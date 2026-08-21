import type { SeedDossier } from '@/lib/seed-types'

/**
 * Enriched batch 18 — the skin.
 *
 * Ten medicines applied to a surface: two retinoids, an oxidising agent, a ribosome-blocking
 * antibiotic, a calcineurin inhibitor, a vitamin D analogue, two antifungals, an insecticide and a
 * tRNA-synthetase inhibitor. Most are decades old, most cost cents per gram, and most are used for
 * years by people who were never shown where the evidence for them stops.
 *
 * That is what makes the group worth auditing, because topical dermatology has a structural
 * problem the rest of medicine mostly does not. The endpoints are graded by eye. "Investigator's
 * Global Assessment improved by two points" is a person looking at a face and choosing a number,
 * and almost every trial below is built on one. Where a hard endpoint has been measured — a cancer
 * counted, a death recorded, a culture taken — it is separated out on the page, because those are
 * the results that survived contact with something other than an opinion.
 *
 * Every DOI, PMID and NCT number was resolved at the time of writing: PMIDs through NCBI
 * E-utilities, NCT numbers through the ClinicalTrials.gov v2 API, DOIs through the record returned
 * with them. Every arm size, response rate, confidence interval and p-value is copied from the
 * published abstract or from the label text held on the record, never from memory. Where a number
 * could not be sourced, the field is absent.
 *
 * Six conventions apply to the whole group.
 *
 * 1. PRICING IS A PRICE, NOT A COST. `retailPricePerDoseOrYear` carries the United States pharmacy
 *    acquisition cost already held on the record, from the CMS National Average Drug Acquisition
 *    Cost survey, with the survey date and the number of listed products the median is taken over.
 *    `synthesisCostPerDose` is empty on every dossier here, because no published per-dose
 *    cost-of-production figure for any of these molecules could be verified. The cost-of-production
 *    literature that was checked — Hill, Barber and Gotham in BMJ Global Health — publishes an
 *    estimation method and an aggregate range and carries no per-dose figure for these compounds.
 *    It is cited as `costSource` so a reader can see what was checked and what it does not contain.
 *
 * 2. THE STRUCTURES ARE THE ONES ALREADY ON THE RECORD. Each SMILES string was pulled from PubChem
 *    by the ingestion pipeline and passed this repository's structure parser before curation began.
 *    None was substituted, including where a cleaner drawing exists — the point of the field is
 *    that the engine has checked the string that is actually stored.
 *
 * 3. A GRADED APPEARANCE IS A SURROGATE AND EVERY PAGE SAYS SO. Lesion counts, Investigator's
 *    Global Assessment, Eczema Area and Severity Index, Psoriasis Area and Severity Index and
 *    mycological cure are all measurements of a proxy. Two of the drugs here have been tested
 *    against a hard endpoint in a randomised trial — tretinoin against skin cancer and death,
 *    mupirocin against surgical site infection — and both missed their primary endpoint. Those two
 *    results are the spine of this batch.
 *
 * 4. RESISTANCE IS REPORTED WHERE IT EXISTS, NOT WHERE IT IS CONVENIENT. Three of these drugs are
 *    anti-infectives whose failure rate is now driven by resistance that did not exist when they
 *    were approved: mupirocin through plasmid-borne ileS-2, permethrin through knockdown-resistance
 *    mutations in the louse sodium channel, terbinafine through squalene epoxidase substitutions in
 *    a dermatophyte species first named in 2020.
 *
 * 5. THE AUDIT POINTS ARE NOT A HIGHLIGHT REEL. Every dossier carries at least one 'inferred' or
 *    'failed' entry, because the literature supplies them.
 *
 * 6. NO DOSING, PROTOCOL, STACKING OR PROCUREMENT GUIDANCE. Strengths, frequencies and durations
 *    appear only where they are part of a trial's description or a label's identity. Nothing here
 *    tells a reader what to apply, how often, for how long, or where to get it.
 */

const NADAC_SOURCE = {
  label:
    'CMS National Average Drug Acquisition Cost (NADAC) survey — what United States retail pharmacies pay to acquire a drug',
  identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
  kind: 'url' as const,
}

const COST_OF_PRODUCTION_SOURCE = {
  label:
    'Hill A, Barber MJ, Gotham D. Estimated costs of production and potential prices for the WHO Essential Medicines List. BMJ Glob Health 2018;3:e000571 — the cost-of-production literature checked for this group; it publishes an estimation method and an aggregate range and carries no per-dose figure for the drugs in this file',
  identifier: '10.1136/bmjgh-2017-000571',
  kind: 'doi' as const,
}

