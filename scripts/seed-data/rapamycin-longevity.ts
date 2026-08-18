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
      'Rapamycin (sirolimus) is FDA-approved to prevent organ rejection after kidney transplant and to treat the lung disease LAM — not for longevity. It is one of the most consistently lifespan-extending drugs ever tested in mice, independently replicated across three NIA-funded labs. In people, only one completed, placebo-controlled trial of the low, intermittent doses used off-label for longevity exists: after one year it found no significant effect on its primary measure (visceral fat), with only preliminary, subgroup-specific improvements on secondary measures. Using it for longevity today means using an approved immunosuppressant off-label, on human evidence that has not yet shown it extends healthspan or lifespan.',
    regulatoryCategory: 'approved_medicine',
    accessRealityNote:
      'In the United States, rapamycin is a prescription-only medicine. Getting it for longevity purposes requires a physician willing to prescribe it off-label — typically compounded into a low, intermittent dose that is not the FDA-approved transplant regimen — since no regulator has approved any dose or schedule for longevity or anti-aging use. Responsible off-label prescribing is generally paired with routine blood monitoring (lipid panel, complete blood count, kidney function), because the drug\'s documented effects at higher, continuous transplant doses include changes to lipids and blood counts and an increased risk of infection. Telehealth clinics that prescribe compounded rapamycin for longevity exist in the US; at least one (AgelessRx) also sponsored the largest completed human trial to date (PEARL), which is a relevant fact to weigh when reading that trial\'s results. This is a description of access reality, not guidance on dosing or self-use.',
    regulatoryStatuses: [
      {
        jurisdiction: 'United States',
        legalCategory: 'approved_medicine',
        approvedIndications:
          'Prophylaxis of organ rejection in patients aged 13 years or older receiving renal (kidney) transplants, used in combination with cyclosporine and corticosteroids; treatment of lymphangioleiomyomatosis (LAM), a rare progressive lung disease. Not approved, and not recommended, for liver or lung transplant patients. No approval exists for longevity, healthspan, or anti-aging use in any indication or population.',
        statusStatement:
          'Sirolimus (brand name Rapamune) is an FDA-approved prescription immunosuppressant for the two indications above. It carries a boxed warning that increased susceptibility to infection and the possible development of lymphoma and other malignancies may result from immunosuppression. Its use for longevity or anti-aging is off-label: legal for a licensed physician to prescribe at their clinical discretion, but not an FDA-reviewed or FDA-approved use.',
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
          'No — the only completed, placebo-controlled human trial of rapamycin for healthy aging (the PEARL trial, published 2025) found no significant effect on its primary measure, visceral fat, after one year, and while a subgroup of women showed improved lean muscle mass and less pain, no human trial has yet measured whether rapamycin extends lifespan or overall healthspan.',
        measuredFinding:
          'PEARL (Moel et al., 2025, Aging 17(4):908-936; NCT04488601): a 48-week, double-blind, randomized, placebo-controlled, decentralized trial in 129 enrolled and 114 completing adults aged 50-85 (40 on 5 mg/week, 35 on 10 mg/week compounded rapamycin, 39 placebo). Primary endpoint — change in visceral adipose tissue by DXA scan — showed no significant difference between groups (p = 0.942). Secondary endpoints showed some significant, sex-specific effects: women on 10 mg/week gained on average 6.2 kg more lean tissue mass than placebo at 48 weeks (95% CI 0.88-11.51 kg, p = 0.018), and reported an 8.1-point greater improvement in self-reported pain (95% CI 3.04-13.10, p < 0.001). The 5 mg/week group showed a modest improvement in a general-health quality-of-life measure. No effects on mortality, disease incidence, frailty, or any other hard endpoint were measured, because the trial was not designed or powered to measure them.',
        inference:
          'The lean-mass and pain improvements seen in women are preliminary, single-trial, secondary-outcome findings that have not been independently replicated, and by themselves they do not establish a healthspan or lifespan benefit. Whether any effect exists on outcomes that actually define "healthspan" or "longevity" — mortality, frailty, cognitive decline, disease incidence — remains unmeasured in humans.',
        proofBoundaryStage: 'controlled_human_evidence',
        proofBoundaryExplanation:
          'A genuine double-blind, randomized, placebo-controlled human trial of low-dose rapamycin has been completed and published in a peer-reviewed journal — real controlled human evidence exists, which is why this claim sits here and not lower on the Proof Boundary. But "controlled human evidence exists" is not the same as "the trial proved the longevity claim." The trial\'s own pre-specified primary endpoint showed no significant difference between rapamycin and placebo. The positive results were secondary, sex-specific, and come from a single trial sponsored by AgelessRx, a telehealth company that itself prescribes compounded rapamycin — a conflict of interest worth weighing. This is deliberately the honest middle ground between "never tested in humans" and "proven to work in humans": tested, but not yet shown to work for what people are using it for.',
        remainingUnknown:
          'Whether the lean-mass and pain improvements seen in women replicate in an independent trial; whether rapamycin, at any dose or schedule, affects mortality, frailty, cognitive decline, or age-related disease incidence in humans; whether effects differ meaningfully in men; and what happens with use beyond one year, which no controlled human trial has yet studied.',
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
              'No significant difference between rapamycin and placebo on the primary endpoint (visceral adipose tissue, p = 0.942) after 48 weeks; significant secondary improvements in lean tissue mass and self-reported pain limited to women in the 10 mg/week group.',
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
          'Rapamycin inhibits mTOR, a cellular growth-signaling protein, and this has been shown across three independent, NIA-funded mouse labs to extend both median and maximal lifespan — but that same causal chain has not been directly measured, end-to-end, in humans.',
        measuredFinding:
          'Harrison et al. 2009 (Nature): rapamycin fed to genetically heterogeneous mice beginning at 600 days of age increased the age at 90% mortality by 14% (females) and 9% (males), replicated at three independent ITP test sites. Miller et al. 2014 (Aging Cell): a dose-response study at the same three sites found median lifespan increased up to 23% (males) and 26% (females) at the highest tested dose (42 ppm in food), with effects present even at lower doses. Strong et al. 2020 (Aging Cell): intermittent (one month on/one month off) or a limited three-month exposure starting at 20 months of age was as effective as continuous lifelong exposure at increasing survival in males.',
        inference:
          'Because mTOR is present and does the same basic job (regulating cell growth, protein synthesis, and autophagy) across mice and humans, researchers hypothesize the same inhibition could slow aging-related decline in people. That is a plausible, mechanism-based extrapolation — not a demonstrated human effect.',
        proofBoundaryStage: 'animal_evidence',
        proofBoundaryExplanation:
          'This is unusually strong animal evidence: the NIA Interventions Testing Program was specifically designed to test replicability, running the same intervention at three independent labs simultaneously so a result can\'t be one lab\'s fluke. Rapamycin\'s lifespan effect passed that test repeatedly across three separate published studies over more than a decade. That makes it about as solid as animal evidence gets — and it is still animal evidence. Mouse lifespan extension, however well replicated, is not itself proof of a human effect.',
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
              'This binding-and-inhibition mechanism is well-established cell biology, built up over decades of biochemical and structural studies and summarized in the major review cited here (Saxton & Sabatini, 2017, Cell).',
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
              'Directly measured across three published NIA Interventions Testing Program studies: Harrison et al. 2009 (age at 90% mortality up 9-14%), Miller et al. 2014 (median lifespan up to 23-26% at the highest dose, dose-dependent), and Strong et al. 2020 (intermittent and late-life regimens equally effective).',
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
              'Because the same mTOR pathway exists in humans, researchers hypothesize the same mechanism could slow aging or extend healthspan in people — but this final step has not been directly measured. The one completed randomized human trial (PEARL, 2025) tested low, intermittent, off-label doses and found no significant effect on its primary aging-related measure after one year.',
            evidenceContext:
              'This step is an extrapolation from a shared molecular pathway, tested once in humans by Moel et al. 2025 in a trial whose primary endpoint did not confirm the anti-aging hypothesis. It goes beyond what has been directly measured and is not established.',
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
          'Rapamycin carries an FDA boxed warning for increased infection and cancer risk from immunosuppression at the continuous, higher doses used after transplant, and while the low, intermittent doses typically prescribed off-label for longevity looked relatively safe over one year in the only controlled trial to test them, longer-term risk in healthy people has not been established, and off-label access requires a physician willing to prescribe it plus ongoing blood monitoring.',
        measuredFinding:
          'FDA label (transplant dosing, continuous, higher-dose use): boxed warning states increased susceptibility to infection and possible development of lymphoma and other malignancies may result from immunosuppression; the most common (≥30%) adverse reactions in renal transplant studies included peripheral edema, hypertriglyceridemia, hypertension, hypercholesterolemia, elevated creatinine, GI symptoms, infections, thrombocytopenia, and anemia. PEARL trial (low-dose, intermittent, off-label-relevant dosing, 48 weeks): no significant difference in moderate-to-severe adverse events or safety blood biomarkers between rapamycin and placebo groups; GI symptoms were somewhat more common with rapamycin (8 cases at 10 mg/week, 7 at 5 mg/week, versus 4 on placebo); serious adverse events occurred in 1, 2, and 3 participants respectively (10 mg, 5 mg, placebo) — no signal of excess serious harm at this dose over this duration.',
        inference:
          'The well-documented immunosuppression risks (infection, malignancy) come from continuous, higher transplant-level dosing reviewed by the FDA. The low, intermittent, off-label longevity dosing pattern has a much shorter and thinner safety record — one 48-week trial — and while it did not show excess harm over that period, one year is not long-term, and the trial was not designed or powered to detect rare or slow-developing risks like cancer.',
        proofBoundaryStage: 'controlled_human_evidence',
        proofBoundaryExplanation:
          'The immunosuppression risk itself is regulatory-grade evidence — it comes directly from the trials that supported FDA approval, at transplant doses. But that is a different dosing context from off-label longevity use. For the low, intermittent doses people actually take off-label, the best available evidence is the one 48-week randomized controlled trial (PEARL), which is genuine controlled human evidence but covers only a single year in a relatively healthy, closely monitored trial population — not the multi-year, real-world use this claim is actually about.',
        remainingUnknown:
          'Long-term (multi-year) safety of low, intermittent off-label dosing in otherwise healthy adults; whether infection or cancer risk is meaningfully elevated at these lower doses over years of use; and safety in people with other health conditions who were excluded from the trial population studied so far.',
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
          'No — rapamycin (sirolimus) is FDA-approved only to prevent organ rejection in kidney transplant recipients aged 13 and older and to treat the rare lung disease lymphangioleiomyomatosis (LAM); no regulator anywhere has approved it, or any drug, for longevity, healthspan, or anti-aging.',
        measuredFinding:
          'Per the current FDA label (via DailyMed, revised November 2024): sirolimus (Rapamune) is indicated for prophylaxis of organ rejection in patients aged 13 years or older receiving renal transplants, used with cyclosporine and corticosteroids, and for treatment of LAM. The label explicitly states safety and efficacy have not been established in liver or lung transplant patients, and use in those populations is not recommended due to documented risks including excess mortality and graft loss.',
        inference:
          'A licensed physician can still legally prescribe sirolimus off-label for longevity at their own clinical discretion — off-label prescribing of an approved drug is legal in the US — but that reflects an individual clinical judgment call, not a regulatory finding that it is safe or effective for that purpose.',
        proofBoundaryStage: 'regulatory_evidence',
        proofBoundaryExplanation:
          'This is the strongest evidence category in the Proof Boundary system, and it genuinely applies here — but only to what the FDA actually reviewed and approved: transplant-rejection prophylaxis and LAM. It is not evidence for longevity. No regulator has ever evaluated rapamycin for an anti-aging or longevity indication, and "FDA-approved" should never be read as "FDA-approved for longevity."',
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
