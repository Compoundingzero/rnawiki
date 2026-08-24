import type { SeedDossier } from '@/lib/seed-types'

/**
 * Enriched batch 18 — the skin.
 *
 * Nine medicines applied to a surface: two retinoids, an oxidising agent, a ribosome-blocking
 * antibiotic, a vitamin D analogue, two antifungals, an insecticide and a tRNA-synthetase
 * inhibitor. Most are decades old, most cost cents per gram, and most are used for years by people
 * who were never shown where the evidence for them stops.
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
 * A tenth, topical tacrolimus, was researched and then dropped from this file: `tacrolimus` was
 * already taken by a sibling group, whose transplant-focused dossier also carries the ointment
 * indication and the 2006 boxed malignancy warning. A second dossier on the same slug is discarded
 * at load, so it is absent here rather than duplicated.
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
 *    Global Assessment, global improvement scales and mycological cure are all measurements of a
 *    proxy. Two of the drugs here have been tested
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
        'For acne the comparison is with the other topical retinoids and with benzoyl peroxide, and the largest network meta-analysis of the field found that the combinations beat any single agent. For fine wrinkling there is no substitute with comparable randomised evidence, which is a statement about how little the alternatives have been tested rather than a claim that tretinoin is powerful.',
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
          typicalCost:
            'Priced per capsule rather than per gram; not comparable to a topical figure',
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
          'The VATTC intervention was terminated six months early because of an excessive number of deaths in the tretinoin-treated group. Death was not contemplated as an endpoint in the original design. Post hoc analysis found minor imbalances in age, comorbidity and smoking status, all important predictors of death; after adjusting for them, the difference in mortality between the randomised groups remained statistically significant. The authors state that they observed an association but do not infer a causal one, and that current evidence suggests causation is unlikely — topical tretinoin has minimal systemic absorption, and no mechanism connects it to all-cause death. The finding has not been reproduced in any subsequent randomised trial, and no subsequent trial of this size has been run.',
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
        primaryEndpoint:
          'Graded improvement in photoaging at 16 weeks, with histologic confirmation',
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
          'This unexplained finding was reported rather than omitted. It is included here because it remains unresolved, not because the drug is known to be dangerous.',
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
        'Adapalene’s real competition is tretinoin, which a manufacturer-run meta-analysis of 900 patients found it equivalent to on lesion counts, and the fixed combinations, which the largest network meta-analysis in the field ranked above every single agent including this one. The choice between the retinoids is therefore about tolerability and stability rather than a demonstrated efficacy difference.',
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
          action: 'Adapalene is photostable and resistant to oxidation, which tretinoin is not.',
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
        measuredMetric:
          'IGA success 21% against 16% against 9%; total lesion reduction 45.3% against 41.8% against 33.7%',
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
        evidenceSource:
          'Cunliffe WJ, Poncet M, Loesche C, Verschoore M. Br J Dermatol 1998;139 Suppl 52:48-56 (PMID 9990421)',
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
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.application_number:%22NDA021753%22',
        kind: 'regulatory',
      },
      {
        label:
          'openFDA Drugs@FDA record for NDA 020380 (DIFFERIN adapalene gel 0.1%), marketing status over-the-counter',
        identifier:
          'https://api.fda.gov/drug/drugsfda.json?search=application_number:%22NDA020380%22',
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
            'In two phase 3 vehicle-controlled trials in 733 subjects, IGA clear or almost clear at week 12 was 43.5% against 16.1% in the first study and 50.1% against 25.9% in the second, all P<0.001. The papers state that the encapsulated product was never compared with ordinary unencapsulated benzoyl peroxide.',
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
        evidenceSource:
          'Cunliffe WJ, Holland KT, Bojar R, Levy SF. Clin Ther 2002;24:1117-1133 (PMID 12182256)',
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
        primaryEndpoint:
          'Investigators’ global assessment of improvement at 12 weeks against placebo',
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
        a: 'The chemistry is real and published in a peer-reviewed dermatology journal. Benzene was measured at 0.16 to 35.30 parts per million across 111 over-the-counter products held at ordinary room temperature. A prescription encapsulated product formed no apparent benzene at refrigerator temperature and high levels at 50C. Applied product released benzene into the air above a face model, and much more under ultraviolet light below peak sunlight. What is not established is what any of that means for a person’s cancer risk, which depends on absorbed dose over years and has not been measured. Five of the eight authors work for the analytical laboratory that raised the issue, which the paper discloses. A stability problem has been demonstrated and a health consequence has not been quantified either way.',
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

  // ---------------------------------------------------------------------------------------------
  // 4. Clindamycin — the acne cream whose own Indications section tells the prescriber to consider
  //    whether something else would be better, because a face lotion can cause colitis.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'clindamycin',
    name: 'Clindamycin',
    tradeName:
      'Cleocin / Cleocin T (topical) / Clindagel / Clindamycin Phosphate lotion, gel, foam and solution / Cabtreo (with adapalene and benzoyl peroxide)',
    sponsor: 'Pfizer, through the acquisition of the Upjohn Company, which developed it',
    targetGene:
      'rrl — the bacterial 23S ribosomal RNA gene. There is no human target; the human ribosome is not inhibited',
    targetProtein:
      'The peptidyl transferase centre of the bacterial 50S ribosomal subunit, at domain V of 23S rRNA',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1970,
    indication:
      'The topical lotion, gel, foam and solution are indicated in the treatment of acne vulgaris. The oral and injectable forms are indicated for serious infections caused by susceptible anaerobic bacteria and by susceptible streptococci, pneumococci and staphylococci, with the label directing that their use be reserved for penicillin-allergic patients or those for whom a penicillin is inappropriate',
    patientFriendlyIndication:
      'Acne, when applied to the skin; serious bacterial infection when taken by mouth or by drip',
    anatomicalSite:
      'The sebaceous follicle, where Cutibacterium acnes lives — and, unavoidably, the colon, because topical clindamycin is absorbed through the skin',
    conditionContext: {
      conditionExplainer:
        'Cutibacterium acnes multiplies behind a blocked pore and drives the inflammation that makes acne red and painful. Clindamycin stops that bacterium making protein. It is bacteriostatic — it halts growth rather than killing outright — and it also damps inflammation directly, which is part of why it works faster than the bacterial counts alone would predict.',
      whyItMatters:
        'This is the clearest example in dermatology of a local treatment with a systemic consequence. The label for a lotion applied to a face carries the colitis warning written for an intravenous antibiotic, because the drug crosses the skin, and the Indications section itself tells the prescriber to consider using something else.',
      whoTakesThis:
        'People with inflammatory acne, almost always in a fixed combination rather than alone. Guidelines and labels have converged on never using it as monotherapy, and the trial evidence for why is on this page.',
      clinicalGoals:
        'Fewer inflammatory lesions. The measured secondary goal, and the more interesting one, is what happens to the resistant bacterial population on the patient’s own skin.',
    },
    oneSentenceVerdict:
      'A lincosamide that jams the bacterial ribosome at the peptidyl transferase centre — indistinguishable from benzoyl peroxide on every pooled acne outcome, and shown in a controlled 16-week trial to raise clindamycin-resistant Cutibacterium acnes counts on the patient’s own face by more than 1,600% when used alone, which is why the modern product is a three-drug gel and why the topical label tells prescribers to consider whether another agent would be more appropriate.',
    laymanHowItWorks:
      'Bacteria build their proteins on a machine called a ribosome, which is different enough from the human version that a drug can block one and leave the other alone. Clindamycin wedges itself into the part of the bacterial ribosome where each new amino acid gets stitched onto the growing chain. Protein production stalls and the bacteria stop multiplying. Enough of the drug crosses the skin into the bloodstream that the same effect reaches the bacteria in the gut, which is why a cream for the face carries a warning about the bowel.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 66,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1684 per unit, the median United States pharmacy acquisition cost across 96 listed clindamycin products of all routes (CMS NADAC, generic, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Off patent since the 1980s, with 96 separately listed products spanning capsules, injections and topical preparations. The commercially protected objects are the fixed combinations built on top of it — the clindamycin/benzoyl peroxide gels, and the triple-combination gel approved under NDA 216632 — not the molecule.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Every serious alternative to topical clindamycin in acne is either something that cannot select resistance, or clindamycin with that something added to it. The Cochrane overview could not distinguish clindamycin from benzoyl peroxide on any pooled outcome, and the microbiology trial explains why nobody recommends the antibiotic on its own regardless.',
      conventionalRx: [
        {
          name: 'Benzoyl peroxide',
          class: 'Oxidising antimicrobial with no molecular target',
          howItCompares:
            'Statistically indistinguishable from clindamycin on total lesions (MD -3.50, 95% CI -7.54 to 0.54), inflammatory lesions, non-inflammatory lesions, participant self-assessment (RR 0.95, 95% CI 0.68 to 1.34) and investigator assessment (RR 1.10, 95% CI 0.83 to 1.45) in the 2024 Cochrane overview. It differs by being incapable of selecting resistance.',
          typicalCost:
            'US$0.3993 per gram, median United States pharmacy acquisition cost across 53 listed products (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: same measured effect, no resistance, no colitis warning, no prescription. Cons: bleaches fabric, irritates more, and degrades to benzene on warm storage.',
        },
        {
          name: 'Clindamycin phosphate with benzoyl peroxide (fixed combination gel)',
          class: 'Lincosamide plus oxidising antimicrobial in one product',
          howItCompares:
            'The combination beat matching clindamycin monotherapy on total, inflammatory and comedonal lesion counts (P<=0.046) in a 16-week randomised comparison, and reversed the growth of clindamycin-resistant organisms that monotherapy produced.',
          typicalCost:
            'Sold as a combination product; not comparable to the per-unit clindamycin figure',
          prosAndCons:
            'Pros: better efficacy and better microbiology than clindamycin alone, from the same trial. Cons: inherits benzoyl peroxide’s bleaching and irritation, and the topical clindamycin colitis warning still applies.',
        },
        {
          name: 'Clindamycin phosphate 1.2% / adapalene 0.15% / benzoyl peroxide 3.1% gel (Cabtreo)',
          class: 'Fixed-dose triple combination, approved under NDA 216632',
          howItCompares:
            'In a 741-participant phase 2 trial, treatment success at week 12 was 52.5% for the triple against 27.8% to 30.5% for the three component dyads and 8.1% for vehicle (P<=0.001 for all). The two phase 3 confirmatory trials compared it only with vehicle: 49.6% and 50.5% against 24.9% and 20.5%.',
          typicalCost: 'Branded prescription gel; not comparable to the generic per-unit figure',
          prosAndCons:
            'Pros: the only topical acne product that has beaten its own two-drug components in a randomised trial. Cons: that comparison exists in one phase 2 study and was not repeated in either phase 3 trial, and the phase 3 authors list inter-observer variation in severity ratings as a limitation.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Report persistent diarrhoea, even though this is a cream',
          action:
            'The topical label instructs that the drug be discontinued when significant diarrhoea occurs.',
          patientImpact:
            'Diarrhoea, bloody diarrhoea and colitis including pseudomembranous colitis have been reported with topical as well as systemic clindamycin, because the topical formulation is absorbed from the skin surface. The label states that orally and parenterally administered clindamycin has been associated with severe colitis which may result in patient death.',
          clinicalPrecaution:
            'The label specifically warns that antiperistaltic agents such as opiates and diphenoxylate with atropine may prolong or worsen the condition. This is a reason to tell a clinician rather than to self-treat the diarrhoea.',
        },
        {
          name: 'Ask why it is not being used on its own',
          action:
            'Modern products pair clindamycin with benzoyl peroxide or with benzoyl peroxide and a retinoid.',
          patientImpact:
            'In a controlled comparison, sixteen weeks of clindamycin alone multiplied clindamycin-resistant bacteria on patients’ faces by more than 1,600%, while the identical gel with benzoyl peroxide added reduced them. The patients whose resistant counts fell were the patients whose lesion counts fell.',
          clinicalPrecaution:
            'This is a description of published trial results, not a treatment recommendation. What to use and for how long is a clinician’s decision.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CCC[C@@H]1C[C@H](N(C1)C)C(=O)N[C@@H]([C@@H]2[C@@H]([C@@H]([C@H]([C@H](O2)SC)O)O)O)[C@H](C)Cl',
      chemicalFormula: 'C18H33ClN2O5S',
      molecularWeight: '425.00 g/mol',
      targetReceptorAffinity:
        'Binds the peptidyl transferase centre of the bacterial 50S subunit at domain V of 23S rRNA, overlapping the A-site and P-site substrate positions. It shares that binding pocket with the macrolides and streptogramin B, which is the structural reason for inducible cross-resistance through erm-mediated methylation of A2058. It does not inhibit the human 80S ribosome. Potency against Cutibacterium acnes is reported as a minimum inhibitory concentration rather than an affinity constant.',
      structureSource: {
        label:
          'PubChem CID 446598 (clindamycin) — canonical SMILES, molecular formula and weight, as held on the record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/446598',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'cli-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Configuration at C-7 and identity of the chlorine substitution',
          description:
            'Confirm the chlorine at the 7 position and its stereochemistry. Clindamycin is lincomycin with a hydroxyl replaced by chlorine with inversion of configuration, and that single substitution is what raised the potency and the oral absorption. The 7-epimer and residual lincomycin are the impurities that matter.',
          reagentsAndBuffer:
            'Clindamycin hydrochloride reference standard, reversed-phase HPLC with refractive index or evaporative light scattering detection, 1H NMR in D2O, chloride content by ion chromatography',
        },
        {
          id: 'cli-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Phosphorylation to the inactive prodrug ester',
          description:
            'Esterify the 2-hydroxyl to give clindamycin phosphate, which is what actually goes into a topical or intravenous product. The phosphate ester has no antibacterial activity of its own: it is a solubility and stability device that skin and blood phosphatases undo.',
          dependsOnStepId: 'cli-w1',
          reagentsAndBuffer:
            'Phosphorylating agent with protecting-group strategy, aqueous workup, pH-controlled crystallisation of the disodium or free acid form, residual solvent analysis by headspace GC',
        },
        {
          id: 'cli-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Separation of the prodrug from free clindamycin and hydrolysis products',
          description:
            'Quantify how much free clindamycin is already present in the finished product. A topical clindamycin phosphate lotion that has partly hydrolysed in the tube is delivering active drug to the surface before it reaches the follicle, which changes both the local exposure and the systemic one.',
          dependsOnStepId: 'cli-w2',
          reagentsAndBuffer:
            'Gradient reversed-phase HPLC with ultraviolet detection at 210 nm, phosphate buffer mobile phase, accelerated stability at 40C and 75% relative humidity',
        },
        {
          id: 'cli-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Percutaneous absorption and systemic exposure measurement',
          description:
            'Measure how much drug crosses intact skin into the systemic circulation. This experiment is not a formality: the entire colitis warning on a topical acne product rests on the fact that the answer is not zero, and the label says so in its first sentence about the topical formulation.',
          dependsOnStepId: 'cli-w3',
          reagentsAndBuffer:
            'Franz diffusion cells with dermatomed human skin, or in vivo serial plasma sampling, LC-MS/MS quantification of clindamycin phosphate and free clindamycin, urinary excretion collection',
        },
        {
          id: 'cli-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Cutibacterium acnes minimum inhibitory concentration and resistant-subpopulation counting',
          description:
            'Determine the minimum inhibitory concentration against clinical isolates, then plate the same sample on clindamycin-containing agar to count the resistant fraction separately. The second number is the one that moved in the 16-week clinical trial, and a susceptibility result reported without it hides the effect that matters most.',
          dependsOnStepId: 'cli-w4',
          reagentsAndBuffer:
            'Cutibacterium acnes clinical isolates, anaerobic Brucella or reinforced clostridial agar, clindamycin-supplemented selective plates, erythromycin disc for inducible resistance detection, CLSI anaerobe methodology',
        },
      ],
    },
    keyAudits: [
      {
        id: 'cli-a1',
        category: 'failed',
        title: 'Sixteen weeks alone multiplied the resistant bacteria more than sixteenfold',
        laymanSummary:
          'Seventy-nine patients were randomised to clindamycin gel or the identical gel with benzoyl peroxide added. By sixteen weeks the antibiotic-alone group had more than sixteen times as many clindamycin-resistant bacteria on their faces as when they started. The combination group had fewer.',
        technicalDetails:
          'Cunliffe and colleagues enrolled 79 patients aged 13 to 30 with facial Cutibacterium acnes counts of at least 10^4 colony-forming units per square centimetre and randomised them to clindamycin 1% with benzoyl peroxide 5% or to matching clindamycin 1% alone, twice daily for 16 weeks; 70 were analysed. Clindamycin-resistant C. acnes counts rose by more than 1,600% at week 16 on monotherapy and fell from baseline on the combination (P=0.018 between groups). Total C. acnes count also fell significantly more on the combination (P=0.002). Reduction in resistant organisms correlated with reduction in inflammatory lesions (r2=0.31, P=0.016) and total lesions (r2=0.28, P=0.027), and the combination reduced total, inflammatory and comedonal lesion counts significantly more (P<=0.046). This is a single-centre trial in 70 analysed patients, and it is the study the whole no-monotherapy convention rests on.',
        evidenceSource:
          'Cunliffe WJ, Holland KT, Bojar R, Levy SF. Clin Ther 2002;24:1117-1133 (PMID 12182256)',
        doi: '10.1016/s0149-2918(02)80023-6',
        measuredMetric:
          'Clindamycin-resistant Cutibacterium acnes colony counts at 16 weeks, monotherapy against combination',
        auditFlag: 'verified',
      },
      {
        id: 'cli-a2',
        category: 'failed',
        title: 'The label’s Indications section tells the prescriber to consider something else',
        laymanSummary:
          'Most drug labels use the Indications section to say what the drug is for. This one says what it is for and then, in the same paragraph, tells the doctor to think about whether another treatment would be better, because of the risk of bloody diarrhoea and colitis from a lotion applied to a face.',
        technicalDetails:
          'The topical clindamycin phosphate lotion label reads: "Clindamycin phosphate topical lotion is indicated in the treatment of acne vulgaris. In view of the potential for diarrhea, bloody diarrhea and pseudomembranous colitis, the physician should consider whether other agents are more appropriate." The Warnings section opens by stating that orally and parenterally administered clindamycin has been associated with severe colitis which may result in patient death, then that use of the topical formulation results in absorption of the antibiotic from the skin surface, and that diarrhoea, bloody diarrhoea and colitis including pseudomembranous colitis have been reported with topical as well as systemic clindamycin. It directs that the drug be discontinued when significant diarrhoea occurs and warns that antiperistaltic agents may prolong or worsen the condition.',
        evidenceSource:
          'Clindamycin Phosphate Topical Lotion United States prescribing information, Indications and Usage and Warnings sections (ANDA 214604, openFDA label endpoint)',
        measuredMetric:
          'Regulatory label text — an indication qualified in its own first paragraph by a direction to consider alternatives',
        auditFlag: 'caution',
      },
      {
        id: 'cli-a3',
        category: 'inferred',
        title: 'No measurable advantage over benzoyl peroxide on any pooled outcome',
        laymanSummary:
          'Pooled across trials with more than two thousand patients, an antibiotic that carries a colitis warning performed the same as an over-the-counter oxidising cream that carries none.',
        technicalDetails:
          'The 2024 Cochrane overview reports that against clindamycin, benzoyl peroxide may have little to no effect on total lesion counts (MD -3.50, 95% CI -7.54 to 0.54; 1 trial, 641 participants), inflammatory lesion counts (MD -1.20, 95% CI -2.99 to 0.59), non-inflammatory lesion counts (MD -2.4, 95% CI -5.3 to 0.5), participant’s global self-assessment (RR 0.95, 95% CI 0.68 to 1.34; 1 trial, 240 participants), investigator’s global assessment (RR 1.10, 95% CI 0.83 to 1.45; 2 trials, 2,277 participants) or incidence of a less serious adverse event (RR 1.27, 95% CI 0.98 to 1.64; 5 trials, 2,842 participants). Certainty was very low or low for every estimate. The overview separately notes that no included review collected data comparing topical antibiotics with placebo at all.',
        evidenceSource:
          'Yuan Y et al., Cochrane Database Syst Rev 2024;10:CD014918 (PMID 39440650)',
        doi: '10.1002/14651858.CD014918.pub2',
        inferredClaim:
          'That an antibiotic is the stronger option for inflammatory acne — every pooled comparison against benzoyl peroxide crosses no difference, and no pooled comparison against placebo exists at all',
        auditFlag: 'caution',
      },
      {
        id: 'cli-a4',
        category: 'measured',
        title: 'The triple combination beat all three of its own two-drug components',
        laymanSummary:
          'A gel with an antibiotic, an oxidiser and a retinoid in it was tested against each of the three possible pairs and against a dummy gel, in seven hundred and forty-one people. It beat every one of them.',
        technicalDetails:
          'A phase 2, double-blind, multicentre randomised 12-week study enrolled 741 participants aged 9 and over with moderate to severe acne, randomised equally to clindamycin phosphate 1.2%/benzoyl peroxide 3.1%/adapalene 0.15% gel, vehicle, or one of three component dyads. At week 12 treatment success — a two-grade reduction in Evaluator’s Global Severity Score plus clear or almost clear skin — was 52.5% on the triple against 8.1% on vehicle and 27.8% to 30.5% across the dyads, P<=0.001 for all. Absolute reductions in inflammatory (29.9) and non-inflammatory (35.5) lesions exceeded vehicle and all dyads (P<0.05, all), corresponding to more than 70% reduction. Registered as NCT03170388.',
        evidenceSource:
          'Stein Gold L et al., Am J Clin Dermatol 2022;23:93-104 (PMID 34674160; NCT03170388)',
        doi: '10.1007/s40257-021-00650-3',
        measuredMetric:
          'Treatment success at week 12, triple combination against three dyads and vehicle in one randomised trial',
        auditFlag: 'verified',
      },
      {
        id: 'cli-a5',
        category: 'inferred',
        title: 'The confirmatory trials dropped the comparison that mattered',
        laymanSummary:
          'The finding that made the three-drug gel interesting was that it beat the two-drug versions. Neither of the two confirmatory trials that supported approval included a two-drug arm. Both compared it only with a gel containing nothing.',
        technicalDetails:
          'The two phase 3, double-blind 12-week studies randomised 183 and 180 participants aged 9 and over 2:1 to once-daily triple-combination gel or vehicle gel. Treatment success at week 12 was 49.6% and 50.5% against 24.9% and 20.5% on vehicle (P<0.01 both), with least-squares mean lesion reductions of 72.7% to 80.1% against 47.6% to 59.6% (P<0.001 all). Neither trial contained a dyad arm, so the superiority over two-drug combinations rests on the single phase 2 study. The authors list inter-observer bias and variation in acne severity ratings, limited treatment duration and population generalisability as limitations. Registered as NCT04214639 and NCT04214652; approved under NDA 216632.',
        evidenceSource:
          'Stein Gold L et al., J Am Acad Dermatol 2023;89:927-935 (PMID 37656094; NCT04214639, NCT04214652)',
        doi: '10.1016/j.jaad.2022.08.069',
        inferredClaim:
          'That the three-drug gel is established as better than the two-drug gels — a single phase 2 trial made that comparison and neither confirmatory phase 3 trial repeated it',
        auditFlag: 'caution',
      },
      {
        id: 'cli-a6',
        category: 'conclusion_shift',
        title: 'Clindamycin resistance is real but far rarer than the reputation suggests',
        laymanSummary:
          'The story people tell is that acne antibiotics have stopped working because of resistance. Pooling thirty-nine studies, about three in a hundred acne bacteria were clindamycin-resistant. For erythromycin, the drug clindamycin largely replaced, it was thirty-seven in a hundred.',
        technicalDetails:
          'A random-effects meta-analysis of 39 studies estimated the pooled proportion of clindamycin-resistant Cutibacterium acnes isolates at 0.031 (95% CI 0.014 to 0.071). Erythromycin resistance was 0.366 (95% CI 0.302 to 0.434) and azithromycin 0.149 (95% CI 0.061 to 0.322); doxycycline 0.079, tetracycline 0.062 and minocycline 0.025. The authors’ own conclusion still describes a concerning increase in resistant C. acnes with antibiotic use in acne. Both readings are supportable and they are not in conflict: the population-level prevalence is low, and the within-patient selection effect demonstrated in the 16-week monotherapy trial is large. What a pooled prevalence cannot capture is what happens to one person’s own skin flora over a course of treatment.',
        evidenceSource: 'Beig M et al., J Glob Antimicrob Resist 2024;39:82-91 (PMID 39179105)',
        doi: '10.1016/j.jgar.2024.07.005',
        inferredClaim:
          'That topical clindamycin has been rendered ineffective by resistance — the pooled prevalence is around 3%, and the case against monotherapy rests on within-patient selection rather than on population-level failure',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Applied as an inactive ester that the skin switches on',
        laymanDesc:
          'What is in the bottle is not the working drug. It is a phosphate version with no antibacterial activity, which enzymes in the skin snip off to release the active molecule.',
        molecularDetail:
          'Clindamycin phosphate is a prodrug with no intrinsic antibacterial activity. Phosphatases in skin and plasma hydrolyse the 2-phosphate ester to free clindamycin. The ester exists for aqueous solubility and formulation stability, not for targeting, and its hydrolysis in the tube is a stability specification.',
        iconName: 'Droplet',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Some of it crosses the skin into the bloodstream',
        laymanDesc:
          'Not all of the drug stays where it is put. Enough passes through the skin to reach the rest of the body, and that is the entire reason a face lotion carries a warning about the bowel.',
        molecularDetail:
          'The topical label states directly that use of the topical formulation results in absorption of the antibiotic from the skin surface, and this is the stated basis for extending the systemic colitis warning to topical products. The absorbed fraction is small but not nil, and it reaches the colonic flora.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It plugs the bacterial protein factory',
        laymanDesc:
          'Inside the bacterium the drug jams itself into the exact spot where each new building block gets attached to a growing protein. The chain cannot be extended.',
        molecularDetail:
          'Clindamycin binds domain V of 23S rRNA in the 50S ribosomal subunit at the peptidyl transferase centre, overlapping the A-site and P-site substrate positions and blocking peptide bond formation and early chain elongation. It does not inhibit the human 80S ribosome, which is the basis for its selectivity.',
        iconName: 'Ban',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Growth stops, and the survivors are the resistant ones',
        laymanDesc:
          'The bacteria stop multiplying rather than dying outright. Any organism that already carries a change in the target site keeps growing, and over weeks it inherits the space the others vacated.',
        molecularDetail:
          'Clindamycin is bacteriostatic against Cutibacterium acnes. Resistance arises from mutation at A2058 or G2057 in 23S rRNA or from erm-mediated methylation of A2058, which also confers macrolide cross-resistance because the binding pockets overlap. Sixteen weeks of monotherapy raised resistant colony counts by more than 1,600% in the controlled comparison.',
        iconName: 'Bug',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Inflammatory lesions fall',
        laymanDesc:
          'Fewer bacteria and less inflammation mean fewer red spots. In the pooled comparisons this is the same amount of improvement an over-the-counter oxidising cream delivers.',
        molecularDetail:
          'Against benzoyl peroxide, pooled total lesion difference was MD -3.50 (95% CI -7.54 to 0.54) and investigator global assessment RR 1.10 (95% CI 0.83 to 1.45) across 2,277 participants, both crossing no difference. Clindamycin also has direct anti-inflammatory activity independent of bacterial killing, which is the proposed reason lesion counts fall faster than colony counts.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What the endpoint does not measure',
        laymanDesc:
          'The trials count spots on a face. Nothing in that count shows what has happened to the bacteria living on the rest of the patient, and the one trial that did look found the answer was unflattering.',
        molecularDetail:
          'Lesion counts and Evaluator’s Global Severity Score are the registration endpoints. Resistant-subpopulation counting is not part of any pivotal acne trial programme and was measured in a separate 79-patient microbiology study, where the resistant fraction rose more than 1,600% on monotherapy over 16 weeks.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Cunliffe 2002 clindamycin microbiology trial (PMID 12182256)',
        phase: 'Single-centre, randomised, double-blind, parallel-group, active-controlled',
        sampleSize: 79,
        primaryEndpoint:
          'Cutibacterium acnes and clindamycin-resistant C. acnes counts and lesion counts at 16 weeks, clindamycin/benzoyl peroxide against matching clindamycin alone',
        endpointMet: true,
        statisticalPValue:
          'Total C. acnes P=0.002 and clindamycin-resistant count P=0.018 favouring combination; resistant counts rose more than 1,600% on clindamycin monotherapy. Lesion reductions P<=0.046',
        unreportedAdverseSignals:
          'The headline result is usually reported as the combination being more effective. The more consequential finding is what happened in the monotherapy arm, and it is a microbiological endpoint that no pivotal acne trial collects.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'IDP-126 phase 2, triple combination against three dyads (NCT03170388)',
        phase: 'Phase 2, multicentre, randomised, double-blind, vehicle- and active-controlled',
        sampleSize: 741,
        primaryEndpoint:
          'Treatment success at week 12 and absolute change in inflammatory and non-inflammatory lesion counts',
        endpointMet: true,
        statisticalPValue:
          'Treatment success 52.5% against 8.1% vehicle and 27.8% to 30.5% across the three dyads, P<=0.001 for all; lesion reductions greater than every comparator, P<0.05',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'IDP-126 phase 3 trial 1 (NCT04214639)',
        phase: 'Phase 3, double-blind, randomised, vehicle-controlled',
        sampleSize: 183,
        primaryEndpoint:
          'Treatment success and change in inflammatory and non-inflammatory lesion counts at week 12 against vehicle',
        endpointMet: true,
        statisticalPValue:
          '49.6% treatment success against 24.9% on vehicle, P<0.01; least-squares mean lesion reductions 72.7% to 80.1% against 47.6% to 59.6%, P<0.001',
        unreportedAdverseSignals:
          'Vehicle-controlled only. The dyad comparison that justified a three-drug product was not included, and the authors list inter-observer variation in severity ratings as a limitation.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'IDP-126 phase 3 trial 2 (NCT04214652)',
        phase: 'Phase 3, double-blind, randomised, vehicle-controlled',
        sampleSize: 180,
        primaryEndpoint:
          'Treatment success and change in inflammatory and non-inflammatory lesion counts at week 12 against vehicle',
        endpointMet: true,
        statisticalPValue: '50.5% treatment success against 20.5% on vehicle, P<0.01',
        unreportedAdverseSignals:
          'Same design limitation as the companion trial: no active comparator arm of any kind.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Cochrane overview pooled clindamycin against benzoyl peroxide (CD014918)',
        phase: 'Overview of systematic reviews, pooled randomised evidence',
        sampleSize: 2277,
        primaryEndpoint:
          'Investigator’s global assessment at 12 weeks, benzoyl peroxide against clindamycin',
        endpointMet: false,
        statisticalPValue:
          'RR 1.10 (95% CI 0.83 to 1.45), 2 trials, very low-certainty evidence; every other pooled outcome in the comparison also crosses no difference',
        unreportedAdverseSignals:
          'The overview records that no included review collected data for topical antibiotics against placebo or against topical retinoids, so clindamycin has no pooled placebo comparison at all.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Clindamycin-resistant Cutibacterium acnes counts rose more than 1,600% over 16 weeks of monotherapy and fell when benzoyl peroxide was added (P=0.018)',
        'The combination reduced total, inflammatory and comedonal lesions more than clindamycin alone (P<=0.046)',
        'Triple-combination gel produced 52.5% treatment success against 27.8% to 30.5% for the three dyads and 8.1% for vehicle in 741 randomised participants',
        'Triple-combination gel produced 49.6% and 50.5% treatment success against 24.9% and 20.5% on vehicle in the two phase 3 trials',
        'Pooled clindamycin resistance among C. acnes isolates is 3.1% (95% CI 1.4 to 7.1) across 39 studies, against 36.6% for erythromycin',
      ],
      unsupportedInferences: [
        'That a topical antibiotic outperforms benzoyl peroxide in inflammatory acne — every pooled comparison crosses no difference',
        'That the three-drug gel is established as better than the two-drug gels, when only the phase 2 trial made that comparison',
        'That topical clindamycin is a local treatment — the label states it is absorbed from the skin surface and extends the systemic colitis warning to it',
        'That resistance has made the drug ineffective, when population prevalence is around 3% and the demonstrated problem is within-patient selection',
      ],
      whatFailedInitially: [
        'Monotherapy failed on its own microbiology, multiplying resistant organisms on patients’ faces more than sixteenfold in 16 weeks',
        'The topical label qualifies its own Indications section with a direction to consider whether other agents are more appropriate',
        'No pooled comparison of topical antibiotics against placebo exists in the 2024 Cochrane overview',
        'Neither phase 3 trial of the triple combination retained the dyad comparison that made the product interesting',
      ],
      realWorldOutcome: [
        'Approved in 1970 and still in first-line acne use, but effectively never as a single agent',
        'Ninety-six listed products across all routes at a median United States acquisition cost of US$0.1684 per unit',
        'Now most commonly dispensed inside a fixed combination, culminating in the triple-combination gel approved under NDA 216632',
        'Carries the same colitis warning on a facial lotion as on an intravenous infusion, because the skin absorbs it',
      ],
    },
    deliverySystem: {
      type: 'Topical lotion, gel, foam and solution for acne; oral capsules and intravenous solution for systemic infection',
      description:
        'The topical forms deliver clindamycin phosphate, an inactive ester that skin phosphatases hydrolyse to free clindamycin. The label states that the topical formulation is absorbed from the skin surface, which is why systemic warnings apply. Modern products almost always pair it with benzoyl peroxide, or with benzoyl peroxide and adapalene in a single fixed-dose gel, because monotherapy selects resistance on the treated skin.',
      safetyProfile:
        'The topical label carries the colitis warning written for the systemic drug: diarrhoea, bloody diarrhoea and colitis including pseudomembranous colitis have been reported with topical as well as systemic use, and orally or parenterally administered clindamycin has been associated with severe colitis which may result in patient death. The drug should be discontinued when significant diarrhoea occurs, and antiperistaltic agents may prolong or worsen the condition. Local effects are dryness, erythema, burning and peeling, at rates not distinguishable from benzoyl peroxide in the pooled comparisons (RR 1.27, 95% CI 0.98 to 1.64).',
    },
    commonQuestions: [
      {
        q: 'Can a cream really cause colitis?',
        a: 'The label says it has been reported, and explains the mechanism in its first sentence about the topical form: use of the topical formulation results in absorption of the antibiotic from the skin surface. Enough drug reaches the bloodstream, and from there the colon, to disturb the gut flora that keeps Clostridioides difficile in check. The Warnings section opens by noting that orally and parenterally administered clindamycin has been associated with severe colitis which may result in patient death, and the topical Indications section itself says that in view of the potential for diarrhoea, bloody diarrhoea and pseudomembranous colitis, the physician should consider whether other agents are more appropriate. It is rare. It is also the reason this drug is not a first choice on its own.',
        auditNote:
          'An Indications section that qualifies itself with a suggestion to use something else is unusual enough to be worth reading in the original.',
      },
      {
        q: 'Why is it never prescribed on its own any more?',
        a: 'Because of one trial and its microbiology. Seventy-nine patients were randomised to clindamycin gel or the identical gel with benzoyl peroxide in it, for sixteen weeks, with bacterial counts taken from their faces. On clindamycin alone, the number of clindamycin-resistant organisms rose by more than 1,600%. On the combination it fell. And the patients whose resistant counts fell were the patients whose spots cleared — the two correlated. Benzoyl peroxide has no target for a bacterium to mutate, so pairing them lets the antibiotic work without breeding its own replacement.',
      },
      {
        q: 'Is it stronger than benzoyl peroxide?',
        a: 'The pooled evidence says no. On total lesion counts the difference was -3.50 with a confidence interval from -7.54 to 0.54. On the patient’s own assessment, 0.95 with an interval from 0.68 to 1.34. On the investigator’s assessment, across 2,277 participants, 1.10 with an interval from 0.83 to 1.45. Every one of those crosses no difference, and every one is graded low or very low certainty. There is also no pooled comparison of topical antibiotics against placebo anywhere in the Cochrane overview, which is a striking gap for a drug class in use since 1970.',
      },
      {
        q: 'Has resistance made acne antibiotics useless?',
        a: 'Not on the numbers, and the numbers are less alarming than the reputation. Pooling 39 studies, 3.1% of Cutibacterium acnes isolates were clindamycin-resistant, with a confidence interval from 1.4% to 7.1%. Erythromycin, the drug clindamycin largely displaced, sits at 36.6%. So the population prevalence is low. What is genuinely established is the within-patient effect: a course of monotherapy reshapes one person’s own skin flora towards resistance within months. Those two facts are both true, and the second is the one that drives how the drug is used.',
        auditNote:
          'The authors of that meta-analysis still describe a concerning increase in resistant organisms. Reporting the pooled figure without their conclusion, or their conclusion without the figure, would each be a partial reading.',
      },
      {
        q: 'Is the three-drug gel worth it over the two-drug one?',
        a: 'One trial says yes and the two trials that mattered for approval did not ask. In a 741-person phase 2 study the triple gel achieved 52.5% treatment success against 27.8% to 30.5% for each of the three two-drug combinations and 8.1% for vehicle. That is a genuine and well-designed comparison. The two phase 3 trials that followed randomised 183 and 180 people against vehicle only, and reported 49.6% and 50.5% against 24.9% and 20.5%. So the vehicle-controlled result has been replicated and the comparison against the two-drug alternatives has not. The phase 3 authors also list inter-observer variation in acne severity ratings among their limitations, which is a fair caution about every number on this page.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Cunliffe WJ, Holland KT, Bojar R, Levy SF. A randomized, double-blind comparison of a clindamycin phosphate/benzoyl peroxide gel formulation and a matching clindamycin gel with respect to microbiologic activity and clinical efficacy in the topical treatment of acne vulgaris. Clin Ther 2002;24:1117-1133',
        identifier: '10.1016/s0149-2918(02)80023-6',
        kind: 'doi',
      },
      {
        label:
          'Yuan Y et al. Topical, light-based, and complementary interventions for acne: an overview of systematic reviews. Cochrane Database Syst Rev 2024;10:CD014918',
        identifier: '10.1002/14651858.CD014918.pub2',
        kind: 'doi',
      },
      {
        label:
          'Stein Gold L et al. Efficacy and safety of a fixed-dose clindamycin phosphate 1.2%, benzoyl peroxide 3.1%, and adapalene 0.15% gel for moderate-to-severe acne: a randomized phase II study of the first triple-combination drug. Am J Clin Dermatol 2022;23:93-104',
        identifier: '10.1007/s40257-021-00650-3',
        kind: 'doi',
      },
      {
        label:
          'Stein Gold L et al. Clindamycin phosphate 1.2%/adapalene 0.15%/benzoyl peroxide 3.1% gel for moderate-to-severe acne: efficacy and safety results from two randomized phase 3 trials. J Am Acad Dermatol 2023;89:927-935',
        identifier: '10.1016/j.jaad.2022.08.069',
        kind: 'doi',
      },
      {
        label:
          'Beig M et al. Prevalence of antibiotic-resistant Cutibacterium acnes (formerly Propionibacterium acnes) isolates, a systematic review and meta-analysis. J Glob Antimicrob Resist 2024;39:82-91',
        identifier: '10.1016/j.jgar.2024.07.005',
        kind: 'doi',
      },
      {
        label:
          'Clindamycin Phosphate Topical Lotion United States prescribing information, Indications and Usage and Warnings — ANDA 214604, retrieved from the openFDA label endpoint',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.application_number:%22ANDA214604%22',
        kind: 'regulatory',
      },
      {
        label: 'IDP-126 triple combination phase 2 trial registration record, 741 participants',
        identifier: 'NCT03170388',
        kind: 'nct',
      },
      {
        label: 'IDP-126 triple combination phase 3 trial registration record, 183 participants',
        identifier: 'NCT04214639',
        kind: 'nct',
      },
      {
        label: 'IDP-126 triple combination phase 3 trial registration record, 180 participants',
        identifier: 'NCT04214652',
        kind: 'nct',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 5. Calcipotriene — a psoriasis drug that loses to steroids on the scalp and irritates more,
  //    which turned out to be an immune adjuvant that cut three-year skin cancer on treated faces.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'calcipotriene',
    name: 'Calcipotriene',
    tradeName: 'Dovonex / Sorilux / Calcitrene / Taclonex (with betamethasone dipropionate)',
    sponsor: 'LEO Pharma AS, which discovered it and holds the originator applications',
    targetGene: 'VDR — the vitamin D receptor gene',
    targetProtein:
      'Vitamin D receptor, acting as a heterodimer with retinoid X receptor at vitamin D response elements in keratinocyte DNA',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1993,
    indication:
      'Topical treatment of plaque psoriasis of the scalp and body. The foam is indicated in adults and paediatric patients 4 years of age and older; combination products with betamethasone dipropionate are separately approved',
    patientFriendlyIndication: 'Plaque psoriasis — the raised, red, scaly patches',
    anatomicalSite:
      'The epidermal keratinocyte nucleus, in the thickened plaque where cell division has run out of control',
    conditionContext: {
      conditionExplainer:
        'In a psoriasis plaque the skin cells divide far too fast and never finish maturing, so they pile up as scale instead of shedding. The immune system drives that acceleration and is driven by it in turn. Calcipotriene is a modified vitamin D that tells those cells to slow down and grow up.',
      whyItMatters:
        'It was introduced as the steroid-free alternative for a disease people treat for decades. Whether it delivers on that promise is the central unanswered question on this page, and the Cochrane review that examined it said the evidence to answer it does not exist for either drug.',
      whoTakesThis:
        'Adults and children from age 4 with plaque psoriasis, usually now in a fixed combination with a corticosteroid rather than alone.',
      clinicalGoals:
        'Flatter, less scaly, less red plaques on a graded scale. The interesting secondary story is what the same molecule does to sun-damaged skin, which has nothing to do with psoriasis at all.',
    },
    oneSentenceVerdict:
      'A vitamin D analogue that binds the vitamin D receptor in keratinocytes and forces them to stop dividing and differentiate — significantly better than placebo on the body across a 177-trial, 34,808-participant Cochrane review, significantly worse than potent corticosteroids on the scalp and more irritating than they are everywhere, and, in an unrelated four-day use, the agent that cut three-year squamous cell carcinoma on treated faces from 28% to 7%.',
    laymanHowItWorks:
      'Vitamin D is not really a vitamin — it is a hormone, and skin cells have a receptor for it sitting on their DNA. Calcipotriene is vitamin D redesigned so that it still fits that receptor but is destroyed within hours, so it acts on skin and does not raise the calcium in your blood the way real vitamin D would. When it binds, the receptor switches off the genes that keep the cell dividing and switches on the genes that make it mature and shed. The plaque thins. Separately and unexpectedly, the same receptor makes keratinocytes release an alarm signal that pulls immune cells in, which is why the drug ended up in a skin cancer trial.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 70,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$1.48 per gram, the median United States pharmacy acquisition cost across 22 listed calcipotriene products (CMS NADAC, generic, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Generic since the Dovonex patents expired, with 22 listed products. The commercially live objects are the fixed combinations with betamethasone dipropionate and the newer foam and suspension vehicles, not the molecule — a pattern this batch shows repeatedly for drugs nobody can own.',
      synthesisComplexity: 'High',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The Cochrane review put the answer bluntly: corticosteroids perform at least as well as vitamin D analogues and cause fewer local adverse events, and the combination of the two beats either alone on both body and scalp. The case for calcipotriene rests on avoiding long-term steroid atrophy, and the same review reports there is not enough evidence to know how large that risk is.',
      conventionalRx: [
        {
          name: 'Potent topical corticosteroid',
          class: 'Glucocorticoid receptor agonist',
          howItCompares:
            'Pooled standardised mean difference against placebo -0.89 (95% CI -1.06 to -0.72) for potent and -1.56 (95% CI -1.87 to -1.26) for very potent steroids, which on a six-point improvement scale is 1.0 and 1.8 points. On the scalp, vitamin D analogues were significantly less effective than both. Steroids also caused fewer local adverse events than vitamin D.',
          typicalCost: 'Most potent topical corticosteroids are generic and inexpensive',
          prosAndCons:
            'Pros: at least as effective, less burning and irritation, faster. Cons: dermal atrophy with prolonged use, and the Cochrane authors state there remains a lack of evidence about how large that risk actually is.',
        },
        {
          name: 'Calcipotriene with betamethasone dipropionate (Taclonex and generics)',
          class: 'Fixed-dose vitamin D analogue plus potent corticosteroid',
          howItCompares:
            'For both body and scalp psoriasis, combined treatment performed significantly better than vitamin D alone or corticosteroid alone in the Cochrane review, and was tolerated as well as potent corticosteroids and significantly better than vitamin D alone.',
          typicalCost:
            'Sold as a combination product; not comparable to the per-gram calcipotriene figure',
          prosAndCons:
            'Pros: the best-supported topical option in the review, and better tolerated than calcipotriene by itself. Cons: carries the corticosteroid’s HPA-axis suppression, cataract and glaucoma warnings alongside calcipotriene’s hypercalcaemia warning.',
        },
        {
          name: 'Coal tar preparations',
          class: 'Crude complex mixture, mechanism not fully defined',
          howItCompares:
            'Vitamin D generally performed better than coal tar in the pooled head-to-head comparisons. Findings against dithranol were mixed, and dithranol itself beat placebo.',
          typicalCost: 'Inexpensive and widely available without prescription in many formulations',
          prosAndCons:
            'Pros: decades of use, very cheap. Cons: staining, smell, and generally outperformed by vitamin D analogues in the pooled comparisons.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Calcium in the blood is a real, monitored risk',
          action:
            'The label directs that treatment be discontinued if hypercalcaemia or hypercalciuria develops, until calcium metabolism normalises.',
          patientImpact:
            'Calcipotriene was engineered to be destroyed quickly so it would not raise blood calcium, and mostly it succeeds. Hypercalcaemia and hypercalciuria have nonetheless been observed with the combination product and appear in its Warnings and Precautions.',
          clinicalPrecaution:
            'This is a label-directed monitoring point, not a dosing instruction. How much to use and where is a clinician’s decision.',
        },
        {
          name: 'Expect more irritation than from a steroid, not less',
          action:
            'Local adverse events such as burning and irritation were significantly more common with vitamin D than with potent corticosteroids on both body and scalp.',
          patientImpact:
            'This surprises people who assume the non-steroid option must be the gentler one. Adding a corticosteroid to calcipotriene improves tolerability rather than worsening it — the combination was tolerated significantly better than calcipotriene alone.',
          clinicalPrecaution:
            'Persistent burning, or irritation spreading beyond treated plaques, is a reason to consult rather than continue.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'C[C@H](/C=C/[C@H](C1CC1)O)[C@H]2CC[C@@H]\\3[C@@]2(CCC/C3=C\\C=C/4\\C[C@H](C[C@@H](C4=C)O)O)C',
      chemicalFormula: 'C27H40O3',
      molecularWeight: '412.60 g/mol',
      targetReceptorAffinity:
        'Binds the vitamin D receptor with affinity comparable to calcitriol, the natural hormone, which is the design target: equal receptor engagement with a side chain — a 22,23-double bond and a terminal cyclopropyl ring — that is metabolised within hours. The short half-life, not weaker binding, is what separates the skin effect from the systemic calcium effect.',
      structureSource: {
        label:
          'PubChem CID 5288783 (calcipotriol) — canonical SMILES, molecular formula and weight, as held on the record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5288783',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'cal-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Triene identity and 5,6-trans isomer content',
          description:
            'Confirm the intact secosteroid triene and quantify the 5,6-trans isomer. Vitamin D analogues carry an open B-ring with a conjugated triene that light and acid both isomerise. The trans isomer is far less active, so this is a potency assay disguised as an identity test.',
          reagentsAndBuffer:
            'Calcipotriol reference standard, reversed-phase HPLC with ultraviolet detection at 264 nm, amber glassware under argon, butylated hydroxytoluene as antioxidant, 1H NMR for triene geometry',
        },
        {
          id: 'cal-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Side-chain construction and formulation at controlled pH',
          description:
            'Build the cyclopropyl-bearing side chain that gives the molecule its short half-life, then formulate into ointment, cream, foam or scalp solution. The pH of the vehicle matters more than usual: calcipotriene is degraded by acid, which is why co-formulating it with certain other topicals destroys it.',
          dependsOnStepId: 'cal-w1',
          reagentsAndBuffer:
            'Protected vitamin D side-chain intermediates, Wittig or Julia coupling under inert atmosphere, white petrolatum or foam vehicle, pH adjusted to the alkaline side, disodium edetate',
        },
        {
          id: 'cal-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Photostability and compatibility testing of the finished product',
          description:
            'Expose the finished product to light and, separately, to acidic co-formulants. This is the analytical basis for a practical fact: calcipotriene and salicylic acid are incompatible, and combination with a corticosteroid required a vehicle designed so both survive.',
          dependsOnStepId: 'cal-w2',
          reagentsAndBuffer:
            'ICH Q1B photostability chamber, acid challenge at defined pH, accelerated stability at 40C and 75% relative humidity, HPLC assay of calcipotriol and 5,6-trans isomer before and after',
        },
        {
          id: 'cal-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Penetration into plaque skin and systemic calcium counter-screen',
          description:
            'Measure delivery into thickened psoriatic plaque, then measure serum and urinary calcium. Both readouts are needed together: the whole design of the molecule is a trade between reaching the keratinocyte and not reaching the parathyroid axis, and only measuring one of them cannot show whether the trade worked.',
          dependsOnStepId: 'cal-w3',
          reagentsAndBuffer:
            'Excised plaque or lesional biopsy, Franz diffusion cells for intact skin comparison, LC-MS/MS for calcipotriol and its ketone and alcohol metabolites, serum calcium, albumin and 24-hour urinary calcium in vivo',
        },
        {
          id: 'cal-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'VDR transactivation, keratinocyte differentiation and TSLP induction',
          description:
            'Run a vitamin D response element reporter, then measure both keratinocyte differentiation markers and thymic stromal lymphopoietin. The last of those is not a psoriasis readout at all — it is the cytokine that turned this drug into an immunotherapy, and a laboratory that only assays differentiation would never have found it.',
          dependsOnStepId: 'cal-w4',
          reagentsAndBuffer:
            'VDRE-luciferase reporter line, primary normal human epidermal keratinocytes, calcitriol as reference agonist, quantitative PCR and ELISA for involucrin, transglutaminase 1 and TSLP',
        },
      ],
    },
    keyAudits: [
      {
        id: 'cal-a1',
        category: 'measured',
        title: 'Better than placebo on the body, across 177 trials and 34,808 participants',
        laymanSummary:
          'The Cochrane review of topical psoriasis treatments is one of the largest in dermatology. Vitamin D analogues beat placebo on the body, by roughly one point on a six-point improvement scale.',
        technicalDetails:
          'The 2013 Cochrane review included 177 randomised controlled trials with 34,808 participants, including 26 trials of scalp psoriasis. Most vitamin D analogues used on the body were significantly more effective than placebo, with standardised mean differences ranging from -0.67 (95% CI -1.04 to -0.30) for twice-daily becocalcidiol to -1.66 (95% CI -2.66 to -0.67) for once-daily paricalcitol — on a six-point global improvement scale, 0.8 and 1.9 points respectively. Vitamin D generally performed better than coal tar; findings against dithranol were mixed. No comparison of topical agents found a significant difference in systemic adverse effects.',
        evidenceSource:
          'Mason AR, Mason J, Cork M, Dooley G, Hancock H. Cochrane Database Syst Rev 2013;3:CD005028 (PMID 23543539)',
        doi: '10.1002/14651858.CD005028.pub3',
        measuredMetric:
          'Standardised mean difference in global improvement against placebo, pooled across randomised trials',
        auditFlag: 'verified',
      },
      {
        id: 'cal-a2',
        category: 'failed',
        title: 'On the scalp it lost to steroids, and it irritated more everywhere',
        laymanSummary:
          'Applied to the scalp, the vitamin D analogue was significantly worse than both potent and very potent steroid preparations. And on both body and scalp it caused more burning and irritation than the steroids did.',
        technicalDetails:
          'The Cochrane review states that when applied to psoriasis of the scalp, vitamin D was significantly less effective than both potent corticosteroids and very potent corticosteroids, and that indirect evidence from placebo-controlled trials supported the finding. Head-to-head comparisons on the body had mixed findings. For both body and scalp, potent corticosteroids were less likely than vitamin D to cause local adverse events such as burning or irritation. The authors’ overall conclusion is that corticosteroids perform at least as well as vitamin D analogues and are associated with a lower incidence of local adverse events.',
        evidenceSource:
          'Mason AR et al., Cochrane Database Syst Rev 2013;3:CD005028 (PMID 23543539)',
        doi: '10.1002/14651858.CD005028.pub3',
        measuredMetric:
          'Head-to-head effectiveness and local adverse event rates against potent and very potent corticosteroids',
        auditFlag: 'verified',
      },
      {
        id: 'cal-a3',
        category: 'inferred',
        title: 'The reason to avoid steroids has never been properly measured',
        laymanSummary:
          'People use a vitamin D analogue instead of a steroid to protect the skin from thinning over years. Of 177 trials, twenty-five looked for skin thinning at all, found almost none, and did not report enough detail to know whether they would have detected it.',
        technicalDetails:
          'The review records that only 25 trials assessed clinical cutaneous dermal atrophy, few cases were detected, and trials reported insufficient information to determine whether the assessment methods were robust. It adds that clinical measurements of dermal atrophy are insensitive and detect only the most severe cases. The authors conclude that for people receiving long-term corticosteroid treatment there remains a lack of evidence about the risk of skin dermal atrophy, and that further research is required to inform long-term maintenance treatment. Psoriasis is treated for decades and the trials are measured in weeks; the comparison that would justify the whole steroid-sparing strategy has not been run at the necessary duration on either side.',
        evidenceSource:
          'Mason AR et al., Cochrane Database Syst Rev 2013;3:CD005028 (PMID 23543539)',
        doi: '10.1002/14651858.CD005028.pub3',
        inferredClaim:
          'That using a vitamin D analogue instead of a corticosteroid protects skin from atrophy over years of treatment — the rationale for the entire drug class, and unmeasured in 152 of the 177 trials that could have measured it',
        auditFlag: 'caution',
      },
      {
        id: 'cal-a4',
        category: 'measured',
        title: 'The combination beats either component, and is gentler than calcipotriene alone',
        laymanSummary:
          'Putting the vitamin D analogue and a steroid in one product worked better than either separately, on the body and on the scalp. It also stung less than the vitamin D on its own.',
        technicalDetails:
          'For both body and scalp psoriasis, combined treatment with vitamin D and corticosteroid performed significantly better than vitamin D alone or corticosteroid alone. Combined treatment on either site was tolerated as well as potent corticosteroids and significantly better than vitamin D alone. The combination product’s own label reports the most common adverse reactions at 1% or more as pruritus and scaly rash, from a safety database of 2,448 subjects with plaque psoriasis, of whom 1,992 were exposed for 4 weeks and 289 for 8 weeks.',
        evidenceSource:
          'Mason AR et al., Cochrane Database Syst Rev 2013;3:CD005028 (PMID 23543539); calcipotriene and betamethasone dipropionate ointment United States prescribing information, section 6.1 (ANDA 200174)',
        doi: '10.1002/14651858.CD005028.pub3',
        measuredMetric:
          'Effectiveness and local tolerability of the fixed combination against each component alone',
        auditFlag: 'verified',
      },
      {
        id: 'cal-a5',
        category: 'conclusion_shift',
        title: 'Four days of it cleared 87.8% of precancerous lesions, in a different disease',
        laymanSummary:
          'A trial gave people four days of calcipotriene mixed with a chemotherapy cream, on sun-damaged faces and scalps, and counted precancerous spots. Almost nine in ten disappeared, against about one in four with the chemotherapy cream alone.',
        technicalDetails:
          'A randomised double-blind trial in 131 participants compared 0.005% calcipotriol ointment plus 5% 5-fluorouracil cream against Vaseline plus 5-fluorouracil, self-applied to the whole of qualified anatomical sites — face, scalp and upper extremities — twice daily for four consecutive days. Mean reduction in actinic keratosis count was 87.8% against 26.3% (P<0.0001). The combination induced thymic stromal lymphopoietin, HLA class II and NKG2D ligand expression in lesional keratinocytes with a marked CD4+ T cell infiltrate peaking at days 10 to 11, without pain, crusting or ulceration. The mechanism was worked out first in genetically engineered mice, where calcipotriol suppressed skin carcinogenesis in a TSLP-dependent manner. Registered as NCT02019355 and investigator-initiated.',
        evidenceSource:
          'Cunningham TJ et al., J Clin Invest 2017;127:106-116 (PMID 27869649; NCT02019355)',
        doi: '10.1172/JCI89820',
        measuredMetric:
          'Percentage reduction in actinic keratosis count after a four-day course, against 5-fluorouracil with an inert vehicle',
        auditFlag: 'verified',
      },
      {
        id: 'cal-a6',
        category: 'inferred',
        title: 'The cancer-prevention follow-up is real, small, and narrower than it sounds',
        laymanSummary:
          'Following those same patients for three years, fewer of the calcipotriene group developed squamous cell carcinoma on the treated face and scalp — two of thirty against eleven of forty. Across the whole body and the whole follow-up period, the difference did not reach significance.',
        technicalDetails:
          'A blinded prospective cohort study of the trial participants assessed squamous cell and basal cell carcinoma at 1, 2 and 3 years. Significantly fewer participants developed SCC on the treated face and scalp within 3 years: 2 of 30 (7%) against 11 of 40 (28%), hazard ratio 0.215 (95% CI 0.048 to 0.972), P=0.032. Over the full follow-up of more than 1,500 days the proportion remaining SCC-free favoured the treated group but did not reach significance (P=0.0765). There was no difference in basal cell carcinoma. Epidermal tissue-resident memory T cells persisted in treated face and scalp skin (P=0.0028). Two of the authors are co-inventors on a filed patent for the use of calcipotriol plus 5-fluorouracil for precancerous skin lesions, which the paper discloses.',
        evidenceSource: 'Rosenberg AR et al., JCI Insight 2019;4:e125476 (PMID 30895944)',
        doi: '10.1172/jci.insight.125476',
        inferredClaim:
          'That calcipotriene prevents skin cancer — the significant result is a 3-year, single-site, 70-person subgroup; the whole-follow-up comparison did not reach significance and basal cell carcinoma did not move at all',
        auditFlag: 'caution',
      },
      {
        id: 'cal-a7',
        category: 'failed',
        title: 'It was engineered not to raise blood calcium, and sometimes does anyway',
        laymanSummary:
          'The entire point of redesigning vitamin D was to keep the skin effect and lose the effect on blood calcium. The label still records that raised blood and urine calcium have been seen, and instructs stopping treatment when they are.',
        technicalDetails:
          'The calcipotriene and betamethasone dipropionate ointment label lists hypercalcaemia and hypercalciuria in Warnings and Precautions, directing that treatment be discontinued until parameters of calcium metabolism normalise. The same label carries the corticosteroid class warnings for the combination product: reversible hypothalamic-pituitary-adrenal axis suppression with potential glucocorticosteroid insufficiency during and after withdrawal, with risk raised by high potency, large surface area, occlusion, prolonged use, altered skin barrier, liver failure and paediatric use, plus increased risk of cataract and glaucoma. The Cochrane review separately found no comparison of topical agents showing a significant difference in systemic adverse effects, so the label warning and the pooled trial data are describing different resolutions of the same question.',
        evidenceSource:
          'Calcipotriene and betamethasone dipropionate ointment United States prescribing information, section 5 Warnings and Precautions (ANDA 200174, openFDA label endpoint)',
        measuredMetric:
          'Regulatory label warning — hypercalcaemia and hypercalciuria observed in use, with directed discontinuation',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Vitamin D, redesigned to self-destruct',
        laymanDesc:
          'The molecule is real vitamin D hormone with its tail rebuilt so the body breaks it down within hours. That is what lets it work on skin without raising blood calcium the way vitamin D would.',
        molecularDetail:
          'Calcipotriol is calcitriol with a 22,23-double bond and a terminal cyclopropyl ring on the side chain. Receptor affinity is comparable to calcitriol; systemic half-life is not. The molecule is rapidly metabolised to a 24-oxo and then a 24-hydroxy derivative with far lower activity, which is the entire safety design.',
        iconName: 'Timer',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It finds a receptor already sitting on the DNA',
        laymanDesc:
          'Inside a skin cell the drug binds a receptor that is parked on specific stretches of the genome, waiting for a signal.',
        molecularDetail:
          'The vitamin D receptor heterodimerises with retinoid X receptor and binds vitamin D response elements. Ligand binding exchanges corepressors for coactivators, the same architecture the retinoid receptors use — which is why a retinoid and a vitamin D analogue can be described in almost identical terms and still do different things.',
        iconName: 'Dna',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The runaway cell division stops',
        laymanDesc:
          'The genes that keep psoriatic skin cells dividing get switched off, and the genes that make a cell mature and shed get switched on. The plaque thins.',
        molecularDetail:
          'VDR activation induces cyclin-dependent kinase inhibitors and drives transcription of involucrin, transglutaminase 1 and other terminal differentiation markers, reversing the hyperproliferation and parakeratosis that define the plaque. It also suppresses T-cell derived IL-2 and interferon-gamma, so the effect is not purely on the keratinocyte.',
        iconName: 'Layers',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The same receptor releases an immune alarm signal',
        laymanDesc:
          'Unexpectedly, the same switch makes skin cells release a cytokine that summons immune cells. In psoriasis that is a side note. On sun-damaged skin it turned out to be the main event.',
        molecularDetail:
          'VDR activation induces thymic stromal lymphopoietin in keratinocytes. In genetically engineered mice calcipotriol suppressed skin carcinogenesis in a TSLP-dependent manner, and in human skin the calcipotriol plus 5-fluorouracil combination induced TSLP, HLA class II and NKG2D ligand expression with a CD4+ T cell infiltrate peaking at days 10 to 11.',
        iconName: 'Siren',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Plaques flatten, and steroids do it at least as well',
        laymanDesc:
          'On the body the drug clearly beats a placebo. Against a steroid it is a draw on the body, a loss on the scalp, and it stings more in both places.',
        molecularDetail:
          'Vitamin D analogues on the body: standardised mean difference against placebo -0.67 to -1.66. Potent corticosteroids -0.89 (95% CI -1.06 to -0.72) and very potent -1.56 (95% CI -1.87 to -1.26). On the scalp, vitamin D was significantly less effective than both, and less well tolerated locally than potent corticosteroids on both sites.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What the endpoint does not measure',
        laymanDesc:
          'Psoriasis is treated for decades and these trials ran for weeks. The reason to pick this drug over a steroid is what happens to skin over years, and only twenty-five of a hundred and seventy-seven trials even looked.',
        molecularDetail:
          'Only 25 of 177 trials assessed clinical cutaneous dermal atrophy; few cases were found and reporting was insufficient to judge whether the assessment methods could have detected it. The review states that clinical measurements of dermal atrophy are insensitive and detect only the most severe cases.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'Cochrane topical psoriasis review, vitamin D analogues against placebo (CD005028)',
        phase: 'Systematic review and meta-analysis of 177 randomised controlled trials',
        sampleSize: 34808,
        primaryEndpoint:
          'Global improvement in chronic plaque psoriasis against placebo and against other topical treatments',
        endpointMet: true,
        statisticalPValue:
          'Standardised mean difference against placebo on the body from -0.67 (95% CI -1.04 to -0.30) to -1.66 (95% CI -2.66 to -0.67), equivalent to 0.8 to 1.9 points on a six-point scale',
        unreportedAdverseSignals:
          'Only 25 of 177 trials assessed dermal atrophy, and reporting was too sparse to judge whether the assessment methods were adequate. The review states that the long-term safety comparison which motivates the whole drug class has not been made.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'Cochrane topical psoriasis review, vitamin D against corticosteroids on the scalp',
        phase: 'Pooled head-to-head comparison within the same systematic review',
        sampleSize: 34808,
        primaryEndpoint:
          'Global improvement in scalp psoriasis, vitamin D against potent and very potent corticosteroids',
        endpointMet: false,
        statisticalPValue:
          'Vitamin D significantly less effective than both potent and very potent corticosteroids on the scalp, supported by indirect evidence from placebo-controlled trials',
        unreportedAdverseSignals:
          'Potent corticosteroids also caused fewer local adverse events than vitamin D on both body and scalp, which reverses the usual assumption about which of the two is gentler.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Calcipotriol plus 5-fluorouracil actinic keratosis trial (NCT02019355)',
        phase: 'Randomised, double-blind, investigator-initiated clinical trial',
        sampleSize: 131,
        primaryEndpoint:
          'Percentage reduction in actinic keratosis count after a four-day course, against Vaseline plus 5-fluorouracil',
        endpointMet: true,
        statisticalPValue: '87.8% against 26.3% mean reduction, P<0.0001',
        unreportedAdverseSignals:
          'Four days of treatment and a lesion-count endpoint. The cancer question was answered separately in a follow-up cohort of the same participants rather than in this trial.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'Rosenberg 2019 three-year squamous cell carcinoma follow-up cohort (PMID 30895944)',
        phase: 'Blinded prospective cohort study of participants from the randomised trial',
        sampleSize: 70,
        primaryEndpoint:
          'Squamous cell and basal cell carcinoma incidence at 1, 2 and 3 years after treatment',
        endpointMet: true,
        statisticalPValue:
          'SCC on treated face and scalp within 3 years: 2 of 30 (7%) against 11 of 40 (28%), hazard ratio 0.215 (95% CI 0.048 to 0.972), P=0.032. Overall SCC-free survival over more than 1,500 days P=0.0765',
        unreportedAdverseSignals:
          'The significant result is confined to one anatomical site and one time horizon in 70 people. Basal cell carcinoma did not differ, and two authors hold a filed patent on the combination.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Vitamin D analogues significantly better than placebo on the body, standardised mean difference -0.67 to -1.66 across 177 trials and 34,808 participants',
        'Significantly less effective than both potent and very potent corticosteroids on the scalp',
        'More local adverse events than potent corticosteroids on both body and scalp',
        'The fixed combination with a corticosteroid better than either component alone, and better tolerated than calcipotriene alone',
        '87.8% against 26.3% reduction in actinic keratosis count after four days of calcipotriol plus 5-fluorouracil in 131 randomised participants (P<0.0001)',
        'Squamous cell carcinoma on treated face and scalp within 3 years: 7% against 28%, hazard ratio 0.215 (95% CI 0.048 to 0.972)',
      ],
      unsupportedInferences: [
        'That a vitamin D analogue spares skin from atrophy over years of psoriasis treatment — the rationale for the class, unmeasured in 152 of 177 trials',
        'That the non-steroid option is the gentler one, when the pooled data show the opposite on local tolerability',
        'That calcipotriene prevents skin cancer, when the significant result is a single-site three-year subgroup of 70 people',
        'That the actinic keratosis result transfers to psoriasis or the psoriasis result to skin cancer — they are different endpoints in different diseases',
      ],
      whatFailedInitially: [
        'Lost significantly to both potent and very potent corticosteroids on scalp psoriasis',
        'Caused more burning and irritation than the steroids it was meant to replace',
        'Was designed to avoid affecting blood calcium and still carries hypercalcaemia and hypercalciuria in its Warnings and Precautions',
        'Overall squamous cell carcinoma-free survival across the whole follow-up period did not reach significance (P=0.0765), and basal cell carcinoma did not move at all',
      ],
      realWorldOutcome: [
        'Approved in 1993 and still first-line for plaque psoriasis, now usually inside a fixed combination with a corticosteroid',
        'Twenty-two listed generic products at a median United States acquisition cost of US$1.48 per gram',
        'The Cochrane conclusion that corticosteroids perform at least as well with fewer local adverse events has not been overturned',
        'Repurposed as a topical immune adjuvant against sun-damaged skin, on the strength of a cytokine nobody was looking for',
      ],
    },
    deliverySystem: {
      type: 'Topical ointment, cream, foam and scalp solution; also a fixed combination ointment and suspension with betamethasone dipropionate',
      description:
        'Applied to plaques. The molecule is degraded by acid and by light, so the vehicle is formulated on the alkaline side and packaged accordingly, and it is chemically incompatible with acidic co-applied products such as salicylic acid. The foam vehicle carries the paediatric indication from age 4. Rapid metabolism after absorption is what confines the effect to skin.',
      safetyProfile:
        'Local burning and irritation are the commonest effects and are significantly more frequent than with potent topical corticosteroids. Hypercalcaemia and hypercalciuria have been observed and the label directs discontinuation until calcium metabolism normalises. The fixed combination with betamethasone adds the corticosteroid warnings: reversible HPA-axis suppression with potential glucocorticosteroid insufficiency, and increased risk of cataract and glaucoma. The pooled review found no significant difference between topical agents in systemic adverse effects.',
    },
    commonQuestions: [
      {
        q: 'Is it better than a steroid cream for psoriasis?',
        a: 'No, and on the scalp it is worse. The Cochrane review of 177 trials in 34,808 people concluded that corticosteroids perform at least as well as vitamin D analogues and are associated with a lower incidence of local adverse events. On the scalp specifically, vitamin D was significantly less effective than both potent and very potent corticosteroids, and indirect evidence from the placebo-controlled trials pointed the same way. What did beat both was the two of them combined in one product, on the body and on the scalp — and that combination was also better tolerated than calcipotriene by itself.',
      },
      {
        q: 'Then why use it instead of a steroid at all?',
        a: 'Because steroids thin skin over years and this does not. That is a real and well-understood pharmacological difference, and it is the reason the drug class exists. It is also, on the evidence, an assumption rather than a measurement. Of the 177 trials in the Cochrane review, 25 assessed dermal atrophy at all. Few cases were detected, and the review says the trials did not report enough detail to know whether the assessment methods were robust — adding that clinical measurement of atrophy is insensitive and picks up only the most severe cases. Psoriasis is treated for decades; the trials ran for weeks. The comparison that would settle this has not been done.',
        auditNote:
          'The absence of evidence here cuts both ways. It does not show steroids are safe long-term either — the review calls specifically for research on exactly that question.',
      },
      {
        q: 'Does it burn less than a steroid because it is not a steroid?',
        a: 'The opposite. For both body and scalp psoriasis, potent corticosteroids were less likely than vitamin D to cause local adverse events such as burning or irritation. This is one of the more reliably counterintuitive findings in the review, and it has a practical consequence: adding a corticosteroid to calcipotriene improves how it feels, so the combination product was tolerated significantly better than calcipotriene alone.',
      },
      {
        q: 'Is it true that this psoriasis cream prevents skin cancer?',
        a: 'Something real happened, and it is narrower than the headline. In a randomised double-blind trial, 131 people applied calcipotriol plus 5-fluorouracil or Vaseline plus 5-fluorouracil to their face, scalp and arms for four days. Precancerous lesion counts fell 87.8% against 26.3%. A blinded follow-up of those participants then found that squamous cell carcinoma on the treated face and scalp within three years occurred in 2 of 30 treated against 11 of 40 controls — a hazard ratio of 0.215. That is a striking result in 70 people at one anatomical site over one time window. Across the whole follow-up of more than 1,500 days the difference did not reach significance, and basal cell carcinoma did not change. Two authors hold a patent on the combination, which the paper discloses.',
        auditNote:
          'The mechanism is unusually well worked out for a result this small — it runs through a cytokine, TSLP, that calcipotriol induces in keratinocytes, and it was demonstrated in genetically engineered mice before the human trial.',
      },
      {
        q: 'Can it raise the calcium in my blood?',
        a: 'It was specifically engineered not to, and it still sometimes does. Calcipotriene is vitamin D hormone with its side chain rebuilt so the body destroys it within hours — same receptor binding, far shorter systemic life. That design mostly works, and the Cochrane review found no significant difference between topical agents in systemic adverse effects. But the label for the combination product lists hypercalcaemia and hypercalciuria in its Warnings and Precautions and directs that treatment be stopped until calcium metabolism normalises. The two statements are not in conflict: a pooled trial comparison and a postmarketing label warning are looking at different resolutions of the same question.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Mason AR, Mason J, Cork M, Dooley G, Hancock H. Topical treatments for chronic plaque psoriasis. Cochrane Database Syst Rev 2013;3:CD005028',
        identifier: '10.1002/14651858.CD005028.pub3',
        kind: 'doi',
      },
      {
        label:
          'Cunningham TJ et al. Randomized trial of calcipotriol combined with 5-fluorouracil for skin cancer precursor immunotherapy. J Clin Invest 2017;127:106-116',
        identifier: '10.1172/JCI89820',
        kind: 'doi',
      },
      {
        label:
          'Rosenberg AR et al. Skin cancer precursor immunotherapy for squamous cell carcinoma prevention. JCI Insight 2019;4:e125476',
        identifier: '10.1172/jci.insight.125476',
        kind: 'doi',
      },
      {
        label:
          'Calcipotriol plus 5-fluorouracil actinic keratosis randomised trial registration record, 131 participants',
        identifier: 'NCT02019355',
        kind: 'nct',
      },
      {
        label:
          'Calcipotriene and betamethasone dipropionate ointment United States prescribing information, Warnings and Precautions and Adverse Reactions — ANDA 200174, retrieved from the openFDA label endpoint',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.application_number:%22ANDA200174%22',
        kind: 'regulatory',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 6. Terbinafine — 70% mycological cure and 38% normal-looking nails, from the same trial, on the
  //    same label, and a resistant dermatophyte species that did not have a name until 2020.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'terbinafine',
    name: 'Terbinafine',
    tradeName: 'Lamisil / Lamisil AT (topical, over the counter)',
    sponsor:
      'Novartis, which developed it; the topical over-the-counter line is now held elsewhere',
    targetGene:
      'ERG1 — the fungal squalene epoxidase gene. The human enzyme is not meaningfully inhibited',
    targetProtein:
      'Fungal squalene epoxidase (squalene monooxygenase), the first committed step of ergosterol biosynthesis',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1992,
    indication:
      'Oral tablets are indicated for onychomycosis of the toenail or fingernail due to dermatophytes (tinea unguium), with laboratory confirmation of the diagnosis before treatment. Topical cream, gel, solution and spray are indicated for tinea pedis, tinea cruris and tinea corporis',
    patientFriendlyIndication: 'Fungal nail infection, athlete’s foot and ringworm',
    anatomicalSite:
      'The fungal cell membrane, in the nail bed and the keratinised layers of skin where the dermatophyte lives',
    conditionContext: {
      conditionExplainer:
        'A dermatophyte is a fungus that eats keratin. In a nail it grows underneath the plate, in tissue that no blood vessel reaches, and the nail takes about a year to grow out. That is why nail infections take months to treat and why the treatment is judged twelve months after it stopped.',
      whyItMatters:
        'Terbinafine is one of very few drugs where the label prints both the flattering endpoint and the unflattering one side by side, and the difference between them is nearly two to one. It is also the first drug in this batch to be losing to a genuinely new organism.',
      whoTakesThis:
        'People with laboratory-confirmed dermatophyte nail infection for the tablets, and people with athlete’s foot or ringworm for the cream, which is sold without prescription.',
      clinicalGoals:
        'The label defines three: mycological cure, meaning negative microscopy and culture; effective treatment, meaning mycological cure plus new clear nail growth; and mycological plus clinical cure, meaning a normal nail. Those three numbers are 70%, 59% and 38% in the same trial.',
    },
    oneSentenceVerdict:
      'An allylamine that blocks squalene epoxidase so the fungus can neither make its membrane nor stop making squalene, killing it outright — six times as likely as placebo to produce clinical cure across 1,006 randomised patients on high-quality evidence, better than every azole compared with it, and printing 70% mycological cure against 38% normal-looking nails on the same page of its own label.',
    laymanHowItWorks:
      'Fungi build their cell membranes out of ergosterol, and the first step is an enzyme that adds oxygen to a molecule called squalene. Terbinafine jams that enzyme. Two things then go wrong at once: the fungus runs out of the material its membrane is made of, and squalene piles up inside the cell to the point where it dissolves the membrane from within. That second effect is why terbinafine kills the fungus rather than merely stopping its growth, which is the difference between it and the azoles. Human cells use a related enzyme for cholesterol, but the fungal one is about a thousand times more sensitive.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 78,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1356 per unit, the median United States pharmacy acquisition cost across 20 listed terbinafine products (CMS NADAC, generic, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Long off patent, with 20 listed products and the topical line sold over the counter. The Lamisil cream application, NDA 020192, was approved on 30 December 1992. Nobody has a commercial reason to develop a successor allylamine, which is one reason the arrival of a terbinafine-resistant dermatophyte matters more than it otherwise would.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The Cochrane review compared terbinafine with the azoles head to head across 17 studies and terbinafine won on both cure definitions with no difference in adverse events. That ordering is now conditional: against Trichophyton indotineae, which carries squalene epoxidase mutations, the ranking inverts and the azoles become the option that still works.',
      conventionalRx: [
        {
          name: 'Itraconazole',
          class: 'Triazole, inhibits fungal lanosterol 14-alpha-demethylase',
          howItCompares:
            'In the 496-patient LION study, mycological cure at week 72 was 75.7% and 80.8% on the two terbinafine arms against 38.3% and 49.1% on the two intermittent itraconazole arms, all comparisons P<0.0001, with no difference in the number or type of adverse events. Pooled across the Cochrane review, terbinafine was probably more effective than azoles for clinical cure (RR 0.82, 95% CI 0.72 to 0.95) and mycological cure (RR 0.77, 95% CI 0.68 to 0.88).',
          typicalCost: 'Generic; priced per capsule rather than per gram',
          prosAndCons:
            'Pros: retains activity against Trichophyton indotineae, where terbinafine does not, and covers non-dermatophyte moulds and yeasts that terbinafine covers poorly. Cons: beaten decisively on cure rate in the dermatophyte trials, and carries substantial drug-interaction and cardiac cautions terbinafine does not.',
        },
        {
          name: 'Fluconazole',
          class: 'Triazole',
          howItCompares:
            'Included among the azoles that lost to terbinafine in the pooled comparison. The 2024 resistance review states that fluconazole and griseofulvin are generally not effective against Trichophyton indotineae, so it does not solve the problem terbinafine now has.',
          typicalCost: 'Generic and inexpensive',
          prosAndCons:
            'Pros: well tolerated, familiar, once-weekly regimens exist. Cons: inferior to terbinafine on both cure definitions, and no answer to the resistant species.',
        },
        {
          name: 'Topical terbinafine (Lamisil AT and generics)',
          class: 'The same molecule applied to skin rather than swallowed',
          howItCompares:
            'A different product for a different problem: licensed for athlete’s foot, jock itch and ringworm, not for nails. The Cochrane review of oral drugs notes that topical treatments traditionally have low success rates in nail disease because of the physical properties of the nail plate.',
          typicalCost:
            'Sold over the counter; included in the same CMS median of US$0.1356 per unit across 20 listed products',
          prosAndCons:
            'Pros: no liver monitoring, no taste loss, no prescription. Cons: does not reliably penetrate a nail plate, which is why the oral drug exists at all.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Get the diagnosis confirmed in a laboratory first',
          action:
            'The label instructs that appropriate nail specimens — potassium hydroxide preparation, fungal culture or nail biopsy — be obtained before treatment begins.',
          patientImpact:
            'About half of thickened, discoloured nails are not fungal at all. Committing to months of a drug that can cause liver failure, on the strength of how a nail looks, is the specific mistake the label is written to prevent.',
          clinicalPrecaution:
            'Species identification is now more consequential than it used to be: Trichophyton indotineae responds poorly to terbinafine and requires molecular methods to distinguish from its close relatives.',
        },
        {
          name: 'Report loss of taste or smell, and do not wait to see whether it returns',
          action: 'The label directs discontinuation if taste or smell disturbance occurs.',
          patientImpact:
            'Taste disturbance including complete taste loss can be severe, prolonged or permanent, and the same is true of smell. These are not nuisance side effects — they are irreversible in some people, and the treatment being given is for the appearance of a nail.',
          clinicalPrecaution:
            'The label also lists depressive symptoms, severe neutropenia and severe cutaneous reactions including Stevens-Johnson syndrome and DRESS as reasons to stop.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(C)(C)C#C/C=C/CN(C)CC1=CC=CC2=CC=CC=C21',
      chemicalFormula: 'C21H25N',
      molecularWeight: '291.40 g/mol',
      targetReceptorAffinity:
        'Non-competitively inhibits fungal squalene epoxidase at nanomolar concentrations, roughly three orders of magnitude below the concentration needed to inhibit the mammalian enzyme, which is the basis for selectivity. Resistance in Trichophyton indotineae maps to point substitutions in the squalene epoxidase gene, principally Leu393Phe and Phe397Leu, which alter the binding site rather than the amount of enzyme.',
      structureSource: {
        label:
          'PubChem CID 1549008 (terbinafine) — canonical SMILES, molecular formula and weight, as held on the record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/1549008',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ter-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Enyne geometry and identity of the tert-butyl acetylene',
          description:
            'Confirm the E configuration of the double bond in the enyne side chain. Terbinafine’s entire pharmacophore is a rigid conjugated ene-yne terminating in a tert-butyl group, and the Z isomer is markedly less active. This is a small molecule with almost no functional groups to check, which makes the geometry the whole assay.',
          reagentsAndBuffer:
            'Terbinafine hydrochloride reference standard, reversed-phase HPLC with ultraviolet detection at 224 nm, 1H NMR coupling constant analysis for alkene geometry, residual palladium by ICP-MS',
        },
        {
          id: 'ter-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Naphthylmethylamine alkylation and salt formation',
          description:
            'Alkylate N-methyl-1-naphthalenemethylamine with the enyne halide and form the hydrochloride salt. The naphthalene is the lipophilic anchor that drives accumulation in keratin, and it is why the drug persists in nail and skin for weeks after the last tablet.',
          dependsOnStepId: 'ter-w1',
          reagentsAndBuffer:
            'N-methyl-1-naphthalenemethylamine, 6,6-dimethylhept-2-en-4-ynyl halide, base in polar aprotic solvent, hydrogen chloride in isopropanol for salt formation',
        },
        {
          id: 'ter-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation and isomeric purity of the finished salt',
          description:
            'Crystallise the hydrochloride and re-assay for the Z isomer and for residual amine. Free amine left in the product is both an impurity and a stability liability, and the isomer ratio must be checked after crystallisation as well as before it.',
          dependsOnStepId: 'ter-w2',
          reagentsAndBuffer:
            'Recrystallisation from isopropanol or ethanol-water, gradient HPLC with photodiode array detection, Karl Fischer water determination, differential scanning calorimetry for polymorph identity',
        },
        {
          id: 'ter-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Keratin binding and distribution into nail plate and stratum corneum',
          description:
            'Measure how much drug partitions into keratin and how long it stays. This is the pharmacokinetic fact that makes a twelve-week course treat a twelve-month problem: the drug reaches the nail through the matrix and the bed, binds keratin avidly, and persists there long after plasma concentrations have gone.',
          dependsOnStepId: 'ter-w3',
          reagentsAndBuffer:
            'Human nail clippings and stratum corneum, keratin powder binding assay, LC-MS/MS quantification in nail, plasma and sebum, serial sampling out to several months after dosing',
        },
        {
          id: 'ter-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Squalene epoxidase inhibition, minimum inhibitory concentration and SQLE genotyping',
          description:
            'Measure enzyme inhibition, then the minimum inhibitory concentration against clinical isolates, then sequence the squalene epoxidase gene. The third step is new: distinguishing Trichophyton indotineae from its close relatives is not reliably possible by culture morphology, and a susceptibility result without a genotype no longer answers the question being asked.',
          dependsOnStepId: 'ter-w4',
          reagentsAndBuffer:
            'Fungal microsomal squalene epoxidase preparation, radiolabelled squalene substrate, CLSI M38 broth microdilution against dermatophyte isolates, PCR and sequencing of the squalene epoxidase gene covering codons 393 and 397',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ter-a1',
        category: 'measured',
        title: 'High-quality evidence, six times the clinical cure rate of placebo',
        laymanSummary:
          'Cochrane graded the evidence for this drug against placebo as high quality, which is rare in dermatology. Across eight trials in a thousand people, clinical cure was six times as likely on terbinafine, and side effects were no more common.',
        technicalDetails:
          'The 2017 Cochrane review included 48 studies in 10,200 participants. It found high-quality evidence that terbinafine is more effective than placebo for clinical cure (RR 6.00, 95% CI 3.96 to 9.08; 8 studies, 1,006 participants) and for mycological cure (RR 4.53, 95% CI 2.47 to 8.33; same 8 studies). Adverse events among terbinafine-treated participants included gastrointestinal symptoms, infections and headache, with probably no significant difference in risk between groups (RR 1.13, 95% CI 0.87 to 1.47; 4 studies, 399 participants, moderate-quality evidence). One study was at low risk of bias in all domains and 18 were at high risk in at least one, most commonly blinding of personnel and participants.',
        evidenceSource:
          'Kreijkamp-Kaspers S et al., Cochrane Database Syst Rev 2017;7:CD010031 (PMID 28707751)',
        doi: '10.1002/14651858.CD010031.pub2',
        measuredMetric:
          'Risk ratio for clinical and mycological cure against placebo, pooled across 8 randomised trials',
        auditFlag: 'verified',
      },
      {
        id: 'ter-a2',
        category: 'measured',
        title: 'LION: it doubled the cure rate of the drug it was compared against',
        laymanSummary:
          'Nearly five hundred patients in six countries were randomised to terbinafine or to intermittent itraconazole and followed for seventy-two weeks. Around four in five terbinafine patients were culture-negative at the end. Around two in five itraconazole patients were.',
        technicalDetails:
          'The LION study was a prospective, randomised, double-blind, double-dummy, multicentre parallel-group study over 72 weeks at 35 centres in six European countries, in 496 patients aged 18 to 75 with clinically and mycologically confirmed dermatophyte toenail onychomycosis. Four arms received terbinafine for 12 or 16 weeks or intermittent itraconazole for 12 or 16 weeks. The primary endpoint at week 72 was mycological cure, defined as negative microscopy and negative culture from the target toenail: 75.7% (81/107) and 80.8% (80/99) on the terbinafine arms against 38.3% (41/107) and 49.1% (53/108) on the itraconazole arms, every pairwise comparison P<0.0001. All secondary clinical outcomes favoured terbinafine at week 72, and there were no differences in the number or type of adverse events between the drugs.',
        evidenceSource: 'Evans EG, Sigurgeirsson B. BMJ 1999;318:1031-1035 (PMID 10205099)',
        doi: '10.1136/bmj.318.7190.1031',
        measuredMetric:
          'Mycological cure at week 72, negative microscopy plus negative culture, four randomised arms',
        auditFlag: 'verified',
      },
      {
        id: 'ter-a3',
        category: 'failed',
        title: '70% cure, 38% normal nail — both printed on the same label',
        laymanSummary:
          'The label reports three numbers from one trial. Seventy per cent of patients had no fungus left. Fifty-nine per cent had no fungus and some clear new nail. Thirty-eight per cent had a nail with no involvement at all. The number people remember is the first one.',
        technicalDetails:
          'The terbinafine tablets label reports the first United States and Canadian placebo-controlled toenail trial assessed at week 48, after 12 weeks of treatment and 36 weeks of follow-up: mycological cure, defined as simultaneous negative KOH and negative culture, in 70% of subjects; effective treatment, defined as mycological cure plus zero per cent nail involvement or more than 5 mm of new unaffected nail growth, in 59%; and mycological cure plus clinical cure, defined as zero per cent nail involvement, in 38%. Mean time to overall success was approximately 10 months. In the fingernail trial at week 24, the corresponding figures were 79%, 75% and 59%, with a mean time to success of about 4 months. The gap between the first and third numbers is the gap between killing the fungus and restoring the nail, and the second is a composite that sits between them.',
        evidenceSource:
          'Terbinafine tablets United States prescribing information, section 14 Clinical Studies (ANDA 078297, openFDA label endpoint)',
        measuredMetric:
          'Mycological cure 70%, effective treatment 59%, mycological plus clinical cure 38%, same trial, week 48',
        inferredClaim:
          'That a 70% cure rate means seven in ten people end up with a normal nail — the label’s own third figure for that outcome is 38%',
        auditFlag: 'caution',
      },
      {
        id: 'ter-a4',
        category: 'failed',
        title: 'Liver failure, permanent loss of taste and smell, for a nail',
        laymanSummary:
          'The Warnings section lists liver failure leading to transplant or death, taste loss that may be permanent, smell loss that may be permanent, depression, severe drops in white cells, and life-threatening skin reactions. The condition being treated is a discoloured nail.',
        technicalDetails:
          'The label directs obtaining pretreatment serum transaminases, assessing liver function before and periodically during therapy, and discontinuing if liver injury develops; the tablets are contraindicated in chronic or active liver disease. Taste disturbance including taste loss can be severe, prolonged or permanent, and smell disturbance may also be prolonged or permanent; both are grounds for discontinuation. The label further lists depressive symptoms, severe neutropenia with discontinuation at a neutrophil count of 1,000 cells/mm3 or below, and Stevens-Johnson syndrome, toxic epidermal necrolysis, erythema multiforme, exfoliative dermatitis, bullous dermatitis and DRESS. The Cochrane review separately found probably no significant difference in overall adverse event risk against placebo (RR 1.13, 95% CI 0.87 to 1.47), which is the expected pattern for rare severe harms: trials of a thousand people cannot detect them and postmarketing surveillance can.',
        evidenceSource:
          'Terbinafine tablets United States prescribing information, section 5 Warnings and Precautions (ANDA 078297); Kreijkamp-Kaspers S et al., Cochrane Database Syst Rev 2017;7:CD010031',
        doi: '10.1002/14651858.CD010031.pub2',
        measuredMetric:
          'Regulatory warnings from postmarketing surveillance, against a pooled trial adverse event risk ratio of 1.13 (95% CI 0.87 to 1.47)',
        auditFlag: 'caution',
      },
      {
        id: 'ter-a5',
        category: 'conclusion_shift',
        title: 'A resistant dermatophyte that did not have a name until 2020',
        laymanSummary:
          'For thirty years terbinafine was the reliable answer to ringworm and nail fungus. A new species that carries mutations in the exact enzyme terbinafine blocks spread out of South Asia, and the first United States cases were reported from New York in 2023.',
        technicalDetails:
          'Trichophyton indotineae is a recently named species within the T. mentagrophytes complex, distinguishable from its close relatives only by molecular methods, and usually responding poorly to terbinafine. The reduced susceptibility is attributed to point substitutions in the squalene epoxidase gene, principally Leu393Phe and Phe397Leu, which alter the drug binding site. The first reported United States cases were described in Notes from the Field covering New York City between December 2021 and March 2023. Most cases outside South Asia are linked to international travel, with mounting evidence of local person-to-person and animal-to-human transmission. Fluconazole and griseofulvin are generally not effective against it. Because terbinafine is decades off patent and no successor allylamine is in development, the field’s response has been to fall back on the drug class terbinafine displaced.',
        evidenceSource:
          'Caplan AS et al., MMWR Morb Mortal Wkly Rep 2023;72:536-537 (PMID 37167192); Gupta AK et al., Expert Rev Anti Infect Ther 2024;22:739-751 (PMID 39114868)',
        doi: '10.15585/mmwr.mm7219a4',
        inferredClaim:
          'That the head-to-head ranking of terbinafine over the azoles is a stable fact — it was measured against the dermatophytes circulating in 1990s Europe, and a species carrying squalene epoxidase mutations inverts it',
        auditFlag: 'contested',
      },
      {
        id: 'ter-a6',
        category: 'inferred',
        title: 'The durability claim rests on thirty-five people',
        laymanSummary:
          'Nail infections come back. The pooled evidence that terbinafine reduces recurrence compared with placebo comes from a single trial of thirty-five patients, and Cochrane rates it low quality.',
        technicalDetails:
          'The Cochrane review states that terbinafine and azoles may lower the recurrence rate when compared individually with placebo — terbinafine RR 0.05 (95% CI 0.01 to 0.38) from 1 study in 35 participants, azoles RR 0.55 (95% CI 0.29 to 1.07) from 1 study in 26 participants — both graded low-quality evidence. A point estimate of 0.05 from 35 people with a confidence interval spanning nearly an order of magnitude is not a number to plan around. Recurrence is the outcome that determines whether a twelve-week course of a hepatotoxic drug was worth taking, and it is the outcome with the least evidence behind it in the entire review.',
        evidenceSource:
          'Kreijkamp-Kaspers S et al., Cochrane Database Syst Rev 2017;7:CD010031 (PMID 28707751)',
        doi: '10.1002/14651858.CD010031.pub2',
        inferredClaim:
          'That terbinafine durably prevents recurrence of nail infection — pooled from a single 35-participant study graded low quality, for the outcome that matters most',
        auditFlag: 'caution',
      },
      {
        id: 'ter-a7',
        category: 'measured',
        title: 'It beat the azoles head to head, on both definitions of cure',
        laymanSummary:
          'Across fifteen to seventeen trials in more than two thousand patients each, terbinafine cured more people than the azole drugs did, on both the laboratory measure and the appearance measure, with no difference in side effects.',
        technicalDetails:
          'Moderate-quality evidence that terbinafine was probably more effective than azoles for clinical cure (RR 0.82, 95% CI 0.72 to 0.95; 15 studies, 2,168 participants) and for mycological cure (RR 0.77, 95% CI 0.68 to 0.88; 17 studies, 2,544 participants), with the risk ratios expressed for the azole arms. There was probably no difference in adverse event risk between the two classes (RR 1.00, 95% CI 0.86 to 1.17; 9 studies, 1,762 participants, moderate-quality evidence). The LION study is the largest single contributor to that ordering and it used an intermittent itraconazole schedule, which is one reason the pooled advantage is smaller than LION’s alone.',
        evidenceSource:
          'Kreijkamp-Kaspers S et al., Cochrane Database Syst Rev 2017;7:CD010031 (PMID 28707751)',
        doi: '10.1002/14651858.CD010031.pub2',
        measuredMetric:
          'Risk ratios for clinical and mycological cure, terbinafine against azoles, pooled across 15 and 17 trials',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed, then parked in keratin',
        laymanDesc:
          'The drug is absorbed and then collects in exactly the tissues the fungus lives in — nail, skin and the oily layer on it — and stays there for weeks after the last tablet.',
        molecularDetail:
          'Terbinafine is highly lipophilic and binds keratin avidly. It reaches the nail through both the matrix and the nail bed and persists in nail plate long after plasma concentrations fall, which is why a 12-week course is assessed at week 48 and why the mean time to success is around 10 months.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It blocks the first step of membrane building',
        laymanDesc:
          'Fungi make their cell membranes from a molecule called ergosterol. Terbinafine jams the very first enzyme in that assembly line.',
        molecularDetail:
          'Non-competitive inhibition of fungal squalene epoxidase, the enzyme that epoxidises squalene to 2,3-oxidosqualene at the committed step of ergosterol biosynthesis. Inhibition occurs at nanomolar concentrations, roughly a thousandfold below what is needed against the mammalian enzyme.',
        iconName: 'Ban',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'And the blocked material poisons the cell',
        laymanDesc:
          'Two things go wrong at once. The fungus cannot finish its membrane, and the unused raw material builds up until it dissolves the membrane from inside. That second effect is what kills it.',
        molecularDetail:
          'Ergosterol depletion is fungistatic on its own; the fungicidal effect comes from intracellular squalene accumulation, which disrupts membrane organisation and lipid storage. This dual mechanism is the structural reason allylamines kill dermatophytes where azoles, which act further down the same pathway, largely inhibit them.',
        iconName: 'Flame',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'The fungus dies and the nail grows out',
        laymanDesc:
          'Killing the fungus does not repair the nail. The damaged nail has to grow off the end of the finger or toe, which takes about a year on a toenail.',
        molecularDetail:
          'This is why the primary endpoint in LION was assessed at week 72 after 12 or 16 weeks of treatment, and why the label’s trial was read at week 48. Mycological cure and clinical cure are separated in time by the growth rate of the nail plate, not by the pharmacology.',
        iconName: 'Timer',
        visualStage: 'therapeutic_result',
      },
      {
        step: 5,
        title: 'Unless the fungus is one that has changed the enzyme',
        laymanDesc:
          'A species that spread out of South Asia carries changes in the exact enzyme this drug blocks. The drug still reaches it and no longer works on it.',
        molecularDetail:
          'Trichophyton indotineae carries squalene epoxidase substitutions, principally Leu393Phe and Phe397Leu, that reduce terbinafine binding. The species cannot be reliably distinguished from Trichophyton mentagrophytes by culture morphology, so identification requires molecular methods, and the first reported United States cases date from New York City between December 2021 and March 2023.',
        iconName: 'Bug',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What the endpoint does not measure',
        laymanDesc:
          'Every headline figure for this drug is a laboratory result. Whether the nail ends up looking normal is a different number and it is close to half the size. Whether the infection stays away is a third number, and it comes from thirty-five people.',
        molecularDetail:
          'Label figures from the same trial: mycological cure 70%, effective treatment 59%, mycological plus clinical cure 38%. Recurrence against placebo: RR 0.05 (95% CI 0.01 to 0.38) from a single 35-participant study, graded low-quality by Cochrane.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'LION study (PMID 10205099)',
        phase:
          'Prospective, randomised, double-blind, double-dummy, multicentre, four-arm, 72 weeks',
        sampleSize: 496,
        primaryEndpoint:
          'Mycological cure of the target toenail at week 72, negative microscopy plus negative culture',
        endpointMet: true,
        statisticalPValue:
          '75.7% (81/107) and 80.8% (80/99) on terbinafine against 38.3% (41/107) and 49.1% (53/108) on intermittent itraconazole; all four pairwise comparisons P<0.0001',
        unreportedAdverseSignals:
          'The comparator used an intermittent schedule while terbinafine was continuous, which flatters the difference. Mycological cure is a laboratory endpoint; the trial’s clinical outcomes also favoured terbinafine but the nail-appearance gap seen on the label applies here too.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Cochrane pooled terbinafine against placebo (CD010031)',
        phase: 'Systematic review and meta-analysis of randomised controlled trials',
        sampleSize: 1006,
        primaryEndpoint: 'Clinical cure and mycological cure against placebo',
        endpointMet: true,
        statisticalPValue:
          'Clinical cure RR 6.00 (95% CI 3.96 to 9.08) and mycological cure RR 4.53 (95% CI 2.47 to 8.33), 8 studies, high-quality evidence',
        unreportedAdverseSignals:
          'Of 48 studies in the full review, one was at low risk of bias in all domains and 18 at high risk in at least one, most often blinding of personnel and participants.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Cochrane pooled terbinafine against azoles (CD010031)',
        phase: 'Systematic review and meta-analysis of randomised controlled trials',
        sampleSize: 2544,
        primaryEndpoint:
          'Clinical cure and mycological cure, terbinafine against azole comparators',
        endpointMet: true,
        statisticalPValue:
          'Clinical cure RR 0.82 (95% CI 0.72 to 0.95; 15 studies, 2,168 participants) and mycological cure RR 0.77 (95% CI 0.68 to 0.88; 17 studies, 2,544 participants), moderate-quality evidence; adverse events RR 1.00 (95% CI 0.86 to 1.17)',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Cochrane pooled recurrence, terbinafine against placebo (CD010031)',
        phase: 'Single randomised trial within the systematic review',
        sampleSize: 35,
        primaryEndpoint: 'Recurrence of onychomycosis after treatment against placebo',
        endpointMet: true,
        statisticalPValue: 'RR 0.05 (95% CI 0.01 to 0.38), 1 study, low-quality evidence',
        unreportedAdverseSignals:
          'Thirty-five participants, one study, low-quality evidence, for the outcome that determines whether the course was worth taking. The confidence interval spans nearly an order of magnitude.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Clinical cure six times as likely as placebo (RR 6.00, 95% CI 3.96 to 9.08) on high-quality evidence across 1,006 participants',
        'Mycological cure 75.7% and 80.8% against 38.3% and 49.1% for intermittent itraconazole at week 72 in 496 randomised patients (P<0.0001)',
        'More effective than azoles for clinical cure (RR 0.82) and mycological cure (RR 0.77) across 15 and 17 pooled trials',
        'Label figures from one trial: mycological cure 70%, effective treatment 59%, mycological plus clinical cure 38%',
        'Squalene epoxidase substitutions Leu393Phe and Phe397Leu in Trichophyton indotineae, with the first United States cases reported from New York City in 2023',
      ],
      unsupportedInferences: [
        'That a 70% cure rate means a normal-looking nail in 70% of people — the label’s figure for that is 38%',
        'That terbinafine durably prevents recurrence, an inference resting on 35 participants in one low-quality study',
        'That the head-to-head advantage over the azoles is a stable property, when it was measured before the resistant species existed',
        'That the pooled adverse event risk ratio of 1.13 describes the drug’s safety, when the harms that matter are too rare for a 1,000-person trial to see',
      ],
      whatFailedInitially: [
        'Clinical cure — a nail with no involvement at all — was reached by 38% of patients against 70% mycological cure in the same trial',
        'Mean time to overall success was approximately 10 months for toenails, after a 12-week course',
        'Postmarketing surveillance added liver failure, permanent taste and smell loss, depression, severe neutropenia and DRESS, none visible in the trials',
        'Against Trichophyton indotineae the drug is now poorly effective, and no successor allylamine is in development',
      ],
      realWorldOutcome: [
        'Lamisil cream approved under NDA 020192 on 30 December 1992; the topical line is now sold over the counter',
        'Twenty listed generic products at a median United States acquisition cost of US$0.1356 per unit',
        'Still the first-line oral treatment for dermatophyte nail infection, with laboratory confirmation required before starting',
        'Its position is now conditional on species identification, which culture morphology cannot reliably provide',
      ],
    },
    deliverySystem: {
      type: 'Oral tablets and granules; topical cream, gel, solution and spray sold over the counter',
      description:
        'The tablets are absorbed and concentrate in keratin — nail, stratum corneum and sebum — where they persist for weeks after the course ends, which is why a twelve-week course is assessed at week 48. The topical forms treat skin infections only: the Cochrane review notes that topical treatments traditionally have low success rates in nail disease because of the physical properties of the nail plate.',
      safetyProfile:
        'Contraindicated in chronic or active liver disease. Liver failure, sometimes leading to transplant or death, has occurred; the label directs pretreatment serum transaminases and periodic liver function testing, with discontinuation if injury develops. Taste disturbance including complete taste loss can be severe, prolonged or permanent, as can smell disturbance; both are grounds for stopping. Depressive symptoms, severe neutropenia and severe cutaneous adverse reactions including Stevens-Johnson syndrome, toxic epidermal necrolysis and DRESS are also listed. In the pooled randomised trials, overall adverse event risk did not differ significantly from placebo (RR 1.13, 95% CI 0.87 to 1.47) — the pattern expected when the serious harms are rarer than a trial can detect.',
    },
    commonQuestions: [
      {
        q: 'What does a 70% cure rate actually mean here?',
        a: 'It means the laboratory could not find the fungus any more. The label prints three numbers from the same trial and they are worth reading together: mycological cure — negative microscopy and negative culture — in 70% of subjects; effective treatment, meaning mycological cure plus either a clear nail or more than 5 mm of new unaffected growth, in 59%; and mycological cure plus clinical cure, meaning zero per cent nail involvement, in 38%. So the fungus is gone in seven of ten and the nail looks normal in fewer than four of ten. Mean time to success was about ten months, because a toenail has to grow out.',
        auditNote:
          'This is a rare case of a label doing the audit for you. Both numbers are there, in order, on the same page. The one that gets quoted is the first.',
      },
      {
        q: 'Is it really worth risking liver failure for a toenail?',
        a: 'That is the right question and this page will not answer it for you. What can be set out is what is on each side. On the benefit side: high-quality evidence, six times the clinical cure rate of placebo, better than every azole compared with it, and a 38% chance of a normal-looking nail. On the harm side: the label lists liver failure sometimes leading to transplant or death, taste loss and smell loss that may be permanent, depressive symptoms, severe neutropenia and life-threatening skin reactions. Those harms are rare enough that in pooled trials of a thousand people the adverse event risk was no different from placebo — which is exactly what a rare severe harm looks like in trial data. The label requires liver function tests before and during treatment for that reason.',
      },
      {
        q: 'Why does the doctor want a nail sample first?',
        a: 'Because roughly half of thickened, discoloured nails are not fungal, and because it now matters which fungus it is. The label instructs obtaining a potassium hydroxide preparation, a fungal culture or a nail biopsy before starting treatment. Historically that was about not giving a hepatotoxic drug for psoriasis or trauma. Now there is a second reason: Trichophyton indotineae responds poorly to terbinafine, and it cannot be told apart from its close relatives by looking at a culture plate — it takes molecular identification.',
      },
      {
        q: 'What is Trichophyton indotineae?',
        a: 'A dermatophyte species that was only named in 2020, spread out of South Asia, and carries point mutations in the squalene epoxidase gene — Leu393Phe and Phe397Leu — which is the exact enzyme terbinafine blocks. Terbinafine is becoming less effective against it as a first-line agent, and fluconazole and griseofulvin are generally not effective either. The first reported United States cases were described from New York City covering December 2021 to March 2023. Most cases outside South Asia are still travel-associated, but reports of local transmission are accumulating. This is the clearest example in this batch of an evidence base having a shelf life: the head-to-head trials that established terbinafine’s superiority were run in Europe in the 1990s against the organisms circulating then.',
      },
      {
        q: 'Will it come back?',
        a: 'Often, and the evidence on this is unusually thin. Cochrane found that terbinafine may lower the recurrence rate compared with placebo, with a risk ratio of 0.05 — but that comes from a single study of 35 participants, with a confidence interval from 0.01 to 0.38, graded low quality. For azoles it was one study of 26 participants and the interval crossed no effect. Recurrence is the outcome that decides whether a twelve-week course was worth it, and across 48 studies and 10,200 participants it is the outcome with the least evidence behind it.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Kreijkamp-Kaspers S et al. Oral antifungal medication for toenail onychomycosis. Cochrane Database Syst Rev 2017;7:CD010031',
        identifier: '10.1002/14651858.CD010031.pub2',
        kind: 'doi',
      },
      {
        label:
          'Evans EG, Sigurgeirsson B. Double blind, randomised study of continuous terbinafine compared with intermittent itraconazole in treatment of toenail onychomycosis. The LION Study Group. BMJ 1999;318:1031-1035',
        identifier: '10.1136/bmj.318.7190.1031',
        kind: 'doi',
      },
      {
        label:
          'Caplan AS et al. Notes from the field: first reported U.S. cases of tinea caused by Trichophyton indotineae — New York City, December 2021-March 2023. MMWR Morb Mortal Wkly Rep 2023;72:536-537',
        identifier: '10.15585/mmwr.mm7219a4',
        kind: 'doi',
      },
      {
        label:
          'Gupta AK et al. Antifungal resistance in dermatophytes — review of the epidemiology, diagnostic challenges and treatment strategies for managing Trichophyton indotineae infections. Expert Rev Anti Infect Ther 2024;22:739-751',
        identifier: '10.1080/14787210.2024.2390629',
        kind: 'doi',
      },
      {
        label:
          'Terbinafine tablets United States prescribing information, section 5 Warnings and Precautions and section 14 Clinical Studies — ANDA 078297, retrieved from the openFDA label endpoint',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.application_number:%22ANDA078297%22',
        kind: 'regulatory',
      },
      {
        label:
          'openFDA Drugs@FDA record for NDA 020192 (LAMISIL cream), original approval 30 December 1992, Novartis',
        identifier:
          'https://api.fda.gov/drug/drugsfda.json?search=application_number:%22NDA020192%22',
        kind: 'regulatory',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 7. Ketoconazole — the first oral azole, de-indicated by its own boxed warning for the
  //    infections it was famous for, and re-approved in 2021 for the side effect.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'ketoconazole',
    name: 'Ketoconazole',
    tradeName: 'Nizoral / Nizoral Anti-Dandruff / Extina / Xolegel / Ketoconazole shampoo 2%',
    sponsor: 'Janssen Pharmaceuticals, which discovered it',
    targetGene:
      'ERG11 (CYP51) in fungi. Off-target in humans, CYP3A4 and the steroidogenic cytochromes CYP17A1 and CYP11B1',
    targetProtein:
      'Fungal lanosterol 14-alpha-demethylase, a cytochrome P450 enzyme of the ergosterol pathway; human cytochrome P450 enzymes are inhibited too, which is the source of both its dangers and its second career',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1981,
    indication:
      'Ketoconazole shampoo 2% is indicated for the treatment of tinea (pityriasis) versicolor; topical cream, gel and foam are used for seborrhoeic dermatitis and superficial dermatophyte infection. Ketoconazole tablets are explicitly not indicated for onychomycosis, cutaneous dermatophyte infections or Candida infections, and are restricted to systemic mycoses in patients who have failed or cannot tolerate other therapies',
    patientFriendlyIndication:
      'Dandruff and seborrhoeic dermatitis, and the pale or dark patches of tinea versicolor',
    anatomicalSite:
      'The scalp and sebaceous skin, where Malassezia yeasts live in the oil, and the fungal cell membrane they build from ergosterol',
    conditionContext: {
      conditionExplainer:
        'Seborrhoeic dermatitis and dandruff are an inflammatory reaction to a yeast, Malassezia, that lives in the oil on almost everybody’s skin. Tinea versicolor is the same organism growing enough to interfere with pigment, leaving pale or dark patches. Neither is an infection in the ordinary sense — the organism is a normal resident and the problem is the response to it.',
      whyItMatters:
        'Ketoconazole is the clearest case in this batch of a drug whose reputation and whose regulatory status point in opposite directions. On skin it is a cheap, well-evidenced first choice. Swallowed, its own label opens by listing the things it must not be used for.',
      whoTakesThis:
        'People with dandruff, seborrhoeic dermatitis or tinea versicolor use the shampoo, cream or foam. The tablets are now a last-resort drug for deep systemic fungal infection.',
      clinicalGoals:
        'Clearance of scale and redness. For tinea versicolor the label sets a lower expectation than most people bring to it, and says so in the indication itself.',
    },
    oneSentenceVerdict:
      'An imidazole that blocks the fungal enzyme converting lanosterol into ergosterol, and blocks the structurally similar human enzymes too — a 31% lower risk of failed clearance in seborrhoeic dermatitis against placebo across eight trials, indistinguishable from a topical steroid but with 44% fewer side effects, and carrying a boxed warning that removes the tablets from every infection they were famous for treating.',
    laymanHowItWorks:
      'Fungal cell membranes are built from ergosterol, and one step in making it is done by an enzyme with an iron atom at its centre. Ketoconazole binds that iron and shuts the enzyme down. The fungus cannot finish its membrane and stops growing. Human cells contain a family of enzymes built the same way — the ones that metabolise most medicines, and the ones that make cortisol and testosterone — and ketoconazole binds those too. On skin that barely matters. Swallowed, it is the whole story: it is why the tablets can cause liver failure and dangerous heart rhythms, and why the same molecule is now approved as a treatment for a hormone disease.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 68,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.3029 per gram, the median United States pharmacy acquisition cost across 32 listed ketoconazole products (CMS NADAC, generic, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Off patent since the 1990s, with 32 listed products and 1% shampoo sold over the counter. The commercially live version of this molecule is not the antifungal at all: it is levoketoconazole, the single enantiomer approved as Recorlev under NDA 214133 on 30 December 2021 for a hormonal disease, whose label states that it is not approved for the treatment of fungal infections.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The Cochrane review compared topical ketoconazole against placebo, against topical steroids and against the other topical antifungals. It beat placebo, drew with steroids while causing fewer side effects, and drew with ciclopirox. Its authors state that limited evidence suggests any agent in this class is more effective than any other.',
      conventionalRx: [
        {
          name: 'Ciclopirox 1%',
          class: 'Hydroxypyridone antifungal, a metal chelator rather than an ergosterol inhibitor',
          howItCompares:
            'Lower failed-remission rate than placebo at four weeks (RR 0.79, 95% CI 0.67 to 0.94, eight studies, moderate-quality evidence) with similar side effect rates. Compared directly with ketoconazole, remission failure was indistinguishable (RR 1.09, 95% CI 0.95 to 1.26, three studies, low-quality evidence).',
          typicalCost: 'Generic; sold as shampoo and cream',
          prosAndCons:
            'Pros: an entirely different mechanism, so it is a genuine alternative rather than a variation. Cons: no measurable efficacy advantage, and the evidence base has the same weaknesses.',
        },
        {
          name: 'Topical corticosteroid',
          class: 'Glucocorticoid receptor agonist',
          howItCompares:
            'Ketoconazole produced a remission rate similar to steroids (RR 1.17, 95% CI 0.95 to 1.44, six studies, low-quality evidence), with side effects 44% lower in the ketoconazole group (RR 0.56, 95% CI 0.32 to 0.96, eight studies, moderate-quality evidence). The tolerability difference is the strongest single finding in the comparison.',
          typicalCost: 'Generic and inexpensive; many scalp preparations available',
          prosAndCons:
            'Pros: fast, familiar, effective. Cons: more side effects than ketoconazole in the pooled comparison, and the atrophy problem on facial skin that recurs throughout this batch.',
        },
        {
          name: 'Selenium sulfide or zinc pyrithione shampoo',
          class: 'Over-the-counter antifungal and antiproliferative agents',
          howItCompares:
            'Widely used for the same condition. The Cochrane review found treatment effects on individual symptoms less clear and inconsistent across the field, and evidence insufficient to conclude that dose or mode of delivery influenced outcome.',
          typicalCost: 'Sold over the counter at low cost',
          prosAndCons:
            'Pros: no prescription, very cheap. Cons: less well characterised in randomised comparisons than ketoconazole, and the same four-week evidence horizon applies.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Clearing the yeast will not immediately restore skin colour',
          action:
            'The shampoo label states this directly in its Indications section for tinea versicolor.',
          patientImpact:
            'Tinea versicolor leaves hyperpigmented or hypopigmented patches. The label notes that treatment of the infection may not immediately result in normalisation of pigment at the affected sites — the organism can be gone while the visible problem remains for months.',
          clinicalPrecaution:
            'Persisting patches after treatment are not necessarily treatment failure, and this is a distinction worth raising with a clinician rather than treating repeatedly.',
        },
        {
          name: 'The tablets and the shampoo are not interchangeable in risk',
          action: 'The oral formulation carries a boxed warning; the topical formulations do not.',
          patientImpact:
            'Oral ketoconazole has caused hepatotoxicity with fatal outcome or requiring liver transplantation, in some patients with no obvious risk factors, and prolongs the QT interval with nine drugs contraindicated for co-administration. None of that applies to a shampoo.',
          clinicalPrecaution:
            'The oral label states the tablets are not indicated for onychomycosis, cutaneous dermatophyte infections or Candida infections at all.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CC(=O)N1CCN(CC1)C2=CC=C(C=C2)OC[C@@H]3CO[C@@](O3)(CN4C=CN=C4)C5=C(C=C(C=C5)Cl)Cl',
      chemicalFormula: 'C26H28Cl2N4O4',
      molecularWeight: '531.40 g/mol',
      targetReceptorAffinity:
        'Coordinates the heme iron of fungal lanosterol 14-alpha-demethylase through the imidazole nitrogen, which is the binding mode shared by the whole azole class. The same coordination chemistry applies to human cytochrome P450 enzymes: ketoconazole is a potent CYP3A4 inhibitor and inhibits CYP17A1 and CYP11B1 in the steroid pathway. Selectivity for the fungal enzyme is a matter of degree, not of kind, which is the single fact that explains this drug’s entire regulatory history.',
      structureSource: {
        label:
          'PubChem CID 456201 (ketoconazole) — canonical SMILES, molecular formula and weight, as held on the record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/456201',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ket-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Cis-dioxolane stereochemistry and enantiomeric composition',
          description:
            'Confirm the cis relationship across the dioxolane ring and determine the enantiomeric ratio. Ketoconazole as marketed is a racemate of two cis enantiomers, and this is not a technicality: the 2S,4R enantiomer alone is levoketoconazole, a separately approved drug for a different disease. A batch record that reports only chemical purity has not reported the thing that distinguishes the two products.',
          reagentsAndBuffer:
            'Ketoconazole reference standard, chiral HPLC on polysaccharide stationary phase, 1H NMR nuclear Overhauser experiments for ring stereochemistry, chloride content by ion chromatography',
        },
        {
          id: 'ket-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Imidazole installation and piperazine coupling',
          description:
            'Attach the imidazole that will coordinate the heme iron, then couple the acetylpiperazine-phenol fragment. The imidazole is the pharmacophore and everything else is a delivery scaffold — which is why the whole azole class shares one mechanism and differs mainly in how it distributes.',
          dependsOnStepId: 'ket-w1',
          reagentsAndBuffer:
            'Imidazole with base in polar aprotic solvent, 1-acetyl-4-(4-hydroxyphenyl)piperazine, phase-transfer catalyst, anhydrous conditions under nitrogen',
        },
        {
          id: 'ket-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation and formulation into shampoo, cream, gel or foam',
          description:
            'Crystallise the free base and formulate. Vehicle choice is doing real work here: a shampoo has contact time measured in minutes, a cream in hours and a foam somewhere between, and the Cochrane review found the evidence insufficient to conclude that mode of delivery influenced outcome at all.',
          dependsOnStepId: 'ket-w2',
          reagentsAndBuffer:
            'Recrystallisation from organic solvent, surfactant base for shampoo or emulsion base for cream, sodium lauryl sulfate, hydrochloric acid or sodium hydroxide for pH adjustment',
        },
        {
          id: 'ket-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Retention on scalp after rinsing, and systemic absorption counter-screen',
          description:
            'Measure how much drug is still on the scalp after a shampoo is rinsed off, and measure plasma concentrations. Both matter: the first determines whether a two-minute contact time can work at all, and the second is what separates a shampoo from a drug carrying a boxed warning.',
          dependsOnStepId: 'ket-w3',
          reagentsAndBuffer:
            'Scalp swab and tape-strip recovery after standardised rinsing, LC-MS/MS quantification on scalp and in plasma, sebum collection for reservoir measurement',
        },
        {
          id: 'ket-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Malassezia susceptibility and human CYP inhibition panel',
          description:
            'Measure minimum inhibitory concentration against Malassezia isolates, then run the compound against a panel of human cytochrome P450 enzymes. The second assay is not a formality for this molecule — the human CYP inhibition is the reason the oral drug was restricted and the reason a single enantiomer of it is now sold as an endocrine medicine.',
          dependsOnStepId: 'ket-w4',
          reagentsAndBuffer:
            'Malassezia furfur and M. globosa isolates in lipid-supplemented medium, CLSI-adapted broth microdilution, recombinant human CYP3A4, CYP17A1 and CYP11B1 with fluorogenic or LC-MS/MS substrates',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ket-a1',
        category: 'measured',
        title: 'A 31% lower failure rate than placebo, on low-quality evidence',
        laymanSummary:
          'Pooling eight trials, ketoconazole shampoo left about a third fewer people with unresolved rash than a dummy shampoo. The reviewers graded the evidence low quality, and the trials disagreed with each other substantially.',
        technicalDetails:
          'The 2015 Cochrane review included 51 studies with 9,052 participants, of which 45 assessed outcomes at five weeks or less. Topical ketoconazole 2% showed a 31% lower risk of failed clearance of rashes compared with placebo (RR 0.69, 95% CI 0.59 to 0.81; eight studies, low-quality evidence) at four weeks, with substantial heterogeneity between studies (I² = 74%). The median proportion who did not clear in the placebo groups was 69%. The effect on side effects against placebo was uncertain on very low-quality evidence (RR 0.97, 95% CI 0.58 to 1.64, six studies). The reviewers believe 24 of the 51 trials had some form of conflict of interest, such as pharmaceutical company funding.',
        evidenceSource:
          'Okokon EO et al., Cochrane Database Syst Rev 2015;5:CD008138 (PMID 25933684)',
        doi: '10.1002/14651858.CD008138.pub3',
        measuredMetric:
          'Risk ratio for failed clearance of rash at four weeks against placebo, pooled across eight trials',
        auditFlag: 'caution',
      },
      {
        id: 'ket-a2',
        category: 'measured',
        title: 'As good as a steroid, with 44% fewer side effects',
        laymanSummary:
          'Head to head against topical steroids, remission rates were the same. Side effects were nearly half as common on the antifungal. That tolerability difference, not the clearance rate, is the strongest reason to choose it.',
        technicalDetails:
          'Ketoconazole treatment resulted in a remission rate similar to that of steroids (RR 1.17, 95% CI 0.95 to 1.44; six studies, low-quality evidence), and occurrence of side effects was 44% lower in the ketoconazole group (RR 0.56, 95% CI 0.32 to 0.96; eight studies, moderate-quality evidence). The side effect comparison carries a higher certainty grade than the efficacy comparison, which is unusual and worth noticing: the better-supported claim about this drug is about what it does not do.',
        evidenceSource:
          'Okokon EO et al., Cochrane Database Syst Rev 2015;5:CD008138 (PMID 25933684)',
        doi: '10.1002/14651858.CD008138.pub3',
        measuredMetric:
          'Remission rate ratio and side effect rate ratio against topical corticosteroids, pooled',
        auditFlag: 'verified',
      },
      {
        id: 'ket-a3',
        category: 'inferred',
        title: 'Nothing in the class beats anything else, and nobody measured quality of life',
        laymanSummary:
          'Ketoconazole, ciclopirox and the rest came out level with one another. Of fifty-one trials in nine thousand people, not one measured whether patients felt better. Only one recorded whether they used the treatment as intended.',
        technicalDetails:
          'The reviewers’ conclusion is that ketoconazole and ciclopirox are more effective than placebo, but limited evidence suggests that either is more effective than any other agent within the same class. Ketoconazole yielded a similar remission failure rate to ciclopirox (RR 1.09, 95% CI 0.95 to 1.26, three studies, low-quality evidence), and most comparisons between ketoconazole and other antifungals rested on single studies showing comparability. Treatment effects on individual symptoms were less clear and inconsistent. Evidence was insufficient to conclude that dose or mode of delivery influenced outcome. Only one study reported on treatment compliance. No study assessed quality of life. One study assessed maximum rash-free period and provided insufficient data to analyse.',
        evidenceSource:
          'Okokon EO et al., Cochrane Database Syst Rev 2015;5:CD008138 (PMID 25933684)',
        doi: '10.1002/14651858.CD008138.pub3',
        inferredClaim:
          'That one topical antifungal is better than another for seborrhoeic dermatitis, and that clearing scale is the same as the patient being better — neither was measured across 51 trials and 9,052 participants',
        auditFlag: 'caution',
      },
      {
        id: 'ket-a4',
        category: 'conclusion_shift',
        title: 'The tablets were de-indicated for the infections that made them famous',
        laymanSummary:
          'Ketoconazole was the first azole that could be swallowed, and it treated fungal nail and skin infections for two decades. Its label now opens by saying it is not indicated for any of those, and that it should only be used when nothing else works.',
        technicalDetails:
          'The current oral ketoconazole label opens: "Because ketoconazole tablets have been associated with serious adverse reactions, ketoconazole tablets are not indicated for treatment of onychomycosis, cutaneous dermatophyte infections, or Candida infections. Ketoconazole tablets should be used only when other effective antifungal therapy is not available or tolerated." It records serious hepatotoxicity including cases with a fatal outcome or requiring liver transplantation, in some patients with no obvious risk factors. It contraindicates co-administration with dofetilide, quinidine, pimozide, lurasidone, cisapride, methadone, disopyramide, dronedarone and ranolazine because ketoconazole raises their plasma concentrations and may prolong the QT interval, sometimes causing torsades de pointes. The remaining indications are blastomycosis, coccidioidomycosis, histoplasmosis, chromomycosis and paracoccidioidomycosis in patients who have failed or cannot tolerate other therapies, and it is excluded from fungal meningitis because it penetrates cerebrospinal fluid poorly.',
        evidenceSource:
          'Ketoconazole tablets United States prescribing information, boxed warning and Indications and Usage (ANDA 075912, openFDA label endpoint)',
        inferredClaim:
          'That an early, broadly effective antifungal remains a reasonable oral option for skin and nail infection — its own label removes it from all three indications and confines it to deep mycoses of last resort',
        auditFlag: 'verified',
      },
      {
        id: 'ket-a5',
        category: 'conclusion_shift',
        title: 'The side effect became the indication, and the indication became a disclaimer',
        laymanSummary:
          'Ketoconazole blocks the human enzymes that make cortisol — an unwanted effect for an antifungal. In 2021 half the molecule was approved as a treatment for a disease of too much cortisol, on a label that states it is not approved for fungal infections.',
        technicalDetails:
          'Levoketoconazole, the 2S,4R enantiomer of ketoconazole, was approved as Recorlev under NDA 214133 on 30 December 2021 for the treatment of endogenous hypercortisolemia in adult patients with Cushing’s syndrome for whom surgery is not an option or has not been curative. Its Limitations of Use state: "RECORLEV is not approved for the treatment of fungal infections. The safety and effectiveness of RECORLEV for the treatment of fungal infections have not been established." It is described in its own label as a cortisol synthesis inhibitor. It carries the same boxed warning for hepatotoxicity and QT prolongation as the racemic antifungal, with contraindications in cirrhosis, acute or poorly controlled chronic liver disease, recurrent symptomatic cholelithiasis, prior azole-induced liver injury requiring discontinuation, and extensive metastatic liver disease.',
        evidenceSource:
          'RECORLEV (levoketoconazole) United States prescribing information, Indications and Usage and boxed warning (NDA 214133, approved 30 December 2021)',
        inferredClaim:
          'That off-target activity is a defect — here the off-target inhibition of human steroidogenic cytochromes outlived the on-target antifungal indication and became a separately approved medicine',
        auditFlag: 'verified',
      },
      {
        id: 'ket-a6',
        category: 'failed',
        title: 'Curing the infection does not fix what the patient came in about',
        laymanSummary:
          'Tinea versicolor shows up as pale or dark patches. The shampoo label says, in the Indications section itself, that treating the infection may not immediately normalise the colour of the skin.',
        technicalDetails:
          'The ketoconazole shampoo 2% label states the indication as treatment of tinea (pityriasis) versicolor caused by or presumed to be caused by Pityrosporum orbiculare, also known as Malassezia furfur, and then adds: "Note: Tinea (pityriasis) versicolor may give rise to hyperpigmented or hypopigmented patches on the trunk which may extend to the neck, arms and upper thighs. Treatment of the infection may not immediately result in normalization of pigment to the affected sites." The measured endpoint is mycological, the presenting complaint is cosmetic, and the label is unusually explicit that the two come apart — the same structure as terbinafine’s 70% mycological cure against 38% normal nails.',
        evidenceSource:
          'Ketoconazole shampoo 2% United States prescribing information, Indications and Usage, as held on the record',
        measuredMetric:
          'Regulatory label text — clearance of the organism stated not to imply resolution of the visible sign',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Applied to skin or scalp, and mostly staying there',
        laymanDesc:
          'As a shampoo, cream or foam the drug sits in the oily layer where the yeast lives. Almost none of it reaches the bloodstream, which is why the topical products carry none of the tablet’s warnings.',
        molecularDetail:
          'Ketoconazole is lipophilic and accumulates in the sebaceous reservoir where Malassezia species reside. Systemic absorption from topical application is minimal, so the CYP3A4 and steroidogenic inhibition that dominates the oral drug’s safety profile does not arise.',
        iconName: 'Droplet',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The imidazole ring grabs an iron atom',
        laymanDesc:
          'At the centre of the target enzyme is a single iron atom. One nitrogen on the drug latches onto it and will not let go, which stops the enzyme working.',
        molecularDetail:
          'The imidazole nitrogen coordinates the heme iron of fungal lanosterol 14-alpha-demethylase (CYP51/ERG11), blocking oxygen activation at the catalytic centre. This is the binding mode of the entire azole class; the rest of each molecule determines where it goes, not what it does.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'The fungus cannot finish its membrane',
        laymanDesc:
          'Without that step the fungus cannot convert its raw material into the sterol its membrane needs, and it stops growing.',
        molecularDetail:
          'Blocking 14-alpha-demethylation halts conversion of lanosterol to ergosterol and causes accumulation of 14-methylated sterol intermediates that disorder the membrane. The effect is largely fungistatic — a difference from terbinafine, which kills by a second mechanism.',
        iconName: 'Ban',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'The same chemistry works on human enzymes',
        laymanDesc:
          'Humans use enzymes built the same way to break down medicines and to make hormones. The drug binds those too. On skin this does not matter. Swallowed, it is the whole problem.',
        molecularDetail:
          'Ketoconazole is a potent CYP3A4 inhibitor and inhibits CYP17A1 and CYP11B1 in the adrenal steroid pathway. This produces the oral drug’s hepatotoxicity risk, its QT prolongation through raised concentrations of co-administered drugs, and — repurposed — the cortisol synthesis inhibition for which levoketoconazole was approved in 2021.',
        iconName: 'AlertTriangle',
        visualStage: 'cellular_entry',
      },
      {
        step: 5,
        title: 'The scale and redness settle',
        laymanDesc:
          'Fewer yeasts means less inflammation. About a third fewer people are left with unresolved rash than on a dummy shampoo, and it works about as well as a steroid with fewer side effects.',
        molecularDetail:
          'Against placebo, risk of failed clearance RR 0.69 (95% CI 0.59 to 0.81) at four weeks, eight studies, low-quality evidence, I² = 74%. Against topical steroids, remission RR 1.17 (95% CI 0.95 to 1.44) and side effects RR 0.56 (95% CI 0.32 to 0.96).',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What the endpoint does not measure',
        laymanDesc:
          'Forty-five of fifty-one trials stopped looking at five weeks or less. None of them measured whether patients felt better about their skin. And for tinea versicolor the label warns that clearing the yeast may not restore the colour.',
        molecularDetail:
          'No study in the 51-trial review assessed quality of life; one reported compliance; one measured maximum rash-free period and provided insufficient data to analyse. Twenty-four of the 51 trials were judged to carry some form of conflict of interest.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Cochrane pooled ketoconazole 2% against placebo (CD008138)',
        phase: 'Systematic review and meta-analysis of randomised controlled trials',
        sampleSize: 3253,
        primaryEndpoint: 'Failed clearance of rash at four weeks against placebo or vehicle',
        endpointMet: true,
        statisticalPValue:
          'RR 0.69 (95% CI 0.59 to 0.81), eight studies, low-quality evidence, I² = 74%; median non-clearance in placebo groups 69%',
        unreportedAdverseSignals:
          'Substantial heterogeneity between trials, 24 of the 51 trials in the review judged to carry a conflict of interest, and no study anywhere in the review assessed quality of life.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Cochrane pooled ketoconazole against topical steroids (CD008138)',
        phase: 'Pooled head-to-head comparison within the same systematic review',
        sampleSize: 632,
        primaryEndpoint:
          'Remission rate and side effect occurrence against topical corticosteroids',
        endpointMet: false,
        statisticalPValue:
          'Remission RR 1.17 (95% CI 0.95 to 1.44), six studies, low-quality evidence — no significant difference. Side effects RR 0.56 (95% CI 0.32 to 0.96), eight studies, moderate-quality evidence — 44% lower',
        unreportedAdverseSignals:
          'The efficacy comparison is a draw. The result that survives is about tolerability, and it carries a higher certainty grade than the efficacy result does.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Cochrane pooled ketoconazole against ciclopirox (CD008138)',
        phase: 'Pooled head-to-head comparison within the same systematic review',
        sampleSize: 3029,
        primaryEndpoint: 'Remission failure rate, ketoconazole against ciclopirox',
        endpointMet: false,
        statisticalPValue: 'RR 1.09 (95% CI 0.95 to 1.26), three studies, low-quality evidence',
        unreportedAdverseSignals:
          'Most comparisons between ketoconazole and other antifungals rested on single studies. The review concludes that limited evidence suggests any agent in the class is more effective than any other.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Risk of failed clearance 31% lower than placebo at four weeks (RR 0.69, 95% CI 0.59 to 0.81) across eight trials',
        'Remission rate indistinguishable from topical corticosteroids (RR 1.17, 95% CI 0.95 to 1.44)',
        'Side effects 44% lower than with topical corticosteroids (RR 0.56, 95% CI 0.32 to 0.96), moderate-quality evidence',
        'Remission failure indistinguishable from ciclopirox (RR 1.09, 95% CI 0.95 to 1.26)',
        'Levoketoconazole approved 30 December 2021 for endogenous hypercortisolemia, on a label stating it is not approved for fungal infections',
      ],
      unsupportedInferences: [
        'That one topical antifungal in this class outperforms another — the pooled comparisons cannot separate them',
        'That clearance of scale corresponds to a patient feeling better, an outcome no study in the 51-trial review measured',
        'That an oral azole with a broad historical spectrum is still a reasonable choice for skin or nail infection',
        'That the four-week trial horizon tells you anything about a relapsing lifelong condition, when 45 of 51 trials stopped at five weeks or less',
      ],
      whatFailedInitially: [
        'Oral ketoconazole was de-indicated by its own boxed warning for onychomycosis, cutaneous dermatophyte infections and Candida infections',
        'Serious hepatotoxicity with fatal outcome or requiring liver transplantation occurred in patients with no obvious risk factors',
        'Nine drugs are contraindicated for co-administration because of QT prolongation through CYP3A4 inhibition',
        'For tinea versicolor, the label states that treating the infection may not immediately normalise the pigment the patient came in about',
      ],
      realWorldOutcome: [
        'Still a first-choice topical for seborrhoeic dermatitis and dandruff, at a median United States acquisition cost of US$0.3029 per gram across 32 listed products',
        'The 1% shampoo is sold over the counter; the tablets are a last-resort systemic antifungal',
        'The strongest evidence about the topical drug concerns its tolerability rather than its efficacy',
        'The molecule’s commercially live form is now an endocrine drug whose label disclaims antifungal use',
      ],
    },
    deliverySystem: {
      type: 'Topical shampoo, cream, gel and foam; oral tablets, restricted',
      description:
        'The topical forms sit in the sebaceous reservoir where Malassezia lives, with minimal systemic absorption. Contact time differs by an order of magnitude between a shampoo and a leave-on cream, and the Cochrane review found the evidence insufficient to conclude that mode of delivery influences outcome. The oral tablets are a different risk category entirely and their label says so in its first sentence.',
      safetyProfile:
        'Topical use: local irritation, and side effects 44% less frequent than with topical corticosteroids in the pooled comparison, though the comparison against placebo was too uncertain to interpret. Oral use carries a boxed warning for serious hepatotoxicity including fatal cases and cases requiring liver transplantation, in some patients with no obvious risk factors, and for QT prolongation through CYP3A4 inhibition, with dofetilide, quinidine, pimozide, lurasidone, cisapride, methadone, disopyramide, dronedarone and ranolazine contraindicated for co-administration.',
    },
    commonQuestions: [
      {
        q: 'How well does ketoconazole shampoo work for dandruff?',
        a: 'Better than a dummy shampoo and about the same as a steroid. Pooling eight trials, the risk of not clearing was 31% lower than placebo at four weeks — and the useful context is that 69% of people on placebo did not clear either, so the absolute movement is real but not dramatic. Against a topical steroid the remission rates were indistinguishable, while side effects were 44% lower on ketoconazole. Cochrane graded the efficacy evidence low quality with substantial disagreement between trials, and graded the side effect comparison moderate — so the better-supported claim about this drug is the one about what it does not do.',
      },
      {
        q: 'Is it better than ciclopirox or the drugstore shampoos?',
        a: 'Nobody has shown that it is. Against ciclopirox the remission failure rate was 1.09 with an interval from 0.95 to 1.26 — a draw. Most comparisons against other antifungals came from single studies showing comparability. The reviewers’ own conclusion is that ketoconazole and ciclopirox both beat placebo, but limited evidence suggests either is more effective than any other agent in the class. Choosing between them on efficacy grounds is choosing on grounds the evidence does not support.',
      },
      {
        q: 'Why is oral ketoconazole barely used any more?',
        a: 'Because of what its own label now says. It opens with a boxed warning stating that the tablets are not indicated for onychomycosis, cutaneous dermatophyte infections or Candida infections, and should be used only when other effective antifungal therapy is unavailable or not tolerated. Serious hepatotoxicity — including fatal cases and cases requiring liver transplantation — has occurred, sometimes in people with no risk factors for liver disease. And because it blocks the enzyme that metabolises most other drugs, it raises their blood levels enough to prolong the QT interval, with nine specific drugs contraindicated alongside it. It was the first oral azole and it was superseded by ones that do the same job with less collateral damage.',
      },
      {
        q: 'Why is a version of it approved for Cushing’s syndrome?',
        a: 'Because the enzymes it blocks in fungi are structurally the same family as the ones that make cortisol in the human adrenal gland. That was an adverse effect for an antifungal and it is a therapeutic effect for a disease of too much cortisol. Levoketoconazole — the single 2S,4R enantiomer — was approved as Recorlev on 30 December 2021 for endogenous hypercortisolemia in adults with Cushing’s syndrome where surgery is not an option or has not been curative. The Limitations of Use on that label are worth the read: "RECORLEV is not approved for the treatment of fungal infections." The molecule’s side effect outlived its indication.',
        auditNote:
          'It carries the same hepatotoxicity and QT boxed warning in its new role. The repurposing changed what the effect is called, not how dangerous it is.',
      },
      {
        q: 'Will it get rid of the pale patches on my skin?',
        a: 'Not straight away, and the label says so where you would least expect it — in the Indications section itself. Tinea versicolor produces hyperpigmented or hypopigmented patches on the trunk that can extend to the neck, arms and upper thighs. The label adds that treatment of the infection may not immediately result in normalisation of pigment at the affected sites. So a successful treatment and an unchanged appearance are entirely compatible for some time afterwards, and repeating treatment because the patches are still visible is treating the wrong thing.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Okokon EO, Verbeek JH, Ruotsalainen JH, Ojo OA, Bakhoya VN. Topical antifungals for seborrhoeic dermatitis. Cochrane Database Syst Rev 2015;5:CD008138',
        identifier: '10.1002/14651858.CD008138.pub3',
        kind: 'doi',
      },
      {
        label:
          'Ketoconazole tablets United States prescribing information, boxed warning and Indications and Usage — ANDA 075912, retrieved from the openFDA label endpoint',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.application_number:%22ANDA075912%22',
        kind: 'regulatory',
      },
      {
        label:
          'RECORLEV (levoketoconazole) United States prescribing information, Indications and Usage with Limitations of Use, and boxed warning — NDA 214133',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22RECORLEV%22',
        kind: 'regulatory',
      },
      {
        label:
          'openFDA Drugs@FDA record for NDA 214133 (RECORLEV levoketoconazole), original approval 30 December 2021, Strongbridge',
        identifier:
          'https://api.fda.gov/drug/drugsfda.json?search=application_number:%22NDA214133%22',
        kind: 'regulatory',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 8. Permethrin — still first-line for scabies, and facing a head louse population in which the
  //    pooled frequency of the resistance mutation is 76.9%.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'permethrin',
    name: 'Permethrin',
    tradeName: 'Elimite / Nix / Permethrin Cream 5% / lice-killing creme rinse 1%',
    sponsor:
      'No single originator; the 5% cream is approved under NDA 019855 and the over-the-counter 1% lice products under separate applications, with the labeller held on the record listed as GlaxoSmithKline',
    targetGene:
      'None human. The target is the arthropod voltage-gated sodium channel gene, the para orthologue, in which the knockdown-resistance substitutions arise',
    targetProtein:
      'The alpha subunit of the arthropod voltage-gated sodium channel, held open so the nerve cannot repolarise',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1986,
    indication:
      'Permethrin cream 5% is indicated for the treatment of infestation with Sarcoptes scabiei (scabies). The over-the-counter 1% creme rinse is indicated for the treatment of head lice',
    patientFriendlyIndication: 'Scabies, and head lice',
    anatomicalSite:
      'The skin surface and the burrows in the stratum corneum where the scabies mite lives, and the scalp and hair shaft for lice',
    conditionContext: {
      conditionExplainer:
        'Scabies is a mite that burrows into the outer layer of skin and lays eggs there. The unbearable itch is an allergic reaction to the mite and its waste, which is why it can continue for weeks after every mite is dead. Head lice are a different arthropod living on the hair shaft, and the same drug kills both.',
      whyItMatters:
        'Permethrin is the World Health Organization’s and most guidelines’ first-line scabies treatment, and it is genuinely hard to beat. It is also the drug in this batch facing the most advanced resistance problem, and the two facts belong on the same page because the resistance is in the louse rather than the mite.',
      whoTakesThis:
        'People with scabies, and their household contacts; and children and adults with head lice, for whom the 1% product is sold off the shelf.',
      clinicalGoals:
        'Complete clearance of the infestation. The itch is a separate matter and outlasts the cure, which is the commonest reason people believe treatment has failed when it has not.',
    },
    oneSentenceVerdict:
      'A synthetic pyrethroid that holds the arthropod sodium channel open until the nerve cannot fire again — indistinguishable from ivermectin on complete clearance of scabies by two weeks across 15 randomised trials in 1,896 people, with a pooled treatment failure rate of 10.8% that has risen by about half a percentage point every year since 1983, and facing a head louse population whose pooled resistance-mutation frequency is 76.9%.',
    laymanHowItWorks:
      'Nerves fire by letting sodium rush in through a gate and then slamming the gate shut so they can reset. Permethrin wedges that gate open. Sodium keeps leaking in, the nerve never resets, and the mite or louse is paralysed and dies. Insect gates are far more sensitive to it than human ones, and on top of that human skin absorbs almost none of it — about two per cent or less of what is applied — and breaks down what does get in within hours. That combination of a species-selective target and near-zero exposure is why a neurotoxic insecticide is safe enough to put on a baby.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 69,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.2314 per gram, the median United States pharmacy acquisition cost across 3 listed permethrin products (CMS NADAC, generic, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Long off patent, and with only three products in the CMS survey the median rests on a thin base. The 1% lice products are sold over the counter and are not all captured in the prescription acquisition-cost survey at all, which is worth knowing before treating that number as the price of treating an infestation.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The Cochrane comparison of permethrin against ivermectin is one of the cleaner head-to-head questions in dermatology and the answer is a draw by two weeks. What separates them is practical rather than pharmacological: one is a cream applied over the whole body and the other is a tablet, which matters enormously when a household or an institution has to be treated at once.',
      conventionalRx: [
        {
          name: 'Oral ivermectin',
          class: 'Macrocyclic lactone, opens glutamate-gated chloride channels in invertebrates',
          howItCompares:
            'At one week, permethrin cleared more people — 65% average against an illustrative 43% for ivermectin (RR 0.65, 95% CI 0.54 to 0.78, 6 studies, 613 participants). By two weeks the difference had gone (74% against 68%, RR 0.91, 95% CI 0.76 to 1.08). At four weeks with one to three doses or applications, 93% against 86% (RR 0.92, 95% CI 0.82 to 1.03). The pooled treatment-failure review put permethrin at 10.8% and oral ivermectin at 11.8%.',
          typicalCost: 'Generic tablets; not comparable to a per-gram cream figure',
          prosAndCons:
            'Pros: swallowed rather than smeared, which makes treating households, care homes and outbreaks feasible. Cons: slower to clear in the first week, and the failure review found single-dose failure at 15.2% against 7.1% for two doses.',
        },
        {
          name: 'Topical ivermectin 1% lotion',
          class: 'The same macrocyclic lactone applied to skin',
          howItCompares:
            'Probably no difference from permethrin cream at four weeks (extrapolated cure rates 96% against 94%; RR 1.02, 95% CI 0.96 to 1.08, 210 participants, 1 study, moderate-certainty evidence), and no difference from oral ivermectin (97% against 96%, RR 0.99, 95% CI 0.95 to 1.03). Pooled treatment failure 9.3%, the lowest of the three.',
          typicalCost: 'Priced as a topical lotion; availability varies by country',
          prosAndCons:
            'Pros: the lowest pooled failure rate of the three main options, with mild and rare adverse events. Cons: the comparison against permethrin rests on a single 210-participant study.',
        },
        {
          name: 'Benzyl benzoate, crotamiton, malathion and sulfur',
          class: 'Older scabicides of varied mechanism',
          howItCompares:
            'All included in the 147-study treatment-failure review, where the overall failure prevalence across all agents was 15.2% (95% CI 12.9 to 17.6) — higher than permethrin, oral ivermectin or topical ivermectin individually.',
          typicalCost:
            'Generally inexpensive; sulfur preparations remain the option in settings where the others are unavailable',
          prosAndCons:
            'Pros: cheap, long-established, and sulfur is usable where nothing else is. Cons: higher pooled failure rates and, for several of them, worse tolerability.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'The itch outlasting treatment is not treatment failure',
          action:
            'Post-scabetic itch is an immune reaction to dead mite material, not evidence of live mites.',
          patientImpact:
            'It can persist for weeks after every mite is dead. Repeating treatment because the itch has not stopped is the commonest avoidable exposure in this condition, and it is what makes real failure rates hard to measure.',
          clinicalPrecaution:
            'Persistent or worsening itch, new burrows, or itch in previously unaffected household members are reasons to be re-assessed rather than to re-treat unsupervised.',
        },
        {
          name: 'For head lice, resistance is the likeliest explanation for failure',
          action:
            'The knockdown-resistance mutation is now the majority allele in surveyed louse populations.',
          patientImpact:
            'Across 24 studies the mean frequency of pyrethroid resistance was 76.9%, and in four surveyed countries the resistance allele frequency reached 100%. The highest resistance recorded was against permethrin specifically.',
          clinicalPrecaution:
            'This is an epidemiological finding about louse populations, not advice about what to use instead. Which treatment is appropriate is a clinical decision.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1(C(C1C(=O)OCC2=CC(=CC=C2)OC3=CC=CC=C3)C=C(Cl)Cl)C',
      chemicalFormula: 'C21H20Cl2O3',
      molecularWeight: '391.30 g/mol',
      targetReceptorAffinity:
        'Permethrin has no receptor in the conventional sense: it binds a lipophilic site on the arthropod voltage-gated sodium channel and slows its inactivation, prolonging the open state. Selectivity comes from three things at once — the arthropod channel is far more sensitive than the mammalian one, mammalian body temperature reduces pyrethroid binding, and mammalian esterases hydrolyse the ester rapidly. The label reports absorption after a single application of the 5% cream as 2% or less of the amount applied.',
      structureSource: {
        label:
          'PubChem CID 40326 (permethrin) — canonical SMILES, molecular formula and weight, as held on the record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/40326',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'per-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Cis/trans isomer ratio of the cyclopropane ester',
          description:
            'Determine the ratio of cis to trans isomers about the cyclopropane ring. Permethrin is not one compound but a defined mixture, the cis isomer being the more insecticidal and the more slowly metabolised. A product with the wrong ratio is a different insecticide with different potency and different persistence.',
          reagentsAndBuffer:
            'Permethrin reference standard of defined isomer ratio, capillary gas chromatography with flame ionisation or mass detection, 1H NMR for cyclopropane ring geometry',
        },
        {
          id: 'per-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Esterification and formulation into cream or creme rinse',
          description:
            'Couple the dichlorovinyl cyclopropanecarboxylic acid to 3-phenoxybenzyl alcohol and formulate. The ester bond is deliberately the weak point of the molecule: it is what mammalian esterases cleave within hours, and the whole safety argument for putting this on human skin runs through that bond.',
          dependsOnStepId: 'per-w1',
          reagentsAndBuffer:
            'Cis/trans-3-(2,2-dichlorovinyl)-2,2-dimethylcyclopropanecarboxylic acid, 3-phenoxybenzyl alcohol, acid catalyst or acyl chloride route, emulsion cream base or cationic creme rinse base',
        },
        {
          id: 'per-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Removal of the free alcohol and acid, and hydrolytic stability testing',
          description:
            'Strip out unreacted phenoxybenzyl alcohol and the free acid, then test how fast the ester hydrolyses in the finished vehicle. A cream that hydrolyses on the shelf is delivering inactive metabolites, and the assay that detects that is the same one used to demonstrate the drug’s rapid inactivation in the body.',
          dependsOnStepId: 'per-w2',
          reagentsAndBuffer:
            'Vacuum distillation or chromatographic removal of residuals, gas chromatography-mass spectrometry for 3-phenoxybenzyl alcohol and free acid, accelerated stability at 40C and 75% relative humidity across the vehicle pH range',
        },
        {
          id: 'per-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Percutaneous absorption and urinary metabolite recovery',
          description:
            'Measure how much crosses human skin. The answer is meant to be very small, and the label states it: 2% or less of a single application of the 5% cream, established with carbon-14 labelled permethrin and in patients with moderate to severe scabies. That figure is the entire systemic safety case for the product.',
          dependsOnStepId: 'per-w3',
          reagentsAndBuffer:
            'Carbon-14 labelled permethrin, dermatomed human skin in Franz cells or in vivo application under clinical conditions, urinary collection for 3-phenoxybenzoic acid and other ester hydrolysis metabolites, LC-MS/MS quantification',
        },
        {
          id: 'per-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Ex vivo knockdown bioassay and kdr allele genotyping',
          description:
            'Expose field-collected lice or mites to permethrin and time how long knockdown takes, then genotype the sodium channel gene. The two together are the only way to say whether a treatment failure was resistance or something else — and a systematic review of 147 scabies studies found that none of them assessed resistance at all.',
          dependsOnStepId: 'per-w4',
          reagentsAndBuffer:
            'Field-collected Pediculus humanus capitis or Sarcoptes scabiei, filter-paper or immersion knockdown bioassay with timed observation, DNA extraction and PCR of the voltage-gated sodium channel gene covering the knockdown-resistance codons',
        },
      ],
    },
    keyAudits: [
      {
        id: 'per-a1',
        category: 'measured',
        title: 'Faster than ivermectin in week one, level with it by week two',
        laymanSummary:
          'Fifteen randomised trials compared permethrin cream against ivermectin. After a week, roughly two-thirds of the permethrin patients were clear against four in ten on ivermectin. By two weeks the gap had closed, and by four weeks both were above eighty-five per cent.',
        technicalDetails:
          'The 2018 Cochrane review included 15 studies with 1,896 participants comparing topical permethrin, systemic ivermectin and topical ivermectin. Using the average clearance of 65% in the permethrin trials, the illustrative clearance with oral ivermectin at one week was 43% (RR 0.65, 95% CI 0.54 to 0.78; 613 participants, 6 studies, low-certainty evidence). By two weeks there may be little or no difference (74% against 68%; RR 0.91, 95% CI 0.76 to 1.08; 459 participants, 5 studies). With one to three doses or applications at four weeks, illustrative cures were 93% for permethrin and 86% for ivermectin (RR 0.92, 95% CI 0.82 to 1.03; 581 participants, 5 studies). The authors conclude that for the most part no difference in efficacy was detected, with confidence in the effect estimates mostly low to moderate and poor reporting a major limitation.',
        evidenceSource:
          'Rosumeck S, Nast A, Dressler C. Cochrane Database Syst Rev 2018;4:CD012994 (PMID 29608022)',
        doi: '10.1002/14651858.CD012994',
        measuredMetric:
          'Complete clearance of scabies at one, two and four weeks, permethrin against ivermectin',
        auditFlag: 'verified',
      },
      {
        id: 'per-a2',
        category: 'failed',
        title:
          'Failure rates have risen every year since 1983, and nobody has tested for resistance',
        laymanSummary:
          'A review of 147 studies found that about one scabies treatment in seven fails, and that permethrin failures have crept up by roughly half a percentage point every year for four decades. Not one of the 147 studies looked for resistance in the mite.',
        technicalDetails:
          'The overall prevalence of scabies treatment failure across 147 eligible studies was 15.2% (95% CI 12.9 to 17.6; I² = 95.3%, moderate-certainty evidence), with regional variation (P=0.003) and the highest rate in the Western Pacific region at 26.9% (95% CI 14.5 to 41.2). Permethrin failure was 10.8% (95% CI 7.5 to 14.5), oral ivermectin 11.8% (8.4 to 15.4) and topical ivermectin 9.3% (5.1 to 14.3). Across the included studies from 1983 to 2021, overall failure prevalence increased by 0.27% per year and permethrin failure prevalence by 0.58% per year. Only three studies conducted a multivariable risk factor analysis, and the review records that no studies assessed resistance. The authors read the temporal increase as a hint of decreasing mite susceptibility.',
        evidenceSource:
          'Mbuagbaw L et al. Failure of scabies treatment: a systematic review and meta-analysis. Br J Dermatol 2024;190:163-173 (PMID 37625798)',
        doi: '10.1093/bjd/ljad308',
        measuredMetric:
          'Pooled treatment failure prevalence and its annual trend, 1983 to 2021, across 147 studies',
        auditFlag: 'contested',
      },
      {
        id: 'per-a3',
        category: 'conclusion_shift',
        title: 'Against head lice, the resistance mutation is now the majority allele',
        laymanSummary:
          'Permethrin is still sold off the shelf as the standard treatment for head lice. Across twenty-four surveys worldwide, three-quarters of lice carried the mutation that makes them insensitive to it, and in four countries every louse tested did.',
        technicalDetails:
          'A systematic review and meta-analysis of 24 articles covering the period 2000 to June 2021 estimated the mean frequency of pyrethroid resistance in treated head louse populations at 76.9%, of which 64.4% of resistant lice were homozygous and 30.3% heterozygous. Four countries — Australia, England, Israel and Turkey — showed 100% knockdown-resistance gene frequencies, which the authors state is likely to render pyrethrin- and pyrethroid-based pediculicides ineffective there. The highest resistance recorded across the included studies was against permethrin specifically. The mechanism is target-site insensitivity: point substitutions in the voltage-gated sodium channel that reduce pyrethroid binding without affecting the channel’s normal function.',
        evidenceSource: 'Mohammadi J et al., Parasite 2021;28:86 (PMID 34935614)',
        doi: '10.1051/parasite/2021083',
        inferredClaim:
          'That an over-the-counter treatment’s continued availability implies continued effectiveness — the pooled resistance frequency in the target organism is 76.9% and reaches 100% in four surveyed countries',
        auditFlag: 'contested',
      },
      {
        id: 'per-a4',
        category: 'measured',
        title: 'The safety case is a pharmacokinetic number, and the label states it',
        laymanSummary:
          'Putting an insecticide on a child’s skin sounds alarming until you see how little of it gets in. The label says two per cent or less of a single application is absorbed, and what does get in is broken down and passed in urine.',
        technicalDetails:
          'The permethrin cream 5% label states that although the amount absorbed after a single application has not been determined precisely, data from studies with carbon-14 labelled permethrin and absorption studies of the cream applied to patients with moderate to severe scabies indicate it is 2% or less of the amount applied. Permethrin is rapidly metabolised by ester hydrolysis to inactive metabolites excreted primarily in the urine. Selectivity has three independent components: the arthropod sodium channel is markedly more sensitive than the mammalian one, pyrethroid binding falls with rising temperature so mammalian body temperature works against it, and mammalian esterases cleave the molecule quickly. Any one of those alone would be a thin argument; together they are why the drug is usable on infants.',
        evidenceSource:
          'Permethrin Cream 5% United States prescribing information, Clinical Pharmacology (NDA 019855, openFDA label endpoint)',
        measuredMetric:
          'Percutaneous absorption of 2% or less of a single application, from carbon-14 labelled studies',
        auditFlag: 'verified',
      },
      {
        id: 'per-a5',
        category: 'inferred',
        title:
          'The trials were run where the disease is, which is not where the guidelines are used',
        laymanSummary:
          'Nearly every randomised trial in the Cochrane review was conducted in South Asia or North Africa, where scabies is common and associated with poverty. The results are then applied worldwide, including in settings with different mite populations and different living conditions.',
        technicalDetails:
          'The review records that nearly all included studies were conducted in South Asia or North Africa, where the disease is more common and is associated with poverty; that the overall risk of bias in included trials was moderate with poor reporting in many studies; and that confidence in the effect estimates was mostly low to moderate, with poor reporting a major limitation. The treatment-failure review separately found significant regional differences in failure prevalence between World Health Organization regions (P=0.003), with the Western Pacific at 26.9% against an overall 15.2%. Transporting a pooled clearance rate across regions that demonstrably differ by a factor of nearly two is an inference the trials do not license.',
        evidenceSource:
          'Rosumeck S, Nast A, Dressler C. Cochrane Database Syst Rev 2018;4:CD012994; Mbuagbaw L et al., Br J Dermatol 2024;190:163-173',
        doi: '10.1002/14651858.CD012994',
        inferredClaim:
          'That a pooled clearance rate from trials in South Asia and North Africa describes what will happen elsewhere, when the pooled failure rate itself differs significantly by region',
        auditFlag: 'caution',
      },
      {
        id: 'per-a6',
        category: 'inferred',
        title: 'Nothing in these trials measured the symptom people actually have',
        laymanSummary:
          'Scabies is unbearable because of the itch. The primary outcome in every one of these trials is whether mites can still be found. The itch is an allergic reaction that continues for weeks after the last mite dies, and it is not what was measured.',
        technicalDetails:
          'The Cochrane review’s primary outcome was complete clearance of scabies, with secondary outcomes of re-treatment, adverse events and withdrawals. Post-scabetic pruritus is not among them. Reporting of adverse events in included studies was described as suboptimal; at four weeks the extrapolated proportion with at least one adverse event was 4% for permethrin and 5% for ivermectin (RR 1.30, 95% CI 0.35 to 4.83, low-certainty evidence). Because persistent itch is routinely interpreted as treatment failure by patients and sometimes by clinicians, an endpoint that excludes it also systematically under-measures the thing that drives re-treatment.',
        evidenceSource:
          'Rosumeck S, Nast A, Dressler C. Cochrane Database Syst Rev 2018;4:CD012994 (PMID 29608022)',
        doi: '10.1002/14651858.CD012994',
        inferredClaim:
          'That parasitological clearance is what a scabies patient experiences as cure — the itch is an immune response to dead mite material and persists for weeks after clearance, and no trial in the review measured it',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Applied to skin, and barely absorbed',
        laymanDesc:
          'The cream goes on the skin where the mites are. Almost none of it crosses into the body — two per cent or less of what is applied.',
        molecularDetail:
          'The label reports absorption of 2% or less of a single application of the 5% cream, from carbon-14 labelled studies and from patients with moderate to severe scabies. Permethrin is rapidly metabolised by ester hydrolysis to inactive metabolites excreted primarily in urine.',
        iconName: 'Droplet',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It reaches the nerves of the mite',
        laymanDesc:
          'The mite lives in burrows in the outer skin, which is exactly where a lipophilic cream sits. The drug crosses the mite’s cuticle and reaches its nervous system.',
        molecularDetail:
          'Permethrin is highly lipophilic and partitions into the stratum corneum and the burrows within it. Penetration into the arthropod occurs through the cuticle rather than by ingestion, which is why the drug works on contact rather than requiring feeding.',
        iconName: 'Bug',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The sodium gate is wedged open',
        laymanDesc:
          'Nerve cells fire by letting sodium in and then shutting the gate. Permethrin stops the gate closing.',
        molecularDetail:
          'Permethrin binds a lipophilic site on the arthropod voltage-gated sodium channel and slows inactivation, prolonging the open state. The label describes it as disrupting the sodium channel current by which polarisation of the membrane is regulated.',
        iconName: 'Zap',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The nerve cannot reset and the animal is paralysed',
        laymanDesc:
          'With sodium leaking in continuously the nerve never repolarises. The mite or louse is knocked down and dies.',
        molecularDetail:
          'Delayed repolarisation and paralysis are the stated consequences in the label. Human channels are far less sensitive, mammalian body temperature reduces pyrethroid binding, and mammalian esterases hydrolyse the ester rapidly — three independent contributions to selectivity.',
        iconName: 'Ban',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Unless the gate has been rebuilt',
        laymanDesc:
          'Lice have accumulated changes in that gate which stop the drug binding. Across worldwide surveys about three-quarters of lice carry them, and in four countries all of them do.',
        molecularDetail:
          'Knockdown resistance arises from point substitutions in the voltage-gated sodium channel that reduce pyrethroid binding without impairing normal channel function. Pooled mean frequency across 24 studies was 76.9%, with 64.4% of resistant lice homozygous, and 100% allele frequency reported in Australia, England, Israel and Turkey.',
        iconName: 'ShieldOff',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What the endpoint does not measure',
        laymanDesc:
          'Every trial counts whether mites can still be found. None of them measured the itch, which is what the patient came in about and which continues for weeks after the last mite is dead.',
        molecularDetail:
          'Complete clearance of scabies was the primary outcome of every trial in the Cochrane review; post-scabetic pruritus appears in none of the outcome sets. The 147-study failure review records that no study assessed resistance either, so the two most likely explanations for a treatment appearing not to work are both unmeasured.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Cochrane pooled permethrin against ivermectin, one week (CD012994)',
        phase: 'Systematic review and meta-analysis of randomised controlled trials',
        sampleSize: 613,
        primaryEndpoint: 'Complete clearance of scabies one week after treatment',
        endpointMet: true,
        statisticalPValue:
          'RR 0.65 (95% CI 0.54 to 0.78) favouring permethrin, 6 studies, low-certainty evidence; illustrative clearance 65% permethrin against 43% ivermectin',
        unreportedAdverseSignals:
          'Nearly all included trials were run in South Asia or North Africa. Risk of bias was moderate and reporting poor in many studies, which the reviewers name as their major limitation.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Cochrane pooled permethrin against ivermectin, four weeks (CD012994)',
        phase: 'Systematic review and meta-analysis of randomised controlled trials',
        sampleSize: 581,
        primaryEndpoint:
          'Complete clearance four weeks after initiation, one to three applications or doses',
        endpointMet: false,
        statisticalPValue:
          'RR 0.92 (95% CI 0.82 to 1.03), 5 studies, low-certainty evidence; illustrative cures 93% permethrin against 86% ivermectin — no difference detected',
        unreportedAdverseSignals:
          'The reviewers state that for the most part no difference in efficacy was detected between permethrin and either form of ivermectin. The week-one advantage does not persist.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Scabies treatment failure systematic review (PMID 37625798)',
        phase: 'Systematic review and random-effects meta-analysis of 147 studies, 1983 to 2021',
        sampleSize: 147,
        primaryEndpoint: 'Prevalence of scabies treatment failure and its associated factors',
        endpointMet: true,
        statisticalPValue:
          'Overall failure 15.2% (95% CI 12.9 to 17.6, I² = 95.3%); permethrin 10.8% (7.5 to 14.5); permethrin failure rising 0.58% per year across the study period',
        unreportedAdverseSignals:
          'Only three of 147 studies performed a multivariable risk factor analysis and none assessed resistance. Sample size here counts studies, not participants — participant-level totals are not reported as a single figure.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Pyrethroid resistance frequency meta-analysis in head lice (PMID 34935614)',
        phase: 'Systematic review and meta-analysis of 24 field surveys, 2000 to June 2021',
        sampleSize: 24,
        primaryEndpoint:
          'Frequency of pyrethroid knockdown-resistance alleles in treated head louse populations',
        endpointMet: true,
        statisticalPValue:
          'Mean resistance frequency 76.9%; 64.4% of resistant lice homozygous and 30.3% heterozygous; 100% allele frequency reported in four countries',
        unreportedAdverseSignals:
          'Sample size counts included articles rather than lice. Surveys are geographically uneven and the review restricted itself to English-language publications.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Complete clearance at one week 65% on permethrin against an illustrative 43% on oral ivermectin (RR 0.65, 95% CI 0.54 to 0.78)',
        'No difference detected by two weeks (74% against 68%) or at four weeks (93% against 86%, RR 0.92, 95% CI 0.82 to 1.03)',
        'Pooled scabies treatment failure 10.8% for permethrin against 15.2% across all agents',
        'Permethrin treatment failure prevalence rose by 0.58% per year across studies published from 1983 to 2021',
        'Mean pyrethroid resistance frequency in head lice 76.9% across 24 surveys, reaching 100% in four countries',
        'Percutaneous absorption of 2% or less of a single application of the 5% cream',
      ],
      unsupportedInferences: [
        'That parasitological clearance is what the patient experiences as cure, when the itch persists for weeks afterwards and no trial measured it',
        'That continued over-the-counter availability for head lice implies continued effectiveness against them',
        'That a pooled clearance rate from South Asian and North African trials transfers to regions whose failure rates differ significantly',
        'That the rising failure rate is resistance — the authors call it a hint, and none of the 147 studies tested for it',
      ],
      whatFailedInitially: [
        'The week-one advantage over ivermectin disappears by week two and is gone at four weeks',
        'Permethrin failure prevalence has climbed steadily for nearly four decades of published studies',
        'Against head lice the resistance allele is now the majority allele in surveyed populations, and fixed in four countries',
        'No study in the 147-study failure review assessed resistance, so the most important question about the drug has no direct data behind it',
      ],
      realWorldOutcome: [
        'Still the first-line scabies treatment in most guidelines, approved as a 5% cream under NDA 019855',
        'Only three permethrin products appear in the CMS survey, at a median United States acquisition cost of US$0.2314 per gram',
        'The 1% lice product remains on open shelves in countries where the resistance allele is at or near fixation',
        'Its principal practical rival is a tablet, which is why ivermectin has taken over outbreak and institutional treatment',
      ],
    },
    deliverySystem: {
      type: 'Topical cream 5% for scabies; over-the-counter creme rinse 1% for head lice',
      description:
        'A lipophilic cream that partitions into the stratum corneum and the mite burrows within it, killing on contact rather than requiring the parasite to feed. Percutaneous absorption is 2% or less of a single application, and what is absorbed is hydrolysed to inactive metabolites and excreted in urine. The 1% creme rinse is a short-contact scalp product for a different parasite.',
      safetyProfile:
        'Well tolerated: in the pooled randomised trials at four weeks, the extrapolated proportion with at least one adverse event was 4% on permethrin against 5% on ivermectin, and no withdrawals for adverse events occurred in either group. Reporting of adverse events in the underlying studies was described by the reviewers as suboptimal. Transient burning, stinging and itching on application are the usual complaints, and are hard to distinguish from the itch of the disease. The selectivity that makes a neurotoxic insecticide acceptable on human and infant skin rests on the arthropod channel’s greater sensitivity, the temperature dependence of pyrethroid binding and rapid mammalian ester hydrolysis.',
    },
    commonQuestions: [
      {
        q: 'Why am I still itching after the treatment worked?',
        a: 'Because the itch is not caused by the mites moving around — it is an allergic reaction to the mites, their eggs and their waste, and that material stays in the skin after everything is dead. It can go on for weeks. This is the single most common reason people conclude a treatment has failed, and it is also why the failure rates in the literature are hard to trust: the trials measured whether mites could still be found, which is the right scientific endpoint and is not the thing the patient is experiencing. Not one trial in the Cochrane review had persistent itch as an outcome.',
        auditNote:
          'New burrows, spreading rash, or itch appearing in household members who were previously fine are a different matter and mean a reassessment rather than a repeat.',
      },
      {
        q: 'Is permethrin or ivermectin better for scabies?',
        a: 'For the first week, permethrin. After that, neither. Pooling six trials, permethrin cleared about 65% of people at one week against an illustrative 43% for oral ivermectin. By two weeks the figures were 74% and 68% with the confidence interval crossing no difference, and by four weeks 93% and 86%, again with no difference detected. The reviewers’ own summary is that for the most part they found no difference in efficacy. What separates the two in practice is the form: treating an entire household or a care home with a whole-body cream is a different proposition from handing out tablets.',
      },
      {
        q: 'Does permethrin still work on head lice?',
        a: 'Increasingly not, and the evidence for that is genetic rather than clinical. Lice develop resistance through point mutations in the sodium channel the drug targets — the gate is rebuilt so the drug no longer wedges it open. A meta-analysis of 24 field surveys found the mean frequency of that resistance at 76.9%, with about two-thirds of resistant lice carrying it on both chromosomes. In Australia, England, Israel and Turkey the surveyed frequency was 100%, which the authors say is likely to make pyrethroid-based treatments ineffective there. The highest resistance recorded across all the included studies was against permethrin specifically. It is still sold on open shelves.',
      },
      {
        q: 'Is it safe to put an insecticide on skin, including a child’s?',
        a: 'The safety case is unusually explicit and it rests on numbers rather than reassurance. Three things point the same way. The arthropod sodium channel is far more sensitive to pyrethroids than the mammalian one. Pyrethroid binding weakens as temperature rises, so mammalian body temperature works against the drug. And mammalian esterases cleave the molecule quickly into inactive fragments excreted in urine. On top of that, the label states that absorption after a single application of the 5% cream is 2% or less of what was applied, established using carbon-14 labelled drug in patients with real scabies. Any one of those arguments alone would be thin; together they are why the drug is used on infants.',
      },
      {
        q: 'Is scabies becoming resistant to permethrin too?',
        a: 'It is suspected and it has not been demonstrated. A review of 147 studies published between 1983 and 2021 found that permethrin treatment failure rose by about 0.58 percentage points every year over that period, and overall failure across all drugs by 0.27 points a year. The authors describe this as hinting at decreasing mite susceptibility. The same review records that no study assessed resistance — not one of the 147. So the trend is real, the explanation is unestablished, and the experiment that would settle it has not been done. Poor adherence, reinfestation from untreated contacts and misdiagnosis are all plausible alternatives.',
        auditNote:
          'The failure rate also differs significantly between regions, from 26.9% in the Western Pacific against 15.2% overall, which any single explanation would need to account for.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Rosumeck S, Nast A, Dressler C. Ivermectin and permethrin for treating scabies. Cochrane Database Syst Rev 2018;4:CD012994',
        identifier: '10.1002/14651858.CD012994',
        kind: 'doi',
      },
      {
        label:
          'Mbuagbaw L, Sadeghirad B, Morgan RL, et al. Failure of scabies treatment: a systematic review and meta-analysis. Br J Dermatol 2024;190:163-173',
        identifier: '10.1093/bjd/ljad308',
        kind: 'doi',
      },
      {
        label:
          'Mohammadi J, Azizi K, Alipour H, et al. Frequency of pyrethroid resistance in human head louse treatment: systematic review and meta-analysis. Parasite 2021;28:86',
        identifier: '10.1051/parasite/2021083',
        kind: 'doi',
      },
      {
        label:
          'Permethrin Cream 5% United States prescribing information, Indications and Usage and Clinical Pharmacology — NDA 019855, retrieved from the openFDA label endpoint',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.application_number:%22NDA019855%22',
        kind: 'regulatory',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 9. Mupirocin — a 4,030-patient trial that missed its primary endpoint and is remembered for a
  //    subgroup, and a decolonisation strategy that works best where resistance has not arrived.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'mupirocin',
    name: 'Mupirocin',
    tradeName: 'Bactroban / Bactroban Nasal / Centany',
    sponsor:
      'Beecham, now GlaxoSmithKline, which isolated it from Pseudomonas fluorescens and developed it',
    targetGene:
      'ileS — the bacterial isoleucyl-tRNA synthetase gene. Resistance comes from a second, plasmid-borne copy, ileS-2, carried on the mupA determinant',
    targetProtein:
      'Bacterial isoleucyl-tRNA synthetase. The human enzyme has a different active site and is not inhibited',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1987,
    indication:
      'Mupirocin cream 2% is indicated for secondarily infected traumatic skin lesions up to 10 cm in length or 100 cm2 in area due to susceptible isolates of Staphylococcus aureus and Streptococcus pyogenes. The ointment is indicated for impetigo, and a separate nasal ointment is used for eradication of nasal Staphylococcus aureus carriage',
    patientFriendlyIndication:
      'Impetigo and small infected skin wounds, and clearing staph from the nose before surgery',
    anatomicalSite:
      'The skin surface and the anterior nares — the front of the nostril, which is where Staphylococcus aureus lives in about a quarter of people',
    conditionContext: {
      conditionExplainer:
        'Roughly a quarter of people carry Staphylococcus aureus in their nose without any illness. That reservoir is where a patient’s own surgical wound infection usually comes from. Impetigo is the same organism, plus Streptococcus pyogenes, growing on broken skin.',
      whyItMatters:
        'Mupirocin is the drug behind hospital decolonisation programmes worldwide, and the evidence for those programmes is a more complicated story than it is usually told as. The largest trial of the strategy missed its primary endpoint outright.',
      whoTakesThis:
        'People with impetigo or a small infected wound, and surgical patients found to carry Staphylococcus aureus in the nose.',
      clinicalGoals:
        'Clearance of the skin infection, or eradication of nasal carriage. Whether eradicating carriage prevents infection is a separate question with two large trials pointing in different directions.',
    },
    oneSentenceVerdict:
      'A Pseudomonas natural product that mimics isoleucine locked onto ATP and jams the bacterial enzyme that loads isoleucine onto tRNA — better than placebo for impetigo (RR 2.24, 95% CI 1.61 to 3.13) and indistinguishable from fusidic acid, but its 4,030-patient surgical prophylaxis trial missed its primary endpoint (2.3% against 2.4%) and is remembered for a carrier subgroup, with pooled high-level resistance now at 8.5%.',
    laymanHowItWorks:
      'To build a protein, a cell must first attach each amino acid to its matching carrier molecule, and a dedicated enzyme does that for each amino acid. Mupirocin is shaped almost exactly like isoleucine already joined to the cell’s energy currency — the fleeting intermediate that enzyme normally makes. It slots into the enzyme and will not leave. No isoleucine gets loaded, protein production halts, and the bacterium stops. The equivalent human enzyme is built differently enough that the drug ignores it. The molecule is also destroyed within minutes in blood, which is why it exists only as an ointment.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 71,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.8388 per gram, the median United States pharmacy acquisition cost across 20 listed mupirocin products (CMS NADAC, generic, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Off patent with 20 listed products, and at US$0.8388 per gram it is the second most expensive drug per gram in this batch after tretinoin. It is a fermentation product of Pseudomonas fluorescens rather than a synthetic compound, which puts a floor under manufacturing cost, and the near-universal hospital decolonisation programmes keep demand high.',
      synthesisComplexity: 'High',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'For impetigo the Cochrane review found mupirocin and fusidic acid indistinguishable, and topical treatment equal or superior to oral antibiotics with fewer side effects. For nasal decolonisation there is no established alternative with comparable trial evidence, which is precisely why the rising resistance figures matter.',
      conventionalRx: [
        {
          name: 'Fusidic acid (topical)',
          class: 'Steroid-like antibiotic inhibiting bacterial elongation factor G',
          howItCompares:
            'In four studies with 440 participants there was no clear evidence that either mupirocin or fusidic acid was more effective than the other (RR 1.03, 95% CI 0.95 to 1.11). The reviewers conclude the two are of similar efficacy.',
          typicalCost: 'Generic where marketed; not licensed in the United States',
          prosAndCons:
            'Pros: equivalent efficacy in the pooled comparison, and a different target so no cross-resistance. Cons: resistance in Staphylococcus aureus is well documented for this agent too, and it is unavailable in some markets.',
        },
        {
          name: 'Oral erythromycin or cloxacillin',
          class: 'Systemic antibiotics for impetigo',
          howItCompares:
            'Topical mupirocin was slightly superior to oral erythromycin across 10 studies with 581 participants (pooled RR 1.07, 95% CI 1.01 to 1.13), and there were no significant differences against other oral antibiotics. Side effects were more common with oral treatment, driven mostly by gastrointestinal effects.',
          typicalCost: 'Generic oral antibiotics, inexpensive',
          prosAndCons:
            'Pros: practical for extensive disease, where the review notes a lack of studies and cannot say whether oral is superior. Cons: more side effects for no measured efficacy gain in localised impetigo.',
        },
        {
          name: 'Retapamulin',
          class: 'Pleuromutilin, inhibits the bacterial ribosome at a distinct site',
          howItCompares:
            'The Cochrane review notes that for this newly developed topical treatment no resistance had yet been reported at the time of writing, against a background of growing resistance among the bacteria causing impetigo to commonly used antibiotics.',
          typicalCost: 'Branded topical; more expensive than generic mupirocin',
          prosAndCons:
            'Pros: a genuinely different target and, at the time of that review, no reported resistance. Cons: a smaller evidence base, and two of the review’s authors disclosed manufacturer funding for a retapamulin trial included in the update.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Disinfectant washes are not a substitute',
          action:
            'The Cochrane review pooled two studies with 292 participants comparing topical antibiotics against disinfecting treatments.',
          patientImpact:
            'Topical antibiotics were significantly better (RR 1.15, 95% CI 1.01 to 1.32), and the reviewers state there is a lack of evidence to support disinfection measures to manage impetigo.',
          clinicalPrecaution:
            'This concerns treating established impetigo. It says nothing about hand hygiene or preventing spread, which were not what was compared.',
        },
        {
          name: 'The area limit in the indication is part of the indication',
          action:
            'The cream is licensed for secondarily infected traumatic skin lesions up to 10 cm in length or 100 cm2 in area.',
          patientImpact:
            'That boundary exists because the trials were done in localised disease. The Cochrane review notes a lack of studies in people with extensive impetigo and says it is therefore unclear whether oral antibiotics are superior in that group.',
          clinicalPrecaution:
            'Extensive or spreading infection, fever, or infection not settling are reasons for clinical assessment rather than continued topical treatment.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'C[C@H]([C@H]1[C@@H](O1)C[C@H]2CO[C@H]([C@@H]([C@@H]2O)O)C/C(=C/C(=O)OCCCCCCCCC(=O)O)/C)[C@H](C)O',
      chemicalFormula: 'C26H44O9',
      molecularWeight: '500.60 g/mol',
      targetReceptorAffinity:
        'Mupirocin is a structural mimic of isoleucyl-adenylate, the transient intermediate that isoleucyl-tRNA synthetase forms from isoleucine and ATP. It binds the bacterial enzyme reversibly and with high affinity, competing with both substrates, and does not inhibit the eukaryotic enzyme, whose active site differs. Activity is concentration-dependent: bacteriostatic at low concentrations and bactericidal at the concentrations achieved topically.',
      structureSource: {
        label:
          'PubChem CID 446596 (mupirocin) — canonical SMILES, molecular formula and weight, as held on the record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/446596',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'mup-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Fermentation identity and pseudomonic acid congener profile',
          description:
            'Confirm the producing strain and separate pseudomonic acid A from the B, C and D congeners it makes alongside. Mupirocin is pseudomonic acid A specifically; the others differ by a hydroxyl or a double bond and are far less potent. This is a purity problem that only exists because the drug is grown rather than built.',
          reagentsAndBuffer:
            'Pseudomonas fluorescens culture, pseudomonic acid A reference standard, reversed-phase HPLC with ultraviolet detection at 221 nm, LC-MS for congener identification',
        },
        {
          id: 'mup-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Extraction and formulation into a polyethylene glycol or emollient base',
          description:
            'Extract from broth and formulate. Vehicle choice is a real clinical variable here: the original ointment used a polyethylene glycol base which is unsuitable for large denuded areas because the glycol is absorbed, and the cream and the paraffin-based ointment exist to work around that.',
          dependsOnStepId: 'mup-w1',
          reagentsAndBuffer:
            'Solvent extraction from fermentation broth, polyethylene glycol 400 and 3350 base or white soft paraffin, benzyl alcohol as preservative in the cream, mild heating with controlled cooling',
        },
        {
          id: 'mup-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation and ester hydrolysis stability profiling',
          description:
            'Purify and then measure how fast the ester linking the monic acid head to the nonanoic acid tail hydrolyses. That hydrolysis yields monic acid, which is inactive, and it happens within minutes in plasma. The instability is the reason there is no systemic mupirocin and never will be.',
          dependsOnStepId: 'mup-w2',
          reagentsAndBuffer:
            'Crystallisation as the free acid or calcium salt, HPLC assay of mupirocin and monic acid, human plasma incubation at 37C for half-life determination, accelerated stability at 40C and 75% relative humidity',
        },
        {
          id: 'mup-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Retention in the anterior nares and on wound surfaces',
          description:
            'Measure how long the drug persists where it is applied. Nasal decolonisation depends entirely on maintaining concentration in the anterior nares against mucociliary clearance, and a formulation that is cleared quickly fails for reasons that have nothing to do with susceptibility.',
          dependsOnStepId: 'mup-w3',
          reagentsAndBuffer:
            'Anterior nares swab recovery at timed intervals, ex vivo skin and wound-model surfaces, LC-MS/MS quantification of mupirocin and monic acid, plasma sampling to confirm absence of systemic exposure',
        },
        {
          id: 'mup-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Minimum inhibitory concentration with low- and high-level resistance breakpoints',
          description:
            'Determine the minimum inhibitory concentration against Staphylococcus aureus isolates, then apply both resistance breakpoints separately and screen for the mupA determinant. Low-level and high-level resistance have different mechanisms and different clinical meanings, and a single susceptible-or-resistant call collapses a distinction that decides whether decolonisation will work.',
          dependsOnStepId: 'mup-w4',
          reagentsAndBuffer:
            'Staphylococcus aureus clinical isolates including MRSA, CLSI broth microdilution and mupirocin-containing agar screens at both breakpoints, PCR for the plasmid-borne mupA (ileS-2) determinant and sequencing of native ileS',
        },
      ],
    },
    keyAudits: [
      {
        id: 'mup-a1',
        category: 'failed',
        title: 'The 4,030-patient prophylaxis trial missed its primary endpoint',
        laymanSummary:
          'The largest randomised trial of nasal mupirocin before surgery found no difference in surgical wound infections: 2.3 per cent on the drug and 2.4 per cent on placebo. The result the trial is remembered for came from a subgroup analysis.',
        technicalDetails:
          'Perl and colleagues randomised 4,030 patients undergoing general, gynaecologic, neurologic or cardiothoracic surgery to intranasal mupirocin or placebo, with 3,864 in the intention-to-treat analysis. Overall, 2.3% of mupirocin recipients and 2.4% of placebo recipients had Staphylococcus aureus infections at surgical sites — the primary endpoint, not met. Among the 891 patients (23.1% of completers) who carried S. aureus in the anterior nares, 4.0% of mupirocin recipients had nosocomial S. aureus infections against 7.7% on placebo (odds ratio 0.49, 95% CI 0.25 to 0.92, P=0.02). The authors state the conclusion precisely: prophylactic intranasal mupirocin did not significantly reduce surgical-site S. aureus infections overall, but did significantly decrease all nosocomial S. aureus infections among carriers. Note that the subgroup result is also on a different endpoint from the primary one.',
        evidenceSource: 'Perl TM et al., N Engl J Med 2002;346:1871-1877 (PMID 12063371)',
        doi: '10.1056/NEJMoa003069',
        measuredMetric:
          'Staphylococcus aureus surgical-site infection, 2.3% against 2.4% in 3,864 patients',
        auditFlag: 'contested',
      },
      {
        id: 'mup-a2',
        category: 'measured',
        title: 'Screening first, then treating only carriers, cut infections by more than half',
        laymanSummary:
          'A later trial screened everyone on admission with a rapid genetic test and treated only the carriers. Infections fell from 7.7 per cent to 3.4 per cent, and deep wound infections by nearly eighty per cent. Deaths did not change.',
        technicalDetails:
          'Bode and colleagues screened 6,771 patients on admission with a real-time PCR assay; 1,270 swabs from 1,251 patients were positive and 917 entered the intention-to-treat analysis, of whom 88.1% underwent surgery. Treatment was mupirocin nasal ointment plus chlorhexidine soap against placebo. Staphylococcus aureus infection occurred in 3.4% (17 of 504) against 7.7% (32 of 413), relative risk 0.42 (95% CI 0.23 to 0.75). The effect was most pronounced for deep surgical-site infections, relative risk 0.21 (95% CI 0.07 to 0.62). Time to onset of nosocomial infection was shorter in the placebo group (P=0.005). There was no significant difference in all-cause in-hospital mortality. Registered as ISRCTN56186788.',
        evidenceSource: 'Bode LG et al., N Engl J Med 2010;362:9-17 (PMID 20054045)',
        doi: '10.1056/NEJMoa0808939',
        measuredMetric:
          'Hospital-associated Staphylococcus aureus infection in screened carriers, 3.4% against 7.7%',
        auditFlag: 'verified',
      },
      {
        id: 'mup-a3',
        category: 'inferred',
        title: 'Every organism in that trial was susceptible, and the paper says so',
        laymanSummary:
          'The trial that made decolonisation standard practice was run where no strain in it was resistant to either methicillin or mupirocin. That is stated in the results, and it is exactly the condition that no longer holds in much of the world.',
        technicalDetails:
          'The Bode trial reports: "All the S. aureus strains identified on PCR assay were susceptible to methicillin and mupirocin." The trial was conducted in Dutch hospitals between October 2005 and June 2007, in a country with an aggressive search-and-destroy MRSA policy and correspondingly low prevalence. Transporting a relative risk of 0.42 into a setting where a pooled 13.8% of MRSA isolates are mupirocin-resistant and 8.1% carry high-level resistance requires assuming the intervention works the same way when a meaningful fraction of target organisms cannot be eradicated by it. The trial also found no difference in all-cause in-hospital mortality, so the demonstrated benefit is on infection counts rather than on survival.',
        evidenceSource:
          'Bode LG et al., N Engl J Med 2010;362:9-17 (PMID 20054045); Dadashi M et al., J Glob Antimicrob Resist 2020;20:238-247 (PMID 31442624)',
        doi: '10.1056/NEJMoa0808939',
        inferredClaim:
          'That a decolonisation result obtained where every strain was mupirocin-susceptible transfers to settings where a substantial minority are not — the condition is stated in the trial’s own results and is not met globally',
        auditFlag: 'caution',
      },
      {
        id: 'mup-a4',
        category: 'measured',
        title: 'Impetigo: better than placebo, level with fusidic acid, barely ahead of a tablet',
        laymanSummary:
          'Across 68 trials in more than five thousand people, topical antibiotics roughly doubled the cure rate against placebo. Mupirocin and fusidic acid could not be told apart. Against an oral antibiotic mupirocin came out ahead by seven per cent relative, an interval that only just clears no difference.',
        technicalDetails:
          'The 2012 Cochrane review of interventions for impetigo included 68 trials with 5,578 participants reporting on 50 different treatments. Topical antibiotic treatment beat placebo (pooled RR 2.24, 95% CI 1.61 to 3.13; 6 studies, 575 participants). Mupirocin and fusidic acid were indistinguishable (RR 1.03, 95% CI 0.95 to 1.11; 4 studies, 440 participants). Topical mupirocin was slightly superior to oral erythromycin (pooled RR 1.07, 95% CI 1.01 to 1.13; 10 studies, 581 participants), with no significant differences against other oral antibiotics. Topical antibiotics beat disinfecting treatments (RR 1.15, 95% CI 1.01 to 1.32; 2 studies, 292 participants). Reported side effects were low and mostly mild, and more common with oral than topical treatment, the difference driven mainly by gastrointestinal effects. Most studies did not provide enough information to assess risk of bias, and only 15 reported blinding of participants and outcome assessors.',
        evidenceSource:
          'Koning S et al., Cochrane Database Syst Rev 2012;1:CD003261 (PMID 22258953)',
        doi: '10.1002/14651858.CD003261.pub3',
        measuredMetric:
          'Pooled cure rate ratios for topical antibiotic against placebo, against fusidic acid and against oral erythromycin',
        auditFlag: 'verified',
      },
      {
        id: 'mup-a5',
        category: 'conclusion_shift',
        title: 'Resistance is now measurable and rising, including the high-level kind',
        laymanSummary:
          'The drug that hospitals rely on to clear staph from noses is losing ground. Pooling studies from 2000 to 2018, about one staph isolate in thirteen was mupirocin-resistant, rising to about one MRSA isolate in seven.',
        technicalDetails:
          'A meta-analysis of studies published between 2000 and 2018 found pooled prevalences of mupirocin-resistant Staphylococcus aureus at 7.6% (95% CI 6.2 to 9.0) from 30 studies, mupirocin-resistant MRSA at 13.8% (95% CI 12.0 to 15.6) from 63 studies, high-level mupirocin-resistant S. aureus at 8.5% (95% CI 6.3 to 10.7) from 27 studies and high-level mupirocin-resistant MRSA at 8.1% (95% CI 6.8 to 9.4) from 60 studies. The authors report a global increase in high-level resistance over time, with a significant increase specifically in mupirocin-resistant MRSA. High-level resistance is conferred by mupA, a plasmid-borne second copy of the isoleucyl-tRNA synthetase gene (ileS-2) whose product the drug does not bind; low-level resistance arises from point mutations in the native enzyme. Because they are transmissible and non-transmissible respectively, the distinction matters more than the numbers do.',
        evidenceSource:
          'Dadashi M et al., J Glob Antimicrob Resist 2020;20:238-247 (PMID 31442624)',
        doi: '10.1016/j.jgar.2019.07.032',
        inferredClaim:
          'That mupirocin remains uniformly effective for decolonisation — pooled resistance is 7.6% overall and 13.8% among MRSA, with high-level plasmid-borne resistance rising over time',
        auditFlag: 'contested',
      },
      {
        id: 'mup-a6',
        category: 'inferred',
        title: 'Reducing infection counts is not the same as saving lives',
        laymanSummary:
          'The trial that showed decolonisation works measured infections. It also measured deaths in hospital, and found no difference between the groups.',
        technicalDetails:
          'The Bode trial states that there was no significant difference in all-cause in-hospital mortality between the mupirocin-chlorhexidine group and placebo. The Perl trial did not demonstrate an effect on its primary infection endpoint at all. Neither trial was powered for mortality, and a reduction in deep surgical-site infection from a relative risk of 0.21 is a clinically meaningful outcome in its own right. But the step from fewer infections to fewer deaths is an inference here, not a measurement, and decolonisation programmes are frequently justified in the stronger terms.',
        evidenceSource:
          'Bode LG et al., N Engl J Med 2010;362:9-17 (PMID 20054045); Perl TM et al., N Engl J Med 2002;346:1871-1877',
        doi: '10.1056/NEJMoa0808939',
        inferredClaim:
          'That nasal decolonisation reduces deaths — the trial that established it measured in-hospital mortality and found no significant difference, and was not powered to',
        auditFlag: 'caution',
      },
      {
        id: 'mup-a7',
        category: 'measured',
        title: 'A target no other antibiotic uses, and a molecule blood destroys in minutes',
        laymanSummary:
          'Mupirocin blocks bacterial isoleucyl-tRNA synthetase, a target distinct from those of other antibiotic classes, so cross-resistance is uncommon. It is rapidly inactivated in blood, which confines its practical use to topical treatment.',
        technicalDetails:
          'Mupirocin is a structural analogue of isoleucyl-adenylate and reversibly inhibits bacterial isoleucyl-tRNA synthetase, competing with both isoleucine and ATP. No other clinically used antibiotic class targets an aminoacyl-tRNA synthetase in this way, so cross-resistance with other classes does not occur. The eukaryotic enzyme is not inhibited. The ester bond joining the monic acid moiety to 9-hydroxynonanoic acid is hydrolysed rapidly in plasma to inactive monic acid, which precludes systemic administration entirely — an unusual case where a molecule’s metabolic fragility is the reason its indication is confined to a surface.',
        evidenceSource:
          'Mupirocin Cream 2% United States prescribing information, Indications and Usage and Microbiology sections, as held on the record',
        measuredMetric:
          'Mechanism of action and route restriction as stated in the approved label and reflected in the absence of any systemic formulation',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Applied to skin or to the front of the nose',
        laymanDesc:
          'The ointment goes where the bacteria are — on the crusted skin of impetigo, or just inside the nostril where staph lives quietly in about a quarter of people.',
        molecularDetail:
          'The anterior nares are the principal reservoir of Staphylococcus aureus and the source of most endogenous surgical site infections: 23.1% of completers in the Perl trial carried it. Nasal decolonisation depends on maintaining local concentration against mucociliary clearance rather than on systemic exposure, of which there is none.',
        iconName: 'Droplet',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It impersonates a fleeting intermediate',
        laymanDesc:
          'To build a protein, a bacterium first joins each amino acid to the cell’s energy currency for a fraction of a second. Mupirocin is shaped like that fleeting pairing, made permanent.',
        molecularDetail:
          'Mupirocin is a structural mimic of isoleucyl-adenylate, the transient enzyme-bound intermediate formed from isoleucine and ATP. It competes with both substrates for the active site of bacterial isoleucyl-tRNA synthetase and binds reversibly with high affinity.',
        iconName: 'Copy',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The enzyme is jammed and isoleucine is never loaded',
        laymanDesc:
          'With the enzyme occupied, no isoleucine gets attached to its carrier. Every protein that needs isoleucine — which is nearly all of them — stalls.',
        molecularDetail:
          'Inhibition of isoleucyl-tRNA synthetase depletes charged tRNA-Ile, halting translation and triggering the stringent response. No other clinically used antibiotic class inhibits an aminoacyl-tRNA synthetase this way, so cross-resistance with other classes does not arise.',
        iconName: 'Ban',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Human cells are untouched, and so is the bloodstream',
        laymanDesc:
          'The human version of the same enzyme is built differently and ignores the drug. And blood destroys the molecule within minutes, so it cannot be given any other way than on a surface.',
        molecularDetail:
          'The eukaryotic isoleucyl-tRNA synthetase active site differs and is not inhibited. The ester linking monic acid to 9-hydroxynonanoic acid is rapidly hydrolysed in plasma to inactive monic acid, which is why no systemic formulation exists or can exist.',
        iconName: 'ShieldCheck',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The infection clears, or the carriage does',
        laymanDesc:
          'On skin, cure rates roughly double compared with placebo. In the nose, treating screened carriers cut hospital staph infections from about eight per cent to about three.',
        molecularDetail:
          'Impetigo: topical antibiotic against placebo RR 2.24 (95% CI 1.61 to 3.13). Decolonisation of screened carriers: S. aureus infection 3.4% against 7.7%, RR 0.42 (95% CI 0.23 to 0.75), with deep surgical-site infection RR 0.21 (95% CI 0.07 to 0.62).',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What the endpoint does not measure',
        laymanDesc:
          'The decolonisation trial counted infections, not deaths, and found no difference in deaths. And every organism in it was susceptible to the drug, which is no longer true everywhere.',
        molecularDetail:
          'No significant difference in all-cause in-hospital mortality in the Bode trial. All strains identified in that trial were susceptible to methicillin and mupirocin. Pooled resistance now stands at 7.6% for S. aureus overall, 13.8% among MRSA and 8.5% for high-level resistance, which is plasmid-borne and transmissible.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Perl 2002 intranasal mupirocin surgical prophylaxis trial (PMID 12063371)',
        phase: 'Randomised, double-blind, placebo-controlled',
        sampleSize: 3864,
        primaryEndpoint:
          'Staphylococcus aureus infection at the surgical site, intranasal mupirocin against placebo',
        endpointMet: false,
        statisticalPValue:
          '2.3% on mupirocin against 2.4% on placebo — no significant reduction. In the 891-patient carrier subgroup, nosocomial S. aureus infection 4.0% against 7.7%, odds ratio 0.49 (95% CI 0.25 to 0.92), P=0.02',
        unreportedAdverseSignals:
          'The result this trial is cited for is a subgroup, and on a different endpoint from the primary one — all nosocomial S. aureus infections rather than surgical-site infections. Both facts are stated in the paper and routinely lost in citation.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Bode 2010 screen-and-decolonise trial (ISRCTN56186788)',
        phase: 'Randomised, double-blind, placebo-controlled, multicentre',
        sampleSize: 917,
        primaryEndpoint:
          'Hospital-associated Staphylococcus aureus infection in PCR-identified nasal carriers treated with mupirocin nasal ointment plus chlorhexidine soap',
        endpointMet: true,
        statisticalPValue:
          '3.4% (17/504) against 7.7% (32/413), relative risk 0.42 (95% CI 0.23 to 0.75); deep surgical-site infection relative risk 0.21 (95% CI 0.07 to 0.62); time to onset shorter on placebo, P=0.005',
        unreportedAdverseSignals:
          'All S. aureus strains identified in the trial were susceptible to both methicillin and mupirocin, which is stated in the results and constrains generalisability. There was no significant difference in all-cause in-hospital mortality. The intervention was two drugs, so the mupirocin contribution alone is not separable.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Cochrane interventions for impetigo (CD003261)',
        phase: 'Systematic review and meta-analysis of 68 randomised controlled trials',
        sampleSize: 5578,
        primaryEndpoint: 'Cure rate, topical antibiotic against placebo and against comparators',
        endpointMet: true,
        statisticalPValue:
          'Topical antibiotic against placebo RR 2.24 (95% CI 1.61 to 3.13); mupirocin against fusidic acid RR 1.03 (95% CI 0.95 to 1.11); mupirocin against oral erythromycin RR 1.07 (95% CI 1.01 to 1.13)',
        unreportedAdverseSignals:
          'Most studies did not provide enough information to assess risk of bias and only 15 reported blinding. Three review authors were authors of an included trial and two disclosed manufacturer funding for a retapamulin study added in the update.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Dadashi 2020 mupirocin resistance meta-analysis (PMID 31442624)',
        phase: 'Systematic review and meta-analysis of prevalence studies, 2000 to 2018',
        sampleSize: 63,
        primaryEndpoint:
          'Pooled worldwide prevalence of mupirocin-resistant and high-level mupirocin-resistant Staphylococcus aureus and MRSA',
        endpointMet: true,
        statisticalPValue:
          'MuRSA 7.6% (95% CI 6.2 to 9.0); MuRMRSA 13.8% (95% CI 12.0 to 15.6); HLMuRSA 8.5% (95% CI 6.3 to 10.7); HLMuRMRSA 8.1% (95% CI 6.8 to 9.4)',
        unreportedAdverseSignals:
          'Sample size counts included studies rather than isolates. Prevalence surveys are geographically uneven and reflect where surveillance is done rather than where resistance is.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Staphylococcus aureus surgical-site infection 2.3% on intranasal mupirocin against 2.4% on placebo in 3,864 randomised patients — primary endpoint not met',
        'Among 891 nasal carriers in that trial, nosocomial S. aureus infection 4.0% against 7.7%, odds ratio 0.49 (95% CI 0.25 to 0.92)',
        'In screened carriers given mupirocin plus chlorhexidine, S. aureus infection 3.4% against 7.7%, relative risk 0.42 (95% CI 0.23 to 0.75)',
        'Deep surgical-site infection relative risk 0.21 (95% CI 0.07 to 0.62) in the same trial',
        'Impetigo: topical antibiotic against placebo RR 2.24 (95% CI 1.61 to 3.13); mupirocin against fusidic acid RR 1.03 (95% CI 0.95 to 1.11)',
        'Pooled mupirocin resistance 7.6% in S. aureus, 13.8% in MRSA, with high-level resistance at 8.5% and rising',
      ],
      unsupportedInferences: [
        'That the 2002 trial demonstrated mupirocin prevents surgical-site infection — its primary endpoint was 2.3% against 2.4%',
        'That a decolonisation result obtained where every strain was susceptible transfers to settings where 13.8% of MRSA is resistant',
        'That decolonisation reduces mortality, when the trial that established it found no difference in in-hospital deaths',
        'That the benefit shown by mupirocin plus chlorhexidine belongs to mupirocin, when the two were given together and never separately',
      ],
      whatFailedInitially: [
        'The largest randomised prophylaxis trial missed its primary endpoint outright and is cited for a subgroup on a different endpoint',
        'All-cause in-hospital mortality did not differ in the trial that established screen-and-decolonise',
        'Against oral erythromycin the advantage was RR 1.07 with a lower bound of 1.01 — statistically present, clinically slight',
        'High-level, plasmid-borne mupirocin resistance is rising globally in the organism the drug exists to eradicate',
      ],
      realWorldOutcome: [
        'Approved in 1987 and now the backbone of hospital decolonisation programmes worldwide',
        'Twenty listed products at a median United States acquisition cost of US$0.8388 per gram, the second highest per gram in this batch',
        'Equal to fusidic acid and at least equal to oral antibiotics for impetigo, with fewer side effects than the oral route',
        'Its unique target means no cross-resistance with any other antibiotic class, and its plasmid-borne resistance determinant is transmissible',
      ],
    },
    deliverySystem: {
      type: 'Topical ointment 2%, cream 2%, and a separate nasal ointment',
      description:
        'Topical only, and necessarily so: the ester bond in the molecule is hydrolysed to inactive monic acid within minutes in plasma, which rules out any systemic formulation. The original ointment used a polyethylene glycol base that is unsuitable for extensive denuded skin because the glycol is absorbed; the cream and paraffin-based ointment exist for that reason. The nasal preparation is formulated to persist in the anterior nares against mucociliary clearance.',
      safetyProfile:
        'Well tolerated. In the impetigo review, reported side effects were low and mostly mild, and were more common with oral than with topical treatment, the difference driven mainly by gastrointestinal effects. Local burning, stinging and itching are the usual complaints. Systemic exposure is negligible because the molecule is destroyed in plasma. The cream’s indication is bounded by lesion size — up to 10 cm in length or 100 cm2 in area — because that is the population it was tested in, and the polyethylene glycol vehicle of the original ointment is a specific caution on large open areas.',
    },
    commonQuestions: [
      {
        q: 'Does putting mupirocin in the nose before surgery prevent wound infections?',
        a: 'The two big trials give different answers and both are worth knowing. In 2002, 3,864 surgical patients were randomised to intranasal mupirocin or placebo. Staphylococcus aureus surgical-site infection occurred in 2.3% and 2.4% — no difference, primary endpoint not met. Within that trial, the 891 patients who actually carried staph in their nose did better on mupirocin: 4.0% against 7.7% for all nosocomial staph infections, odds ratio 0.49. That is a subgroup, on a different endpoint. In 2010 a second trial did what the first result implied: screened everyone on admission, treated only the carriers, and added a chlorhexidine wash. Infections fell from 7.7% to 3.4%, and deep wound infections by nearly 80%. So the strategy that works is screen-then-treat, not treat-everybody.',
        auditNote:
          'The 2010 trial gave two interventions together. How much of the effect belongs to mupirocin and how much to the chlorhexidine soap is not separable from that design.',
      },
      {
        q: 'Does it save lives?',
        a: 'Not shown. The trial that established screen-and-decolonise reported all-cause in-hospital mortality and found no significant difference between the groups. It was not powered to detect one, and a reduction in deep surgical-site infection with a relative risk of 0.21 is a serious clinical benefit whether or not it moves mortality. But decolonisation programmes are often justified in terms of lives saved, and the step from fewer infections to fewer deaths is an inference in this evidence base rather than a measurement.',
      },
      {
        q: 'Is mupirocin better than the alternatives for impetigo?',
        a: 'It is equal to fusidic acid and about equal to tablets. Pooling 68 trials in 5,578 people, topical antibiotics beat placebo with a risk ratio of 2.24. Mupirocin against fusidic acid was 1.03 with an interval from 0.95 to 1.11 — indistinguishable. Against oral erythromycin, mupirocin came out ahead at 1.07 with a lower bound of 1.01, which is a real but slight advantage, and there were no significant differences against other oral antibiotics. What did differ was side effects: more common with tablets, mostly gastrointestinal. The reviewers also note a lack of studies in extensive impetigo, so whether oral treatment is better in that situation is genuinely unknown.',
      },
      {
        q: 'Are bacteria becoming resistant to it?',
        a: 'Yes, and the shape of the resistance matters more than the rate. Pooling studies from 2000 to 2018, 7.6% of Staphylococcus aureus isolates were mupirocin-resistant, rising to 13.8% among MRSA. High-level resistance — the kind that makes decolonisation fail rather than just work less well — was 8.5% overall, and the authors report it rising over time. Low-level resistance comes from a mutation in the bacterium’s own enzyme. High-level resistance comes from mupA, an entire second copy of the gene carried on a plasmid, which the drug cannot bind and which can be passed between bacteria. That transmissibility is why the 8.5% figure is the one to watch.',
        auditNote:
          'Worth reading alongside the 2010 trial, which states in its results that every strain it identified was susceptible to both methicillin and mupirocin.',
      },
      {
        q: 'Why is there no mupirocin tablet or injection?',
        a: 'Because blood destroys it. The molecule is a long-chain fatty acid ester joined to the active head group, and that ester is hydrolysed within minutes in plasma to monic acid, which has no antibacterial activity. There is no formulation trick that fixes this — it is a property of the molecule. The consolation is a genuinely unusual target: mupirocin blocks the enzyme that loads isoleucine onto its transfer RNA, and no other antibiotic class in clinical use works that way. A bacterium resistant to everything else is usually still sensitive to it, which is exactly why the rising resistance figures are worth taking seriously.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Perl TM et al. Intranasal mupirocin to prevent postoperative Staphylococcus aureus infections. N Engl J Med 2002;346:1871-1877',
        identifier: '10.1056/NEJMoa003069',
        kind: 'doi',
      },
      {
        label:
          'Bode LG et al. Preventing surgical-site infections in nasal carriers of Staphylococcus aureus. N Engl J Med 2010;362:9-17',
        identifier: '10.1056/NEJMoa0808939',
        kind: 'doi',
      },
      {
        label:
          'Koning S et al. Interventions for impetigo. Cochrane Database Syst Rev 2012;1:CD003261',
        identifier: '10.1002/14651858.CD003261.pub3',
        kind: 'doi',
      },
      {
        label:
          'Dadashi M et al. Mupirocin resistance in Staphylococcus aureus: a systematic review and meta-analysis. J Glob Antimicrob Resist 2020;20:238-247',
        identifier: '10.1016/j.jgar.2019.07.032',
        kind: 'doi',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
]