export const ENRICHED_BATCH_18_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // 1. Tretinoin (topical) — the only drug in this batch tested against skin cancer and death in a
  //    randomised trial. It missed on cancer, and the trial was stopped early for excess deaths.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'tretinoin',
    name: 'Tretinoin (topical)',
    tradeName: 'Retin-A / Retin-A Micro / Renova / Atralin / Avita',
    sponsor:
      'Originally Johnson & Johnson (Ortho Dermatological); the listed United States labeller on the record is Valeant International, and the molecule is now a generic market',
    targetGene: 'RARA, RARB and RARG — the three human retinoic acid receptor genes',
    targetProtein:
      'Retinoic acid receptor alpha, beta and gamma, acting as heterodimers with retinoid X receptor on retinoic acid response elements in keratinocyte DNA',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1971,
    indication:
      'Topical treatment of acne vulgaris. Separately, as Renova cream, an adjunctive agent for the mitigation of fine facial wrinkles in patients using a comprehensive skin care and sunlight avoidance programme',
    patientFriendlyIndication: 'Acne, and fine facial lines from sun damage',
    anatomicalSite:
      'Epidermis and the follicular infundibulum — the lining of the pore, and the basal keratinocytes beneath it',
    conditionContext: {
      conditionExplainer:
        'Acne begins when the cells lining a pore stop shedding cleanly and stick together into a plug. Oil builds behind the plug, bacteria that live there feed on it, and the surrounding tissue inflames. Photoaging is a separate problem with a similar target: decades of ultraviolet light break down the collagen in the dermis, and the skin above it thins and creases.',
      whyItMatters:
        'Tretinoin is the molecule almost every other retinoid is measured against, and it is the one that carries the most direct evidence in both conditions. It is also the drug whose marketing has drifted furthest from its own label, which is why this page quotes the label back.',
      whoTakesThis:
        'People with comedonal or inflammatory acne, and adults using it for fine lines. It is applied to skin, not swallowed — oral tretinoin is a different medicine with a different risk profile.',
      clinicalGoals:
        'Fewer comedones and inflammatory lesions counted on a face, or a graded improvement in fine wrinkling. Both are appearance endpoints. Neither is a measurement of skin health, and the one trial that measured skin health directly is the third audit on this page.',
    },
    oneSentenceVerdict:
      'The acid form of vitamin A, which binds retinoic acid receptors in the pore lining and forces the plugged cells to shed — reproducibly effective on acne lesion counts and on graded fine wrinkling, and decisively ineffective at preventing skin cancer in 1,131 randomised veterans, a trial stopped six months early because more people died in the tretinoin group.',
    laymanHowItWorks:
      'Tretinoin is vitamin A in the form your cells actually use as a signal. Rubbed onto skin it slips into keratinocytes, finds receptors that sit directly on DNA, and switches on the genes that tell those cells to mature and shed on schedule. The plug in a blocked pore loosens and clears, and new plugs form more slowly. In sun-damaged skin the same signal nudges the dermis to lay down collagen again, which is why fine lines soften — and why the skin peels and stings for the first several weeks while the turnover speeds up.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 74,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$1.57 per gram, the median United States pharmacy acquisition cost across 64 listed tretinoin products (CMS NADAC, generic, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'First approved in 1971 and off patent for decades. The 64 separately listed generic products behind that median are the reason the price is measured in cents rather than dollars per application, and the reason no manufacturer has an incentive to fund a hard-endpoint trial.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'For acne the honest comparison is with the other topical retinoids and with benzoyl peroxide, and the largest network meta-analysis of the field found that the combinations beat any single agent. For fine wrinkling there is no substitute with comparable randomised evidence, which is a statement about how little the alternatives have been tested rather than a claim that tretinoin is powerful.',
      conventionalRx: [
        {
          name: 'Adapalene',
          class: 'Third-generation naphthoic acid retinoid, selective for RAR-beta and RAR-gamma',
          howItCompares:
            'Similar lesion-count reduction in head-to-head trials with markedly less irritation, and chemically stable in light and in the presence of benzoyl peroxide, which tretinoin is not. Available without a prescription in the United States since 2016.',
          typicalCost:
            'US$0.5094 per gram, median United States pharmacy acquisition cost across 17 listed products (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: better tolerated, cheaper per gram, no prescription needed, can be combined with benzoyl peroxide in one product. Cons: no randomised evidence for photoaging comparable to tretinoin, and the same pregnancy caution applies.',
        },
        {
          name: 'Benzoyl peroxide',
          class: 'Oxidising antimicrobial',
          howItCompares:
            'Works on a different part of the same disease — it kills Cutibacterium acnes rather than unplugging the pore — and in the Southampton network meta-analysis it beat vehicle for self-reported improvement (35% against 26%). Combining it with a retinoid ranked higher than either alone.',
          typicalCost:
            'US$0.3993 per gram, median United States pharmacy acquisition cost across 53 listed products (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: no bacterial resistance described, cheap, over the counter. Cons: bleaches fabric and hair, and several products were found in 2024 to degrade to benzene on storage above room temperature.',
        },
        {
          name: 'Isotretinoin (oral)',
          class: 'Systemic retinoid',
          howItCompares:
            'A different medicine, not a stronger cream. It shrinks the sebaceous gland itself and is the only acne treatment with durable remission after a finite course. It is also a proven human teratogen under a mandatory pregnancy-prevention programme, which topical tretinoin is not.',
          typicalCost: 'Priced per capsule rather than per gram; not comparable to a topical figure',
          prosAndCons:
            'Pros: works when topicals have not, and the effect can outlast treatment. Cons: teratogenic, requires monitoring, and is a systemic exposure for a skin problem.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Use sunscreen while using it',
          action:
            'Tretinoin thins the stratum corneum in the first weeks and the label instructs minimising sun exposure.',
          patientImpact:
            'Treated skin burns more easily. The Renova indication is written explicitly as an adjunct to a comprehensive skin care and sunlight avoidance programme, which means the sunscreen is part of the treatment rather than an optional extra.',
          clinicalPrecaution:
            'Wind and cold also irritate treated skin more than untreated skin, which the label states directly.',
        },
        {
          name: 'Expect it to get worse before it gets better, and know what is not normal',
          action:
            'Peeling, redness and stinging in the first weeks are the expected pharmacology of increased cell turnover.',
          patientImpact:
            'In the VATTC chemoprevention trial, run at 0.1% twice daily on the face and ears, the only quality-of-life difference at 12 months was worse symptoms in the tretinoin group. Irritation is the dose-limiting effect, not a sign the drug is working.',
          clinicalPrecaution:
            'Severe or spreading irritation, or irritation that has not settled after several weeks, is a reason to ask a clinician rather than to persist.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1=C(C(CCC1)(C)C)/C=C/C(=C/C=C/C(=C/C(=O)O)/C)/C',
      chemicalFormula: 'C20H28O2',
      molecularWeight: '300.40 g/mol',
      targetReceptorAffinity:
        'All-trans retinoic acid is the natural ligand of the retinoic acid receptors and binds RAR-alpha, RAR-beta and RAR-gamma at nanomolar concentrations. It does not bind the retinoid X receptors directly; its 9-cis isomer does. Human skin expresses predominantly RAR-gamma, which is the receptor the epidermal effect is attributed to.',
      structureSource: {
        label:
          'PubChem CID 444795 (tretinoin) — canonical SMILES, molecular formula and weight, as held on the record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/444795',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'tre-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Geometric isomer identity of the all-trans tetraene',
          description:
            'Confirm that every one of the four conjugated double bonds is in the trans configuration before anything else happens. The 13-cis isomer is isotretinoin, a systemically teratogenic drug with a mandatory pregnancy-prevention programme, and the 9-cis isomer is alitretinoin. These are not impurities of tretinoin; they are other approved medicines, and light alone converts between them.',
          reagentsAndBuffer:
            'All-trans retinoic acid reference standard, reversed-phase HPLC with ultraviolet detection at 350 nm, amber glassware, argon headspace, butylated hydroxytoluene as antioxidant',
        },
        {
          id: 'tre-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Formulation into a vehicle that will not isomerise the drug',
          description:
            'Disperse the acid into cream, gel or microsphere vehicle under light exclusion. The vehicle is not inert here: the microsphere formulation exists specifically to hold tretinoin in a porous polymer so less of it reaches the surface at once, which is a tolerability intervention rather than a potency one.',
          dependsOnStepId: 'tre-w1',
          reagentsAndBuffer:
            'Methyl methacrylate/glycol dimethacrylate crosspolymer for microsphere product, or emollient cream base, stearic acid, edetate disodium, butylated hydroxytoluene, nitrogen purge',
        },
        {
          id: 'tre-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Assay of residual isomers and degradation products in the finished vehicle',
          description:
            'Re-assay after formulation, not only before it. Isomerisation is driven by light and by peroxides, and a vehicle containing an oxidising co-formulant will degrade the drug on the shelf. This is the analytical reason tretinoin and benzoyl peroxide are not put in the same product while adapalene and benzoyl peroxide are.',
          dependsOnStepId: 'tre-w2',
          reagentsAndBuffer:
            'Gradient reversed-phase HPLC, photodiode array detection, accelerated stability chambers at 40C and 75% relative humidity, peroxide value titration on the vehicle',
        },
        {
          id: 'tre-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Percutaneous penetration across excised human skin',
          description:
            'Mount excised human skin in a diffusion cell and measure how much drug crosses in 24 hours. The point of the experiment is that the answer should be small: systemic absorption of topical tretinoin is minimal, and that is the whole basis for the difference in pregnancy risk between this drug and oral isotretinoin.',
          dependsOnStepId: 'tre-w3',
          reagentsAndBuffer:
            'Franz diffusion cells, dermatomed human abdominal skin, phosphate-buffered saline receptor fluid with bovine serum albumin, LC-MS/MS quantification of tretinoin and its 13-cis and 4-oxo metabolites',
        },
        {
          id: 'tre-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Retinoic acid response element reporter assay and keratinocyte differentiation readout',
          description:
            'Measure transcription from a retinoic acid response element in a reporter line, then confirm the same concentration changes keratin expression in primary keratinocytes. The reporter tells you the receptor was engaged; only the keratinocyte tells you the cell behaved differently, and the gap between those two readouts is the gap this whole site exists to describe.',
          dependsOnStepId: 'tre-w4',
          reagentsAndBuffer:
            'RARE-luciferase reporter construct in HeLa or HaCaT cells, primary normal human epidermal keratinocytes in low-calcium serum-free medium, quantitative PCR for KRT1, KRT10 and CRABP2, luciferase substrate and lysis buffer',
        },
      ],
    },
    keyAudits: [
      {
        id: 'tre-a1',
        category: 'measured',
        title: 'Photoaging: improvement on the treated forearm and not the other one',
        laymanSummary:
          'The trial that started the anti-ageing industry had every patient put tretinoin on one forearm and the plain cream on the other, so each person was their own comparison. All thirty who finished improved on the tretinoin arm and not on the vehicle arm.',
        technicalDetails:
          'Weiss and colleagues ran a 16-week randomised, double-blind, vehicle-controlled study at the University of Michigan. Every patient applied tretinoin to one forearm and vehicle cream to the other; half additionally received tretinoin to the face and half vehicle. All 30 patients who completed showed statistically significant improvement in photoaging on the tretinoin-treated forearm and not on the vehicle-treated forearm. Fourteen of 15 who received facial tretinoin improved, against none of the vehicle-treated faces. Histologic changes were significant in tretinoin-treated forearm skin only. Side effects were confined to irritation of exposed skin. The within-patient design is the strength of this study and its sample size is the weakness.',
        evidenceSource: 'Weiss JS et al., JAMA 1988;259:527-532 (PMID 3336176)',
        measuredMetric:
          'Graded photoaging score and histology, tretinoin-treated forearm against vehicle-treated forearm in the same patient',
        auditFlag: 'verified',
      },
      {
        id: 'tre-a2',
        category: 'measured',
        title: 'The effect holds for 48 weeks at two strengths',
        laymanSummary:
          'Nearly three hundred people who had already used the cream for six months carried on for another six under blinded conditions. The improvement held or continued, and the side effects got less common rather than more.',
        technicalDetails:
          'Olsen and colleagues extended two multicentre double-blind studies: subjects who had completed 24 weeks of once-daily tretinoin emollient cream at 0.05% (n=149) or 0.01% (n=149) continued the same strength for a further 24 weeks. Maintenance of improvement or continued reduction in signs of photodamage was recorded by investigators and subjects and confirmed by skin replica analysis. Cutaneous side effects were less common during the extension than during the first 24 weeks. The extension was not vehicle-controlled, so it establishes durability within treated groups rather than a fresh comparison against no treatment.',
        evidenceSource: 'Olsen EA et al., J Am Acad Dermatol 1997;37:217-226',
        doi: '10.1016/s0190-9622(97)80128-4',
        measuredMetric:
          'Investigator and subject assessment of photodamage plus skin replica analysis at 48 weeks',
        auditFlag: 'verified',
      },
      {
        id: 'tre-a3',
        category: 'failed',
        title: 'VATTC: no effect on skin cancer in 1,131 randomised patients',
        laymanSummary:
          'The largest randomised trial ever run on this drug asked whether it prevents the commonest cancer in the United States. Over five years, about half of both groups developed a basal cell carcinoma. The difference was one percentage point, in a trial designed to find a real one.',
        technicalDetails:
          'The Veterans Affairs Topical Tretinoin Chemoprevention Trial randomised 1,131 high-risk patients, mean age 71, to 0.1% tretinoin or matching vehicle applied twice daily to the face and ears for 1.5 to 5.5 years. Primary outcomes were time to new basal cell carcinoma and time to new invasive squamous cell carcinoma on the face or ears. Neither was significant (P=0.3 for BCC, P=0.4 for SCC). At five years, 53% of the tretinoin group and 54% of controls had developed a BCC, and 28% against 31% an invasive SCC; the differences were 1.0% (95% CI -6.5 to 8.6) and 3.6% (95% CI -3.1 to 10.3). No differences appeared in any cancer-related endpoint or in actinic keratosis counts. The only quality-of-life difference was worse symptoms in the tretinoin group at 12 months.',
        evidenceSource:
          'Weinstock MA et al., J Invest Dermatol 2012;132:1583-1590 (VATTC, NCT00007631)',
        doi: '10.1038/jid.2011.483',
        measuredMetric:
          'Time to first new basal cell carcinoma and first new invasive squamous cell carcinoma on the face or ears',
        auditFlag: 'verified',
      },
      {
        id: 'tre-a4',
        category: 'failed',
        title: 'The same trial was stopped early because more people in the tretinoin group died',
        laymanSummary:
          'Death was never meant to be measured in this trial. The monitoring committee stopped the study six months early anyway, because there were too many deaths among people using the cream. The authors adjusted for every difference they could find between the groups, and the gap did not go away.',
        technicalDetails:
          'The VATTC intervention was terminated six months early because of an excessive number of deaths in the tretinoin-treated group. Death was not contemplated as an endpoint in the original design. Post hoc analysis found minor imbalances in age, comorbidity and smoking status, all important predictors of death; after adjusting for them, the difference in mortality between the randomised groups remained statistically significant. The authors state plainly that they observed an association but do not infer a causal one, and that current evidence suggests causation is unlikely — topical tretinoin has minimal systemic absorption, and no mechanism connects it to all-cause death. The finding has not been reproduced in any subsequent randomised trial, and no subsequent trial of this size has been run.',
        evidenceSource: 'Weinstock MA et al., Arch Dermatol 2009;145:18-24 (PMID 19153339)',
        doi: '10.1001/archdermatol.2008.542',
        measuredMetric:
          'All-cause mortality, a post hoc endpoint in a trial powered for skin cancer incidence',
        auditFlag: 'contested',
      },
      {
        id: 'tre-a5',
        category: 'inferred',
        title: 'The Renova label denies in capital letters what the category is sold on',
        laymanSummary:
          'The approved wrinkle indication is worth reading in the original. The label says the product does not eliminate wrinkles, does not repair sun-damaged skin, does not reverse photoaging and does not restore younger skin. It is approved for the mitigation of fine facial wrinkles, as an adjunct, in people already avoiding the sun.',
        technicalDetails:
          'The RENOVA 0.02% cream label states the indication as "an adjunctive agent for use in the mitigation (palliation) of fine facial wrinkles in patients who use comprehensive skin care and sunlight avoidance programs", followed by the capitalised sentence "RENOVA (tretinoin cream) 0.02% DOES NOT ELIMINATE WRINKLES, REPAIR SUN-DAMAGED SKIN, REVERSE PHOTOAGING, or RESTORE MORE YOUTHFUL or YOUNGER SKIN." Every trial supporting the indication measured graded fine wrinkling, mottled hyperpigmentation and roughness on ordinal scales. None measured dermal collagen restoration as a clinical outcome, and none measured coarse wrinkling, which the label does not claim.',
        evidenceSource:
          'RENOVA (tretinoin cream) 0.02% United States prescribing information, Indications and Usage, as held on the record',
        inferredClaim:
          'That topical tretinoin reverses skin ageing — a claim the product’s own approved label refuses in capital letters, and one the trials were never designed to test',
        auditFlag: 'caution',
      },
      {
        id: 'tre-a6',
        category: 'conclusion_shift',
        title: 'The pregnancy question moved from case reports to a prospective cohort',
        laymanSummary:
          'Because tretinoin is chemically close to a drug that famously causes birth defects, individual case reports in the early 1990s caused alarm. A cohort that followed pregnancies forward, rather than looking back after a bad outcome, found no increase in any measured outcome.',
        technicalDetails:
          'Case reports in the Lancet in 1993 linked first-trimester topical tretinoin to congenital disorders and prompted a genuine scare, on the reasonable prior that isotretinoin is an established human teratogen. Loureiro and colleagues then prospectively ascertained 106 pregnant women with first-trimester topical tretinoin exposure through the California Teratogen Information Service between 1983 and 2003 and compared them with 389 prospectively ascertained unexposed women. There were no significant differences in spontaneous abortion (6.6% against 8.5%, P=0.53) or major structural defects (2.2% against 1.2%, P=0.62), and no difference in birth weight, length, head circumference or gestation. In a subset (62 exposed, 191 unexposed) the prevalence of retinoic acid-specific minor malformations did not differ (12.9% against 9.9%, P=0.51). The authors note it remains impossible to exclude individual susceptibility, and the label still advises against use in pregnancy.',
        evidenceSource: 'Loureiro KD et al., Am J Med Genet A 2005;136:117-121 (PMID 15940677)',
        doi: '10.1002/ajmg.a.30744',
        inferredClaim:
          'That topical tretinoin carries isotretinoin’s teratogenic risk — an inference from chemical similarity and retrospective case reports that a prospective cohort did not support',
        auditFlag: 'verified',
      },
      {
        id: 'tre-a7',
        category: 'inferred',
        title:
          'The largest acne network meta-analysis rates its own confidence in the evidence as low',
        laymanSummary:
          'Forty randomised trials in eighteen thousand people were pooled to work out which acne cream works best. The combinations came out ahead of single drugs. The authors then graded their own confidence in the whole exercise as low, because the trials do not report their results consistently enough to compare.',
        technicalDetails:
          'Stuart and colleagues searched CENTRAL, MEDLINE, Embase and the WHO registry to June 2020 and pooled 40 trials with 18,089 participants in a frequentist network meta-analysis. Patient Global Assessment of Improvement was reported in only 11 of the 40 trials. Against vehicle, benzoyl peroxide improved self-reported acne (35% against 26%); benzoyl peroxide with adapalene (54% against 35%) and with clindamycin (49% against 35%) ranked above benzoyl peroxide alone. Withdrawals for adverse events were low throughout, slightly higher for the combinations (2.5% and 2.7%) than for benzoyl peroxide (1.6%) or adapalene alone (1.0%). Overall confidence in the evidence, assessed with CINeMA, was low, and the authors state that inconsistent reporting precluded firmer conclusions.',
        evidenceSource: 'Stuart B et al., Br J Dermatol 2021;185:512-525 (PMID 33825196)',
        doi: '10.1111/bjd.20080',
        inferredClaim:
          'That the ranking of topical acne treatments is settled — the network exists, the ranking exists, and the confidence rating attached to it by its own authors is low',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Applied to the surface, and mostly staying there',
        laymanDesc:
          'The cream sits on the skin and the drug works its way into the outer layers and down the pore. Very little reaches the bloodstream, which is the single most important fact about this medicine compared with the vitamin A pills it resembles.',
        molecularDetail:
          'Percutaneous absorption of topical tretinoin is minimal. Partitioning is driven by the molecule being a lipophilic carboxylic acid (formula C20H28O2, 300.40 g/mol) that concentrates in the stratum corneum and follicular infundibulum. The microsphere formulations exist to slow surface delivery further, trading peak concentration for tolerability rather than for potency.',
        iconName: 'Droplet',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Carried into the nucleus of the cell',
        laymanDesc:
          'Inside a skin cell, a shuttle protein picks the drug up and carries it to the nucleus, where the cell keeps its DNA. This is a signalling molecule, not a solvent or a scrub.',
        molecularDetail:
          'Cellular retinoic acid-binding protein 2 (CRABP2) binds all-trans retinoic acid in the cytoplasm and delivers it to the nuclear retinoic acid receptors. CRABP2 is itself retinoic acid-inducible, which produces a short positive-feedback loop on the first exposures and is part of why the response builds over weeks.',
        iconName: 'ArrowRightLeft',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It switches genes on by sitting on the DNA',
        laymanDesc:
          'The drug clicks into a receptor that is already parked on specific stretches of DNA. Occupied, that receptor stops silencing those genes and starts transcribing them.',
        molecularDetail:
          'Retinoic acid receptors alpha, beta and gamma heterodimerise with retinoid X receptors and bind retinoic acid response elements as a preformed complex. Unliganded, the complex recruits nuclear corepressors and histone deacetylases. Ligand binding exchanges those for coactivators with histone acetyltransferase activity. Human epidermis expresses predominantly RAR-gamma, and the epidermal effects are attributed to it.',
        iconName: 'Dna',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The pore lining stops sticking together',
        laymanDesc:
          'The cells lining the pore start maturing and shedding on schedule again instead of clumping. The plug at the top of the pore loosens and clears, and fewer new plugs form behind it.',
        molecularDetail:
          'Transcriptional reprogramming of follicular keratinocytes normalises the abnormal desquamation that produces the microcomedone, the precursor lesion of both comedonal and inflammatory acne. Keratin expression shifts and corneocyte cohesion falls. This is why a retinoid is a comedolytic rather than an antibacterial, and why it is the component of a regimen that acts on lesion formation rather than on the organism.',
        iconName: 'Layers',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'In sun-damaged skin, the dermis is remodelled',
        laymanDesc:
          'Deeper down, the same signal shifts the balance between building collagen and breaking it down. Over months the skin thickens slightly and fine creases soften. Deep lines do not change.',
        molecularDetail:
          'Retinoic acid signalling suppresses ultraviolet-induced AP-1 activation and the matrix metalloproteinase transcription that follows it, while increasing procollagen expression. The clinical endpoints in the registration trials were ordinal grades of fine wrinkling, mottled hyperpigmentation and tactile roughness, not measured collagen content.',
        iconName: 'Sparkles',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What the endpoint does not measure',
        laymanDesc:
          'Every result on this page is somebody looking at skin and grading it, or counting spots. When the drug was finally tested against something that cannot be graded by eye — cancer, and death — it did nothing to the cancer, and the trial was stopped early over the deaths.',
        molecularDetail:
          'VATTC randomised 1,131 high-risk patients to 0.1% tretinoin or vehicle for up to 5.5 years and found no effect on basal cell carcinoma (P=0.3), invasive squamous cell carcinoma (P=0.4) or actinic keratosis count, and terminated six months early for excess deaths in the tretinoin arm that survived adjustment for age, comorbidity and smoking.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'VATTC (NCT00007631)',
        phase: 'Phase 3, randomised, double-blind, vehicle-controlled',
        sampleSize: 1131,
        primaryEndpoint:
          'Time to new basal cell carcinoma and to new invasive squamous cell carcinoma on the face or ears',
        endpointMet: false,
        statisticalPValue:
          'P=0.3 for BCC and P=0.4 for SCC. Five-year BCC 53% against 54%, difference 1.0% (95% CI -6.5 to 8.6); invasive SCC 28% against 31%, difference 3.6% (95% CI -3.1 to 10.3)',
        unreportedAdverseSignals:
          'The intervention was stopped six months early for excess all-cause mortality in the tretinoin group, an endpoint the trial was never designed to measure. The imbalance survived adjustment for age, comorbidity and smoking status and was reported separately in Archives of Dermatology rather than in the main efficacy paper.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Weiss 1988 University of Michigan photoaging study (PMID 3336176)',
        phase: 'Randomised, double-blind, vehicle-controlled, within-patient design',
        sampleSize: 30,
        primaryEndpoint: 'Graded improvement in photoaging at 16 weeks, with histologic confirmation',
        endpointMet: true,
        statisticalPValue:
          'Statistically significant improvement on tretinoin-treated forearms and not on vehicle-treated forearms in all 30 completers; 14 of 15 tretinoin-treated faces improved against 0 of the vehicle-treated faces',
        unreportedAdverseSignals:
          'Thirty completers. The within-patient forearm design controls for confounding tightly but the study cannot speak to durability, to coarse wrinkling, or to anything beyond 16 weeks.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Olsen 1997 tretinoin emollient cream 48-week extension studies',
        phase: 'Multicentre, double-blind extension of two 24-week studies',
        sampleSize: 298,
        primaryEndpoint:
          'Maintenance of or further improvement in photodamage signs through 48 weeks at 0.05% and 0.01%',
        endpointMet: true,
        statisticalPValue:
          'Reported as maintained or continued improvement on investigator and subject assessment, confirmed by skin replica analysis; no comparative p-value against vehicle in the extension phase',
        unreportedAdverseSignals:
          'The extension had no vehicle arm. It measures durability within treated groups, not a fresh comparison against no treatment, and only enrolled people who had already tolerated 24 weeks.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Graded photoaging improved on the tretinoin forearm and not the vehicle forearm in all 30 completers of a within-patient randomised study, with matching histology',
        'Fourteen of 15 tretinoin-treated faces improved against 0 of 15 vehicle-treated faces in the same study',
        'Improvement was maintained or extended through 48 weeks at both 0.05% and 0.01% in 298 subjects',
        'No effect on basal cell carcinoma (P=0.3), invasive squamous cell carcinoma (P=0.4) or actinic keratosis count in 1,131 randomised high-risk patients over up to 5.5 years',
        'No increase in spontaneous abortion, major structural defects or retinoic acid-specific minor malformations in 106 prospectively followed first-trimester exposures',
      ],
      unsupportedInferences: [
        'That tretinoin reverses skin ageing or repairs sun damage — the Renova label denies all four versions of that claim in capital letters',
        'That an appearance grade assigned by an investigator is a measurement of skin health',
        'That a drug which normalises follicular keratinisation should therefore prevent the cancers arising in the same tissue — plausible, tested, and false',
        'That topical tretinoin carries oral isotretinoin’s teratogenic risk, inferred from chemical similarity before the prospective data existed',
      ],
      whatFailedInitially: [
        'VATTC missed both primary endpoints outright, in the largest randomised trial ever run on the drug',
        'VATTC was terminated six months early for excess all-cause mortality in the tretinoin arm, and the imbalance survived adjustment',
        'The only quality-of-life difference measured in VATTC was worse symptoms in the tretinoin group at 12 months',
        'The largest acne network meta-analysis grades its own confidence in the evidence as low, with patient-reported improvement available from only 11 of 40 trials',
      ],
      realWorldOutcome: [
        'Approved in 1971 and still the reference retinoid every newer one is benchmarked against',
        'Sixty-four separately listed generic products in the CMS survey, at a median of US$1.57 per gram',
        'The photoaging indication is written as palliation of fine wrinkles, adjunctive to sun avoidance, and says in capital letters what it does not do',
        'Superseded for tolerability by adapalene, which is chemically stable alongside benzoyl peroxide and available without a prescription',
      ],
    },
    deliverySystem: {
      type: 'Topical cream, gel, lotion and microsphere gel, applied to the skin',
      description:
        'Applied to affected skin rather than swallowed. Percutaneous absorption is minimal, which is the basis for the difference in systemic risk between this drug and oral retinoids. The microsphere formulation holds the drug in a porous polymer to slow its arrival at the skin surface, a tolerability device rather than a potency one. Tretinoin isomerises in light and degrades in the presence of peroxides, which is why it is not co-formulated with benzoyl peroxide.',
      safetyProfile:
        'Local irritation is the dose-limiting effect: erythema, peeling, dryness, stinging and increased sensitivity to sunlight, wind and cold. The label instructs minimising sun exposure and using protective measures. Systemic exposure is minimal. In the VATTC trial at 0.1% twice daily, the only quality-of-life difference at 12 months was worse symptoms in the tretinoin group, and the trial was stopped early for an unexplained excess of deaths that the authors explicitly declined to call causal. Use in pregnancy is advised against, although a prospective cohort of 106 first-trimester exposures found no increase in adverse outcomes.',
    },
    commonQuestions: [
      {
        q: 'Does tretinoin reverse ageing?',
        a: 'Its own label says no, in capital letters. The approved wording for Renova is "mitigation (palliation) of fine facial wrinkles", as an adjunctive agent, in patients already using a comprehensive skin care and sunlight avoidance programme — followed immediately by the sentence "DOES NOT ELIMINATE WRINKLES, REPAIR SUN-DAMAGED SKIN, REVERSE PHOTOAGING, or RESTORE MORE YOUTHFUL or YOUNGER SKIN." What the trials measured was graded fine wrinkling, mottled pigmentation and roughness, on ordinal scales, assessed by an investigator looking at a face. That is a real and reproducible effect. It is a smaller and narrower claim than the one the category is sold on.',
        auditNote:
          'The 1988 forearm study is unusually good evidence for its size, because each patient carried their own control. It is still 30 people over 16 weeks.',
      },
      {
        q: 'Does it prevent skin cancer?',
        a: 'No. This was tested properly, in 1,131 high-risk veterans randomised to 0.1% tretinoin or matching vehicle on the face and ears for up to five and a half years. At five years, 53% of the tretinoin group and 54% of the control group had a basal cell carcinoma, and 28% against 31% had an invasive squamous cell carcinoma. Neither difference approached significance, and actinic keratosis counts did not differ either. It is one of the cleanest negative results in dermatology, and it is worth knowing about precisely because the mechanism made it sound so likely.',
      },
      {
        q: 'Is it true that a trial of this drug was stopped because people died?',
        a: 'Yes, and the detail matters. Death was not an endpoint anyone had planned to measure in the VATTC trial. The independent monitoring committee stopped the intervention six months early because there were too many deaths in the tretinoin group. The investigators then looked for explanations, found small imbalances in age, comorbidity and smoking, adjusted for all of them, and the difference remained statistically significant. Their own published conclusion is careful: they observed an association and do not infer a causal one, because there is no mechanism by which a cream with minimal systemic absorption would cause deaths, and no other trial has seen this. It has never been reproduced, and no trial that size has been run since.',
        auditNote:
          'This is what an unexplained finding looks like when it is reported honestly rather than dropped. It is on this page for that reason, not because the drug is thought to be dangerous.',
      },
      {
        q: 'Why does my skin get worse for the first month?',
        a: 'Because the drug is speeding up how fast the outer layer of skin turns over, and the outer layer is what keeps water in and irritants out. Erythema, peeling, dryness and stinging are the expected pharmacology, not an allergy, and they are the reason adapalene took over much of the market — same class, similar lesion counts, less of this. The Renova label lists increased susceptibility to sunlight, wind and cold in treated skin. What is not expected is severe or spreading irritation, or irritation that has not settled after several weeks.',
      },
      {
        q: 'Is it safe in pregnancy?',
        a: 'The label advises against it, and the best available data are more reassuring than the label. The concern comes from chemistry: tretinoin is all-trans retinoic acid and isotretinoin is its 13-cis isomer, and isotretinoin is one of the most firmly established human teratogens there is. Case reports in the early 1990s appeared to connect topical use to birth defects. A prospective cohort then followed 106 first-trimester exposures and 389 unexposed pregnancies forward from the point of exposure rather than backwards from the outcome, and found no difference in miscarriage, major structural defects, growth or gestation, and no excess of the specific minor malformations that make up the retinoic acid embryopathy. That is genuine evidence, and it is one cohort.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Weinstock MA et al. Tretinoin and the prevention of keratinocyte carcinoma (basal and squamous cell carcinoma of the skin): a Veterans Affairs randomized chemoprevention trial. J Invest Dermatol 2012;132:1583-1590',
        identifier: '10.1038/jid.2011.483',
        kind: 'doi',
      },
      {
        label:
          'Weinstock MA et al. Topical tretinoin therapy and all-cause mortality. Arch Dermatol 2009;145:18-24',
        identifier: '10.1001/archdermatol.2008.542',
        kind: 'doi',
      },
      {
        label:
          'Weiss JS, Ellis CN, Headington JT, Tincoff T, Hamilton TA, Voorhees JJ. Topical tretinoin improves photoaged skin: a double-blind vehicle-controlled study. JAMA 1988;259:527-532',
        identifier: '3336176',
        kind: 'pmid',
      },
      {
        label:
          'Olsen EA et al. Tretinoin emollient cream for photodamaged skin: results of 48-week, multicenter, double-blind studies. J Am Acad Dermatol 1997;37:217-226',
        identifier: '10.1016/s0190-9622(97)80128-4',
        kind: 'doi',
      },
      {
        label:
          'Loureiro KD et al. Minor malformations characteristic of the retinoic acid embryopathy and other birth outcomes in children of women exposed to topical tretinoin during early pregnancy. Am J Med Genet A 2005;136:117-121',
        identifier: '10.1002/ajmg.a.30744',
        kind: 'doi',
      },
      {
        label:
          'Stuart B et al. Topical preparations for the treatment of mild-to-moderate acne vulgaris: systematic review and network meta-analysis. Br J Dermatol 2021;185:512-525',
        identifier: '10.1111/bjd.20080',
        kind: 'doi',
      },
      {
        label:
          'Veterans Affairs Topical Tretinoin Chemoprevention Trial registration record, 1,131 participants, completed',
        identifier: 'NCT00007631',
        kind: 'nct',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 2. Adapalene — a retinoid built to be tolerated rather than to work better, whose own pivotal
  //    trial put 21% of patients clear or almost clear against 9% on the vehicle.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'adapalene',
    name: 'Adapalene',
    tradeName: 'Differin / Differin Gel 0.1% (over the counter) / Epiduo (with benzoyl peroxide)',
    sponsor: 'Galderma Laboratories LP',
    targetGene: 'RARB and RARG — the beta and gamma retinoic acid receptor genes',
    targetProtein:
      'Retinoic acid receptor beta and gamma; binding to RAR-alpha is weak and to the cytosolic retinoic acid-binding proteins negligible, which is the designed difference from tretinoin',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1996,
    indication:
      'Topical treatment of acne vulgaris. The 0.3% gel is indicated in patients 12 years of age and older and remains prescription-only under NDA 021753; the 0.1% gel was switched to over-the-counter status under NDA 020380',
    patientFriendlyIndication: 'Acne',
    anatomicalSite:
      'The follicular infundibulum — adapalene is strongly lipophilic and concentrates in the sebaceous follicle rather than spreading evenly through the epidermis',
    conditionContext: {
      conditionExplainer:
        'Acne starts as a microcomedone: the cells lining a pore stop shedding cleanly, stick together and plug it. Everything downstream — the blackhead, the inflamed papule, the scar — follows from that plug. A retinoid is the class of drug that acts on the plug itself rather than on the bacteria or the oil.',
      whyItMatters:
        'Adapalene was designed to keep the retinoid effect and lose the retinoid irritation, and it largely succeeded. It became the first topical retinoid sold in the United States without a prescription. It is also a clear case of a drug marketed on a comparison it never won.',
      whoTakesThis:
        'People with mild to moderate acne, from age 12 upwards. The 0.1% strength can be bought off a shelf; the 0.3% strength cannot.',
      clinicalGoals:
        'Fewer comedones and inflammatory lesions, and a two-category improvement on the Investigator’s Global Assessment. Both are appearance endpoints assessed by a person looking at a face, and the vehicle arm of the pivotal trial shows how much movement that scale produces on its own.',
    },
    oneSentenceVerdict:
      'A synthetic naphthoic acid retinoid whose adamantyl group makes it photostable and oxidation-resistant where tretinoin is neither — in its 653-patient pivotal trial the 0.3% gel put 21% of patients clear or almost clear against 16% on 0.1% and 9% on plain vehicle, a real and statistically significant difference that leaves four in five patients not clear at twelve weeks.',
    laymanHowItWorks:
      'Adapalene is a laboratory-built molecule shaped to fit the same receptors vitamin A acid uses, but with a bulky cage-like group bolted on that makes it greasy, stable in sunlight and unreactive to oxygen. The greasiness concentrates it in the pore rather than spreading it across the whole skin surface. Once inside a pore-lining cell it switches on the genes that make those cells mature and shed, so the plug loosens and fewer new plugs form. The stability is the reason it can be put in the same tube as benzoyl peroxide, which would destroy tretinoin.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 71,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.5094 per gram, the median United States pharmacy acquisition cost across 17 listed adapalene products (CMS NADAC, generic, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'The compound patent has expired and the 0.1% gel has been sold over the counter in the United States since the Rx-to-OTC switch of NDA 020380. The 0.3% strength stayed prescription-only under a separate application, NDA 021753, and the fixed combination with benzoyl peroxide has since been switched over the counter as well under NDA 220736.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Adapalene’s real competition is tretinoin, which a manufacturer-run meta-analysis of 900 patients found it equivalent to on lesion counts, and the fixed combinations, which the largest network meta-analysis in the field ranked above every single agent including this one. The choice between the retinoids is a tolerability and stability choice, not an efficacy one, and the honest version of the comparison says so.',
      conventionalRx: [
        {
          name: 'Tretinoin (topical)',
          class: 'First-generation retinoid, the natural RAR ligand',
          howItCompares:
            'A meta-analysis of five randomised investigator-blind trials in 900 patients found adapalene 0.1% gel equivalent to tretinoin 0.025% gel on total lesion count reduction, faster at week 1, and considerably better tolerated at every assessment. Equivalent means equivalent.',
          typicalCost:
            'US$1.57 per gram, median United States pharmacy acquisition cost across 64 listed products (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: the reference retinoid, with randomised evidence in photoaging that adapalene does not have. Cons: irritates more, isomerises in light, and degrades next to benzoyl peroxide.',
        },
        {
          name: 'Adapalene with benzoyl peroxide (Epiduo)',
          class: 'Fixed-dose retinoid plus oxidising antimicrobial',
          howItCompares:
            'In a 517-patient randomised double-blind trial the fixed combination beat adapalene alone, benzoyl peroxide alone and vehicle, with separation on total lesion count as early as week 1, and adverse events comparable to adapalene alone. The Southampton network meta-analysis ranked this pairing top for self-reported improvement (54% against 35% for benzoyl peroxide).',
          typicalCost:
            'Sold as a fixed combination product rather than by the gram of adapalene; not directly comparable to the single-agent figure',
          prosAndCons:
            'Pros: the best-supported topical option in the network meta-analysis, one application, and no additional irritation over adapalene alone in the pivotal trial. Cons: withdrawal for adverse events was 2.5% against 1.0% for adapalene alone across the pooled network, and the benzoyl peroxide component bleaches fabric.',
        },
        {
          name: 'Benzoyl peroxide',
          class: 'Oxidising antimicrobial',
          howItCompares:
            'Acts on Cutibacterium acnes rather than on the plug, so it is complementary rather than alternative. Beat vehicle for self-reported improvement in the network meta-analysis (35% against 26%) and no bacterial resistance to it has been described.',
          typicalCost:
            'US$0.3993 per gram, median United States pharmacy acquisition cost across 53 listed products (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: cheap, over the counter, resistance-proof. Cons: bleaches fabric and hair, and benzene has been detected in several marketed products stored above room temperature.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Give it twelve weeks before judging it',
          action:
            'The pivotal trial measured its primary endpoint at week 12, with a repeated-measures analysis across weeks 8 and 12.',
          patientImpact:
            'Lesion counts in that trial fell by 45.3% on adapalene 0.3% and by 33.7% on plain vehicle over the same period. Both arms improved. The drug effect is the difference between those two, and it takes time to become visible against the noise.',
          clinicalPrecaution:
            'Irritation peaks early and settles. In the Epiduo Forte trial, moderate erythema, scaling, dryness and stinging peaked at week 1 and had largely resolved by the end of treatment.',
        },
        {
          name: 'This is the retinoid that tolerates benzoyl peroxide',
          action:
            'Adapalene is photostable and resistant to oxidation, which tretinoin is not.',
          patientImpact:
            'That chemistry is why a single fixed-dose product containing both a retinoid and benzoyl peroxide exists at all, and why the combination could be tested head-to-head against its own components.',
          clinicalPrecaution:
            'Stability is not the same as tolerability. The combination irritates more than benzoyl peroxide alone, and the label records skin irritation in 4% of subjects on the higher-strength combination against 0% on vehicle.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'COC1=C(C=C(C=C1)C2=CC3=C(C=C2)C=C(C=C3)C(=O)O)C45CC6CC(C4)CC(C6)C5',
      chemicalFormula: 'C28H28O3',
      molecularWeight: '412.50 g/mol',
      targetReceptorAffinity:
        'Binds retinoic acid receptor beta and gamma with markedly higher affinity than RAR-alpha, and does not bind the cytosolic retinoic acid-binding proteins. Calculated logP on the stored structure is 6.84, an order of magnitude more lipophilic than tretinoin, which is the physical property behind its concentration in the sebaceous follicle rather than across the whole epidermis.',
      structureSource: {
        label:
          'PubChem CID 60164 (adapalene) — canonical SMILES, molecular formula and weight, as held on the record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/60164',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ada-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity and purity of the adamantyl-methoxyphenyl fragment',
          description:
            'Confirm the adamantane cage and the methoxy substitution before coupling. The adamantyl group is the whole design: it is what makes the molecule rigid, lipophilic and unreactive to light and oxygen, and a des-adamantyl impurity is a naphthoic acid with none of those properties.',
          reagentsAndBuffer:
            '1-(3-methoxy-4-bromophenyl)adamantane reference standard, reversed-phase HPLC with ultraviolet detection, 1H and 13C NMR in CDCl3, residual palladium by ICP-MS',
        },
        {
          id: 'ada-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Biaryl coupling to the naphthoic acid',
          description:
            'Form the bond between the adamantyl-bearing ring and the 2-naphthoic acid ester under palladium catalysis, then hydrolyse the ester. This coupling is what builds the rigid, roughly linear shape that lets a molecule with no double-bond chain at all sit in a receptor evolved for retinoic acid.',
          dependsOnStepId: 'ada-w1',
          reagentsAndBuffer:
            'Methyl 6-bromo-2-naphthoate, palladium catalyst with phosphine ligand, boronic acid or organozinc partner, anhydrous solvent under nitrogen, aqueous sodium hydroxide for saponification',
        },
        {
          id: 'ada-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation of the free acid and photostability challenge',
          description:
            'Crystallise the free acid, then deliberately expose it to light and to peroxide. Adapalene is expected to survive both, and this is the experiment that licenses co-formulation with benzoyl peroxide. Running it is how the claim stops being a chemical intuition and becomes a specification.',
          dependsOnStepId: 'ada-w2',
          reagentsAndBuffer:
            'Recrystallisation from ethanol or tetrahydrofuran, ICH Q1B photostability chamber, benzoyl peroxide challenge at formulation concentration, HPLC assay before and after',
        },
        {
          id: 'ada-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Follicular versus interfollicular distribution in excised skin',
          description:
            'Apply the finished gel to excised human skin, then separate follicular casts from surrounding stratum corneum and assay each. The design intent is that most of the drug ends up in the follicle. A formulation that distributes evenly across the surface has traded away the reason for the lipophilicity.',
          dependsOnStepId: 'ada-w3',
          reagentsAndBuffer:
            'Dermatomed human skin, cyanoacrylate follicular biopsy, tape stripping of interfollicular stratum corneum, LC-MS/MS quantification of adapalene in each compartment',
        },
        {
          id: 'ada-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'RAR subtype selectivity panel and comedolytic readout',
          description:
            'Measure transactivation at RAR-alpha, beta and gamma separately, then run the rhino mouse or a human follicular keratinocyte comedolytic model. Subtype selectivity is the claimed basis for the tolerability advantage, so a page that reports the tolerability without reporting the selectivity assay has skipped the step that connects them.',
          dependsOnStepId: 'ada-w4',
          reagentsAndBuffer:
            'RAR-alpha, RAR-beta and RAR-gamma transactivation reporter cell lines, all-trans retinoic acid as reference agonist, primary human follicular keratinocytes, quantitative PCR for differentiation markers',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ada-a1',
        category: 'measured',
        title: 'The pivotal trial: 653 patients, and a dose-dependent effect at both strengths',
        laymanSummary:
          'Six hundred and fifty-three people were randomised to the strong gel, the weak gel or plain vehicle for twelve weeks. The strong gel beat both. The effect got bigger with the stronger concentration, which is the pattern you expect from a drug that is really doing something.',
        technicalDetails:
          'Thiboutot and colleagues randomised 653 patients aged 12 to 52 with mild to moderate acne 2:2:1 to adapalene gel 0.3%, adapalene gel 0.1% or vehicle once daily for 12 weeks, analysed with generalised estimating equations across weeks 8 and 12. Adapalene 0.3% was significantly superior to both 0.1% and vehicle on success rate, total lesion count and inflammatory lesion count, with a consistent dose-dependent effect across all efficacy measures. Signs and symptoms were mostly mild to moderate and transient. The trial did not study any adjunctive topical or oral agent.',
        evidenceSource: 'Thiboutot D et al., J Am Acad Dermatol 2006;54:242-250 (PMID 16443054)',
        doi: '10.1016/j.jaad.2004.10.879',
        measuredMetric:
          'Investigator’s Global Assessment success rate and lesion counts at 12 weeks, three arms',
        auditFlag: 'verified',
      },
      {
        id: 'ada-a2',
        category: 'inferred',
        title: 'Read the same table again: 21% clear, and the vehicle got two-thirds of the way',
        laymanSummary:
          'The numbers behind that trial are printed in the label. One patient in five on the strongest gel was clear or almost clear at twelve weeks. Nearly one in ten on the plain vehicle was too. And the vehicle alone shifted lesion counts down by a third.',
        technicalDetails:
          'Table 3 of the DIFFERIN 0.3% label reports the primary efficacy results at week 12. IGA success — clear or almost clear — was 53 of 258 (21%) on adapalene 0.3%, 41 of 261 (16%) on adapalene 0.1% and 12 of 134 (9%) on vehicle. Total lesions fell by 45.3% on 0.3%, 41.8% on 0.1% and 33.7% on vehicle from mean baseline counts of 67.1, 69.1 and 67.2. Inflammatory lesions fell 51.6%, 49.7% and 40.7%. The drug effect is real and consistent across every measure, and it is the gap between those columns — roughly 12 percentage points on success and 12 points on lesion reduction — not the size of the column itself.',
        evidenceSource:
          'DIFFERIN (adapalene) Gel 0.3% United States prescribing information, section 14, Table 3 (NDA 021753)',
        inferredClaim:
          'That a retinoid clears acne — the pivotal trial’s own table leaves 79% of patients on the strongest strength not clear or almost clear at 12 weeks, and credits the vehicle with three-quarters of the measured lesion reduction',
        measuredMetric: 'IGA success 21% against 16% against 9%; total lesion reduction 45.3% against 41.8% against 33.7%',
        auditFlag: 'caution',
      },
      {
        id: 'ada-a3',
        category: 'measured',
        title: 'The fixed combination beat both of its own components',
        laymanSummary:
          'Putting adapalene and benzoyl peroxide in one tube was tested against each of them alone and against plain vehicle in the same trial. The combination won, and the difference in lesion counts showed up within a week.',
        technicalDetails:
          'Thiboutot and colleagues randomised 517 subjects 2:2:2:1 in a double-blind controlled trial to adapalene 0.1% plus benzoyl peroxide 2.5% fixed combination, adapalene alone, benzoyl peroxide alone or vehicle for 12 weeks. The fixed combination was significantly more effective than either monotherapy, with significant differences in total lesion count observed as early as week 1. Adverse event frequency and cutaneous tolerability for the combination were similar to adapalene monotherapy. The authors note the result was generated in a controlled trial and that practice may differ. This is the trial behind the network meta-analysis ranking that put adapalene with benzoyl peroxide at the top of the topical field.',
        evidenceSource: 'Thiboutot DM et al., J Am Acad Dermatol 2007;57:791-799 (PMID 17655969)',
        doi: '10.1016/j.jaad.2007.06.006',
        measuredMetric:
          'Success rate and total lesion count at 12 weeks, combination against each monotherapy and vehicle in one trial',
        auditFlag: 'verified',
      },
      {
        id: 'ada-a4',
        category: 'failed',
        title: 'It set out to beat tretinoin and demonstrated equivalence instead',
        laymanSummary:
          'A meta-analysis pooled every comparison of adapalene against tretinoin the manufacturer could find, published and unpublished, in nine hundred patients. The stated goal was to show adapalene worked better. It worked the same. It was gentler, which is a genuine finding, and the paper concluded it was a pharmacologic advance.',
        technicalDetails:
          'Cunliffe and colleagues pooled five multicentre randomised investigator-blind trials, published and unpublished, from the United States and Europe: 450 patients on adapalene 0.1% gel against 450 on tretinoin 0.025% gel, analysed by intention to treat. The stated purpose was "to determine if adapalene 0.1% gel provided superior efficacy and better tolerability than tretinoin 0.025% gel". Adapalene demonstrated equivalent efficacy on total lesion count reduction, a significant advantage at week 1 on inflammatory and total lesions, and considerably greater local tolerability at every assessment. The authors concluded the findings "suggest that adapalene 0.1% gel constitutes a pharmacologic advance over such classic retinoids as tretinoin". Three of the four authors were employees of the manufacturer, the analysis included unpublished company studies, and it was published in a journal supplement rather than a regular issue.',
        evidenceSource: 'Cunliffe WJ, Poncet M, Loesche C, Verschoore M. Br J Dermatol 1998;139 Suppl 52:48-56 (PMID 9990421)',
        doi: '10.1046/j.1365-2133.1998.1390s2048.x',
        inferredClaim:
          'That adapalene is a pharmacologic advance over tretinoin — an equivalence result on the efficacy endpoint plus a tolerability advantage, restated as a class advance in the manufacturer’s own supplement',
        measuredMetric:
          'Total lesion count reduction, adapalene 0.1% against tretinoin 0.025% in 900 patients: equivalent',
        auditFlag: 'contested',
      },
      {
        id: 'ada-a5',
        category: 'conclusion_shift',
        title: 'The first topical retinoid to be sold without a prescription',
        laymanSummary:
          'For twenty years a retinoid was something a doctor prescribed, partly because of the birth-defect history of the oral ones. Adapalene 0.1% was moved onto the open shelf. Nothing new was discovered about how well it works — what changed was the judgment about whether people could choose it safely on their own.',
        technicalDetails:
          'The 0.1% gel is now listed in Drugs@FDA under NDA 020380 with an over-the-counter marketing status, while the 0.3% gel remains prescription-only under a separate application, NDA 021753. The fixed combination with benzoyl peroxide has since followed, listed over the counter under NDA 220736. An Rx-to-OTC switch is a determination that a condition is self-recognisable, that a product can be used safely without supervision and that the labelling can be understood — it is not a new efficacy finding, and the efficacy evidence behind the OTC product is the same 1990s dataset that supported the prescription version.',
        evidenceSource:
          'openFDA Drugs@FDA records for NDA 020380 (DIFFERIN 0.1%, over-the-counter), NDA 021753 (DIFFERIN 0.3%, prescription) and NDA 220736 (DIFFERIN EPIDUO, over-the-counter)',
        inferredClaim:
          'That over-the-counter status reflects stronger evidence — it reflects a regulatory judgment about self-selection and labelling comprehension, made on the efficacy dataset that already existed',
        auditFlag: 'verified',
      },
      {
        id: 'ada-a6',
        category: 'inferred',
        title: 'Ranked first in a network the authors themselves rate low-confidence',
        laymanSummary:
          'The largest pooled comparison of acne creams put adapalene with benzoyl peroxide at the top. The same paper says the trials underneath report their results so inconsistently that the confidence in the whole ranking is low.',
        technicalDetails:
          'Stuart and colleagues pooled 40 randomised trials with 18,089 participants. Patient Global Assessment of Improvement — their primary outcome — was reported in only 11 of the 40. Adapalene with benzoyl peroxide ranked highest for self-reported improvement (54% against 35% for benzoyl peroxide alone) and clindamycin with benzoyl peroxide second (49% against 35%). Withdrawals were low everywhere but higher for the combinations (2.5% and 2.7%) than for benzoyl peroxide (1.6%) or adapalene alone (1.0%). Confidence in the evidence, assessed with CINeMA, was low overall, and the authors state that inconsistent reporting precluded firmer conclusions.',
        evidenceSource: 'Stuart B et al., Br J Dermatol 2021;185:512-525 (PMID 33825196)',
        doi: '10.1111/bjd.20080',
        inferredClaim:
          'That the top of a network meta-analysis ranking is a settled finding, when the paper producing it grades its own confidence as low and had patient-reported data from a quarter of its trials',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'It goes where the oil is',
        laymanDesc:
          'Adapalene is unusually greasy for a drug. Applied to skin it does not spread evenly — it collects in the oily pores, which is exactly where acne starts.',
        molecularDetail:
          'Calculated logP on the stored structure is 6.84. That lipophilicity, conferred by the adamantane cage, drives partitioning into sebum-filled follicles rather than uniform distribution across the interfollicular stratum corneum, and is the design rationale for a follicular-targeted retinoid.',
        iconName: 'Droplet',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It survives light and oxygen, which the natural molecule does not',
        laymanDesc:
          'The bulky cage on the molecule makes it chemically tough. Sunlight does not rearrange it and peroxides do not destroy it. That is the only reason it can share a tube with benzoyl peroxide.',
        molecularDetail:
          'Adapalene has no polyene chain to isomerise. The rigid adamantyl-naphthoic acid scaffold is photostable under ICH Q1B conditions and resistant to oxidative degradation by benzoyl peroxide at formulation concentration, unlike all-trans retinoic acid, which isomerises to its 13-cis form in light and degrades in the presence of peroxides.',
        iconName: 'Shield',
        visualStage: 'delivery',
      },
      {
        step: 3,
        title: 'It reaches the DNA without needing a carrier',
        laymanDesc:
          'Inside the cell the drug goes straight to receptors sitting on DNA. It skips the shuttle protein that natural vitamin A acid uses, which is part of why it behaves differently.',
        molecularDetail:
          'Adapalene does not bind the cytosolic retinoic acid-binding proteins CRABP1 and CRABP2, and binds RAR-beta and RAR-gamma preferentially over RAR-alpha. Human epidermis expresses predominantly RAR-gamma, so the selectivity profile overlaps the receptor that matters in skin while avoiding the alpha-mediated effects associated with systemic retinoid toxicity.',
        iconName: 'Dna',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'The pore lining starts shedding on schedule',
        laymanDesc:
          'The occupied receptor switches on the maturation genes in the cells lining the pore. They stop clumping, the plug loosens, and fewer new plugs form behind it.',
        molecularDetail:
          'Ligand-bound RAR/RXR heterodimers exchange corepressors for coactivators at retinoic acid response elements, normalising the abnormal follicular keratinisation that produces the microcomedone. Adapalene additionally suppresses toll-like receptor 2 expression on monocytes and AP-1 signalling, which is the proposed basis for its effect on inflammatory as well as comedonal lesions.',
        iconName: 'Layers',
        visualStage: 'target_binding',
      },
      {
        step: 5,
        title: 'Lesion counts fall, and so do they on the vehicle',
        laymanDesc:
          'Over twelve weeks the number of spots drops by about 45 in a hundred. On the plain vehicle with no drug in it, the number drops by about 34 in a hundred. The medicine is the gap between those two, not the whole of the first one.',
        molecularDetail:
          'DIFFERIN 0.3% label Table 3: total lesion reduction 45.3% on 0.3%, 41.8% on 0.1%, 33.7% on vehicle from mean baseline counts near 67; IGA success 21%, 16% and 9% respectively at week 12 in 653 randomised patients.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What the endpoint does not measure',
        laymanDesc:
          'Every number here is a person looking at a face and grading it, or counting spots on it. Nothing in the trial programme measured scarring, and nothing measured what happens after treatment stops.',
        molecularDetail:
          'The registration endpoints are Investigator’s Global Assessment success and lesion counts at 12 weeks. No pivotal adapalene trial had a scar-formation endpoint, none ran a randomised off-treatment follow-up, and the largest network meta-analysis of the field could extract patient-reported improvement from only 11 of 40 trials.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Adapalene Gel 0.3% phase 3 (PMID 16443054, NDA 021753)',
        phase: 'Phase 3, multicentre, randomised, double-blind, vehicle- and active-controlled',
        sampleSize: 653,
        primaryEndpoint:
          'Investigator’s Global Assessment success rate and lesion counts at 12 weeks, adapalene 0.3% against 0.1% and vehicle',
        endpointMet: true,
        statisticalPValue:
          'Adapalene 0.3% significantly superior to both 0.1% and vehicle on success rate, total lesion count and inflammatory lesion count by generalised estimating equations across weeks 8 and 12. Label Table 3: IGA success 21% against 16% against 9%',
        unreportedAdverseSignals:
          'The absolute success rate is easy to lose behind the word "superior": 79% of patients on the strongest strength were not clear or almost clear at 12 weeks, and the vehicle arm delivered a 33.7% total lesion reduction on its own.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Adapalene-benzoyl peroxide fixed combination pivotal trial (PMID 17655969)',
        phase: 'Multicentre, randomised, double-blind, vehicle- and active-controlled',
        sampleSize: 517,
        primaryEndpoint:
          'Success rate and lesion counts at 12 weeks, fixed combination against adapalene alone, benzoyl peroxide alone and vehicle',
        endpointMet: true,
        statisticalPValue:
          'Fixed combination significantly more effective than each corresponding monotherapy, with significant differences in total lesion count from week 1',
        unreportedAdverseSignals:
          'Tolerability was reported as comparable to adapalene monotherapy in this trial, but in the pooled network meta-analysis withdrawal for adverse events was 2.5% for adapalene with benzoyl peroxide against 1.0% for adapalene alone.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Cunliffe 1998 adapalene against tretinoin meta-analysis (PMID 9990421)',
        phase: 'Meta-analysis of five multicentre randomised investigator-blind comparative trials',
        sampleSize: 900,
        primaryEndpoint:
          'Superior efficacy and better tolerability of adapalene 0.1% gel against tretinoin 0.025% gel',
        endpointMet: false,
        statisticalPValue:
          'Equivalent efficacy on total lesion count reduction; significant advantage for adapalene on inflammatory and total lesions at week 1 only; considerably greater local tolerability at all assessments',
        unreportedAdverseSignals:
          'Three of four authors were employees of the manufacturer, published and unpublished company studies were pooled together, and the analysis appeared in a journal supplement. The superiority objective was not met and the conclusion nevertheless describes a pharmacologic advance.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Adapalene 0.3% significantly superior to 0.1% and to vehicle on success rate and lesion counts in 653 randomised patients, with a dose-dependent gradient',
        'IGA success 21% on adapalene 0.3%, 16% on 0.1% and 9% on vehicle at week 12, from the label’s own table',
        'Total lesion reduction 45.3% on 0.3% against 33.7% on plain vehicle over the same 12 weeks',
        'The fixed combination with benzoyl peroxide beat both monotherapies and vehicle in 517 randomised patients, separating on total lesion count by week 1',
        'Equivalent to tretinoin 0.025% gel on total lesion count in a pooled analysis of 900 patients, and better tolerated at every assessment',
      ],
      unsupportedInferences: [
        'That adapalene is a pharmacologic advance over tretinoin — the pooled comparison found equivalence on efficacy and reported a tolerability advantage',
        'That a topical retinoid clears acne, when four in five patients on the strongest strength were not clear or almost clear at 12 weeks',
        'That over-the-counter status reflects stronger evidence rather than a regulatory judgment about self-selection and labelling',
        'That the top of the Southampton network ranking is settled, when its authors grade their own confidence in it as low',
      ],
      whatFailedInitially: [
        'The manufacturer’s meta-analysis set out to demonstrate superiority over tretinoin and demonstrated equivalence',
        'The vehicle arm of the pivotal trial reduced total lesions by a third, absorbing most of the apparent effect',
        'Patient-reported improvement was extractable from only 11 of 40 trials in the largest network meta-analysis of topical acne treatment',
        'No pivotal adapalene trial measured scarring, and none ran a randomised off-treatment follow-up',
      ],
      realWorldOutcome: [
        'Approved in 1996 and the first topical retinoid switched to over-the-counter status in the United States',
        'Seventeen listed generic products in the CMS survey at a median of US$0.5094 per gram, a third of the price of tretinoin',
        'Its chemical stability is why a single-tube retinoid plus benzoyl peroxide product exists, which the network meta-analysis then ranked first',
        'The 0.3% strength stayed prescription-only under a separate application while the 0.1% went to the open shelf',
      ],
    },
    deliverySystem: {
      type: 'Topical gel, cream and lotion, applied to the skin once daily',
      description:
        'Applied to affected skin. The molecule is strongly lipophilic and concentrates in sebaceous follicles rather than distributing evenly across the epidermis. It is photostable and resistant to oxidation, which is what allows co-formulation in a single product with benzoyl peroxide — a combination that is chemically impossible with tretinoin. The 0.1% gel is sold over the counter in the United States; the 0.3% gel is prescription-only.',
      safetyProfile:
        'Local irritation is the main effect and is milder than with tretinoin: the pooled comparison found considerably greater local tolerability at every assessment point. In the higher-strength fixed-combination trial, erythema, scaling, dryness and stinging peaked at week 1 and decreased thereafter, with skin irritation reported in 4% of subjects against 0% on vehicle. Systemic absorption is minimal. Sun sensitivity and avoidance of application to abraded or eczematous skin are label cautions.',
    },
    commonQuestions: [
      {
        q: 'Is adapalene better than tretinoin?',
        a: 'It is gentler, and on the efficacy measure it is the same. The comparison was made properly: five randomised investigator-blind trials, 900 patients, published and unpublished, pooled by intention to treat. Adapalene 0.1% gel and tretinoin 0.025% gel reduced total lesion counts equivalently. Adapalene worked faster in the first week and was considerably better tolerated throughout. That tolerability difference is real and it matters, because a cream people stop using because it stings is a cream that does nothing. But the paper that reported equivalence concluded that adapalene "constitutes a pharmacologic advance", and three of its four authors worked for the manufacturer.',
        auditNote:
          'The trials it pooled included unpublished company studies and it appeared in a journal supplement rather than a regular issue. That does not make the equivalence finding wrong; it makes the interpretive sentence attached to it worth reading twice.',
      },
      {
        q: 'How well does it actually work?',
        a: 'The label prints the answer. In the 653-patient pivotal trial, at twelve weeks, 21% of patients on the 0.3% gel were rated clear or almost clear, against 16% on the 0.1% gel and 9% on plain vehicle with no drug in it. Total spot counts fell 45.3%, 41.8% and 33.7% respectively. So the drug works — the gradient across the three arms is exactly what a real pharmacological effect looks like — and the size of it is about twelve percentage points on both measures. Four in five people using the strongest strength were still not clear at the end.',
        auditNote:
          'The vehicle arm is the most informative column in that table. A third of the lesion reduction happened with no active drug at all, which is why single-arm before-and-after photographs are worth so little in acne.',
      },
      {
        q: 'Why can adapalene be mixed with benzoyl peroxide when tretinoin cannot?',
        a: 'Chemistry. Tretinoin is a chain of alternating double bonds, which light rearranges and peroxides attack. Adapalene has no such chain — it is a rigid naphthoic acid with an adamantane cage bolted to it, and it survives both. That stability is the reason a single tube containing a retinoid and benzoyl peroxide exists at all, and the reason that combination could be run head-to-head against each of its own components in one 517-patient trial. It won, and it separated from the monotherapies on lesion count within a week.',
      },
      {
        q: 'Does buying it without a prescription mean it is weaker or safer?',
        a: 'Neither, exactly. The 0.1% gel is listed in Drugs@FDA with over-the-counter status; the 0.3% gel is a separate application and is still prescription-only. What an Rx-to-OTC switch establishes is that people can recognise the condition themselves, choose the product correctly from a label, and use it without supervision. It is a judgment about self-selection, not a new efficacy result — the evidence behind the shelf product is the same dataset that supported the prescription one. The strength difference between 0.1% and 0.3% is a real one, and the label table quantifies it: 16% clear against 21%.',
      },
      {
        q: 'Should I expect it to stop my acne scarring?',
        a: 'Nobody has measured that. Scarring was not an endpoint in any of the pivotal adapalene trials, which ran for twelve weeks and counted lesions and graded appearance. The argument that fewer inflammatory lesions should mean fewer scars is a reasonable one and it is an inference, not a result. Nothing in the registration programme followed patients after treatment stopped either, so the durability question has no trial answer.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Thiboutot D et al. Adapalene gel 0.3% for the treatment of acne vulgaris: a multicenter, randomized, double-blind, controlled, phase III trial. J Am Acad Dermatol 2006;54:242-250',
        identifier: '10.1016/j.jaad.2004.10.879',
        kind: 'doi',
      },
      {
        label:
          'Thiboutot DM et al. Adapalene-benzoyl peroxide, a fixed-dose combination for the treatment of acne vulgaris: results of a multicenter, randomized double-blind, controlled study. J Am Acad Dermatol 2007;57:791-799',
        identifier: '10.1016/j.jaad.2007.06.006',
        kind: 'doi',
      },
      {
        label:
          'Cunliffe WJ, Poncet M, Loesche C, Verschoore M. A comparison of the efficacy and tolerability of adapalene 0.1% gel versus tretinoin 0.025% gel in patients with acne vulgaris: a meta-analysis of five randomized trials. Br J Dermatol 1998;139 Suppl 52:48-56',
        identifier: '10.1046/j.1365-2133.1998.1390s2048.x',
        kind: 'doi',
      },
      {
        label:
          'Stuart B et al. Topical preparations for the treatment of mild-to-moderate acne vulgaris: systematic review and network meta-analysis. Br J Dermatol 2021;185:512-525',
        identifier: '10.1111/bjd.20080',
        kind: 'doi',
      },
      {
        label:
          'DIFFERIN (adapalene) Gel 0.3% United States prescribing information, section 14 Clinical Studies, Table 3 — NDA 021753, Galderma Laboratories LP',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.application_number:%22NDA021753%22',
        kind: 'regulatory',
      },
      {
        label:
          'openFDA Drugs@FDA record for NDA 020380 (DIFFERIN adapalene gel 0.1%), marketing status over-the-counter',
        identifier: 'https://api.fda.gov/drug/drugsfda.json?search=application_number:%22NDA020380%22',
        kind: 'regulatory',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 3. Benzoyl peroxide — a drug with no target, no resistance and no high-certainty evidence,
  //    which a 2024 analysis showed degrades into a class 1 carcinogen in the tube and on the face.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'benzoyl-peroxide',
    name: 'Benzoyl Peroxide',
    tradeName: 'PanOxyl / Benzoyl Peroxide Wash / Epsolay (microencapsulated, prescription)',
    sponsor:
      'No single originator. Sold under the United States over-the-counter acne monograph by many manufacturers; the labeller held on the record is Valeant International, and the microencapsulated prescription product Epsolay is from Sol-Gel Technologies',
    targetGene:
      'None. Benzoyl peroxide has no gene, receptor or enzyme target — it is a non-specific oxidant',
    targetProtein:
      'No defined protein target. Benzoyl peroxide decomposes to benzoyloxy and phenyl radicals that oxidise bacterial membrane lipids and cytoplasmic proteins indiscriminately',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1984,
    indication:
      'Topical treatment of acne vulgaris under the United States over-the-counter monograph. A microencapsulated 5% cream is separately approved on prescription for the inflammatory lesions of rosacea',
    patientFriendlyIndication: 'Acne, and the bumps and spots of rosacea',
    anatomicalSite:
      'The skin surface and the sebaceous follicle — benzoyl peroxide acts where it is applied and decomposes within hours',
    conditionContext: {
      conditionExplainer:
        'Cutibacterium acnes lives in everyone’s pores. In acne it overgrows behind a plug, feeding on sebum and driving the inflammation that turns a blackhead into a red painful spot. Benzoyl peroxide is the oldest and crudest answer to that: it does not inhibit anything, it simply oxidises the bacteria.',
      whyItMatters:
        'This is the drug that antibiotic stewardship in dermatology is built around, because bacteria cannot become resistant to being oxidised. It is also, since 2024, the drug in this batch with a live safety question that has nothing to do with how well it works.',
      whoTakesThis:
        'Almost anyone with acne, at any severity, usually alongside something else. It is bought off a shelf and needs no prescription in the United States.',
      clinicalGoals:
        'Fewer inflammatory lesions and a graded improvement in appearance. The largest evidence synthesis available found that the investigator sees that improvement and the patient, on average, does not report it.',
    },
    oneSentenceVerdict:
      'A benzene ring bolted to a peroxide bond that breaks apart on skin into free radicals which oxidise Cutibacterium acnes to death without any target to mutate — improving investigator-rated acne across 6 trials and 4,110 patients (RR 1.77, 95% CI 1.37 to 2.28) while failing to reach significance on the patient’s own assessment (RR 1.44, 95% CI 0.94 to 2.22), all of it graded very low certainty, and shown in 2024 to degrade into benzene at storage and body temperature.',
    laymanHowItWorks:
      'Benzoyl peroxide is two benzene rings joined by an oxygen-oxygen bond that is deliberately weak. On warm skin that bond snaps and releases free radicals — fragments so reactive they tear apart whatever they touch first. What they touch first, in a pore, is the membrane of the bacteria living there. Because the attack is chemical vandalism rather than a lock-and-key inhibition, there is no enzyme for a bacterium to mutate and no resistance to develop. The same indiscriminate reactivity is why it bleaches towels, why it stings, and why the molecule falls apart in the tube as well as on the face.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 63,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.3993 per gram, the median United States pharmacy acquisition cost across 53 listed benzoyl peroxide products (CMS NADAC, generic, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Unpatentable as a molecule and sold under an over-the-counter monograph, which is why 53 separate products sit behind that median. The patented objects in this field are formulations, not the drug: the silica microencapsulation behind the prescription rosacea cream is the commercial answer to a compound nobody can own.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The Cochrane overview compared benzoyl peroxide directly against both of its main alternatives and could not distinguish it from either. Against adapalene and against clindamycin, on lesion counts, on investigator assessment and on the patient’s own assessment, the confidence intervals cross no difference on almost every measure. What separates them is not effect size but resistance, cost and irritation.',
      conventionalRx: [
        {
          name: 'Adapalene',
          class: 'Topical retinoid',
          howItCompares:
            'The Cochrane overview found benzoyl peroxide may have little to no effect relative to adapalene on inflammatory lesion change (MD -7.7, 95% CI -16.46 to 1.06), non-inflammatory lesion change (MD -3.9, 95% CI -13.31 to 5.51), participant self-assessment (RR 0.96, 95% CI 0.86 to 1.06) or investigator assessment (RR 1.16, 95% CI 0.98 to 1.37). Different mechanism, indistinguishable measured result.',
          typicalCost:
            'US$0.5094 per gram, median United States pharmacy acquisition cost across 17 listed products (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: acts on the plug rather than the bacteria, so the two are complementary and the combination outranks either. Cons: no better on its own, and slower to show an effect in the first week.',
        },
        {
          name: 'Clindamycin (topical)',
          class: 'Lincosamide antibiotic',
          howItCompares:
            'Indistinguishable from benzoyl peroxide on every outcome the Cochrane overview could pool, including total lesion count (MD -3.50, 95% CI -7.54 to 0.54) and investigator assessment (RR 1.10, 95% CI 0.83 to 1.45). The difference is what happens to the bacteria: clindamycin used alone raised clindamycin-resistant Cutibacterium acnes counts by more than 1,600% at 16 weeks in a controlled comparison, and adding benzoyl peroxide reversed that.',
          typicalCost:
            'US$0.1684 per unit, median United States pharmacy acquisition cost across 96 listed clindamycin products (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: does not bleach fabric, less irritating. Cons: selects for resistant organisms when used alone, which benzoyl peroxide structurally cannot.',
        },
        {
          name: 'Microencapsulated benzoyl peroxide 5% cream (Epsolay)',
          class: 'The same molecule inside silica microcapsules, on prescription, for rosacea',
          howItCompares:
            'In two phase 3 vehicle-controlled trials in 733 subjects, IGA clear or almost clear at week 12 was 43.5% against 16.1% in the first study and 50.1% against 25.9% in the second, all P<0.001. The papers state plainly that the encapsulated product was never compared with ordinary unencapsulated benzoyl peroxide.',
          typicalCost:
            'Priced as a branded prescription cream rather than under the over-the-counter monograph; not comparable to the generic per-gram figure',
          prosAndCons:
            'Pros: the only benzoyl peroxide product with randomised evidence in rosacea, and local tolerability similar to vehicle. Cons: no head-to-head against plain benzoyl peroxide exists, and the 2024 stability analysis found the encapsulated product formed high levels of benzene at 50C, which is the specific claim encapsulation was meant to defeat.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Keep it out of a hot car and off a sunny windowsill',
          action:
            'Benzene formation from benzoyl peroxide is temperature-driven and light-driven, and both were measured directly.',
          patientImpact:
            'A prescription encapsulated product held at 2C formed no apparent benzene; the same product at 50C formed high levels. Across 111 over-the-counter products kept at room temperature, benzene was detected between 0.16 and 35.30 parts per million.',
          clinicalPrecaution:
            'This is a storage observation from a published analytical study, not a dosing instruction and not a recall notice. It concerns the product in the tube, and the same study also detected benzene forming from applied product under ultraviolet light below peak sunlight intensity.',
        },
        {
          name: 'Expect it to bleach things',
          action:
            'The same oxidising chemistry that kills bacteria destroys textile dyes and hair pigment.',
          patientImpact:
            'Towels, pillowcases and clothing in contact with treated skin lose colour permanently. This is not a formulation defect that a better product would fix — it is the mechanism.',
          clinicalPrecaution:
            'Contact with eyes, lips and mucous membranes should be avoided, and the over-the-counter label says so.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1=CC=C(C=C1)C(=O)OOC(=O)C2=CC=CC=C2',
      chemicalFormula: 'C14H10O4',
      molecularWeight: '242.23 g/mol',
      targetReceptorAffinity:
        'None measurable, because there is no receptor. Benzoyl peroxide binds nothing: the peroxide bond undergoes homolytic cleavage on contact with skin to give benzoyloxy radicals, which decarboxylate to phenyl radicals and yield benzoic acid, and — through a competing route — benzene. Antibacterial potency is therefore reported as a log reduction in colony-forming units rather than as an affinity constant.',
      structureSource: {
        label:
          'PubChem CID 7187 (benzoyl peroxide) — canonical SMILES, molecular formula and weight, as held on the record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/7187',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'bpo-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Active peroxide assay and baseline benzene by headspace GC-MS',
          description:
            'Titrate the peroxide content and, separately, measure benzene in the raw material before formulation. Both numbers are needed because they move in opposite directions over time: the drug decays and its most concerning degradant accumulates. A certificate of analysis that reports only assay is reporting half the story.',
          reagentsAndBuffer:
            'Iodometric titration with sodium thiosulfate, headspace gas chromatography-mass spectrometry with deuterated benzene internal standard, sealed amber vials, sample handling below 25C',
        },
        {
          id: 'bpo-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Dispersion into vehicle, or entrapment in silica microcapsules',
          description:
            'Benzoyl peroxide is not dissolved but suspended as crystals in a gel, wash or cream, or built into a silica shell. The encapsulated route exists to slow the drug’s arrival at the skin and reduce irritation. Whether the shell also slows chemical degradation is a separate question, and one the stability study below answers.',
          dependsOnStepId: 'bpo-w1',
          reagentsAndBuffer:
            'Micronised benzoyl peroxide with residual water for handling safety, carbomer or cetyl alcohol vehicle, or sol-gel silica precursor for microencapsulation, low-shear mixing below 30C',
        },
        {
          id: 'bpo-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Thermal and photolytic stability challenge on the finished product',
          description:
            'Hold finished product at refrigeration, at room temperature and at 50C, and assay benzene at each. This is the experiment that produced the 2024 finding: no apparent benzene formation at 2C, high levels at 50C, and encapsulation offering no apparent protection. It is a specification test, not a research question.',
          dependsOnStepId: 'bpo-w2',
          reagentsAndBuffer:
            'Stability chambers at 2C, 25C and 50C, headspace GC-MS, selected ion flow tube mass spectrometry for airborne benzene, ultraviolet source calibrated below peak solar intensity',
        },
        {
          id: 'bpo-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Follicular delivery and radical generation in a sebum-like matrix',
          description:
            'Apply to excised skin or a follicular model and confirm that radical generation actually occurs in the follicle rather than only at the surface. Benzoyl peroxide is consumed as it works, so the useful measurement is radical flux over hours, not concentration at one moment.',
          dependsOnStepId: 'bpo-w3',
          reagentsAndBuffer:
            'Dermatomed human skin or artificial sebum-filled follicle model, electron paramagnetic resonance spin trapping with DMPO, benzoic acid quantification by HPLC as a proxy for decomposition',
        },
        {
          id: 'bpo-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Cutibacterium acnes kill kinetics and serial-passage resistance attempt',
          description:
            'Measure log reduction in colony-forming units, then try repeatedly to select a resistant isolate by serial passage at sub-lethal concentration. The negative result is the point: no target means no resistance mechanism, and that claim is only worth making if somebody has genuinely tried and failed to breed one.',
          dependsOnStepId: 'bpo-w4',
          reagentsAndBuffer:
            'Cutibacterium acnes clinical isolates under anaerobic culture, reinforced clostridial medium, serial sub-culture at sub-inhibitory concentration over 20 or more passages, clindamycin-resistant isolates as comparator',
        },
      ],
    },
    keyAudits: [
      {
        id: 'bpo-a1',
        category: 'measured',
        title: 'It works, and the Cochrane overview grades every number very low certainty',
        laymanSummary:
          'Pooling six trials in more than four thousand people, doctors rated acne as improved more often on benzoyl peroxide than on placebo. The reviewers then rated their confidence in that result, and in every other result about every other acne treatment they looked at, as very low.',
        technicalDetails:
          'The 2024 Cochrane overview of systematic reviews covered six low-risk-of-bias reviews containing 275 trials in 40,910 people with acne. For benzoyl peroxide against placebo over 12 weeks it found improvement in investigators’ global assessment (RR 1.77, 95% CI 1.37 to 2.28; 6 trials, 4,110 participants) and reductions in total lesions (MD -16.14, 95% CI -26.51 to -5.78), inflammatory lesions (MD -6.12, 95% CI -11.02 to -1.22) and non-inflammatory lesions (MD -9.69, 95% CI -15.08 to -4.29), all rated very low-certainty. The authors’ stated conclusion is that they found no high-certainty evidence for the effects of any therapy included in the overview.',
        evidenceSource:
          'Yuan Y et al., Cochrane Database Syst Rev 2024;10:CD014918 (PMID 39440650)',
        doi: '10.1002/14651858.CD014918.pub2',
        measuredMetric:
          'Investigators’ global assessment and lesion counts at 10 to 12 weeks against placebo, pooled',
        auditFlag: 'caution',
      },
      {
        id: 'bpo-a2',
        category: 'failed',
        title: 'The doctor saw an improvement the patient did not report',
        laymanSummary:
          'The same review pooled the trials where patients rated their own acne. On the doctor’s scale benzoyl peroxide clearly beat placebo. On the patient’s own scale the result did not reach significance. Both measurements come from the same trials, of the same skin, at the same visits.',
        technicalDetails:
          'For participants’ global self-assessment against placebo, the pooled estimate was RR 1.44 (95% CI 0.94 to 2.22) from 2 trials in 1,073 participants at 10 and 12 weeks — an interval crossing no effect, graded very low certainty, and summarised by the reviewers as benzoyl peroxide having little to no effect on that outcome. The investigators’ global assessment in the same review was RR 1.77 (95% CI 1.37 to 2.28) from 6 trials in 4,110 participants. The gap between an unblinded-to-improvement clinician grading a face and the person who owns that face rating it is the most useful single finding in the acne literature, and it is why this batch treats graded appearance as a surrogate throughout.',
        evidenceSource:
          'Yuan Y et al., Cochrane Database Syst Rev 2024;10:CD014918 (PMID 39440650)',
        doi: '10.1002/14651858.CD014918.pub2',
        measuredMetric:
          'Participants’ global self-assessment against placebo, RR 1.44 (95% CI 0.94 to 2.22)',
        auditFlag: 'contested',
      },
      {
        id: 'bpo-a3',
        category: 'inferred',
        title: 'Indistinguishable from both of its alternatives on almost every measure',
        laymanSummary:
          'Head to head against a retinoid and against a topical antibiotic, benzoyl peroxide came out the same. Not worse, not better — the differences were too small and too uncertain to call, across every pooled outcome except one.',
        technicalDetails:
          'Against adapalene: percentage change in inflammatory lesions MD -7.7 (95% CI -16.46 to 1.06), non-inflammatory lesions MD -3.9 (95% CI -13.31 to 5.51), participant self-assessment RR 0.96 (0.86 to 1.06; 4 trials, 1,123 participants), investigators’ assessment RR 1.16 (0.98 to 1.37; 3 trials, 1,965 participants). The single exception favoured benzoyl peroxide on percentage change in total lesion count, MD 10.8 (95% CI 3.38 to 18.22) from one 205-patient trial. Against clindamycin: total lesions MD -3.50 (-7.54 to 0.54), inflammatory MD -1.20 (-2.99 to 0.59), non-inflammatory MD -2.4 (-5.3 to 0.5), participant self-assessment RR 0.95 (0.68 to 1.34), investigators’ assessment RR 1.10 (0.83 to 1.45; 2 trials, 2,277 participants). Almost every estimate is graded very low or low certainty.',
        evidenceSource:
          'Yuan Y et al., Cochrane Database Syst Rev 2024;10:CD014918 (PMID 39440650)',
        doi: '10.1002/14651858.CD014918.pub2',
        inferredClaim:
          'That the choice between benzoyl peroxide, a retinoid and a topical antibiotic is an efficacy choice — the pooled head-to-head comparisons cannot separate them, and the real differences are resistance, irritation and price',
        auditFlag: 'caution',
      },
      {
        id: 'bpo-a4',
        category: 'measured',
        title: 'Adding it to an antibiotic reverses the resistance the antibiotic creates',
        laymanSummary:
          'Sixteen weeks of clindamycin on its own multiplied the number of clindamycin-resistant bacteria on the face more than sixteenfold. The identical gel with benzoyl peroxide added reduced them instead, and the patients whose resistant bacteria fell were the patients whose spots cleared.',
        technicalDetails:
          'Cunliffe and colleagues randomised 79 patients aged 13 to 30 with facial Cutibacterium acnes counts of at least 10^4 colony-forming units per square centimetre to clindamycin 1% with benzoyl peroxide 5% or to matching clindamycin 1% alone, twice daily for 16 weeks; 70 were analysed. Clindamycin-resistant organism counts fell from baseline in the combination group and rose by more than 1,600% in the clindamycin monotherapy group by week 16 (P=0.018 between groups); total C. acnes count also fell significantly with combination (P=0.002). Reduction in resistant organisms correlated with reduction in inflammatory lesions (r2=0.31, P=0.016) and total lesions (r2=0.28, P=0.027). Total lesion, inflammatory lesion and comedone reductions were all significantly greater on the combination (P<=0.046).',
        evidenceSource: 'Cunliffe WJ, Holland KT, Bojar R, Levy SF. Clin Ther 2002;24:1117-1133 (PMID 12182256)',
        doi: '10.1016/s0149-2918(02)80023-6',
        measuredMetric:
          'Clindamycin-resistant Cutibacterium acnes colony counts at 16 weeks, combination against clindamycin alone',
        auditFlag: 'verified',
      },
      {
        id: 'bpo-a5',
        category: 'conclusion_shift',
        title: 'In 2024 the safest drug in dermatology turned out to make benzene',
        laymanSummary:
          'Benzoyl peroxide had a sixty-year reputation as harmless because it breaks down into benzoic acid, a food preservative. A published analysis in 2024 showed it also breaks down into benzene, a known human carcinogen, in the tube at room temperature, faster when warm, and in the air above skin under sunlight.',
        technicalDetails:
          'Kucera and colleagues detected benzene by headspace gas chromatography-mass spectrometry at 0.16 to 35.30 parts per million across 111 over-the-counter benzoyl peroxide drug products held at room temperature. A prescription encapsulated product stability-tested at 2C showed no apparent benzene formation and at 50C showed high levels, which the authors read as evidence that encapsulation may not stabilise the drug while cold storage may greatly reduce formation. In face-model experiments, product applied to polymethyl methacrylate photoprotection plates released detectable benzene into surrounding air by evaporation, with substantial additional formation under ultraviolet light at intensities below peak sunlight. The authors conclude that exposure risk arises from formation during use and is therefore independent of the benzene concentration a product starts with. Five of the eight authors are affiliated with Valisure, the analytical laboratory whose citizen petition raised the issue, which is disclosed in the paper.',
        evidenceSource: 'Kucera K et al., J Invest Dermatol 2025;145:1147-1154.e11 (PMID 39384016)',
        doi: '10.1016/j.jid.2024.09.009',
        inferredClaim:
          'That benzoyl peroxide is chemically inert enough to need no stability concern — a sixty-year assumption that a temperature and light stability study contradicted, without any change in what is known about its efficacy',
        auditFlag: 'contested',
      },
      {
        id: 'bpo-a6',
        category: 'inferred',
        title: 'The rosacea product was never compared with ordinary benzoyl peroxide',
        laymanSummary:
          'A version of benzoyl peroxide wrapped in glass microcapsules is approved on prescription for rosacea and clearly beats a dummy cream. It has never been tested against plain benzoyl peroxide, so what the microcapsules add is unknown.',
        technicalDetails:
          'Two 12-week randomised double-blind vehicle-controlled phase 3 trials randomised 733 subjects with moderate to severe rosacea 2:1 to microencapsulated benzoyl peroxide 5% cream or vehicle. IGA clear or almost clear at week 12 was 43.5% against 16.1% in study 1 and 50.1% against 25.9% in study 2; lesion count change was -17.4 against -9.5 and -20.3 against -13.3, all P<0.001, with separation by week 2. There were no treatment-related serious adverse events and 1.4% discontinued for adverse events. The paper states directly: "E-BPO was not compared with unencapsulated BPO." Registered as NCT03564119 and NCT03448939. Three authors were employees of the manufacturer.',
        evidenceSource:
          'Bhatia ND et al., J Clin Aesthet Dermatol 2023;16:34-40 (PMID 37636253; NCT03564119, NCT03448939)',
        inferredClaim:
          'That silica microencapsulation is what makes the rosacea product work or makes it tolerable — the comparator in both pivotal trials was vehicle, and the manufacturer states no comparison with plain benzoyl peroxide was made',
        auditFlag: 'caution',
      },
      {
        id: 'bpo-a7',
        category: 'failed',
        title: 'More adverse events than placebo, on the review’s own pooled estimate',
        laymanSummary:
          'Across thirteen trials in more than four thousand people, side effects were about half again as common on benzoyl peroxide as on placebo. They were minor ones, and the confidence interval only just clears no difference.',
        technicalDetails:
          'The Cochrane overview reports that benzoyl peroxide may increase the risk of a less serious adverse event against placebo over 10 to 12 weeks: RR 1.46 (95% CI 1.01 to 2.11) from 13 trials in 4,287 participants, very low-certainty evidence. No review in the overview collected data on the frequency of participants experiencing at least one serious adverse event, or on quality of life, for any of the clinically important comparisons. That gap is not a finding about benzoyl peroxide — it is a finding about the whole topical acne literature.',
        evidenceSource:
          'Yuan Y et al., Cochrane Database Syst Rev 2024;10:CD014918 (PMID 39440650)',
        doi: '10.1002/14651858.CD014918.pub2',
        measuredMetric:
          'Incidence of a less serious adverse event against placebo, RR 1.46 (95% CI 1.01 to 2.11)',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A deliberately weak bond, applied to warm skin',
        laymanDesc:
          'The molecule is two benzene rings held together by a link between two oxygen atoms. That link is the weakest part, and body heat is enough to break it.',
        molecularDetail:
          'Benzoyl peroxide, C14H10O4, 242.23 g/mol, is a suspension of crystals rather than a solution — it is barely soluble in water. The O-O bond dissociation energy is low enough that homolysis proceeds at skin temperature over hours, which is why the drug is consumed as it acts and why storage temperature is a chemical variable rather than a convenience.',
        iconName: 'Flame',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It shatters into free radicals',
        laymanDesc:
          'The broken bond leaves two fragments each carrying an unpaired electron. Fragments like that are violently reactive and grab at the first molecule they meet.',
        molecularDetail:
          'Homolytic cleavage yields two benzoyloxy radicals, which either abstract hydrogen to give benzoic acid or decarboxylate to phenyl radicals. A competing recombination and decarboxylation route yields benzene, which is why the same reaction that kills bacteria also produces a class 1 carcinogen.',
        iconName: 'Zap',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The bacteria are oxidised, not inhibited',
        laymanDesc:
          'The radicals tear into the membranes and proteins of the bacteria in the pore. There is no lock being picked here — it is closer to bleach than to a key.',
        molecularDetail:
          'Radical attack oxidises Cutibacterium acnes membrane lipids and cytoplasmic proteins non-selectively. Because no single enzyme, transporter or ribosomal site is being inhibited, there is no locus at which a point mutation could confer resistance, and none has been described in six decades of use.',
        iconName: 'Bug',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'No target means no resistance, and that is the point',
        laymanDesc:
          'This is why it is put alongside antibiotics. Clindamycin used alone multiplied the resistant bacteria on patients’ faces more than sixteenfold in sixteen weeks. The same gel with benzoyl peroxide added reduced them.',
        molecularDetail:
          'In a 79-patient randomised comparison, clindamycin-resistant C. acnes counts rose more than 1,600% on clindamycin monotherapy at week 16 and fell on the clindamycin plus benzoyl peroxide combination (P=0.018), with resistant-organism reduction correlating with inflammatory lesion reduction (r2=0.31, P=0.016).',
        iconName: 'ShieldCheck',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Lesions fall on the doctor’s scale',
        laymanDesc:
          'Over ten to twelve weeks, doctors rated acne as improved about three-quarters more often on the drug than on placebo, and lesion counts fell by around sixteen more.',
        molecularDetail:
          'Pooled against placebo: investigators’ global assessment RR 1.77 (95% CI 1.37 to 2.28) across 6 trials in 4,110 participants; total lesion count MD -16.14 (95% CI -26.51 to -5.78); inflammatory MD -6.12; non-inflammatory MD -9.69. All estimates graded very low certainty.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What the endpoint does not measure',
        laymanDesc:
          'On the patient’s own rating of their own acne, the same pooled trials could not show a difference from placebo. And nothing in the whole review measured quality of life or serious harm.',
        molecularDetail:
          'Participants’ global self-assessment against placebo: RR 1.44 (95% CI 0.94 to 2.22), 2 trials, 1,073 participants, very low certainty. The overview records that for the clinically important comparisons, no included review collected data on serious adverse events or on quality of life.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'Cochrane overview pooled benzoyl peroxide against placebo, investigators’ assessment (CD014918)',
        phase: 'Overview of systematic reviews, pooled randomised evidence',
        sampleSize: 4110,
        primaryEndpoint: 'Investigators’ global assessment of improvement at 12 weeks against placebo',
        endpointMet: true,
        statisticalPValue:
          'RR 1.77 (95% CI 1.37 to 2.28), 6 trials, very low-certainty evidence by GRADE',
        unreportedAdverseSignals:
          'The overview’s own conclusion is that no high-certainty evidence was found for the effects of any therapy it examined, and that no included review collected serious adverse event or quality-of-life data for the clinically important comparisons.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'Cochrane overview pooled benzoyl peroxide against placebo, participants’ self-assessment (CD014918)',
        phase: 'Overview of systematic reviews, pooled randomised evidence',
        sampleSize: 1073,
        primaryEndpoint:
          'Participants’ global self-assessment of improvement at 10 to 12 weeks against placebo',
        endpointMet: false,
        statisticalPValue:
          'RR 1.44 (95% CI 0.94 to 2.22), 2 trials, very low-certainty evidence; interval crosses no effect',
        unreportedAdverseSignals:
          'Only 2 of the many placebo-controlled trials in the underlying reviews reported the patient’s own assessment at all, against 6 reporting the investigator’s. Which endpoint gets collected is itself a finding.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Cunliffe 2002 clindamycin/benzoyl peroxide microbiology trial (PMID 12182256)',
        phase: 'Single-centre, randomised, double-blind, parallel-group, active-controlled',
        sampleSize: 79,
        primaryEndpoint:
          'Cutibacterium acnes and clindamycin-resistant C. acnes counts and lesion counts at 16 weeks, combination gel against matching clindamycin gel',
        endpointMet: true,
        statisticalPValue:
          'Total C. acnes count P=0.002 and clindamycin-resistant count P=0.018 favouring combination; resistant counts rose more than 1,600% on clindamycin monotherapy. Lesion count reductions P<=0.046',
        unreportedAdverseSignals:
          'Seventy-nine enrolled at a single centre, 70 analysed. The microbiological result is the important one and rests on a small sample.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Microencapsulated benzoyl peroxide 5% rosacea trials (NCT03564119, NCT03448939)',
        phase: 'Two phase 3, randomised, double-blind, vehicle-controlled trials',
        sampleSize: 733,
        primaryEndpoint:
          'IGA clear or almost clear and inflammatory lesion count change at week 12 against vehicle',
        endpointMet: true,
        statisticalPValue:
          'IGA success 43.5% against 16.1% (study 1) and 50.1% against 25.9% (study 2); lesion change -17.4 against -9.5 and -20.3 against -13.3, all P<0.001',
        unreportedAdverseSignals:
          'The comparator was vehicle in both trials. The publication states that the encapsulated product was not compared with unencapsulated benzoyl peroxide, so the contribution of the microcapsule itself is untested.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Investigators’ global assessment improved against placebo, RR 1.77 (95% CI 1.37 to 2.28), 6 trials, 4,110 participants',
        'Total lesion count fell by 16.14 more than placebo (95% CI 5.78 to 26.51) over 12 weeks',
        'Clindamycin-resistant Cutibacterium acnes counts rose more than 1,600% on clindamycin alone and fell when benzoyl peroxide was added (P=0.018)',
        'Microencapsulated 5% cream produced IGA clear or almost clear in 43.5% and 50.1% of rosacea patients against 16.1% and 25.9% on vehicle (P<0.001)',
        'Benzene detected at 0.16 to 35.30 ppm across 111 over-the-counter products at room temperature, with high formation at 50C and none apparent at 2C',
      ],
      unsupportedInferences: [
        'That benzoyl peroxide outperforms a retinoid or a topical antibiotic — every pooled head-to-head comparison but one failed to separate them',
        'That an investigator’s grading of a face is a proxy for what the patient experiences, when the two diverged in the same pooled trials',
        'That silica microencapsulation is what makes the prescription rosacea product work, when no trial compared it with plain benzoyl peroxide',
        'That a molecule breaking down into a food preservative therefore breaks down into nothing else',
      ],
      whatFailedInitially: [
        'Participants’ own global self-assessment did not separate from placebo, RR 1.44 (95% CI 0.94 to 2.22)',
        'Less serious adverse events were more common than on placebo, RR 1.46 (95% CI 1.01 to 2.11) across 13 trials',
        'The Cochrane overview found no high-certainty evidence for any acne therapy it examined, benzoyl peroxide included',
        'Silica microencapsulation did not prevent benzene formation at 50C in the 2024 stability testing, which is the property it was assumed to confer',
      ],
      realWorldOutcome: [
        'Sold under the United States over-the-counter monograph with 53 listed products at a median of US$0.3993 per gram',
        'The backbone of antibiotic stewardship in acne, because no resistance mechanism to it has ever been described',
        'Ranked at the top of the largest topical acne network meta-analysis only in combination with a retinoid or an antibiotic, never alone',
        'Carries an open 2024 stability question about benzene formation in the tube and on the skin that concerns the product, not the pharmacology',
      ],
    },
    deliverySystem: {
      type: 'Topical gel, cream, wash and foam over the counter; microencapsulated 5% cream on prescription',
      description:
        'Applied to the skin as a suspension of crystals rather than a solution, because the compound is barely water-soluble. It is consumed as it acts: the peroxide bond breaks at skin temperature within hours and the drug is gone. Washes are formulated for short contact and leave-on products for extended contact. The prescription rosacea product entraps the same molecule in silica microcapsules to slow its release.',
      safetyProfile:
        'Irritation, dryness, redness, peeling and stinging are common and dose-related, and less serious adverse events were about half again as frequent as on placebo in the pooled trials (RR 1.46, 95% CI 1.01 to 2.11). The over-the-counter label warns against contact with eyes, lips and mucous membranes and notes irreversible bleaching of hair and dyed fabric. Sun exposure should be limited. A 2024 analytical study detected benzene, a class 1 human carcinogen, in 111 marketed products at room temperature and demonstrated formation at elevated temperature and under ultraviolet light; that finding concerns product stability and exposure and is separate from anything known about the drug’s efficacy.',
    },
    commonQuestions: [
      {
        q: 'Can bacteria become resistant to benzoyl peroxide?',
        a: 'No mechanism for it exists, and none has been described in sixty years. Resistance needs a target: an enzyme whose shape can change, a ribosomal site that can be methylated, a pump that can be upregulated. Benzoyl peroxide has none of those. It breaks apart into free radicals that oxidise whatever is nearest, and a bacterium cannot mutate its way out of being chemically burned. That is why it is added to topical antibiotics rather than used instead of them. In a controlled 16-week comparison, clindamycin used alone multiplied clindamycin-resistant bacteria on the face by more than 1,600%, while the same gel with benzoyl peroxide in it reduced them.',
      },
      {
        q: 'Is the benzene story real, and should I stop using it?',
        a: 'The chemistry is real and published in a peer-reviewed dermatology journal. Benzene was measured at 0.16 to 35.30 parts per million across 111 over-the-counter products held at ordinary room temperature. A prescription encapsulated product formed no apparent benzene at refrigerator temperature and high levels at 50C. Applied product released benzene into the air above a face model, and much more under ultraviolet light below peak sunlight. What is not established is what any of that means for a person’s cancer risk, which depends on absorbed dose over years and has not been measured. Five of the eight authors work for the analytical laboratory that raised the issue, which the paper discloses. The honest position is that a stability problem has been demonstrated and a health consequence has not been quantified either way.',
        auditNote:
          'This is on the page because it is a documented conclusion shift about a drug that had a reputation for being chemically boring. It is not a recall notice and this site does not give storage or purchasing advice.',
      },
      {
        q: 'Is it better than a retinoid or a topical antibiotic?',
        a: 'The pooled evidence cannot tell them apart. Against adapalene, the differences in inflammatory lesions, non-inflammatory lesions, the patient’s own assessment and the investigator’s assessment all had confidence intervals crossing no difference. Against clindamycin, the same. One 205-patient trial favoured benzoyl peroxide on total lesion count change and that is the only separation in the set. So the choice is made on other grounds: benzoyl peroxide cannot select resistance, the retinoid acts on the plug rather than the bacteria, and the antibiotic is the least irritating. What the network meta-analyses consistently show is that combining two of them beats any of them alone.',
      },
      {
        q: 'Why did the patients and the doctors disagree?',
        a: 'This is the finding worth taking away from the whole acne literature. In the same pooled placebo-controlled trials, the investigators’ global assessment showed benzoyl peroxide clearly ahead of placebo, and the participants’ own global self-assessment did not reach significance. Same skin, same visits, two scales. It could be that clinicians are better at noticing small changes in lesion counts, or that they are less blind to treatment than the design assumes, or that a change in lesion count is not what a person with acne actually cares about. All three are plausible and the trials cannot distinguish them. It is also worth noticing that six trials reported the doctor’s rating and two reported the patient’s.',
      },
      {
        q: 'Does the expensive prescription version work better?',
        a: 'Nobody knows, because it has never been compared. The microencapsulated 5% cream approved for rosacea beat vehicle convincingly in two phase 3 trials in 733 people — 43.5% against 16.1% and 50.1% against 25.9% clear or almost clear — and its local tolerability was similar to vehicle, which for benzoyl peroxide is a genuine achievement. But the publication says in plain words that it was not compared with unencapsulated benzoyl peroxide. The entire value proposition of the microcapsule is untested against the thing it is a version of. The 2024 stability work then found that the encapsulated product formed high benzene levels at 50C anyway.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Yuan Y et al. Topical, light-based, and complementary interventions for acne: an overview of systematic reviews. Cochrane Database Syst Rev 2024;10:CD014918',
        identifier: '10.1002/14651858.CD014918.pub2',
        kind: 'doi',
      },
      {
        label:
          'Kucera K et al. Evaluation of benzene presence and formation in benzoyl peroxide drug products. J Invest Dermatol 2025;145:1147-1154.e11',
        identifier: '10.1016/j.jid.2024.09.009',
        kind: 'doi',
      },
      {
        label:
          'Cunliffe WJ, Holland KT, Bojar R, Levy SF. A randomized, double-blind comparison of a clindamycin phosphate/benzoyl peroxide gel formulation and a matching clindamycin gel with respect to microbiologic activity and clinical efficacy in the topical treatment of acne vulgaris. Clin Ther 2002;24:1117-1133',
        identifier: '10.1016/s0149-2918(02)80023-6',
        kind: 'doi',
      },
      {
        label:
          'Bhatia ND et al. Efficacy and safety of microencapsulated benzoyl peroxide cream, 5%, in rosacea: results from two phase III, randomized, vehicle-controlled trials. J Clin Aesthet Dermatol 2023;16:34-40',
        identifier: '37636253',
        kind: 'pmid',
      },
      {
        label:
          'Microencapsulated benzoyl peroxide cream 5% phase 3 rosacea trial registration record',
        identifier: 'NCT03564119',
        kind: 'nct',
      },
      {
        label:
          'Second microencapsulated benzoyl peroxide cream 5% phase 3 rosacea trial registration record',
        identifier: 'NCT03448939',
        kind: 'nct',
      },
      {
        label:
          'Stuart B et al. Topical preparations for the treatment of mild-to-moderate acne vulgaris: systematic review and network meta-analysis. Br J Dermatol 2021;185:512-525',
        identifier: '10.1111/bjd.20080',
        kind: 'doi',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
]
