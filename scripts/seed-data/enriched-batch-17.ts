import type { SeedDossier } from '@/lib/seed-types'

/**
 * Curated flagship dossiers — the eye drugs: the topical agents that lower intraocular pressure in
 * glaucoma, the intravitreal VEGF inhibitors that hold back neovascular retinal disease, and the
 * one topical immunosuppressant approved for dry eye.
 *
 * Editorial layer written over the machine-enriched records: the verdict, the mechanism carousel
 * and the audits, which no pipeline can produce. The identity facts — slug, trade name, sponsor,
 * approval year, SMILES, CMS acquisition cost — are copied from the enriched record rather than
 * researched again.
 *
 * Every DOI, PMID, NCT number and regulatory URL below was resolved against the NCBI E-utilities,
 * the Crossref API or the ClinicalTrials.gov v2 API at the time of writing. Sample sizes, effect
 * sizes, confidence intervals and p-values are copied from the published abstract or from the FDA
 * label, never from memory. Where a number could not be sourced, the field is absent.
 *
 * Five conventions apply to the whole group.
 *
 * 1. INTRAOCULAR PRESSURE IS A SURROGATE AND EVERY GLAUCOMA PAGE SAYS SO. Millimetres of mercury
 *    are not sight. Three randomised trials tie pressure lowering to a functional outcome — the
 *    Ocular Hypertension Treatment Study (conversion to glaucoma), the Early Manifest Glaucoma
 *    Trial (progression) and the United Kingdom Glaucoma Treatment Study (visual field
 *    preservation) — and all three measured perimetry and optic disc photographs, not blindness.
 *    No individual drug on these pages has been shown in a randomised trial to prevent blindness.
 *
 * 2. THE CLASS COMPARISON COMES FROM ONE NETWORK META-ANALYSIS, AND IT IS QUOTED THE SAME WAY ON
 *    EVERY PAGE. Li and colleagues pooled 114 randomised trials in 20,275 participants and ranked
 *    the first-line drops by millimetres of mercury lowered at three months. That single table is
 *    the honest cross-page comparator, and it puts the carbonic anhydrase inhibitors at roughly
 *    half the effect of the prostaglandin analogues.
 *
 * 3. NO COST-OF-PRODUCTION FIGURE EXISTS FOR ANY OF THESE. The published retrosynthesis literature
 *    that produced manufacturing floors for oral antivirals covers solid oral dosage forms only —
 *    Hill, Barber and Gotham state the exclusion in their methods. Every `synthesisCostPerDose`
 *    here is therefore empty, and the CMS acquisition cost sits alone in the price field.
 *
 * 4. THE VEGF PAGES CARRY THE BEVACIZUMAB COMPARISON. Two publicly funded randomised trials, CATT
 *    and IVAN, compared the licensed intravitreal drugs against an off-label oncology antibody
 *    costing a fraction as much and found equivalent vision outcomes. That result is on the page
 *    rather than in a footnote, because it is the single most consequential finding in the field.
 *
 * 5. NO DOSING, INSTILLATION, INJECTION-INTERVAL OR PROCUREMENT GUIDANCE. Concentrations and
 *    schedules appear only where they are part of a trial's description or a label's identity.
 *    Nothing here tells a reader what to use, how often, or where to obtain it.
 */

export const ENRICHED_BATCH_17_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // 1. Latanoprost — the first prostaglandin analogue, and the only glaucoma drop with a
  //    placebo-controlled randomised trial showing that it preserves the visual field.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'latanoprost',
    name: 'Latanoprost',
    tradeName: 'Xalatan',
    sponsor: 'Upjohn (a Pfizer division) — originally developed by Pharmacia',
    targetGene: 'PTGFR — the human prostaglandin F2-alpha receptor gene',
    targetProtein: 'FP prostanoid receptor on ciliary muscle and trabecular meshwork cells',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1996,
    indication:
      'Reduction of elevated intraocular pressure in patients with open-angle glaucoma or ocular hypertension',
    patientFriendlyIndication: 'High pressure inside the eye, and the nerve damage it causes',
    anatomicalSite:
      'Ciliary muscle and the uveoscleral outflow pathway at the front of the eye, reached through the cornea',
    conditionContext: {
      conditionExplainer:
        'The eye makes fluid continuously and drains it continuously. When drainage falls behind, pressure rises, and sustained pressure damages the optic nerve where it leaves the eye. The damage shows up first as blind patches in peripheral vision that the brain fills in, so it is usually invisible to the person until a great deal of nerve has already gone.',
      whyItMatters:
        'Nerve fibres lost to glaucoma do not come back. Pressure is the only risk factor anyone has learned to change, which is why every approved treatment in this disease works on pressure and none of them works on the nerve.',
      whoTakesThis:
        'Adults with open-angle glaucoma or with pressure high enough to put them at risk of it. It is a once-daily drop taken for the rest of a person’s life.',
      clinicalGoals:
        'A specified reduction in millimetres of mercury, and behind that, slower loss of visual field on repeated perimetry. Pressure is the number that gets measured at every visit. Field loss is the thing that matters, and it is measured far less often.',
    },
    oneSentenceVerdict:
      'A prostaglandin F2-alpha analogue that switches on the FP receptor in the ciliary muscle and opens the eye’s secondary drainage route, lowering pressure by 4.85 mmHg at three months across 114 pooled randomised trials, and the only glaucoma drop tested against placebo for vision itself — in the 516-patient UKGTS it delayed visual field deterioration with a hazard ratio of 0.44 while permanently darkening some patients’ irises.',
    laymanHowItWorks:
      'Fluid inside the eye normally leaves through a mesh drain near the edge of the iris. Latanoprost works on a second, slower route out through the muscle behind that drain. It switches on a receptor there, which makes the cells dismantle some of the connective tissue packing the spaces between the muscle bundles. The gaps widen, fluid leaves faster, and pressure falls.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 87,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$1.57 per millilitre, median across the 13 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'The Xalatan patents expired in 2011 and generic latanoprost is now among the cheapest drugs in ophthalmology. Two branded reformulations remain on patent for reasons unrelated to the molecule: Xelpros, an oil-in-water emulsion without benzalkonium chloride, and Iyuzeh, a preservative-free solution approved in December 2022. Both exist because the preservative in the original formulation damages the ocular surface over years of daily use, not because latanoprost itself was improved.',
      synthesisComplexity: 'Moderate',
      costSource: {
        label:
          'Nearest published cost-of-production analysis: Hill AM, Barber MJ, Gotham D. Estimated costs of production and potential prices for the WHO Essential Medicines List. BMJ Glob Health 2018;3:e000571. Its methods restrict the analysis to solid oral formulations and exclude eye drops, which is why the synthesis cost field on this page is empty.',
        identifier: '10.1136/bmjgh-2017-000571',
        kind: 'doi',
      },
      priceSource: {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey, generic listing effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    },
    substitutes: {
      summary:
        'Every alternative to latanoprost is either another drop or a laser. The pooled ranking of first-line drops is public and small: bimatoprost lowers pressure most, latanoprost and travoprost are statistically indistinguishable behind it, and the beta-blockers and carbonic anhydrase inhibitors are meaningfully weaker. The genuinely different option is selective laser trabeculoplasty, which the LiGHT trial tested head-to-head against drops as first-line treatment. No food or supplement lowers intraocular pressure to a degree that has been shown to preserve vision.',
      conventionalRx: [
        {
          name: 'Bimatoprost (Lumigan)',
          class: 'Prostamide / prostaglandin analogue',
          howItCompares:
            'The most effective single drop in the pooled analysis, at 5.61 mmHg (95% credible interval 4.94 to 6.29) against latanoprost’s 4.85 (4.24 to 5.46). The difference is under a millimetre and the authors say directly that within-class differences may not be clinically meaningful.',
          typicalCost:
            'US$8.87 per millilitre, median across the 31 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: the largest pressure reduction of any single agent. Cons: more conjunctival redness and more eyelash growth than latanoprost, and the same permanent iris darkening.',
        },
        {
          name: 'Timolol (Timoptic)',
          class: 'Non-selective beta-adrenergic antagonist',
          howItCompares:
            'Lowers pressure 3.70 mmHg (3.16 to 4.24) in the pooled analysis against latanoprost’s 4.85. In the head-to-head US trial of 268 patients, latanoprost achieved a 6.7 mmHg diurnal reduction against timolol’s 4.9 (p<0.001).',
          typicalCost:
            'US$1.06 per millilitre, median across the 65 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: no iris pigmentation, no eyelash change, decades of use. Cons: weaker, taken twice daily rather than once, and the only drop on this list with a recorded death count from systemic absorption.',
        },
        {
          name: 'Selective laser trabeculoplasty',
          class: 'Laser procedure, not a drug',
          howItCompares:
            'The LiGHT trial randomised 718 patients with untreated open-angle glaucoma or ocular hypertension to laser first or drops first. At three years, 74.2% of the laser group needed no drops at all, and the laser arm had more eyes within target pressure with no glaucoma surgery required.',
          typicalCost:
            'Not a product listed in the CMS National Average Drug Acquisition Cost survey — it is a procedure, billed and costed separately',
          prosAndCons:
            'Pros: removes the daily-drop problem entirely for most patients, no ocular surface toxicity, no iris change. Cons: the effect wanes and repeat treatment is often needed, and it is a procedure with its own small risks.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask to be photographed before you start if your eyes are two different colours',
          action:
            'Request a baseline iris photograph, particularly if one eye is being treated and the other is not, or if your irises are mixed-colour.',
          patientImpact:
            'Latanoprost increases brown pigment in the iris, and the change is permanent. It was documented photographically in the original six-month US trial, in a patient whose concentric heterochromia became a uniform darker colour. Mixed-colour irises change most, and a single treated eye can end up visibly different from the other.',
          clinicalPrecaution:
            'The pigment change is cosmetic rather than dangerous on current evidence, but it does not reverse when the drug is stopped, which makes a baseline photograph the only way to know afterwards what changed.',
        },
        {
          name: 'Report a sunken or hollow look around the treated eye',
          action:
            'Mention deepening of the upper eyelid crease, loss of fat around the eye, or a lid that appears to droop, particularly if only one eye is treated.',
          patientImpact:
            'Prostaglandin-associated periorbitopathy was described years after these drugs were approved, not during their registration trials. Case series document deepening of the upper eyelid sulcus that partially recovers when the drug is switched or stopped.',
          clinicalPrecaution:
            'The mechanism traced experimentally is FP receptor activation inhibiting fat cell formation in the orbit, which is the same receptor the drug is designed to hit. It is an on-target effect in the wrong tissue, not a contaminant.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CC(C)OC(=O)CCC/C=C\\C[C@H]1[C@H](C[C@H]([C@@H]1CC[C@H](CCC2=CC=CC=C2)O)O)O',
      chemicalFormula: 'C26H40O5',
      molecularWeight: '432.60 g/mol',
      targetReceptorAffinity:
        'Latanoprost as supplied is an isopropyl ester prodrug and is essentially inactive at the receptor. Corneal esterases hydrolyse it to latanoprost free acid, a selective agonist at the FP prostanoid receptor. The 13,14-dihydro-17-phenyl-18,19,20-trinor modification of the prostaglandin F2-alpha skeleton is what buys the selectivity: it reduces activity at the other prostanoid receptors that would otherwise produce inflammation and pain.',
      structureSource: {
        label: 'PubChem CID 5311221 (latanoprost) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5311221',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'lat-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Stereochemical identity of the five-centre prostaglandin core',
          description:
            'Confirm configuration at every stereocentre on the cyclopentane ring and the omega chain before formulation. Prostaglandin analogues are stereochemically dense and the epimers are not weaker drugs but different pharmacology, including agonism at receptors this molecule was designed to avoid.',
          reagentsAndBuffer:
            'Latanoprost reference standard, chiral HPLC with polysaccharide stationary phase, 1H and 13C NMR in deuterochloroform, optical rotation',
        },
        {
          id: 'lat-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Esterification of the free acid to the isopropyl ester prodrug',
          description:
            'Convert latanoprost acid to its isopropyl ester. This is the step that makes the molecule lipophilic enough to cross the cornea. The free acid, which is the active species, penetrates the cornea poorly, so the ester is not a convenience but the delivery mechanism.',
          dependsOnStepId: 'lat-w1',
          reagentsAndBuffer:
            'Isopropyl halide or isopropanol with a coupling agent, mild base, anhydrous aprotic solvent, nitrogen atmosphere, low temperature to protect the allylic alcohols',
        },
        {
          id: 'lat-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Chromatographic removal of the 15-keto and 5,6-trans impurities',
          description:
            'Separate the oxidised 15-keto degradant and the 5,6-trans isomer, both of which form on storage and light exposure. Latanoprost is unstable enough that the finished product carries refrigeration instructions until it is opened, and the impurity profile is the reason.',
          dependsOnStepId: 'lat-w2',
          reagentsAndBuffer:
            'Silica or preparative reversed-phase chromatography, ethyl acetate and heptane gradient, amber glassware, stability-indicating HPLC method',
        },
        {
          id: 'lat-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Corneal esterase hydrolysis in an ex vivo cornea model',
          description:
            'Mount excised cornea in a diffusion chamber and confirm that the ester is hydrolysed to free acid during passage, and that free acid appears in the receiver chamber. A permeation assay that measures only the parent ester reports the wrong molecule: the ester is a carrier and the acid is the drug.',
          dependsOnStepId: 'lat-w3',
          reagentsAndBuffer:
            'Excised rabbit or human donor cornea, Franz-type diffusion cell, glutathione-bicarbonate Ringer solution at 34 degrees Celsius, LC-MS/MS quantification of latanoprost and latanoprost free acid',
        },
        {
          id: 'lat-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'FP receptor functional assay with prostanoid counter-screen',
          description:
            'Measure agonist potency of the free acid at the recombinant FP receptor by calcium mobilisation, then run the same compound against EP1 to EP4, DP, IP and TP. The counter-screen is the point: selectivity across the prostanoid family is the property that separates a glaucoma drug from an inflammatory mediator.',
          dependsOnStepId: 'lat-w4',
          reagentsAndBuffer:
            'Cells expressing recombinant human prostanoid receptors, calcium-sensitive fluorescent dye, assay buffer with probenecid, prostaglandin F2-alpha as reference agonist',
        },
      ],
    },
    keyAudits: [
      {
        id: 'lat-a1',
        category: 'measured',
        title: 'UKGTS: the only glaucoma drop tested against placebo for vision itself',
        laymanSummary:
          'Five hundred and sixteen people with newly diagnosed glaucoma were given either latanoprost or an identical dummy drop, and neither they nor their doctors knew which. Vision was tracked for two years. Deterioration of the visual field came significantly later in the latanoprost group.',
        technicalDetails:
          'The United Kingdom Glaucoma Treatment Study was a randomised, triple-masked, placebo-controlled trial in 516 patients with newly diagnosed open-angle glaucoma at ten UK centres. Baseline mean intraocular pressure was 19.6 mmHg (SD 4.6) in 258 latanoprost patients and 20.1 (4.8) in 258 controls. At 24 months, mean reduction was 3.8 mmHg (4.0) in 231 assessed latanoprost patients against 0.9 mmHg (3.8) in 230 controls. The primary outcome was time to visual field deterioration within 24 months: adjusted hazard ratio 0.44 (95% CI 0.28 to 0.69, p=0.0003). Eighteen serious adverse events occurred, none attributed to the study drug. The Data and Safety Monitoring Committee stopped the trial early in January 2011 after an interim analysis and recommended changing the primary outcome from a difference in proportions progressing to time to deterioration.',
        evidenceSource:
          'Garway-Heath DF et al., Lancet 2015;385:1295-1304 (UKGTS, ISRCTN96423140)',
        doi: '10.1016/S0140-6736(14)62111-5',
        measuredMetric:
          'Time to visual field deterioration within 24 months, latanoprost against identical placebo drops',
        auditFlag: 'verified',
      },
      {
        id: 'lat-a2',
        category: 'measured',
        title: 'Second of fourteen first-line drops on pressure lowering, by under a millimetre',
        laymanSummary:
          'A pooled analysis of 114 trials ranked every first-line eye drop. Bimatoprost was top, latanoprost second, travoprost third. The gaps between the top three are smaller than the measurement error on a single pressure reading.',
        technicalDetails:
          'Li and colleagues performed a Bayesian network meta-analysis of 114 randomised controlled trials with data from 20,275 participants, comparing single topical agents against placebo or against each other. Mean reductions in intraocular pressure at 3 months, in mmHg with 95% credible intervals, ranked: bimatoprost 5.61 (4.94 to 6.29), latanoprost 4.85 (4.24 to 5.46), travoprost 4.83 (4.12 to 5.54), levobunolol 4.51 (3.85 to 5.24), tafluprost 4.37 (2.94 to 5.83), timolol 3.70 (3.16 to 4.24), brimonidine 3.59 (2.89 to 4.29), carteolol 3.44 (2.42 to 4.46), levobetaxolol 2.56 (1.52 to 3.62), apraclonidine 2.52 (0.94 to 4.11), dorzolamide 2.49 (1.85 to 3.13), brinzolamide 2.42 (1.62 to 3.23), betaxolol 2.24 (1.59 to 2.88), unoprostone 1.91 (1.15 to 2.67). The authors describe the overall risk of bias in the included trials as mixed and state that within-class differences were small and may not be clinically meaningful.',
        evidenceSource: 'Li T et al., Ophthalmology 2016;123:129-140',
        doi: '10.1016/j.ophtha.2015.09.005',
        measuredMetric:
          'Mean intraocular pressure reduction at 3 months, pooled across 114 randomised trials',
        auditFlag: 'verified',
      },
      {
        id: 'lat-a3',
        category: 'measured',
        title: 'Beat timolol by 1.8 mmHg in the registration trial, once daily against twice',
        laymanSummary:
          'In the American trial that supported approval, 268 patients took either latanoprost once a day or timolol twice a day for six months. Latanoprost lowered pressure more, and unlike timolol it did not slow the pulse.',
        technicalDetails:
          'The United States Latanoprost Study Group ran a multicentre, randomised, double-masked, parallel-group study in 268 patients with ocular hypertension or early primary open-angle glaucoma. Comparing six-month with baseline diurnal values, reduction with latanoprost 0.005% once daily was 6.7 mmHg (SD 3.4) against 4.9 mmHg (SD 2.9) with timolol 0.5% twice daily (p<0.001). Neither drug showed long-term drift over six months. Four timolol patients and no latanoprost patients were withdrawn for inadequate pressure control. Pulse rate fell significantly with timolol but not with latanoprost. Latanoprost eyes had slightly more conjunctival hyperemia and fewer subjective side effects.',
        evidenceSource: 'Camras CB et al., Ophthalmology 1996;103:138-147',
        doi: '10.1016/s0161-6420(96)30749-5',
        measuredMetric:
          'Diurnal intraocular pressure reduction at 6 months, latanoprost against timolol',
        auditFlag: 'verified',
      },
      {
        id: 'lat-a4',
        category: 'failed',
        title: 'The iris colour change is permanent, and it was found in the first trial',
        laymanSummary:
          'Latanoprost puts more brown pigment into the iris. It happened in the original six-month trial, it was photographed, and it does not go away when the drug is stopped. One treated eye can end up a different colour from the other.',
        technicalDetails:
          'In the 268-patient United States registration trial, both eyes of a patient with baseline concentric iris heterochromia showed a definite, photographically documented increase in pigmentation during latanoprost treatment, making the irides uniformly darker, with three further latanoprost patients recorded as suspects. Longer comparative work quantified the incidence: in the 12-month travoprost comparison, iris pigmentation change was seen in 10 of 194 latanoprost patients (5.2%), 10 of 201 on travoprost 0.0015% (5.0%), 6 of 196 on travoprost 0.004% (3.1%) and 0 of 196 on timolol. The mechanism is increased melanin content in iris stromal melanocytes rather than an increase in melanocyte number, and the change has not been shown to reverse.',
        evidenceSource:
          'Camras CB et al., Ophthalmology 1996;103:138-147; Netland PA et al., Am J Ophthalmol 2001;132:472-484',
        doi: '10.1016/s0002-9394(01)01177-1',
        measuredMetric: 'Photographically documented iris pigmentation change, by treatment arm',
        auditFlag: 'caution',
      },
      {
        id: 'lat-a5',
        category: 'failed',
        title: 'Periorbitopathy was described a decade after approval, not in the trials',
        laymanSummary:
          'Long-term users of this class can develop a hollow, sunken look around the treated eye. It was not identified in the registration programme. It was reported by clinicians afterwards, and it partly recovers when the drug is switched.',
        technicalDetails:
          'Prostaglandin-associated periorbitopathy — deepening of the upper eyelid sulcus, orbital fat atrophy, ptosis, periocular skin darkening — was characterised in case series and comparative reports after these drugs were in wide use. A Japanese series documented recovery from deepening of the upper eyelid sulcus after switching from bimatoprost to latanoprost, establishing both that the effect is real and that it differs in degree between agents in the class. Experimental work then traced the mechanism: activation of the prostanoid FP receptor inhibits adipogenesis, and the loss of orbital fat follows from the same receptor the drug is prescribed to activate. Unilateral treatment produces visible asymmetry, which is how it is usually noticed.',
        evidenceSource:
          'Sakata R et al., Jpn J Ophthalmol 2013;57:179-184; Taketani Y et al., Invest Ophthalmol Vis Sci 2014;55:1269-1276',
        doi: '10.1167/iovs.13-12589',
        measuredMetric:
          'Upper eyelid sulcus depth on switching agents, and FP-receptor-mediated inhibition of adipogenesis in vitro',
        auditFlag: 'caution',
      },
      {
        id: 'lat-a6',
        category: 'inferred',
        title: 'Millimetres of mercury are not sight, and no drop has been shown to prevent blindness',
        laymanSummary:
          'Every trial on this page measures either pressure or blind spots on a field test. None of them counted how many people went blind. The step from a lower pressure reading to keeping your sight is an inference, well supported but not directly measured.',
        technicalDetails:
          'Three randomised trials connect pressure lowering to a functional outcome, and all of them stop short of blindness. The Ocular Hypertension Treatment Study randomised 1,636 participants with intraocular pressure between 24 and 32 mmHg to medication or observation. Mean pressure reduction was 22.5% (SD 9.9) against 4.0% (11.6) in observation, and at 60 months the cumulative probability of developing primary open-angle glaucoma was 4.4% against 9.5% (hazard ratio 0.40, 95% CI 0.27 to 0.59, p<0.0001). The Early Manifest Glaucoma Trial randomised 255 patients with early glaucoma to laser plus betaxolol or no initial treatment. Treatment reduced pressure by 5.1 mmHg or 25%, and after a median six years progression occurred in 58 of 129 treated (45%) against 78 of 126 controls (62%, p=0.007). UKGTS measured time to visual field deterioration. Every one of these endpoints is a reading committee’s judgement on perimetry and disc photographs. None is a count of people who lost useful vision.',
        evidenceSource:
          'Kass MA et al., Arch Ophthalmol 2002;120:701-713 (OHTS, NCT00000125); Heijl A et al., Arch Ophthalmol 2002;120:1268-1279 (EMGT)',
        doi: '10.1001/archopht.120.6.701',
        inferredClaim:
          'That lowering intraocular pressure with this drug prevents blindness — supported by three trials measuring conversion, progression and field deterioration, and never tested against blindness as an endpoint',
        auditFlag: 'contested',
      },
      {
        id: 'lat-a7',
        category: 'conclusion_shift',
        title: 'OHTS moved the field from treating pressure to treating risk',
        laymanSummary:
          'Before 2002 raised pressure was widely treated on sight. The Ocular Hypertension Treatment Study showed that most people with raised pressure never develop glaucoma at all: nine in ten untreated participants were still free of it five years later.',
        technicalDetails:
          'OHTS found that among 1,636 participants with intraocular pressure of 24 to 32 mmHg and no glaucomatous damage, the five-year cumulative probability of developing primary open-angle glaucoma without treatment was 9.5%. Treatment more than halved it, to 4.4%. Both numbers are small. The authors wrote explicitly that the result does not imply that all patients with borderline or elevated pressure should receive medication, and directed that treatment be considered for those at moderate or high risk. The practical consequence was the arrival of risk calculators built on the trial’s own predictors — age, central corneal thickness, cup-to-disc ratio, pattern standard deviation — and a shift away from treating a pressure number in isolation. Central corneal thickness in particular emerged from this trial as a major predictor and is now measured routinely, which it was not before.',
        evidenceSource: 'Kass MA et al., Arch Ophthalmol 2002;120:701-713 (OHTS, NCT00000125)',
        doi: '10.1001/archopht.120.6.701',
        inferredClaim:
          'That elevated intraocular pressure by itself warrants treatment — an inference the trial designed to support it substantially narrowed instead',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A drop lands on the eye and most of it is lost',
        laymanDesc:
          'A drop is far bigger than the eye can hold. Most of it runs down the tear duct within minutes. Only a small fraction ever crosses into the eye, and that is what the dose is built around.',
        molecularDetail:
          'Latanoprost is supplied as an isopropyl ester in an aqueous vehicle preserved with benzalkonium chloride in the original formulation. Tear turnover and nasolacrimal drainage remove the great majority of an instilled drop within minutes. The ester’s lipophilicity is what allows the surviving fraction to partition into the corneal epithelium.',
        iconName: 'Droplet',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The cornea cuts off the chemical disguise',
        laymanDesc:
          'The molecule that goes in is not the molecule that works. Enzymes in the cornea snip off a chemical tail as it passes through, releasing the active form on the far side.',
        molecularDetail:
          'Corneal esterases hydrolyse the isopropyl ester to latanoprost free acid during passage through the epithelium and stroma. The free acid is the pharmacologically active species and penetrates the cornea poorly on its own, so the ester functions as a permeation prodrug rather than a formulation convenience. Peak aqueous humour concentration of the free acid is reached roughly two hours after instillation.',
        iconName: 'Scissors',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It switches on one receptor and deliberately misses the rest',
        laymanDesc:
          'The active form binds a single receptor on the muscle that rings the lens. The prostaglandin family it belongs to also causes pain and inflammation through other receptors, and this molecule was reshaped to avoid them.',
        molecularDetail:
          'Latanoprost free acid is a selective agonist at the FP prostanoid receptor, expressed on ciliary muscle cells and trabecular meshwork. The 13,14-dihydro-17-phenyl-18,19,20-trinor modification of the prostaglandin F2-alpha skeleton is what confers selectivity over EP, DP, IP and TP receptors, whose activation would produce the hyperemia, pain and inflammation that made native prostaglandins unusable as drugs.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Cells dismantle the packing between the muscle bundles',
        laymanDesc:
          'The receptor tells the cells to break down some of the connective tissue filling the spaces around them. Gaps open up where there were none. This takes days to weeks, which is why the effect builds rather than appearing at once.',
        molecularDetail:
          'FP receptor activation upregulates matrix metalloproteinases in the ciliary muscle, remodelling the extracellular matrix of the uveoscleral outflow pathway and reducing hydraulic resistance. The effect is transcriptional, not mechanical, which accounts for the lag between first dose and full effect. The trabecular route is affected far less, which is why the drug works in eyes where the conventional drain is compromised.',
        iconName: 'Wrench',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Fluid leaves faster and pressure settles lower',
        laymanDesc:
          'With the secondary drain widened, fluid leaves the eye more quickly than before. Pressure falls by around five millimetres of mercury and stays there for as long as the drops continue.',
        molecularDetail:
          'Increased uveoscleral outflow lowers steady-state intraocular pressure. The pooled network meta-analysis puts the reduction at 4.85 mmHg (95% credible interval 4.24 to 5.46) at three months. The registration trial found no long-term drift over six months, in contrast to the tachyphylaxis reported with beta-blockers.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What the pressure reading does not tell you',
        laymanDesc:
          'A lower number on the tonometer is not the same as keeping your sight. One trial has tested this drug against a dummy drop for vision, and it measured blind spots on a field test, not blindness.',
        molecularDetail:
          'UKGTS is the only placebo-controlled randomised trial of a topical agent with a visual function primary outcome: time to visual field deterioration within 24 months, adjusted hazard ratio 0.44 (95% CI 0.28 to 0.69). Perimetric deterioration is a reading-centre judgement on a threshold test, not a measure of useful sight lost, and no trial of any single glaucoma drug has used blindness as an endpoint.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'UKGTS (ISRCTN96423140)',
        phase: 'Randomised, triple-masked, placebo-controlled',
        sampleSize: 516,
        primaryEndpoint: 'Time to visual field deterioration within 24 months',
        endpointMet: true,
        statisticalPValue: 'Adjusted hazard ratio 0.44 (95% CI 0.28 to 0.69), P = 0.0003',
        unreportedAdverseSignals:
          'The trial was stopped early on the recommendation of its Data and Safety Monitoring Committee, and the primary outcome was changed at that point from a difference in proportions progressing to time to deterioration. Early stopping on an interim analysis tends to overstate effect size.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'United States Latanoprost Study (Camras 1996)',
        phase: 'Multicentre, randomised, double-masked, active-controlled',
        sampleSize: 268,
        primaryEndpoint:
          'Diurnal intraocular pressure reduction at 6 months, latanoprost against timolol',
        endpointMet: true,
        statisticalPValue: '-6.7 mmHg (SD 3.4) against -4.9 mmHg (SD 2.9), P < 0.001',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'OHTS (NCT00000125)',
        phase: 'Randomised, controlled, class-level rather than drug-specific',
        sampleSize: 1636,
        primaryEndpoint:
          'Development of reproducible visual field abnormality or optic disc deterioration attributed to primary open-angle glaucoma',
        endpointMet: true,
        statisticalPValue:
          '4.4% against 9.5% cumulative probability at 60 months; hazard ratio 0.40 (95% CI 0.27 to 0.59), P < 0.0001',
        unreportedAdverseSignals:
          'The medication arm used any commercially available topical agent, not latanoprost specifically. This trial establishes that pressure lowering works as a class. It does not measure this molecule.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Travoprost 12-month comparative study (Netland 2001)',
        phase: 'Randomised, active-controlled, four-arm',
        sampleSize: 801,
        primaryEndpoint:
          'Mean intraocular pressure over visits and time of day across travoprost, latanoprost and timolol',
        endpointMet: true,
        statisticalPValue:
          'Latanoprost 18.5 to 19.2 mmHg against travoprost 0.004% 17.7 to 19.1 and timolol 19.4 to 20.3; travoprost 0.8 mmHg lower than latanoprost at 4 PM pooled, P = 0.0191',
        unreportedAdverseSignals:
          'Sponsored by the manufacturer of the comparator that won. Iris pigmentation change occurred in 5.2% of latanoprost patients and 3.1% on travoprost 0.004%, so the safety difference runs the other way from the efficacy one.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Time to visual field deterioration delayed against identical placebo drops in 516 patients, adjusted hazard ratio 0.44 (95% CI 0.28 to 0.69), p=0.0003',
        'Mean intraocular pressure reduction of 4.85 mmHg (95% credible interval 4.24 to 5.46) at three months, pooled across 114 randomised trials in 20,275 participants',
        '6.7 mmHg diurnal reduction against timolol’s 4.9 mmHg in 268 patients over six months (p<0.001), with no drift over that period',
        'Photographically documented, non-reversing iris pigmentation change in 5.2% of latanoprost patients in the 12-month comparative study',
      ],
      unsupportedInferences: [
        'That this drug has been shown to prevent blindness — no randomised trial of any single glaucoma agent has used blindness as an endpoint',
        'That the sub-millimetre gap to bimatoprost in the pooled ranking is a clinical difference; the authors of that analysis say directly that it may not be',
        'That elevated pressure alone justifies treatment — OHTS found nine in ten untreated participants free of glaucoma at five years',
        'That the UKGTS hazard ratio is an unbiased estimate; the trial was stopped early at an interim analysis, which tends to inflate effect size',
      ],
      whatFailedInitially: [
        'Iris pigmentation appeared in the first six-month registration trial, was photographed, and does not reverse when the drug is stopped',
        'Prostaglandin-associated periorbitopathy was not identified in the registration programme at all and was described years later from clinical case series',
        'The benzalkonium chloride preservative in the original formulation damages the ocular surface over years of daily use, which is why two preservative-free reformulations were later developed and approved',
      ],
      realWorldOutcome: [
        'The first prostaglandin analogue approved for glaucoma, in 1996, and the drug that displaced timolol as first-line treatment worldwide',
        'The only topical glaucoma agent with a placebo-controlled randomised trial reporting a visual function outcome',
        'Now generic and among the cheapest drugs in ophthalmology at a median United States acquisition cost of US$1.57 per millilitre',
        'Preservative-free formulations were approved in 2018 and 2022, addressing a formulation problem rather than a limitation of the molecule',
      ],
    },
    deliverySystem: {
      type: 'Topical ophthalmic solution 0.005%, instilled once daily',
      description:
        'A drop onto the ocular surface, from which a small fraction crosses the cornea while the rest drains through the nasolacrimal duct. The isopropyl ester exists to get the molecule through the cornea, where esterases release the active free acid. Bottles are refrigerated until first opened because the molecule oxidises and isomerises on storage.',
      safetyProfile:
        'Increased brown iris pigmentation, permanent, documented photographically from the first registration trial. Eyelash lengthening, thickening and darkening. Conjunctival hyperemia, more than with timolol. Eyelid skin darkening and prostaglandin-associated periorbitopathy, the latter described only after approval. Rare reports of macular oedema, mostly in aphakic or pseudophakic eyes with torn posterior lens capsules, and of herpes simplex keratitis reactivation. Systemic effects are minimal compared with the topical beta-blockers, and pulse rate was unchanged in the registration trial where timolol reduced it significantly.',
    },
    commonQuestions: [
      {
        q: 'Will this stop me going blind?',
        a: 'It has never been tested against that. The strongest trial of this drug, UKGTS, randomised 516 people to latanoprost or an identical dummy drop and measured how long it took the visual field to deteriorate on a threshold test. Deterioration came significantly later on the drug, with a hazard ratio of 0.44. That is a real, placebo-controlled result and no other glaucoma drop has one. It is still not a count of people who lost useful sight. Two larger trials, OHTS and EMGT, measured conversion to glaucoma and progression of existing glaucoma, and both found pressure lowering helps. All three endpoints are judgements by reading centres on perimetry and optic disc photographs. The inference from those to blindness prevented is strong and it is still an inference.',
        auditNote:
          'The objection to running a blindness-endpoint trial is that it would take decades and require withholding effective treatment. That is a fair reason not to run it, not evidence that it has been run.',
      },
      {
        q: 'Will it change the colour of my eyes?',
        a: 'It can, and if it does the change is permanent. Latanoprost increases melanin inside the pigment cells of the iris — it does not add cells, it loads the existing ones. In the twelve-month comparative trial it happened to 10 of 194 latanoprost patients, about one in twenty. Mixed-colour irises change most, and hazel or green-brown eyes are the ones most likely to go uniformly brown. If only one eye is being treated the two can end up visibly different. It was documented photographically in the original 1996 trial, so this is not a late discovery. Nothing suggests the pigment change is harmful, but it does not reverse when the drops stop.',
      },
      {
        q: 'Why does my eye look sunken since I started?',
        a: 'That is prostaglandin-associated periorbitopathy, and it is a recognised effect of this whole drug class. The upper eyelid crease deepens, fat around the eye is lost, the lid can appear to droop and the skin around it can darken. It was not picked up in the registration trials — it was reported by clinicians years afterwards, once large numbers of people had been on the drops for a long time. Experimental work has since traced the mechanism: activating the FP receptor, which is exactly what the drug is meant to do, inhibits fat cell formation, and the orbital fat pads are collateral. Case series document partial recovery after switching agents or stopping. If only one eye is treated, the asymmetry is usually what makes people notice.',
        auditNote:
          'A side effect that emerges from postmarketing observation rather than a trial is not a weaker finding, but it is an unquantified one: nothing in the literature gives a reliable incidence figure.',
      },
      {
        q: 'Is bimatoprost better?',
        a: 'On pressure lowering, marginally, and the size of the margin is the point. The pooled analysis of 114 trials puts bimatoprost at 5.61 mmHg and latanoprost at 4.85 mmHg at three months, with overlapping credible intervals. The authors of that analysis state that within-class differences were small and may not be clinically meaningful. Against that sub-millimetre gap, bimatoprost causes more conjunctival redness. And latanoprost is the one with the placebo-controlled visual field trial. Ranking these drugs by their pooled millimetres treats the least uncertain number as though it were the most important one.',
      },
      {
        q: 'Why is the bottle kept in the fridge?',
        a: 'Because the molecule degrades. Latanoprost oxidises at the 15-position and isomerises across the 5,6 double bond on exposure to warmth and light, and both degradants are inactive. Unopened bottles are refrigerated for that reason. Once opened, the tolerance shifts because the product is used up within weeks. This is a property of the prostaglandin skeleton rather than a manufacturing shortcoming: the same instability is why the purification step in production has to remove the 15-keto and 5,6-trans impurities before the product ever ships.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Garway-Heath DF et al. Latanoprost for open-angle glaucoma (UKGTS): a randomised, multicentre, placebo-controlled trial. Lancet 2015;385:1295-1304',
        identifier: '10.1016/S0140-6736(14)62111-5',
        kind: 'doi',
      },
      {
        label:
          'Camras CB et al. Comparison of latanoprost and timolol in patients with ocular hypertension and glaucoma: a six-month masked, multicenter trial in the United States. Ophthalmology 1996;103:138-147',
        identifier: '10.1016/s0161-6420(96)30749-5',
        kind: 'doi',
      },
      {
        label:
          'Li T et al. Comparative effectiveness of first-line medications for primary open-angle glaucoma: a systematic review and network meta-analysis. Ophthalmology 2016;123:129-140',
        identifier: '10.1016/j.ophtha.2015.09.005',
        kind: 'doi',
      },
      {
        label:
          'Kass MA et al. The Ocular Hypertension Treatment Study: a randomized trial determines that topical ocular hypotensive medication delays or prevents the onset of primary open-angle glaucoma. Arch Ophthalmol 2002;120:701-713',
        identifier: '10.1001/archopht.120.6.701',
        kind: 'doi',
      },
      {
        label:
          'Heijl A et al. Reduction of intraocular pressure and glaucoma progression: results from the Early Manifest Glaucoma Trial. Arch Ophthalmol 2002;120:1268-1279',
        identifier: '10.1001/archopht.120.10.1268',
        kind: 'doi',
      },
      {
        label:
          'Netland PA et al. Travoprost compared with latanoprost and timolol in patients with open-angle glaucoma or ocular hypertension. Am J Ophthalmol 2001;132:472-484',
        identifier: '10.1016/s0002-9394(01)01177-1',
        kind: 'doi',
      },
      {
        label:
          'Taketani Y et al. Activation of the prostanoid FP receptor inhibits adipogenesis leading to deepening of the upper eyelid sulcus in prostaglandin-associated periorbitopathy. Invest Ophthalmol Vis Sci 2014;55:1269-1276',
        identifier: '10.1167/iovs.13-12589',
        kind: 'doi',
      },
      {
        label:
          'Sakata R et al. Recovery from deepening of the upper eyelid sulcus after switching from bimatoprost to latanoprost. Jpn J Ophthalmol 2013;57:179-184',
        identifier: '10.1007/s10384-012-0219-3',
        kind: 'doi',
      },
      {
        label:
          'Gazzard G et al. Selective laser trabeculoplasty versus eye drops for first-line treatment of ocular hypertension and glaucoma (LiGHT): a multicentre randomised controlled trial. Lancet 2019;393:1505-1516',
        identifier: '10.1016/S0140-6736(18)32213-X',
        kind: 'doi',
      },
      {
        label: 'Ocular Hypertension Treatment Study (OHTS), 1,636 participants randomised',
        identifier: 'NCT00000125',
        kind: 'nct',
      },
      {
        label: 'PubChem CID 5311221 — latanoprost structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5311221',
        kind: 'url',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey, generic listing effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 2. Timolol — the 1978 drug that made glaucoma treatable with a drop, described as "innocuous"
  //    in its first paper and credited with 32 deaths in the FDA's first seven years of reports.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'timolol',
    name: 'Timolol',
    tradeName: 'Timoptic',
    sponsor: 'Bausch & Lomb Incorporated — originally developed and marketed by Merck',
    targetGene: 'ADRB1 and ADRB2 — the human beta-1 and beta-2 adrenergic receptor genes',
    targetProtein:
      'Beta-1 and beta-2 adrenergic receptors, blocked non-selectively, on the non-pigmented ciliary epithelium',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1978,
    indication:
      'Reduction of elevated intraocular pressure in patients with ocular hypertension or open-angle glaucoma',
    patientFriendlyIndication: 'High pressure inside the eye, treated by making the eye produce less fluid',
    anatomicalSite:
      'Non-pigmented epithelium of the ciliary body, where aqueous humour is secreted — and, through nasal absorption, the heart and airways',
    conditionContext: {
      conditionExplainer:
        'The eye is a closed chamber with a tap and a drain. Every other glaucoma drug on this site works on the drain. Timolol works on the tap: it turns down the rate at which the ciliary body secretes fluid into the eye in the first place.',
      whyItMatters:
        'Before 1978 the alternatives were pilocarpine, which blurs vision and cramps the eye, and oral carbonic anhydrase inhibitors, which cause fatigue, tingling and kidney stones. Timolol was the first drop that lowered pressure substantially without either. It defined glaucoma treatment for two decades.',
      whoTakesThis:
        'Adults with open-angle glaucoma or ocular hypertension, now usually as a second agent rather than the first. It is contraindicated outright in bronchial asthma, in severe chronic obstructive pulmonary disease, in sinus bradycardia and in second- or third-degree atrioventricular block.',
      clinicalGoals:
        'A reduction in millimetres of mercury sustained across the day. The trials measure daytime pressure, and the drug’s known weakness is that it does much less at night, when patients are asleep and nobody is measuring.',
    },
    oneSentenceVerdict:
      'A non-selective beta-blocker that turns down aqueous secretion at the ciliary epithelium, lowering pressure 3.70 mmHg at three months across 114 pooled trials — sixth of fourteen first-line drops — while drainage down the tear duct delivers enough drug to the nasal mucosa to bypass the liver entirely, producing the 450 serious cardiopulmonary reports and 32 deaths the FDA collected in its first seven years on the market.',
    laymanHowItWorks:
      'Inside the eye, a ring of tissue behind the iris pumps out clear fluid all day. That secretion is switched on partly by the same nerve signals that speed up the heart. Timolol blocks those signals where they arrive at the pump, so less fluid is made and pressure falls. The same receptors sit in the heart and airways, and enough of each drop drains down the tear duct into the nose to reach them.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 71,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$1.06 per millilitre, median across the 65 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Sixty-five separate generic products are listed in the acquisition-cost survey, more than any other drug in this batch. Timolol came off patent in the 1990s and is on the WHO Model List of Essential Medicines. Its remaining branded forms are all delivery reformulations — a gel-forming solution that stays on the eye longer, and a preservative-free unit-dose vial for people the preservative injures — not changes to the molecule.',
      synthesisComplexity: 'Moderate',
      costSource: {
        label:
          'Nearest published cost-of-production analysis: Hill AM, Barber MJ, Gotham D. Estimated costs of production and potential prices for the WHO Essential Medicines List. BMJ Glob Health 2018;3:e000571. Its methods restrict the analysis to solid oral formulations and exclude eye drops, which is why the synthesis cost field on this page is empty.',
        identifier: '10.1136/bmjgh-2017-000571',
        kind: 'doi',
      },
      priceSource: {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey, generic listing effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    },
    substitutes: {
      summary:
        'Timolol has been overtaken on efficacy by the prostaglandin analogues and on safety by almost everything. It survives because it is cheap, because it works by a different mechanism from the drainage drugs and therefore adds to them, and because it is the standard comparator every new glaucoma drug is tested against. The honest alternatives divide into stronger drops with local side effects and weaker drops without the cardiopulmonary risk.',
      conventionalRx: [
        {
          name: 'Latanoprost (Xalatan)',
          class: 'Prostaglandin F2-alpha analogue',
          howItCompares:
            'Lowers pressure 4.85 mmHg against timolol’s 3.70 in the pooled analysis of 114 trials, once daily rather than twice, and holds its effect through the night where timolol does not. In the head-to-head registration trial of 268 patients, 6.7 mmHg against 4.9 mmHg (p<0.001).',
          typicalCost:
            'US$1.57 per millilitre, median across the 13 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: stronger, once daily, no systemic beta-blockade, works at night. Cons: permanent iris darkening, eyelash growth, periorbital fat loss.',
        },
        {
          name: 'Dorzolamide (Trusopt)',
          class: 'Topical carbonic anhydrase inhibitor',
          howItCompares:
            'Weaker than timolol overall, at 2.49 mmHg against 3.70 in the pooled analysis, but the circadian crossover study found dorzolamide outperformed timolol at midnight and 3 AM, the hours when timolol does least.',
          typicalCost:
            'US$0.8910 per millilitre, median across the 23 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: no beta-blockade, so usable in asthma and heart block; works overnight. Cons: weaker, stings on instillation in one patient in six, and can decompensate a cornea whose endothelium is already compromised.',
        },
        {
          name: 'Selective laser trabeculoplasty',
          class: 'Laser procedure, not a drug',
          howItCompares:
            'The LiGHT trial randomised 718 patients to laser first or drops first. At three years, 74.2% of the laser group required no drops at all. For a patient in whom beta-blockade is the specific problem, this removes the drug rather than substituting one.',
          typicalCost:
            'Not a product listed in the CMS National Average Drug Acquisition Cost survey — it is a procedure, billed and costed separately',
          prosAndCons:
            'Pros: no systemic absorption of anything. Cons: the effect wanes, repeat treatment is common, and it is a procedure with its own risks.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Say whether you have asthma or any breathing problem, before the first drop',
          action:
            'Name asthma, chronic bronchitis, emphysema or any history of wheezing, however long ago, and mention any heart rhythm problem or heart failure.',
          patientImpact:
            'The label contraindicates timolol in bronchial asthma or a history of it, in severe chronic obstructive pulmonary disease, in sinus bradycardia and in second- or third-degree atrioventricular block. It states that death due to bronchospasm in patients with asthma has been reported after ophthalmic administration.',
          clinicalPrecaution:
            'In the FDA case series covering 1978 to 1985, 61% of the patients with a recorded medical history had known respiratory disease. A third of the events occurred within a week of starting, and 23% on the first day.',
        },
        {
          name: 'Press on the inner corner of the closed eye after each drop',
          action:
            'Close the eye and press gently at the inner corner, over the tear duct, for a minute or so after instilling.',
          patientImpact:
            'Punctal occlusion measurably lowers plasma drug levels after ophthalmic instillation, according to the published review of systemic absorption. The absorbed fraction reaches the bloodstream through conjunctival and nasal mucosa, which drains straight into the circulation without passing through the liver first.',
          clinicalPrecaution:
            'This reduces systemic exposure. It does not make the drug safe in someone in whom beta-blockade is contraindicated, and the contraindications are absolute rather than dose-dependent.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(C)(C)NC[C@@H](COC1=NSN=C1N2CCOCC2)O',
      chemicalFormula: 'C13H24N4O3S',
      molecularWeight: '316.42 g/mol',
      targetReceptorAffinity:
        'A non-selective beta-1 and beta-2 adrenergic receptor antagonist. The label states that it has no significant intrinsic sympathomimetic activity, no direct myocardial depressant activity and no local anaesthetic or membrane-stabilising activity, which is precisely why its systemic effects are pure beta-blockade rather than a mixture. The S-enantiomer carries the activity; timolol is supplied as the single enantiomer maleate salt.',
      structureSource: {
        label: 'PubChem CID 33624 (timolol) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/33624',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'tim-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Enantiomeric purity of the S-configured propanolamine side chain',
          description:
            'Confirm that the material is the S-enantiomer before anything else. The R-enantiomer is far weaker at the beta receptor, so enantiomeric excess here is not a purity nicety but the difference between the labelled potency and a fraction of it.',
          reagentsAndBuffer:
            'Timolol maleate reference standard, chiral HPLC with amylose or cellulose stationary phase, polarimetry, 1H NMR in deuterium oxide',
        },
        {
          id: 'tim-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Epoxide opening with tert-butylamine onto the thiadiazole ether',
          description:
            'Open a chiral glycidyl ether of the morpholino-thiadiazole with tert-butylamine to install the aminopropanol side chain in a single stereodefined step. The 1,2,5-thiadiazole ring, not a benzene ring, is what distinguishes timolol from the cardiology beta-blockers built on the same side chain.',
          dependsOnStepId: 'tim-w1',
          reagentsAndBuffer:
            'Chiral glycidyl ether intermediate, tert-butylamine in excess, alcoholic solvent under reflux, nitrogen atmosphere',
        },
        {
          id: 'tim-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Maleate salt formation and recrystallisation',
          description:
            'Convert the free base to the maleate salt and recrystallise. The salt is what makes the molecule soluble enough for an aqueous eye drop at 0.25% and 0.5%, and it is the form the pharmacopoeial assay is written against.',
          dependsOnStepId: 'tim-w2',
          reagentsAndBuffer:
            'Maleic acid, ethanol or isopropanol, controlled cooling crystallisation, residual solvent analysis by headspace gas chromatography',
        },
        {
          id: 'tim-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Corneal permeation and conjunctival loss in a paired diffusion model',
          description:
            'Run permeation across excised cornea and, in parallel, across conjunctiva. Measuring only the cornea is the classic error with this drug: the conjunctival and nasal route is where the systemic exposure comes from, and a corneal-only assay makes the safety problem invisible.',
          dependsOnStepId: 'tim-w3',
          reagentsAndBuffer:
            'Excised cornea and conjunctiva, side-by-side diffusion cells, balanced salt solution at 34 degrees Celsius, LC-MS/MS quantification in both receiver chambers',
        },
        {
          id: 'tim-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Beta-1 and beta-2 radioligand binding with cardiac and airway tissue panel',
          description:
            'Measure affinity at recombinant beta-1 and beta-2 receptors and confirm the lack of selectivity, then repeat in cardiac and bronchial smooth muscle preparations. Non-selectivity is the whole safety story: a beta-1-selective agent would spare the airway, and timolol does not.',
          dependsOnStepId: 'tim-w4',
          reagentsAndBuffer:
            'Membranes expressing recombinant human beta-1 and beta-2 receptors, tritiated dihydroalprenolol or CGP-12177 radioligand, isolated cardiac and tracheal smooth muscle strips, isoprenaline as reference agonist',
        },
      ],
    },
    keyAudits: [
      {
        id: 'tim-a1',
        category: 'measured',
        title: 'Sixth of fourteen first-line drops on pressure lowering',
        laymanSummary:
          'Pooling 114 trials, timolol lowers pressure by 3.70 millimetres of mercury at three months. That places it behind all four prostaglandin analogues and one other beta-blocker, and ahead of the carbonic anhydrase inhibitors.',
        technicalDetails:
          'In the Bayesian network meta-analysis of 114 randomised trials with data from 20,275 participants, mean reduction in intraocular pressure at 3 months for timolol was 3.70 mmHg (95% credible interval 3.16 to 4.24). Ahead of it: bimatoprost 5.61, latanoprost 4.85, travoprost 4.83, levobunolol 4.51, tafluprost 4.37. Behind it: brimonidine 3.59, carteolol 3.44, levobetaxolol 2.56, apraclonidine 2.52, dorzolamide 2.49, brinzolamide 2.42, betaxolol 2.24, unoprostone 1.91. Timolol is the comparator arm in a large share of the included trials, which makes its estimate the most precisely determined in the network and also means the network is anchored on it.',
        evidenceSource: 'Li T et al., Ophthalmology 2016;123:129-140',
        doi: '10.1016/j.ophtha.2015.09.005',
        measuredMetric:
          'Mean intraocular pressure reduction at 3 months, pooled across 114 randomised trials',
        auditFlag: 'verified',
      },
      {
        id: 'tim-a2',
        category: 'measured',
        title: 'The 1977 dose-response study that established the drug',
        laymanSummary:
          'Two small studies in thirty and twenty patients showed that a single drop halved eye pressure within seven hours and that the effect lasted a full day. That was enough to change glaucoma treatment worldwide.',
        technicalDetails:
          'Zimmerman and Kaufman studied timolol maleate in 30 patients with glaucoma, finding significant pressure lowering at 0.5% and 1.5%, with pressure 50% below pretreatment at seven hours on both strengths. A companion single-dose study in 20 patients with chronic open-angle glaucoma established the dose-response across 0.1%, 0.25%, 0.5% and 1.0%, found 0.5% gave the maximal effect, and found every concentration produced an ocular hypotensive effect lasting at least 24 hours. Both papers report no ocular or systemic side effects detected. The second concludes that timolol "may be an effective, innocuous, once-a-day, topical agent."',
        evidenceSource:
          'Zimmerman TJ, Kaufman HE. Arch Ophthalmol 1977;95:601-604 and 1977;95:605-607',
        doi: '10.1001/archopht.1977.04450040067008',
        measuredMetric: 'Intraocular pressure reduction after single-dose instillation, by strength',
        auditFlag: 'verified',
      },
      {
        id: 'tim-a3',
        category: 'failed',
        title: '450 serious cardiopulmonary reports and 32 deaths in the first seven years',
        laymanSummary:
          'Between 1978 and 1985 the FDA received 450 reports of serious breathing and heart events attributed to timolol eye drops, and 32 reports of death. A third of them happened within a week of starting, and nearly a quarter on the first day.',
        technicalDetails:
          'Nelson and colleagues reviewed reports received by the United States Food and Drug Administration and the National Registry of Drug-Induced Ocular Side Effects between September 1978 and December 1985: 450 case reports of serious respiratory and cardiovascular events and 32 case reports of death attributed to ophthalmic timolol. Of these, 267 patients (55%) had a cardiac arrhythmia or a bronchospasm-related event. Median age was 68. Of 212 patients with a medical history provided, 129 (61%) had respiratory disease, 65 (31%) cardiovascular disease and 5 (2%) no underlying illness. Of 318 with duration data, 106 (33%) had their event within one week of starting and 73 (23%) on the first day. Of 192 with follow-up, 177 (92%) improved after the drug was stopped. These are spontaneous reports without a denominator, so they establish that the events happen and cannot establish how often.',
        evidenceSource: 'Nelson WL et al., Am J Ophthalmol 1986;102:606-611',
        doi: '10.1016/0002-9394(86)90532-5',
        measuredMetric:
          'Spontaneous adverse event reports to FDA and the National Registry, 1978 to 1985',
        auditFlag: 'caution',
      },
      {
        id: 'tim-a4',
        category: 'failed',
        title: 'It stops working at 3 AM',
        laymanSummary:
          'A crossover study measured pressure around the clock in hospital. Timolol lowered pressure at every time of day except three in the morning, where it did nothing measurable. Latanoprost and dorzolamide both worked overnight.',
        technicalDetails:
          'Orzalesi and colleagues admitted 20 patients with primary open-angle glaucoma or ocular hypertension to hospital and measured four 24-hour tonometric curves — at baseline and after each of three randomised one-month treatment periods — with two evaluators masked to assignment. Using Goldmann sitting values, all three drugs significantly reduced pressure against baseline at every measurement time except timolol at 3 AM. Latanoprost was more effective than timolol at 3, 6 and 9 AM, noon, 9 PM and midnight. Dorzolamide, weaker than timolol overall, outperformed it at midnight and 3 AM. The sample is 20 patients in a crossover design, which is small, and the finding has shaped how the class is understood since.',
        evidenceSource: 'Orzalesi N et al., Invest Ophthalmol Vis Sci 2000;41:2566-2573 (PMID 10937568)',
        measuredMetric:
          'Intraocular pressure at eight times across 24 hours, three drugs in randomised crossover',
        auditFlag: 'caution',
      },
      {
        id: 'tim-a5',
        category: 'inferred',
        title: '"Innocuous" was written before anyone had a denominator',
        laymanSummary:
          'The two papers that launched the drug studied fifty patients between them and reported no side effects at all. One of them used the word innocuous. Seven years later the FDA had 32 death reports.',
        technicalDetails:
          'The 1977 studies enrolled 30 and 20 patients respectively for single-dose and short-duration observation, and both report that no local or systemic side effects were discovered. The conclusion of the dose-response paper reads that timolol "may be an effective, innocuous, once-a-day, topical agent for the treatment of glaucoma." Neither study was powered to detect an event occurring in a susceptible subgroup, and neither enrolled the asthmatic and cardiac patients in whom the harm concentrates — 61% of the FDA-reported cases with a history had known respiratory disease. The label now carries contraindications in bronchial asthma, severe chronic obstructive pulmonary disease, sinus bradycardia and heart block, and states that death due to bronchospasm in asthmatic patients has been reported after ophthalmic administration.',
        evidenceSource:
          'Zimmerman TJ, Kaufman HE. Arch Ophthalmol 1977;95:605-607; TIMOPTIC in OCUDOSE US prescribing information, Warnings and Contraindications',
        doi: '10.1001/archopht.1977.04450040071009',
        inferredClaim:
          'That a topical drug is systemically innocuous because two small short studies saw nothing — an inference the postmarketing record contradicted within a decade',
        auditFlag: 'contested',
      },
      {
        id: 'tim-a6',
        category: 'conclusion_shift',
        title: 'A drop in the eye was assumed to stay in the eye',
        laymanSummary:
          'The original assumption was that a drop on the eye is a local treatment. It is not. Most of it drains down the tear duct into the nose, where it is absorbed straight into the bloodstream without passing through the liver first.',
        technicalDetails:
          'A review of human plasma concentrations after ophthalmic instillation found that eye drops absorb rapidly into the systemic circulation, with plasma levels lower when punctal occlusion is applied. Occasional early and late plasma peaks in the timolol studies led the author to conclude that systemic absorption is low during nasolacrimal passage itself but occurs during conjunctival and nasal contact. The consequence is the one that matters clinically: absorption across nasal mucosa enters the systemic venous circulation directly and bypasses hepatic first-pass metabolism, so a topical dose measured in micrograms can produce plasma concentrations in the range achieved by oral beta-blockade. The label reflects the shift in a single sentence — "As with many topically applied ophthalmic drugs, this drug is absorbed systemically" — and then reproduces the systemic beta-blocker warnings in full.',
        evidenceSource:
          'Salminen L. Review: systemic absorption of topically applied ocular drugs in humans. J Ocul Pharmacol 1990;6:243-249',
        doi: '10.1089/jop.1990.6.243',
        inferredClaim:
          'That topical ophthalmic administration confines a drug to the eye — a founding assumption of the field that plasma measurement and 32 death reports overturned',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A drop goes in and most of it goes down the tear duct',
        laymanDesc:
          'The eye can hold only a fraction of a drop. The rest drains through a duct at the inner corner into the nose within minutes. That drainage is not waste, it is the route by which the drug reaches the rest of the body.',
        molecularDetail:
          'Timolol maleate is instilled as a 0.25% or 0.5% aqueous solution. Tear turnover and nasolacrimal drainage clear the majority of the instilled volume within minutes. Published plasma measurement shows rapid systemic absorption after instillation, reduced when punctal occlusion is applied, with the absorption occurring during conjunctival and nasal contact rather than within the duct itself.',
        iconName: 'Droplet',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The surviving fraction crosses into the front of the eye',
        laymanDesc:
          'What is left soaks through the clear window at the front of the eye and reaches the tissue behind the iris that makes the fluid. Pressure starts falling within half an hour.',
        molecularDetail:
          'Timolol partitions across the corneal epithelium and stroma into the aqueous humour, reaching the ciliary body. The label records onset of pressure reduction within half an hour of a single dose, maximum effect at one to two hours, and significant lowering maintained for as long as 24 hours.',
        iconName: 'Eye',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It blocks the signal that tells the eye to make fluid',
        laymanDesc:
          'The fluid pump behind the iris is switched on partly by adrenaline-type signals. Timolol sits on those receptors and blocks them without switching anything on itself.',
        molecularDetail:
          'Timolol is a non-selective antagonist at beta-1 and beta-2 adrenergic receptors on the non-pigmented ciliary epithelium. The label specifies that it lacks intrinsic sympathomimetic activity, direct myocardial depressant activity and membrane-stabilising activity — it is a pure antagonist. Blockade reduces adenylate cyclase activity and cyclic AMP in the secretory epithelium.',
        iconName: 'Ban',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Less fluid is secreted, so pressure falls',
        laymanDesc:
          'With the signal blocked, the pump slows. The drain is untouched, but less is coming in, so the pressure in the chamber settles lower.',
        molecularDetail:
          'Reduced cyclic AMP lowers the rate of active aqueous humour secretion. Outflow facility is essentially unchanged, which is why timolol combines additively with the prostaglandin analogues and the rho kinase inhibitors, which act on outflow. Pooled reduction is 3.70 mmHg (95% credible interval 3.16 to 4.24) at three months.',
        iconName: 'TrendingDown',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The same receptors in the heart and lungs are blocked too',
        laymanDesc:
          'The receptors timolol blocks are not unique to the eye. They also control heart rate and keep the airways open. The fraction absorbed through the nose reaches both.',
        molecularDetail:
          'Beta-1 blockade reduces cardiac output and can precipitate failure where sympathetic drive is supporting a weak myocardium. Beta-2 blockade in bronchi and bronchioles increases airway resistance through unopposed parasympathetic activity. Absorption across nasal mucosa enters the systemic circulation without hepatic first-pass extraction, so the effective systemic dose is far larger than the instilled micrograms suggest.',
        iconName: 'HeartPulse',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And at three in the morning it does very little',
        laymanDesc:
          'Aqueous production falls naturally overnight, so there is less for the drug to suppress. In a round-the-clock study, timolol was the one drug that failed to lower pressure at 3 AM.',
        molecularDetail:
          'Aqueous humour formation has a strong circadian rhythm, falling substantially during sleep. A drug acting by suppressing secretion therefore has less to act on at night. In the 20-patient crossover study measuring eight times across 24 hours, timolol reduced pressure significantly against baseline at every time point except 3 AM, and dorzolamide — weaker overall — outperformed it at midnight and 3 AM.',
        iconName: 'Moon',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Zimmerman & Kaufman dose-response (1977)',
        phase: 'Single-dose, open, dose-ranging',
        sampleSize: 20,
        primaryEndpoint:
          'Intraocular pressure reduction and duration of action across 0.1%, 0.25%, 0.5% and 1.0%',
        endpointMet: true,
        statisticalPValue:
          'Dose response demonstrated; 0.5% gave maximal effect; every concentration acted for at least 24 hours. No inferential statistic reported.',
        unreportedAdverseSignals:
          'Twenty patients, single dose. The paper states no local or systemic side effects were discovered and calls the drug innocuous. The FDA had 32 death reports within seven years of marketing.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Orzalesi circadian crossover (2000)',
        phase: 'Randomised crossover, masked evaluators, in-hospital 24-hour tonometry',
        sampleSize: 20,
        primaryEndpoint:
          'Around-the-clock intraocular pressure reduction, timolol against latanoprost and dorzolamide',
        endpointMet: false,
        statisticalPValue:
          'Timolol failed to reduce pressure significantly against baseline at 3 AM; latanoprost superior at 3, 6 and 9 AM, noon (P = 0.01), 9 PM and midnight (P = 0.05)',
        unreportedAdverseSignals:
          'Twenty patients across three treatment periods. Small, and the only study of its kind with masked evaluators and inpatient measurement at eight times of day.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'International Dorzolamide Study (Strahlman 1995)',
        phase: 'Double-masked, randomised, parallel comparison at 34 international sites',
        sampleSize: 523,
        primaryEndpoint:
          'Intraocular pressure reduction at one year, dorzolamide against timolol and betaxolol',
        endpointMet: true,
        statisticalPValue:
          'Approximately 25% peak reduction with timolol against 23% dorzolamide and 21% betaxolol; 20% against 17% and 15% at afternoon trough',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Brinzolamide Primary Therapy Study (Silver 1998)',
        phase: 'Multicentre, double-masked, prospective, parallel-group',
        sampleSize: 572,
        primaryEndpoint:
          'Diurnally corrected intraocular pressure reduction at peak and trough over 3 months',
        endpointMet: true,
        statisticalPValue:
          'Timolol 0.5% twice daily -5.2 to -6.3 mmHg against brinzolamide twice daily -3.8 to -5.7 and dorzolamide three times daily -4.3 to -5.9',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Mean intraocular pressure reduction of 3.70 mmHg (95% credible interval 3.16 to 4.24) at three months, pooled across 114 randomised trials in 20,275 participants',
        'Pressure 50% below pretreatment at seven hours after a single dose in the original 30-patient study',
        '450 serious respiratory and cardiovascular case reports and 32 death reports received by the FDA and the National Registry between 1978 and 1985',
        'No significant reduction against baseline at 3 AM in a masked 24-hour crossover study of 20 patients',
      ],
      unsupportedInferences: [
        'That timolol is innocuous, as its founding paper stated on the basis of 20 patients and one dose',
        'That a topical eye drop stays in the eye — the absorbed fraction bypasses hepatic first-pass metabolism entirely',
        'That the 32 reported deaths give a rate; spontaneous reports have no denominator and establish only that the events occur',
        'That daytime pressure readings describe 24-hour control for a drug that suppresses secretion, which itself falls at night',
      ],
      whatFailedInitially: [
        'The registration-era safety claim: two studies totalling 50 patients reported no side effects at all, and the label now carries four absolute contraindications',
        'Nocturnal control: the one time of day the drug does not measurably work is the time nobody was measuring',
        'The premise that ophthalmic administration is local, which plasma measurement disproved and which the label now states plainly in its first Warnings sentence',
      ],
      realWorldOutcome: [
        'The drug that made glaucoma manageable with a drop in 1978, displacing pilocarpine and oral carbonic anhydrase inhibitors',
        'Now the standard comparator arm in glaucoma trials rather than the standard treatment, and the anchor of the pooled network of 114 trials',
        'On the WHO Model List of Essential Medicines, with 65 separate generic products listed in the United States acquisition-cost survey',
        'Retained clinically because it acts on secretion rather than outflow, and therefore adds to the drainage drugs rather than overlapping them',
      ],
    },
    deliverySystem: {
      type: 'Topical ophthalmic solution 0.25% and 0.5%, twice daily; also a gel-forming solution and preservative-free unit-dose vials',
      description:
        'A drop onto the ocular surface. A small fraction crosses the cornea to the ciliary body and the rest drains through the nasolacrimal duct, where conjunctival and nasal absorption delivers it to the systemic circulation without hepatic first pass. The gel-forming formulation increases ocular contact time to allow once-daily use, and the preservative-free unit-dose vial exists for patients sensitive to benzalkonium chloride.',
      safetyProfile:
        'Contraindicated in bronchial asthma or a history of it, in severe chronic obstructive pulmonary disease, in sinus bradycardia, in second- or third-degree atrioventricular block, in overt cardiac failure and in cardiogenic shock. The label states that severe respiratory and cardiac reactions, including death due to bronchospasm in asthmatic patients and rarely death in association with cardiac failure, have been reported after ophthalmic administration. Beta-blockade may mask the symptoms of hypoglycaemia in diabetes and the signs of thyrotoxicosis. Local effects include burning, stinging, corneal hypoesthesia and dry eye. Unlike the prostaglandin analogues it causes no iris pigmentation and no eyelash change.',
    },
    commonQuestions: [
      {
        q: 'How can an eye drop affect my heart?',
        a: 'Through your nose. A drop is far larger than the eye can hold, so most of it drains through the duct at the inner corner of your eye into the nasal cavity within minutes. The lining there absorbs drugs directly into the bloodstream, and unlike a swallowed tablet, that route does not pass through the liver first — so none of the dose is broken down before it circulates. Timolol blocks the same receptors in the heart and airways that it blocks in the eye. Published plasma measurements confirm rapid systemic absorption after instillation, and show that levels are lower when people press on the tear duct after putting the drop in. The label opens its Warnings section by stating this plainly.',
      },
      {
        q: 'Is it really dangerous, or is that overstated?',
        a: 'Both things are true and they need separating. Between 1978 and 1985 the FDA and the National Registry received 450 reports of serious breathing and heart events attributed to timolol eye drops, and 32 reports of death. Those are real events in real people. But spontaneous reports have no denominator: millions of prescriptions were written over the same period and nobody knows how many patients that 450 came from. What the series does establish is who is at risk and when — 61% of the reported patients with a recorded history had known respiratory disease, a third had their event within a week of starting and 23% on the first day. That is why the contraindications are absolute rather than cautionary, and why the risk in someone with clear lungs and a normal heart is different in kind from the risk in someone with asthma.',
        auditNote:
          'A case series without a denominator can prove that a harm exists and can never quantify it. Both halves of that sentence get quoted selectively depending on who is arguing.',
      },
      {
        q: 'Why is it still used if newer drops work better?',
        a: 'Because it works differently, not just less well. Every prostaglandin analogue and the rho kinase inhibitors act on drainage. Timolol acts on production. Two drugs working on opposite sides of the same equation add up, which is why timolol is in almost every fixed-dose combination drop on the market and why it remains useful as a second agent when one drug is not enough. It is also the comparator arm in a large share of glaucoma trials, which makes it the fixed point the whole comparative literature is anchored to. And at a median United States acquisition cost of about a dollar a millilitre across 65 listed products, cost is not the reason to avoid it.',
      },
      {
        q: 'Does it work while I am asleep?',
        a: 'Much less well, and there is a specific reason. Aqueous humour production falls naturally at night, so a drug whose only action is suppressing production has less to suppress. A crossover study admitted 20 patients to hospital and measured pressure eight times across 24 hours with masked evaluators. Timolol lowered pressure significantly against baseline at every measurement point except 3 AM. Latanoprost, which works on drainage, lowered pressure at every point including overnight. Dorzolamide, which is weaker than timolol overall, actually beat it at midnight and 3 AM. Twenty patients is a small study, and it is the most careful measurement of this question anyone has published.',
      },
      {
        q: 'Will it stop my glaucoma getting worse?',
        a: 'Lowering pressure does slow progression — that is established at class level rather than for this drug specifically. The Early Manifest Glaucoma Trial randomised 255 patients to laser plus a beta-blocker or no initial treatment and found progression in 45% of treated patients against 62% of controls after a median six years, with pressure reduced by 5.1 mmHg or 25%. The beta-blocker used there was betaxolol, not timolol. The Ocular Hypertension Treatment Study allowed any commercially available topical agent. So the evidence that pressure lowering preserves the optic nerve is good, and the evidence that this particular molecule does it is inherited from the class rather than measured on its own. Neither trial counted blindness.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Nelson WL, Fraunfelder FT, Sills JM, Arrowsmith JB, Kuritsky JN. Adverse respiratory and cardiovascular events attributed to timolol ophthalmic solution, 1978-1985. Am J Ophthalmol 1986;102:606-611',
        identifier: '10.1016/0002-9394(86)90532-5',
        kind: 'doi',
      },
      {
        label:
          'Zimmerman TJ, Kaufman HE. Timolol. A beta-adrenergic blocking agent for the treatment of glaucoma. Arch Ophthalmol 1977;95:601-604',
        identifier: '10.1001/archopht.1977.04450040067008',
        kind: 'doi',
      },
      {
        label:
          'Zimmerman TJ, Kaufman HE. Timolol, dose response and duration of action. Arch Ophthalmol 1977;95:605-607',
        identifier: '10.1001/archopht.1977.04450040071009',
        kind: 'doi',
      },
      {
        label:
          'Orzalesi N, Rossetti L, Invernizzi T, Bottoli A, Autelitano A. Effect of timolol, latanoprost, and dorzolamide on circadian IOP in glaucoma or ocular hypertension. Invest Ophthalmol Vis Sci 2000;41:2566-2573',
        identifier: '10937568',
        kind: 'pmid',
      },
      {
        label:
          'Salminen L. Review: systemic absorption of topically applied ocular drugs in humans. J Ocul Pharmacol 1990;6:243-249',
        identifier: '10.1089/jop.1990.6.243',
        kind: 'doi',
      },
      {
        label:
          'Li T et al. Comparative effectiveness of first-line medications for primary open-angle glaucoma: a systematic review and network meta-analysis. Ophthalmology 2016;123:129-140',
        identifier: '10.1016/j.ophtha.2015.09.005',
        kind: 'doi',
      },
      {
        label:
          'Strahlman E, Tipping R, Vogel R. A double-masked, randomized 1-year study comparing dorzolamide (Trusopt), timolol, and betaxolol. Arch Ophthalmol 1995;113:1009-1016',
        identifier: '10.1001/archopht.1995.01100080061030',
        kind: 'doi',
      },
      {
        label:
          'Silver LH. Clinical efficacy and safety of brinzolamide (Azopt), a new topical carbonic anhydrase inhibitor for primary open-angle glaucoma and ocular hypertension. Am J Ophthalmol 1998;126:400-408',
        identifier: '10.1016/s0002-9394(98)00095-6',
        kind: 'doi',
      },
      {
        label:
          'Drugs@FDA: TIMOPTIC in OCUDOSE (timolol maleate ophthalmic solution), NDA 019463, Bausch and Lomb — Clinical Pharmacology, Warnings and Contraindications. The original TIMOPTIC solution is NDA 018086.',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=019463',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 33624 — timolol structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/33624',
        kind: 'url',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey, generic listing effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 3. Dorzolamide — the first carbonic anhydrase inhibitor that could be put in the eye instead of
  //    swallowed, and the one glaucoma drop with a warning about dissolving the cornea.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'dorzolamide',
    name: 'Dorzolamide',
    tradeName: 'Trusopt',
    sponsor: 'Merck Sharp & Dohme (MSD, a subsidiary of Merck & Co)',
    targetGene: 'CA2 — the human carbonic anhydrase II gene',
    targetProtein: 'Carbonic anhydrase II in the epithelium of the ciliary processes',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1994,
    indication:
      'Treatment of elevated intraocular pressure in patients with ocular hypertension or open-angle glaucoma',
    patientFriendlyIndication:
      'High pressure inside the eye, treated by slowing the chemistry that drives fluid production',
    anatomicalSite:
      'Ciliary process epithelium, where bicarbonate transport drives the secretion of aqueous humour',
    conditionContext: {
      conditionExplainer:
        'Fluid does not simply leak into the eye. It is pumped, and the pump runs on bicarbonate. An enzyme called carbonic anhydrase makes that bicarbonate out of carbon dioxide and water, thousands of times a second. Block the enzyme and the pump slows.',
      whyItMatters:
        'Swallowed carbonic anhydrase inhibitors have worked in glaucoma since the 1950s and are miserable to take: tingling in the hands and feet, fatigue, appetite loss, kidney stones. Dorzolamide was the first version of that chemistry potent and soluble enough to work as a drop, which took Merck three decades of medicinal chemistry.',
      whoTakesThis:
        'Adults with open-angle glaucoma or ocular hypertension, usually as a second or third agent. It is one of the few options in people for whom beta-blockade is contraindicated by asthma or heart block.',
      clinicalGoals:
        'A reduction in millimetres of mercury. Its particular value is overnight, where it keeps working and timolol does not, and its particular liability is the cornea.',
    },
    oneSentenceVerdict:
      'A thienothiopyran sulfonamide that shuts down carbonic anhydrase II in the ciliary epithelium and starves the fluid pump of bicarbonate, lowering pressure 2.49 mmHg at three months across 114 pooled trials — eleventh of fourteen first-line drops — while keeping its effect at 3 AM where timolol loses it, and carrying a label warning for irreversible corneal decompensation after a case series in which seven of nine affected patients needed a corneal transplant.',
    laymanHowItWorks:
      'The tissue behind your iris pumps fluid into the eye, and the pump is driven by a salt the cells have to manufacture on the spot. One enzyme does that manufacturing. Dorzolamide jams that enzyme, so the raw material runs short, the pump slows and pressure falls. The same enzyme sits in the cells that keep the cornea clear, which is why an eye with an already-damaged cornea can be pushed over the edge by it.',
    auditConfidence: 'High Confidence',
    confidenceScore: 74,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.8910 per millilitre, median across the 23 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'The cheapest drug in this batch by acquisition cost, and cheaper per millilitre than timolol despite having been far harder to invent. Trusopt was approved on 9 December 1994 under NDA 020408 and lost exclusivity in the 2000s. Most current prescribing is of the fixed combination with timolol rather than dorzolamide alone, which is why the single-agent listing carries 23 products and the combination carries its own.',
      synthesisComplexity: 'High',
      costSource: {
        label:
          'Nearest published cost-of-production analysis: Hill AM, Barber MJ, Gotham D. Estimated costs of production and potential prices for the WHO Essential Medicines List. BMJ Glob Health 2018;3:e000571. Its methods restrict the analysis to solid oral formulations and exclude eye drops, which is why the synthesis cost field on this page is empty.',
        identifier: '10.1136/bmjgh-2017-000571',
        kind: 'doi',
      },
      priceSource: {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey, generic listing effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    },
    substitutes: {
      summary:
        'Dorzolamide competes on two things and neither is potency: it works overnight, and it does not block beta receptors. Its direct replacement is brinzolamide, which the head-to-head trial found equal in effect and far more comfortable. Its alternative in patients who can take a beta-blocker is timolol, which is stronger by day and weaker by night. Acetazolamide taken by mouth is more powerful than any of them and is the reason topical carbonic anhydrase inhibitors were developed at all.',
      conventionalRx: [
        {
          name: 'Brinzolamide (Azopt)',
          class: 'Topical carbonic anhydrase inhibitor, suspension rather than solution',
          howItCompares:
            'The same mechanism at near-identical potency. In the 572-patient head-to-head trial, brinzolamide twice daily gave -3.8 to -5.7 mmHg against dorzolamide three times daily at -4.3 to -5.9, statistically equivalent. The difference is comfort: ocular burning and stinging occurred in 1.8% of brinzolamide patients twice daily against 16.4% of dorzolamide patients (p=0.000).',
          typicalCost:
            'US$10.08 per millilitre, median across the 9 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: nine times less stinging, twice-daily rather than three times daily. Cons: eleven times the acquisition cost per millilitre, and being a suspension it blurs vision transiently after instillation.',
        },
        {
          name: 'Timolol (Timoptic)',
          class: 'Non-selective beta-adrenergic antagonist',
          howItCompares:
            'Stronger overall — 3.70 mmHg against 2.49 in the pooled analysis — and in the one-year head-to-head trial 25% peak reduction against dorzolamide’s 23%. But in the round-the-clock crossover study dorzolamide beat timolol at midnight and 3 AM.',
          typicalCost:
            'US$1.06 per millilitre, median across the 65 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: stronger by day, twice rather than three times daily, no corneal endothelium warning. Cons: contraindicated in asthma and heart block, and the systemic risk that dorzolamide was reached for to avoid.',
        },
        {
          name: 'Acetazolamide (Diamox), taken by mouth',
          class: 'Systemic carbonic anhydrase inhibitor',
          howItCompares:
            'The original version of this mechanism and considerably more effective at lowering pressure, because it reaches the enzyme at full systemic concentration rather than by corneal diffusion. It is reserved for short-term use and acute situations.',
          typicalCost:
            'Not compared in the CMS listing consulted for this page — the oral and ophthalmic products are separate entries with different units',
          prosAndCons:
            'Pros: much stronger. Cons: paraesthesia, fatigue, appetite and taste disturbance, metabolic acidosis, kidney stones and blood dyscrasias, which is the entire reason a topical version was pursued.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Say if you have had a corneal transplant or any cornea problem',
          action:
            'Report a previous corneal graft, Fuchs endothelial dystrophy, complicated cataract surgery, or any history of corneal swelling, before starting.',
          patientImpact:
            'The label carries a Corneal Endothelium warning. A published multicentre case series documented nine patients who developed overt corneal decompensation after starting dorzolamide, three to twenty weeks in, that did not resolve when the drug was stopped. All nine had prior intraocular surgery, four had previous corneal transplants, and seven subsequently needed a transplant.',
          clinicalPrecaution:
            'Every affected patient in that series had a pre-existing reason for endothelial compromise. That is what makes the warning actionable: the risk is concentrated in an identifiable group rather than spread across everyone.',
        },
        {
          name: 'Report any sulfa drug reaction you have ever had',
          action:
            'Name any past reaction to a sulfonamide antibiotic or diuretic, however long ago and however mild it seemed.',
          patientImpact:
            'Dorzolamide is a sulfonamide and is absorbed systemically despite being applied to the eye. The label states that fatalities have occurred, rarely, from severe sulfonamide reactions including Stevens-Johnson syndrome, toxic epidermal necrolysis, fulminant hepatic necrosis, agranulocytosis and aplastic anaemia.',
          clinicalPrecaution:
            'The label notes that sensitisation can recur when a sulfonamide is given again by any route. A previous reaction to an oral sulfa drug is therefore relevant to an eye drop, which is not intuitive.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCN[C@H]1C[C@@H](S(=O)(=O)C2=C1C=C(S2)S(=O)(=O)N)C',
      chemicalFormula: 'C10H16N2O4S3',
      molecularWeight: '324.40 g/mol',
      targetReceptorAffinity:
        'A high-affinity inhibitor of human carbonic anhydrase II, the isoform that carries the great majority of the catalytic activity in the ciliary processes. The primary sulfonamide group is the zinc-binding warhead: it deprotonates and coordinates the active-site zinc directly, which is why every drug in this family, from acetazolamide onwards, carries an unsubstituted SO2NH2. The thienothiopyran ring and the ethylamino and methyl substituents were the part Merck engineered, to raise potency and water solubility far enough that a topically applied drop could reach an inhibitory concentration in the ciliary body.',
      structureSource: {
        label: 'PubChem CID 5284549 (dorzolamide) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5284549',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'dor-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirmation of the 4S,6S relative and absolute configuration',
          description:
            'Verify both stereocentres on the thiopyran ring. The trans 4S,6S diastereomer is dorzolamide, and the other three stereoisomers differ substantially in potency at carbonic anhydrase II. This is a chirality check, not a chromatographic formality.',
          reagentsAndBuffer:
            'Dorzolamide hydrochloride reference standard, chiral HPLC, 1H NMR in deuterium oxide with coupling constant analysis across the ring, optical rotation',
        },
        {
          id: 'dor-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Sulfonation and stereoselective amination of the thienothiopyran core',
          description:
            'Build the bicyclic thienothiopyran, install the primary sulfonamide at the thiophene 2-position and set the ethylamino group at C4 with the correct configuration. The primary sulfonamide has to survive every subsequent step because it is the zinc-binding group and cannot be protected as an alkyl sulfonamide without losing all activity.',
          dependsOnStepId: 'dor-w1',
          reagentsAndBuffer:
            'Chlorosulfonic acid then ammonia for the sulfonamide, oxidation to the sulfone, stereoselective reductive amination with ethylamine, anhydrous conditions, nitrogen atmosphere',
        },
        {
          id: 'dor-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Diastereomer separation and hydrochloride salt formation',
          description:
            'Separate the cis and trans diastereomers and convert the correct one to the hydrochloride. The salt is what makes the compound soluble enough for a 2% aqueous drop, and the solubility problem is the reason this class took thirty years to move from tablet to drop.',
          dependsOnStepId: 'dor-w2',
          reagentsAndBuffer:
            'Preparative chromatography or fractional crystallisation, hydrogen chloride in alcoholic solvent, recrystallisation, residual solvent analysis by headspace gas chromatography',
        },
        {
          id: 'dor-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Corneal permeation and red cell partitioning',
          description:
            'Measure permeation across excised cornea, and separately measure binding to carbonic anhydrase in erythrocytes. Red cells accumulate the drug and its N-desethyl metabolite for months, which is the reason its systemic pharmacokinetics are unusual and the reason systemic sulfonamide reactions are possible from a drop.',
          dependsOnStepId: 'dor-w3',
          reagentsAndBuffer:
            'Excised cornea in a diffusion cell, balanced salt solution at 34 degrees Celsius, whole blood incubation, LC-MS/MS quantification of dorzolamide and N-desethyldorzolamide',
        },
        {
          id: 'dor-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Carbonic anhydrase II inhibition with a CA-I and CA-IV counter-screen',
          description:
            'Measure inhibition of recombinant carbonic anhydrase II by stopped-flow carbon dioxide hydration, then repeat against carbonic anhydrase I and the membrane-anchored CA-IV. CA-IV is expressed on the corneal endothelium, which is the isoform relevant to the corneal decompensation warning, so an assay that reports only CA-II potency measures the benefit and not the hazard.',
          dependsOnStepId: 'dor-w4',
          reagentsAndBuffer:
            'Recombinant human CA-I, CA-II and CA-IV, stopped-flow apparatus with pH indicator, carbon dioxide-saturated buffer, acetazolamide as reference inhibitor',
        },
      ],
    },
    keyAudits: [
      {
        id: 'dor-a1',
        category: 'measured',
        title: 'Comparable to betaxolol and behind timolol at one year',
        laymanSummary:
          'Five hundred and twenty-three patients at 34 sites took dorzolamide, timolol or betaxolol for a year. Dorzolamide sat between the two beta-blockers, closer to the weaker one, and did not cause the electrolyte problems that swallowed versions of the same drug do.',
        technicalDetails:
          'The International Dorzolamide Study Group ran a double-masked, randomised, parallel comparison in 523 patients aged 17 to 85 with open-angle glaucoma or ocular hypertension at 34 international sites, after washout of prior medication. At one year, mean percent reduction in intraocular pressure at peak was approximately 23% for dorzolamide 2% three times daily, 25% for timolol 0.5% twice daily and 21% for betaxolol 0.5% twice daily. At afternoon trough the figures were 17%, 20% and 15%. The authors concluded that dorzolamide’s efficacy is comparable with betaxolol and that long-term use was not associated with clinically meaningful electrolyte disturbances or the systemic effects seen with oral carbonic anhydrase inhibitors.',
        evidenceSource: 'Strahlman E, Tipping R, Vogel R. Arch Ophthalmol 1995;113:1009-1016',
        doi: '10.1001/archopht.1995.01100080061030',
        measuredMetric:
          'Percent intraocular pressure reduction at peak and trough at one year, three-arm comparison',
        auditFlag: 'verified',
      },
      {
        id: 'dor-a2',
        category: 'measured',
        title: 'It keeps working at 3 AM, which timolol does not',
        laymanSummary:
          'In a study that measured pressure every three hours around the clock, dorzolamide is weaker than timolol on average but beats it overnight — at midnight and at three in the morning, timolol’s two worst hours.',
        technicalDetails:
          'In the 20-patient randomised crossover study with masked evaluators and inpatient 24-hour tonometry, all three study drugs significantly reduced pressure against baseline at every time point except timolol at 3 AM. Dorzolamide performed better than timolol at midnight and at 3 AM (P = 0.05 at both), while timolol was better than dorzolamide at 3 PM (P = 0.05). Latanoprost was better than dorzolamide at 9 AM, noon, 3 PM and 6 PM. The mechanistic reading is that aqueous secretion falls overnight, so a beta-blocker suppressing sympathetic drive has less to suppress, while carbonic anhydrase inhibition targets the bicarbonate transport that continues.',
        evidenceSource:
          'Orzalesi N et al., Invest Ophthalmol Vis Sci 2000;41:2566-2573 (PMID 10937568)',
        measuredMetric:
          'Intraocular pressure at eight times across 24 hours, dorzolamide against timolol and latanoprost',
        auditFlag: 'verified',
      },
      {
        id: 'dor-a3',
        category: 'failed',
        title: 'Nine corneas that did not recover when the drug was stopped',
        laymanSummary:
          'Nine patients, all of whom had already had eye surgery, developed clouding of the cornea after starting dorzolamide. Stopping the drug did not fix it. Seven of them went on to need a corneal transplant.',
        technicalDetails:
          'A multicentre chart review documented nine eyes of nine patients who developed overt corneal decompensation after starting topical dorzolamide, at three to twenty weeks of therapy (mean 7.8 weeks), which did not resolve on stopping the drug. All nine had undergone intraocular surgery: eight had cataract surgery, three were aphakic, three had posterior chamber lenses, two had anterior chamber lenses plus trabeculectomies, four had previous penetrating keratoplasties each complicated by a treated allograft rejection episode, and two had asymptomatic Fuchs endothelial dystrophy. Seven have since undergone successful penetrating keratoplasty. The proposed mechanism is inhibition of carbonic anhydrase in the corneal endothelium, whose pump maintains stromal deturgescence. The FDA label carries a Corneal Endothelium warning as section 5.3. This is a case series with no denominator: it shows the harm is real and cannot state how often it occurs.',
        evidenceSource: 'Konowal A et al., Am J Ophthalmol 1999;127:403-406',
        doi: '10.1016/s0002-9394(98)00438-3',
        measuredMetric:
          'Irreversible corneal decompensation after starting dorzolamide, nine cases with endothelial compromise',
        auditFlag: 'caution',
      },
      {
        id: 'dor-a4',
        category: 'failed',
        title: 'One patient in six finds it painful to instil',
        laymanSummary:
          'In the head-to-head trial against brinzolamide, 16.4% of dorzolamide patients reported burning and stinging on putting the drop in. On brinzolamide it was under 2%. That is a nine-fold difference in a side effect people stop the drug for.',
        technicalDetails:
          'In the 572-patient multicentre double-masked comparison, the incidence of ocular discomfort on instillation was 16.4% with dorzolamide 2% three times daily against 1.8% with brinzolamide twice daily and 3.0% with brinzolamide three times daily (P = .000 for the comparison). The mechanism is the formulation, not the molecule: dorzolamide is a solution buffered to roughly pH 5.6 because that is where the drug is soluble and stable, and brinzolamide is a near-neutral suspension. The trade is direct — brinzolamide’s comfort is bought by suspending a less soluble compound, and the suspension transiently blurs vision after instillation.',
        evidenceSource: 'Silver LH. Am J Ophthalmol 1998;126:400-408',
        doi: '10.1016/s0002-9394(98)00095-6',
        measuredMetric:
          'Incidence of ocular burning and stinging on instillation, dorzolamide against brinzolamide',
        auditFlag: 'verified',
      },
      {
        id: 'dor-a5',
        category: 'inferred',
        title: 'The ocular blood flow claim was never converted into a vision outcome',
        laymanSummary:
          'This drug is often said to protect the optic nerve by improving blood flow to the back of the eye, on top of lowering pressure. Nobody has shown that it preserves vision better than an equal drop in pressure achieved another way.',
        technicalDetails:
          'A prospective, randomised, double-blind crossover study measured intraocular pressure, blood pressure, ocular perfusion pressure and retrobulbar haemodynamics by colour Doppler imaging in 15 patients with open-angle glaucoma before and one month after treatment with brimonidine/timolol and dorzolamide/timolol. Intraocular pressure, blood pressure, ocular perfusion pressure and retrobulbar blood flow velocities did not differ significantly between the two combinations. Fifteen patients is a small study and its null result is weak evidence of no effect. The point stands regardless: the neuroprotection-through-perfusion argument for this drug has produced surrogate measurements of blood velocity and no randomised comparison with a visual field or optic disc endpoint.',
        evidenceSource: 'Siesky B et al., Adv Ther 2012;29:53-63',
        doi: '10.1007/s12325-011-0092-3',
        inferredClaim:
          'That dorzolamide protects the optic nerve by improving ocular perfusion independently of pressure lowering — an argument built on Doppler velocity measurements, never tested against a vision endpoint',
        auditFlag: 'contested',
      },
      {
        id: 'dor-a6',
        category: 'conclusion_shift',
        title: 'A drop is systemic: the sulfonamide warnings came with it',
        laymanSummary:
          'Putting a sulfa drug in the eye instead of swallowing it removed the tingling, fatigue and kidney stones. It did not remove the rare, severe sulfonamide reactions, and the label says so.',
        technicalDetails:
          'The premise of the topical carbonic anhydrase inhibitor programme was that local delivery would separate the pressure-lowering effect from the systemic toxicity of oral acetazolamide, and on the common toxicities it worked: the one-year trial found no clinically meaningful electrolyte disturbance. The label states the limit of that separation directly. Dorzolamide is a sulfonamide and, although administered topically, is absorbed systemically, so the same types of adverse reactions attributable to sulfonamides may occur — and fatalities have occurred, rarely, from Stevens-Johnson syndrome, toxic epidermal necrolysis, fulminant hepatic necrosis, agranulocytosis, aplastic anaemia and other blood dyscrasias. The label further notes that sensitisation may recur when a sulfonamide is readministered by any route. Dorzolamide also accumulates in erythrocytes by binding carbonic anhydrase there, with a washout measured in months rather than hours.',
        evidenceSource:
          'Dorzolamide hydrochloride ophthalmic solution US prescribing information, Warnings and Precautions 5.1 Sulfonamide Hypersensitivity and 5.3 Corneal Endothelium',
        inferredClaim:
          'That topical delivery of a sulfonamide avoids systemic sulfonamide risk — true for the common dose-related toxicities and explicitly not true for the severe idiosyncratic ones',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'An acidic drop that most people can feel',
        laymanDesc:
          'The drop is buffered to be acidic, because that is the only way to keep enough of the drug dissolved. That is why one person in six finds it stings.',
        molecularDetail:
          'Dorzolamide hydrochloride 2% is formulated as an aqueous solution at roughly pH 5.6, the range in which the compound is both soluble and chemically stable. The head-to-head trial recorded burning and stinging on instillation in 16.4% of dorzolamide patients against 1.8% on the near-neutral brinzolamide suspension.',
        iconName: 'Droplet',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It crosses the cornea into the front chamber',
        laymanDesc:
          'The drug passes through the clear front of the eye and reaches the tissue behind the iris that makes the fluid. A fraction also enters the bloodstream, where it sticks to red blood cells for months.',
        molecularDetail:
          'Dorzolamide partitions across the cornea into the aqueous humour and reaches the ciliary process epithelium. Systemically absorbed drug binds carbonic anhydrase in erythrocytes, and both dorzolamide and its N-desethyl metabolite accumulate there, producing a red cell washout measured in months. That accumulation is why a topically applied sulfonamide can still produce a systemic sulfonamide reaction.',
        iconName: 'Eye',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'A sulfonamide group grabs the zinc atom in the enzyme',
        laymanDesc:
          'The enzyme it targets has a single zinc atom at its heart, and that is where all the chemistry happens. One end of the drug molecule locks onto the zinc and shuts the site down.',
        molecularDetail:
          'The unsubstituted primary sulfonamide deprotonates and coordinates the catalytic zinc ion in the active site of carbonic anhydrase II, displacing the zinc-bound hydroxide that performs catalysis. This binding mode is shared by every drug in the class from acetazolamide onwards, which is why the SO2NH2 group cannot be modified. The rest of the molecule, the thienothiopyran scaffold, is what Merck engineered for potency and aqueous solubility.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The pump runs out of bicarbonate',
        laymanDesc:
          'Without the enzyme, the cells cannot make the salt that drives fluid into the eye. Sodium and water follow the salt, so when the salt stops moving, so does the fluid.',
        molecularDetail:
          'Carbonic anhydrase II catalyses the hydration of carbon dioxide to bicarbonate and a proton in the ciliary epithelium. Inhibition slows bicarbonate formation, which reduces the sodium and fluid transport coupled to it, and therefore the rate of aqueous humour secretion. The label describes the mechanism in exactly these terms and uses the word "presumably" for the coupling step.',
        iconName: 'Beaker',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Pressure falls, and unusually it falls at night too',
        laymanDesc:
          'Pressure drops by about two and a half millimetres of mercury. Unlike the beta-blockers, the effect holds through the small hours, because it does not depend on nerve signals that quieten during sleep.',
        molecularDetail:
          'Pooled reduction is 2.49 mmHg (95% credible interval 1.85 to 3.13) at three months, eleventh of fourteen first-line agents. In 24-hour tonometry dorzolamide significantly reduced pressure against baseline at all eight measurement times and outperformed timolol at midnight and 3 AM. Bicarbonate-dependent secretion does not have the same circadian collapse as sympathetically driven secretion.',
        iconName: 'Moon',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'The same enzyme keeps the cornea clear',
        laymanDesc:
          'The cornea stays transparent because a layer of cells on its inner surface pumps water out of it continuously. That pump uses the same enzyme. In an eye whose cornea is already damaged, blocking it can tip the balance.',
        molecularDetail:
          'The corneal endothelium maintains stromal deturgescence through a bicarbonate-dependent pump involving membrane-anchored carbonic anhydrase. In a series of nine patients with pre-existing endothelial compromise — previous grafts, aphakia, anterior chamber lenses, Fuchs dystrophy — overt corneal decompensation developed 3 to 20 weeks after starting dorzolamide and did not reverse on stopping. Seven required penetrating keratoplasty. The label carries this as Warnings and Precautions 5.3.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'International Dorzolamide Study (Strahlman 1995)',
        phase: 'Double-masked, randomised, parallel comparison at 34 international sites',
        sampleSize: 523,
        primaryEndpoint:
          'Safety profile and intraocular pressure reduction at up to one year, dorzolamide against timolol and betaxolol',
        endpointMet: true,
        statisticalPValue:
          'Peak reduction approximately 23% dorzolamide, 25% timolol, 21% betaxolol; trough 17%, 20%, 15%. Reported descriptively rather than with a p-value for the primary comparison.',
        unreportedAdverseSignals:
          'Corneal decompensation in patients with pre-existing endothelial compromise was not identified here. It emerged from a case series four years after approval and is now a labelled warning.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Brinzolamide Primary Therapy Study (Silver 1998)',
        phase: 'Multicentre, double-masked, prospective, parallel-group',
        sampleSize: 572,
        primaryEndpoint:
          'Diurnally corrected intraocular pressure reduction at peak and trough over 3 months, brinzolamide against dorzolamide and timolol',
        endpointMet: true,
        statisticalPValue:
          'Dorzolamide three times daily -4.3 to -5.9 mmHg, statistically equivalent to brinzolamide (confidence limit ≤1.5 mmHg); ocular discomfort 16.4% against 1.8%, P = .000',
        unreportedAdverseSignals:
          'Sponsored by Alcon, the manufacturer of the comparator that won on tolerability. The efficacy finding is equivalence, so the trial’s conclusion rests entirely on the side effect it was best placed to detect.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Orzalesi circadian crossover (2000)',
        phase: 'Randomised crossover, masked evaluators, in-hospital 24-hour tonometry',
        sampleSize: 20,
        primaryEndpoint:
          'Around-the-clock intraocular pressure reduction, dorzolamide against timolol and latanoprost',
        endpointMet: true,
        statisticalPValue:
          'Significant reduction against baseline at all eight measurement times; superior to timolol at midnight and 3 AM (P = 0.05 both)',
        unreportedAdverseSignals:
          'Twenty patients across three one-month treatment periods. Small, unreplicated at this level of measurement detail, and the source of a claim now made routinely about the whole class.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Siesky retrobulbar haemodynamics crossover (2012)',
        phase: 'Prospective, randomised, double-blind crossover',
        sampleSize: 15,
        primaryEndpoint:
          'Ocular perfusion pressure and retrobulbar blood flow velocities after one month, dorzolamide/timolol against brimonidine/timolol',
        endpointMet: false,
        statisticalPValue:
          'No significant difference between combinations in intraocular pressure, blood pressure, ocular perfusion pressure or retrobulbar flow velocities',
        unreportedAdverseSignals:
          'Fifteen patients with already well-controlled pressure. A null result in a sample this size is weak evidence of no effect, and it is quoted here only because it is the direct test of a claim usually made without any test at all.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Mean intraocular pressure reduction of 2.49 mmHg (95% credible interval 1.85 to 3.13) at three months, pooled across 114 randomised trials in 20,275 participants',
        'Approximately 23% peak and 17% trough reduction at one year in 523 patients, against timolol’s 25% and 20%',
        'Statistically equivalent to brinzolamide on pressure in 572 patients, with ocular discomfort in 16.4% against 1.8% (P = .000)',
        'Superior to timolol at midnight and 3 AM in masked 24-hour tonometry in 20 patients',
      ],
      unsupportedInferences: [
        'That dorzolamide protects the optic nerve through improved ocular perfusion — measured as blood velocity, never against a vision endpoint',
        'That topical delivery of a sulfonamide removes systemic sulfonamide risk; the label states the opposite for the severe reactions',
        'That the case series of nine corneal decompensations gives a rate — it has no denominator and cannot',
        'That overnight superiority to timolol translates into better preserved visual fields, which no trial has compared',
      ],
      whatFailedInitially: [
        'Corneal decompensation in eyes with compromised endothelium was not seen in the 523-patient registration programme and was described four years after approval',
        'The formulation stings: 16.4% of patients reported burning on instillation, which is the reason a competitor built on the same mechanism took the market',
        'Three-times-daily dosing was required for monotherapy, against twice daily for the beta-blockers it was competing with',
      ],
      realWorldOutcome: [
        'The first topically active carbonic anhydrase inhibitor, approved 9 December 1994 under NDA 020408, ending four decades in which this mechanism required a tablet',
        'Now used mostly as the second component of a fixed combination with timolol rather than alone',
        'The cheapest drug in this batch at a median United States acquisition cost of US$0.89 per millilitre',
        'Retained specifically for patients in whom beta-blockade is contraindicated, and for overnight pressure control',
      ],
    },
    deliverySystem: {
      type: 'Topical ophthalmic solution 2%, instilled three times daily as monotherapy',
      description:
        'An aqueous solution buffered to roughly pH 5.6, which is where the compound is soluble and stable and also why it stings. It crosses the cornea to the ciliary body, and the systemically absorbed fraction binds carbonic anhydrase in red blood cells, where it accumulates with a washout measured in months rather than hours.',
      safetyProfile:
        'Labelled warnings for sulfonamide hypersensitivity, bacterial keratitis from contaminated multi-dose containers, corneal endothelium, allergic reactions and acute angle-closure glaucoma. The sulfonamide warning states that fatalities have occurred rarely from Stevens-Johnson syndrome, toxic epidermal necrolysis, fulminant hepatic necrosis, agranulocytosis, aplastic anaemia and other blood dyscrasias, and that sensitisation may recur on readministration by any route. Ocular burning and stinging in roughly one patient in six. Bitter taste after instillation, from nasolacrimal drainage. Superficial punctate keratitis and ocular allergy. Unlike timolol it does not block beta receptors and is therefore usable in asthma and heart block.',
    },
    commonQuestions: [
      {
        q: 'Why does it sting so much?',
        a: 'Because of the acidity, not the drug. Dorzolamide will only stay dissolved and stable in a solution buffered to around pH 5.6, and the ocular surface objects to that. In the head-to-head trial against brinzolamide, 16.4% of dorzolamide patients reported burning and stinging on instillation against 1.8% on brinzolamide. Brinzolamide gets away with a near-neutral pH by being formulated as a suspension of a less soluble compound rather than a solution — which is why it briefly blurs vision instead. The two drugs lower pressure by the same amount, so the choice between them is almost entirely about which trade-off you prefer.',
      },
      {
        q: 'I have had a corneal transplant. Is this drug safe for me?',
        a: 'That is exactly the group the label warns about. The cornea stays clear because a single layer of cells on its inner surface pumps water out of it continuously, and that pump uses the same enzyme dorzolamide blocks. A published series described nine patients who developed corneal clouding three to twenty weeks after starting the drug, which did not resolve when it was stopped, and seven of them needed a corneal transplant afterwards. Every one of the nine had a prior reason for endothelial compromise: previous grafts, cataract surgery, anterior chamber lenses, or Fuchs dystrophy. It is a case series, so nobody can tell you the odds. What it does tell you is that this is a question to raise before the first drop rather than after.',
        auditNote:
          'Nine cases collected across multiple centres is the weakest study design that can still establish causation, and it did so here because the timing, the mechanism and the irreversibility all lined up.',
      },
      {
        q: 'Can I use it if I am allergic to sulfa drugs?',
        a: 'Ask, and say so explicitly, because the connection is not obvious. Dorzolamide is a sulfonamide — the same chemical family as the sulfa antibiotics and several diuretics — and although it goes in the eye, it is absorbed into the bloodstream. The label states plainly that the same types of reactions attributable to sulfonamides may occur, that fatalities have occurred rarely from Stevens-Johnson syndrome, toxic epidermal necrolysis, hepatic necrosis and blood disorders, and that sensitisation may recur when a sulfonamide is given again by any route. These reactions are rare and they are not dose-dependent, which is why a small topical dose does not make them impossible.',
      },
      {
        q: 'Is it weaker than the other drops?',
        a: 'Yes, and knowing where it is weaker matters more than the average. Pooled across 114 trials it lowers pressure 2.49 mmHg against latanoprost’s 4.85 and timolol’s 3.70, which puts it eleventh of fourteen. But averages hide the shape of the day. In the one study that measured pressure eight times across 24 hours with masked evaluators, dorzolamide worked at every hour tested, and beat timolol at midnight and 3 AM — the hours when a beta-blocker has least to suppress because aqueous production has already fallen naturally. If nocturnal pressure is the concern, the ranking by daytime average is the wrong ranking.',
      },
      {
        q: 'Why did it take so long to make a version you could put in the eye?',
        a: 'Because the chemistry and the pharmacokinetics pull in opposite directions. Acetazolamide has worked in glaucoma since the 1950s, but to inhibit enough of the enzyme in the ciliary body from a drop, a molecule has to be both very potent and soluble enough to be delivered at a workable concentration through the cornea — and the group that binds the enzyme, an unsubstituted sulfonamide, is fixed and cannot be tuned. Merck spent decades building the rest of the molecule around that fixed point. Dorzolamide arrived in 1994. Its own successor, brinzolamide, arrived four years later and solved the comfort problem rather than the potency one.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Strahlman E, Tipping R, Vogel R. A double-masked, randomized 1-year study comparing dorzolamide (Trusopt), timolol, and betaxolol. Arch Ophthalmol 1995;113:1009-1016',
        identifier: '10.1001/archopht.1995.01100080061030',
        kind: 'doi',
      },
      {
        label:
          'Konowal A et al. Irreversible corneal decompensation in patients treated with topical dorzolamide. Am J Ophthalmol 1999;127:403-406',
        identifier: '10.1016/s0002-9394(98)00438-3',
        kind: 'doi',
      },
      {
        label:
          'Silver LH. Clinical efficacy and safety of brinzolamide (Azopt), a new topical carbonic anhydrase inhibitor for primary open-angle glaucoma and ocular hypertension. Am J Ophthalmol 1998;126:400-408',
        identifier: '10.1016/s0002-9394(98)00095-6',
        kind: 'doi',
      },
      {
        label:
          'Orzalesi N, Rossetti L, Invernizzi T, Bottoli A, Autelitano A. Effect of timolol, latanoprost, and dorzolamide on circadian IOP in glaucoma or ocular hypertension. Invest Ophthalmol Vis Sci 2000;41:2566-2573',
        identifier: '10937568',
        kind: 'pmid',
      },
      {
        label:
          'Siesky B et al. Short-term effects of brimonidine/timolol and dorzolamide/timolol on ocular perfusion pressure and blood flow in glaucoma. Adv Ther 2012;29:53-63',
        identifier: '10.1007/s12325-011-0092-3',
        kind: 'doi',
      },
      {
        label:
          'Li T et al. Comparative effectiveness of first-line medications for primary open-angle glaucoma: a systematic review and network meta-analysis. Ophthalmology 2016;123:129-140',
        identifier: '10.1016/j.ophtha.2015.09.005',
        kind: 'doi',
      },
      {
        label:
          'Drugs@FDA: TRUSOPT (dorzolamide hydrochloride ophthalmic solution), NDA 020408, MSD Sub Merck — original approval 9 December 1994',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020408',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 5284549 — dorzolamide structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5284549',
        kind: 'url',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey, generic listing effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 4. Brinzolamide — the same mechanism as dorzolamide, the same effect on pressure, nine times
  //    less stinging, and eleven times the acquisition cost per millilitre.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'brinzolamide',
    name: 'Brinzolamide',
    tradeName: 'Azopt',
    sponsor: 'Sandoz — developed and originally marketed by Alcon Laboratories',
    targetGene: 'CA2 — the human carbonic anhydrase II gene',
    targetProtein: 'Carbonic anhydrase II in the epithelium of the ciliary processes',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1998,
    indication:
      'Treatment of elevated intraocular pressure in patients with ocular hypertension or open-angle glaucoma',
    patientFriendlyIndication:
      'High pressure inside the eye, treated with a drop that does not sting',
    anatomicalSite:
      'Ciliary process epithelium, reached as suspended drug particles that dissolve slowly on the ocular surface',
    conditionContext: {
      conditionExplainer:
        'The eye pumps fluid in continuously, driven by bicarbonate that an enzyme manufactures inside the ciliary cells. Blocking that enzyme slows the pump. Brinzolamide does the same job as dorzolamide by the same route.',
      whyItMatters:
        'A glaucoma drop is taken every day for decades. A drug that works but is unpleasant to instil is a drug people stop taking. Brinzolamide exists because dorzolamide stings, and it is the clearest example in this batch of a molecule redesigned for tolerability rather than potency.',
      whoTakesThis:
        'Adults with open-angle glaucoma or ocular hypertension, usually as an added agent. Like dorzolamide it is one of the options where beta-blockade is contraindicated.',
      clinicalGoals:
        'A reduction in millimetres of mercury equivalent to dorzolamide’s, obtained without the burning. The endpoint the drug was actually developed against was comfort.',
    },
    oneSentenceVerdict:
      'A thienothiazine sulfonamide that inhibits the same carbonic anhydrase II as dorzolamide and lowers pressure by an equivalent amount — 2.42 mmHg at three months across 114 pooled trials, twelfth of fourteen first-line drops — while causing burning on instillation in 1.8% of patients against dorzolamide’s 16.4%, at eleven times dorzolamide’s acquisition cost per millilitre and with blurred vision in 5% to 10% instead.',
    laymanHowItWorks:
      'It jams the same enzyme dorzolamide jams, in the same tissue, so less fluid is pumped into the eye and pressure falls. The difference is how it is delivered. Rather than dissolving the drug in acid to keep it in solution, brinzolamide is supplied as fine particles floating in a near-neutral liquid. The eye does not object to the acidity because there is none. The particles do briefly blur vision as they dissolve.',
    auditConfidence: 'High Confidence',
    confidenceScore: 72,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$10.08 per millilitre, median across the 9 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Brinzolamide is generic and still costs eleven times dorzolamide per millilitre in the same acquisition-cost survey on the same date — US$10.08 against US$0.8910 — with nine listed products against twenty-three. The two drugs inhibit the same enzyme in the same tissue and lower pressure by statistically equivalent amounts. What the price difference tracks is the number of manufacturers, not the pharmacology. Azopt was approved on 1 April 1998 under NDA 020816.',
      synthesisComplexity: 'High',
      costSource: {
        label:
          'Nearest published cost-of-production analysis: Hill AM, Barber MJ, Gotham D. Estimated costs of production and potential prices for the WHO Essential Medicines List. BMJ Glob Health 2018;3:e000571. Its methods restrict the analysis to solid oral formulations and exclude eye drops, which is why the synthesis cost field on this page is empty.',
        identifier: '10.1136/bmjgh-2017-000571',
        kind: 'doi',
      },
      priceSource: {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey, generic listing effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    },
    substitutes: {
      summary:
        'Brinzolamide’s only genuine competitor is dorzolamide, and the head-to-head trial that established brinzolamide found the two statistically equivalent on the thing they are prescribed for. The choice is therefore between stinging and blurring, at an eleven-fold price difference in the wrong direction. Against the rest of the field, both carbonic anhydrase inhibitors are near the bottom of the pooled efficacy ranking.',
      conventionalRx: [
        {
          name: 'Dorzolamide (Trusopt)',
          class: 'Topical carbonic anhydrase inhibitor, solution rather than suspension',
          howItCompares:
            'The same target and, in the 572-patient registration trial, statistically equivalent pressure lowering with a confidence limit of 1.5 mmHg or less. The pooled network analysis separates them by 0.07 mmHg, which is noise. Dorzolamide stings in 16.4% of patients and brinzolamide in 1.8%.',
          typicalCost:
            'US$0.8910 per millilitre, median across the 23 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: one eleventh the acquisition cost, no transient blurring, a clear solution needing no shaking. Cons: stings on instillation in roughly one patient in six.',
        },
        {
          name: 'Timolol (Timoptic)',
          class: 'Non-selective beta-adrenergic antagonist',
          howItCompares:
            'Stronger by day — 3.70 mmHg against brinzolamide’s 2.42 in the pooled analysis, and -5.2 to -6.3 mmHg against brinzolamide’s -3.8 to -5.7 in the head-to-head trial — and twice daily rather than three times.',
          typicalCost:
            'US$1.06 per millilitre, median across the 65 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: stronger, cheaper, fewer daily doses. Cons: contraindicated in asthma, chronic obstructive pulmonary disease, bradycardia and heart block, none of which apply to brinzolamide.',
        },
        {
          name: 'Brinzolamide/brimonidine fixed combination (Simbrinza)',
          class: 'Carbonic anhydrase inhibitor plus alpha-2 adrenergic agonist in one bottle',
          howItCompares:
            'Combines two agents that both reduce aqueous production, in a single suspension. The clinical case for it is one bottle instead of two rather than an effect neither component has alone.',
          typicalCost:
            'Not separately listed in the single-agent CMS entry consulted for this page — the fixed combination is its own product line',
          prosAndCons:
            'Pros: fewer bottles, and neither component blocks beta receptors. Cons: brimonidine carries its own ocular allergy rate and causes drowsiness, and a fixed ratio removes the ability to adjust one component.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Shake the bottle every single time',
          action:
            'Shake well immediately before each drop, as the label instructs, rather than at the start of the day.',
          patientImpact:
            'Brinzolamide is a suspension, not a solution. The drug is present as solid particles that settle. An unshaken bottle delivers a drop that is mostly vehicle at the top of the bottle and increasingly concentrated at the bottom, so the dose varies with how long it has been standing.',
          clinicalPrecaution:
            'This is the one instruction that separates this drug from every other glaucoma drop in this batch, and it is the reason the label carries "Shake well before use" in its dosage section rather than in a footnote.',
        },
        {
          name: 'Report any sulfa drug reaction you have ever had',
          action:
            'Name any past reaction to a sulfonamide antibiotic or diuretic before starting.',
          patientImpact:
            'Brinzolamide is a sulfonamide and is absorbed systemically despite being applied to the eye. The label states that fatalities have occurred, rarely, from severe sulfonamide reactions including Stevens-Johnson syndrome, toxic epidermal necrolysis, fulminant hepatic necrosis, agranulocytosis and aplastic anaemia.',
          clinicalPrecaution:
            'The label adds that sensitisation may recur when a sulfonamide is readministered by any route, and directs immediate discontinuation if signs of a serious reaction appear.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCN[C@H]1CN(S(=O)(=O)C2=C1C=C(S2)S(=O)(=O)N)CCCOC',
      chemicalFormula: 'C12H21N3O5S3',
      molecularWeight: '383.50 g/mol',
      targetReceptorAffinity:
        'A high-affinity inhibitor of human carbonic anhydrase II, binding the catalytic zinc through its unsubstituted primary sulfonamide in the same manner as dorzolamide and acetazolamide. The structural difference from dorzolamide is a ring nitrogen carrying a methoxypropyl chain in place of a ring carbon carrying a methyl group, which lowers aqueous solubility enough that the product must be formulated as a suspension. That formulation choice is what removes the acidic buffer and, with it, the stinging.',
      structureSource: {
        label: 'PubChem CID 68844 (brinzolamide) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/68844',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'brz-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Configuration at C4 and integrity of the primary sulfonamide',
          description:
            'Confirm the single stereocentre bearing the ethylamino group and verify that the thiophene sulfonamide is unsubstituted. Any alkylation of that nitrogen abolishes zinc binding and therefore all activity, so this is a go or no-go check rather than a specification limit.',
          reagentsAndBuffer:
            'Brinzolamide reference standard, chiral HPLC, 1H and 13C NMR in DMSO-d6, infrared confirmation of the primary sulfonamide N-H stretch',
        },
        {
          id: 'brz-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Construction of the thienothiazine ring and N-alkylation with the methoxypropyl chain',
          description:
            'Build the bicyclic thieno-thiazine, oxidise the ring sulfur to the sulfone, install the primary sulfonamide on the thiophene and alkylate the ring nitrogen with a 3-methoxypropyl group. The methoxypropyl chain is the whole design difference from dorzolamide and it is installed last, on the nitrogen dorzolamide does not have.',
          dependsOnStepId: 'brz-w1',
          reagentsAndBuffer:
            '3-methoxypropyl halide, base, oxidising agent for the sulfone, chlorosulfonic acid then ammonia for the sulfonamide, anhydrous aprotic solvent, nitrogen atmosphere',
        },
        {
          id: 'brz-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Enantiomer resolution and particle size control',
          description:
            'Resolve the enantiomers and then mill the isolated solid to a controlled particle size distribution. Particle size is a potency-determining specification for a suspension in a way it never is for a solution: it sets the dissolution rate on the ocular surface, the duration of blurring, and how fast the bottle settles between shakes.',
          dependsOnStepId: 'brz-w2',
          reagentsAndBuffer:
            'Chiral resolution by preparative chromatography or diastereomeric salt formation, wet or jet milling, laser diffraction particle sizing, sedimentation rate testing in the final vehicle',
        },
        {
          id: 'brz-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Dissolution and corneal permeation from the suspended solid',
          description:
            'Measure how much drug dissolves from the suspended particles in simulated tear fluid, then measure permeation of the dissolved fraction across excised cornea. A suspension has an extra rate-limiting step no solution has, and skipping the dissolution measurement means measuring the wrong bottleneck.',
          dependsOnStepId: 'brz-w3',
          reagentsAndBuffer:
            'Simulated tear fluid at 34 degrees Celsius, excised cornea in a diffusion cell, timed sampling, LC-MS/MS quantification of brinzolamide and its N-desethyl metabolite',
        },
        {
          id: 'brz-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Carbonic anhydrase II inhibition with erythrocyte binding measurement',
          description:
            'Measure inhibition of recombinant carbonic anhydrase II by stopped-flow carbon dioxide hydration, and separately measure red cell binding of both parent and N-desethyl metabolite. The metabolite is itself an active inhibitor and accumulates in erythrocytes, so an assay of parent drug alone understates the systemic sulfonamide burden the label warns about.',
          dependsOnStepId: 'brz-w4',
          reagentsAndBuffer:
            'Recombinant human CA-I and CA-II, stopped-flow apparatus with pH indicator, carbon dioxide-saturated buffer, whole blood incubation, acetazolamide as reference inhibitor',
        },
      ],
    },
    keyAudits: [
      {
        id: 'brz-a1',
        category: 'measured',
        title: 'Statistically equivalent to dorzolamide, and to itself at two doses',
        laymanSummary:
          'The trial that got this drug approved put 572 patients on brinzolamide twice daily, brinzolamide three times daily, dorzolamide three times daily or timolol. The three carbonic anhydrase arms were indistinguishable from one another.',
        technicalDetails:
          'In a multicentre, double-masked, prospective, parallel-group study of 572 patients with primary open-angle glaucoma or ocular hypertension, mean intraocular pressure changes with brinzolamide 1.0% twice daily (-3.8 to -5.7 mmHg) and three times daily (-4.2 to -5.6 mmHg) were statistically equivalent to each other and to dorzolamide 2.0% three times daily (-4.3 to -5.9 mmHg), with an equivalence confidence limit of 1.5 mmHg or less. Timolol 0.5% twice daily ranged from -5.2 to -6.3 mmHg. Clinically relevant pressure change, defined as a reduction of at least 5 mmHg or a pressure of 21 mmHg or less, was reached in up to 75.7% of patients on brinzolamide twice daily and 80.1% three times daily. The primary endpoint was diurnally corrected pressure reduction at peak and trough over 3 months.',
        evidenceSource: 'Silver LH. Am J Ophthalmol 1998;126:400-408',
        doi: '10.1016/s0002-9394(98)00095-6',
        measuredMetric:
          'Diurnally corrected intraocular pressure reduction at peak and trough over 3 months',
        auditFlag: 'verified',
      },
      {
        id: 'brz-a2',
        category: 'measured',
        title: 'Nine times less stinging than the drug it replaced',
        laymanSummary:
          'This is the number the drug exists for. Fewer than two patients in a hundred found brinzolamide uncomfortable to put in. On dorzolamide it was sixteen in a hundred.',
        technicalDetails:
          'In the same 572-patient trial, the incidence of ocular discomfort — burning and stinging on instillation — was 1.8% with brinzolamide twice daily and 3.0% three times daily, against 16.4% with dorzolamide (P = .000). The mechanistic explanation is formulation rather than molecule: dorzolamide is a solution buffered to roughly pH 5.6 because that is where it stays dissolved, while brinzolamide is a suspension at near-neutral pH and the eye has no acid to object to. The trade-off appears in the label’s adverse reactions section, where blurred vision and bitter, sour or unusual taste are the most frequent reactions at 5% to 10%.',
        evidenceSource:
          'Silver LH. Am J Ophthalmol 1998;126:400-408; AZOPT US prescribing information, Adverse Reactions 6.1',
        doi: '10.1016/s0002-9394(98)00095-6',
        measuredMetric:
          'Incidence of ocular burning and stinging on instillation, brinzolamide against dorzolamide',
        auditFlag: 'verified',
      },
      {
        id: 'brz-a3',
        category: 'failed',
        title: 'Twelfth of fourteen first-line drops on pressure lowering',
        laymanSummary:
          'Pooling 114 trials, brinzolamide lowers pressure by 2.42 millimetres of mercury. Only betaxolol and unoprostone do less. It is roughly half as effective as the prostaglandin analogues.',
        technicalDetails:
          'In the Bayesian network meta-analysis of 114 randomised trials in 20,275 participants, brinzolamide reduced intraocular pressure at 3 months by 2.42 mmHg (95% credible interval 1.62 to 3.23), ranking twelfth of fourteen first-line agents. Bimatoprost at 5.61, latanoprost at 4.85 and travoprost at 4.83 are roughly double. Dorzolamide at 2.49 (1.85 to 3.13) is indistinguishable from brinzolamide. The credible interval on brinzolamide is wider than dorzolamide’s, reflecting fewer contributing trials. This is not a defect in the drug — the class is genuinely weaker — but a page that reports the equivalence with dorzolamide without reporting where the pair sits in the field has told half the story.',
        evidenceSource: 'Li T et al., Ophthalmology 2016;123:129-140',
        doi: '10.1016/j.ophtha.2015.09.005',
        measuredMetric:
          'Mean intraocular pressure reduction at 3 months, pooled across 114 randomised trials',
        auditFlag: 'verified',
      },
      {
        id: 'brz-a4',
        category: 'failed',
        title: 'Comfort was traded for blurring, and the label says so',
        laymanSummary:
          'Removing the sting did not remove the side effects, it changed them. The most common complaints in the trials were blurred vision and a bitter taste, each in five to ten patients in a hundred.',
        technicalDetails:
          'The FDA label lists blurred vision and bitter, sour or unusual taste as the most frequently reported adverse reactions, at an incidence of 5% to 10%. Reactions occurring in 1% to 5% include blepharitis, dermatitis, dry eye, foreign body sensation, headache, hyperemia, ocular discharge and ocular discomfort. Transient blurring is a direct consequence of the suspension: undissolved drug particles scatter light on the tear film until they dissolve. The bitter taste is nasolacrimal drainage carrying drug to the pharynx, which is shared with dorzolamide. So the comparison is not comfort against discomfort but stinging against blurring plus a required shaking step, in a drug taken three times a day for decades.',
        evidenceSource:
          'AZOPT (brinzolamide ophthalmic suspension) 1% US prescribing information, Adverse Reactions 6.1 and Dosage and Administration 2 (NDA 020816)',
        measuredMetric: 'Labelled adverse reaction incidence bands from the clinical trial programme',
        auditFlag: 'caution',
      },
      {
        id: 'brz-a5',
        category: 'inferred',
        title: 'Better tolerated is not the same as better taken, and nobody measured the second',
        laymanSummary:
          'The commercial case for this drug is that a comfortable drop gets used more reliably, and reliable use preserves more sight. The comfort was measured. The chain from comfort to adherence to vision was not.',
        technicalDetails:
          'The registration trial measured pressure and it measured instillation discomfort, and it found equivalence on the first and a nine-fold difference on the second. What it did not measure — and what no randomised comparison of brinzolamide against dorzolamide has since measured — is persistence on therapy, adherence, or any visual outcome. The inference is reasonable: glaucoma treatment is lifelong, non-adherence is the commonest reason it fails, and drop discomfort is a documented reason people stop. It remains an inference. On the available evidence the two drugs lower pressure identically, one costs eleven times the other per millilitre in the same acquisition survey, and the case for the difference rests on an endpoint nobody has collected.',
        evidenceSource:
          'Silver LH. Am J Ophthalmol 1998;126:400-408; Li T et al., Ophthalmology 2016;123:129-140',
        doi: '10.1016/j.ophtha.2015.09.005',
        inferredClaim:
          'That reduced instillation discomfort produces better adherence and therefore better preserved vision — plausible, commercially decisive, and unmeasured in any randomised comparison of these two drugs',
        auditFlag: 'contested',
      },
      {
        id: 'brz-a6',
        category: 'conclusion_shift',
        title: 'The sulfonamide and corneal warnings followed the class, not the molecule',
        laymanSummary:
          'Brinzolamide inherited both of dorzolamide’s serious warnings unchanged, because they come from the mechanism rather than the formulation. Making the drop comfortable did nothing about either.',
        technicalDetails:
          'The brinzolamide label carries two Warnings and Precautions: sulfonamide hypersensitivity reactions, and corneal oedema in patients with low endothelial cell counts. The first states that brinzolamide is a sulfonamide, that it is absorbed systemically despite topical administration, that fatalities have occurred rarely from Stevens-Johnson syndrome, toxic epidermal necrolysis, fulminant hepatic necrosis, agranulocytosis, aplastic anaemia and other blood dyscrasias, and that sensitisation may recur on readministration by any route. The second mirrors the corneal endothelium warning dorzolamide acquired after a 1999 case series, because the corneal endothelial pump depends on the same carbonic anhydrase chemistry. Both warnings are properties of inhibiting this enzyme, and a formulation change cannot address either.',
        evidenceSource:
          'AZOPT (brinzolamide ophthalmic suspension) 1% US prescribing information, Warnings and Precautions 5.1 and 5.2; Konowal A et al., Am J Ophthalmol 1999;127:403-406',
        doi: '10.1016/s0002-9394(98)00438-3',
        inferredClaim:
          'That a better-tolerated formulation of the same mechanism is a safer drug — true for the surface irritation it was designed around, false for the two warnings that matter',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A cloudy drop of suspended particles, not a solution',
        laymanDesc:
          'The bottle contains solid drug floating in liquid rather than dissolved in it. That is why it looks milky and why it has to be shaken before every single use.',
        molecularDetail:
          'Brinzolamide 1% is an ophthalmic suspension at near-neutral pH. The compound’s aqueous solubility is too low to formulate as a solution at a therapeutic concentration without an acidic buffer, so the drug is milled to a controlled particle size and suspended. The label instructs "Shake well before use" in its dosage section, because the particles settle and an unshaken bottle delivers an inconsistent dose.',
        iconName: 'Droplet',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The particles dissolve on the eye and briefly blur vision',
        laymanDesc:
          'The solid particles sit on the tear film and dissolve over the following minutes. While they are there they scatter light, which is why vision goes soft for a short time after each drop.',
        molecularDetail:
          'Dissolution from the suspended solid into the tear film is an additional rate-limiting step absent from solution formulations. Undissolved particles scatter incident light, producing the transient blurred vision the label lists among its most frequent adverse reactions at 5% to 10% incidence.',
        iconName: 'Eye',
        visualStage: 'delivery',
      },
      {
        step: 3,
        title: 'Dissolved drug crosses the cornea to the ciliary body',
        laymanDesc:
          'Once dissolved, the drug passes through the front of the eye to reach the tissue that makes the fluid. Some also drains into the nose, which is what causes the bitter taste.',
        molecularDetail:
          'The dissolved fraction partitions across the corneal epithelium and stroma into the aqueous humour, reaching the ciliary process epithelium. Nasolacrimal drainage carries a portion to the pharynx, producing the bitter, sour or unusual taste the label records at 5% to 10%. Systemically absorbed drug and its active N-desethyl metabolite bind carbonic anhydrase in erythrocytes and accumulate there.',
        iconName: 'ArrowRight',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'The sulfonamide group locks onto the enzyme’s zinc',
        laymanDesc:
          'One end of the molecule clamps onto the single zinc atom at the heart of the enzyme, which is where all its chemistry happens. The enzyme stops working.',
        molecularDetail:
          'The unsubstituted primary sulfonamide deprotonates and coordinates the catalytic zinc of carbonic anhydrase II, displacing the zinc-bound hydroxide that performs the hydration of carbon dioxide. This is the identical binding mode used by dorzolamide and acetazolamide, which is why the two topical drugs are equipotent in the eye despite differing in the ring system around the warhead.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 5,
        title: 'Bicarbonate production slows and so does the fluid pump',
        laymanDesc:
          'The cells cannot make the salt that pulls fluid into the eye. Sodium and water follow the salt, so less of both moves, and pressure falls.',
        molecularDetail:
          'Inhibition of carbonic anhydrase II in the ciliary processes slows bicarbonate formation and the sodium and fluid transport coupled to it, reducing the rate of aqueous humour secretion. Measured reduction is 2.42 mmHg (95% credible interval 1.62 to 3.23) at three months in the pooled network, statistically indistinguishable from dorzolamide’s 2.49.',
        iconName: 'Beaker',
        visualStage: 'catalytic_action',
      },
      {
        step: 6,
        title: 'The two serious risks came along unchanged',
        laymanDesc:
          'Making the drop comfortable did nothing about the two things on the label that actually matter: severe sulfa reactions, and corneal swelling in eyes whose cornea is already fragile.',
        molecularDetail:
          'Both labelled Warnings and Precautions are consequences of the mechanism rather than the vehicle. Sulfonamide hypersensitivity follows from systemic absorption of a sulfonamide, and the label lists Stevens-Johnson syndrome, toxic epidermal necrolysis, fulminant hepatic necrosis, agranulocytosis and aplastic anaemia among rarely fatal reactions. Corneal oedema in patients with low endothelial cell counts follows from inhibiting the carbonic anhydrase the corneal endothelial pump depends on.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Brinzolamide Primary Therapy Study (Silver 1998)',
        phase: 'Multicentre, double-masked, prospective, parallel-group, four-arm',
        sampleSize: 572,
        primaryEndpoint:
          'Diurnally corrected intraocular pressure reduction from baseline at peak and trough over 3 months',
        endpointMet: true,
        statisticalPValue:
          'Brinzolamide twice daily -3.8 to -5.7 mmHg and three times daily -4.2 to -5.6, statistically equivalent to each other and to dorzolamide -4.3 to -5.9 (equivalence limit ≤1.5 mmHg); ocular discomfort 1.8% and 3.0% against dorzolamide 16.4%, P = .000',
        unreportedAdverseSignals:
          'Conducted by Alcon, whose drug it was, against the incumbent competitor. The efficacy result is equivalence, so the entire case for the product rests on the tolerability endpoint, which is the one the sponsor was best positioned to define and detect.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'International Dorzolamide Study (Strahlman 1995)',
        phase: 'Double-masked, randomised, parallel comparison at 34 international sites',
        sampleSize: 523,
        primaryEndpoint:
          'Intraocular pressure reduction at one year for the class, dorzolamide against timolol and betaxolol',
        endpointMet: true,
        statisticalPValue:
          'Dorzolamide approximately 23% peak and 17% trough reduction, comparable with betaxolol and below timolol',
        unreportedAdverseSignals:
          'Cited here for the class rather than for brinzolamide, which did not exist when it ran. It is the source of the one-year durability evidence brinzolamide inherits by equivalence.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Orzalesi circadian crossover (2000)',
        phase: 'Randomised crossover, masked evaluators, in-hospital 24-hour tonometry',
        sampleSize: 20,
        primaryEndpoint:
          'Around-the-clock pressure reduction for the carbonic anhydrase class, dorzolamide against timolol and latanoprost',
        endpointMet: true,
        statisticalPValue:
          'Dorzolamide significant against baseline at all eight measurement times and superior to timolol at midnight and 3 AM (P = 0.05)',
        unreportedAdverseSignals:
          'Tested dorzolamide, not brinzolamide. The overnight advantage often attributed to brinzolamide is inherited from this study by analogy of mechanism, not measured on this molecule.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Statistically equivalent to dorzolamide on pressure in 572 randomised patients, equivalence confidence limit 1.5 mmHg or less',
        'Ocular burning and stinging in 1.8% of patients twice daily and 3.0% three times daily, against dorzolamide’s 16.4% (P = .000)',
        'Mean pressure reduction of 2.42 mmHg (95% credible interval 1.62 to 3.23) at three months, twelfth of fourteen first-line agents in 114 pooled trials',
        'Blurred vision and bitter, sour or unusual taste as the most frequent labelled adverse reactions, at 5% to 10% incidence',
      ],
      unsupportedInferences: [
        'That better instillation comfort produces better adherence and better preserved vision — never measured in any randomised comparison of these two drugs',
        'That brinzolamide shares dorzolamide’s overnight advantage; that finding comes from a 20-patient study of dorzolamide and is transferred by mechanism',
        'That the eleven-fold acquisition cost difference against dorzolamide reflects anything about the drugs rather than the number of listed manufacturers',
        'That a gentler formulation is a safer drug, when both labelled warnings arise from the mechanism and are carried over unchanged',
      ],
      whatFailedInitially: [
        'The comfort was bought rather than gained: blurred vision and bitter taste replaced stinging, each at 5% to 10%',
        'The suspension requires shaking before every dose, a step no other drop in this batch needs and a new way for a dose to go wrong',
        'Three-times-daily dosing was carried over from dorzolamide despite the trial finding twice daily equivalent',
        'The class sits near the bottom of the pooled efficacy ranking, at roughly half the effect of a prostaglandin analogue',
      ],
      realWorldOutcome: [
        'Approved 1 April 1998 under NDA 020816, four years after the drug it was designed to displace',
        'Now generic, with nine listed products against dorzolamide’s twenty-three, and eleven times the acquisition cost per millilitre',
        'Widely used as an add-on and as the carbonic anhydrase half of the brinzolamide/brimonidine fixed combination',
        'Retained in patients who cannot tolerate dorzolamide’s acidity and who cannot take a beta-blocker',
      ],
    },
    deliverySystem: {
      type: 'Topical ophthalmic suspension 1%, instilled three times daily',
      description:
        'A near-neutral aqueous suspension of milled drug particles rather than a solution, which is what removes the acidic sting and what makes shaking before every dose mandatory. Particles dissolve on the tear film over minutes, transiently blurring vision, before the dissolved fraction crosses the cornea. If more than one topical eye product is used, the label directs at least ten minutes between them.',
      safetyProfile:
        'Two labelled Warnings and Precautions: sulfonamide hypersensitivity reactions, with rare fatalities from Stevens-Johnson syndrome, toxic epidermal necrolysis, fulminant hepatic necrosis, agranulocytosis, aplastic anaemia and other blood dyscrasias, and recurrence of sensitisation on readministration by any route; and corneal oedema in patients with low endothelial cell counts. Most frequent adverse reactions at 5% to 10% are blurred vision and bitter, sour or unusual taste. Blepharitis, dermatitis, dry eye, foreign body sensation, headache, hyperemia, ocular discharge and ocular discomfort at 1% to 5%. No beta-blockade, so no respiratory or cardiac contraindications.',
    },
    commonQuestions: [
      {
        q: 'Is it better than dorzolamide?',
        a: 'On the thing it is prescribed for, no — the trial that approved it found the two statistically equivalent, with a confidence limit of 1.5 millimetres of mercury or less, and the pooled analysis of 114 trials separates them by 0.07 mmHg, which is noise. On instillation comfort, decisively yes: 1.8% of brinzolamide patients reported burning against 16.4% on dorzolamide. What you are choosing between is stinging on one hand and transient blurring, a bitter taste and a bottle you must shake before every dose on the other. In the same United States acquisition-cost survey on the same date, brinzolamide costs US$10.08 per millilitre and dorzolamide US$0.89.',
        auditNote:
          'Both drugs are generic. The price gap tracks the number of listed manufacturers — nine against twenty-three — rather than anything about the molecules.',
      },
      {
        q: 'Why does my vision go blurry after I put it in?',
        a: 'Because the drug is not dissolved. Brinzolamide is not soluble enough in water to be made into a clear drop at a useful strength without adding acid, and adding acid is exactly what makes dorzolamide sting. So it is supplied as fine solid particles suspended in liquid. Those particles sit on the tear film and scatter light until they dissolve, which takes a few minutes. The label lists blurred vision as one of its two most common adverse reactions, at 5% to 10%. It is a direct consequence of the design decision that removed the stinging.',
      },
      {
        q: 'Does it really matter if I forget to shake it?',
        a: 'Yes, and this is the only drop in this group where it does. In a suspension the drug is a solid that settles under gravity. A bottle standing overnight has a dilute layer at the top and a concentrated layer at the bottom, so an unshaken drop is not a full dose and the following one may be more than a full dose. This is why "Shake well before use" appears in the dosage and administration section of the label rather than in small print. Every other drop in this batch is a true solution, where the concentration is the same everywhere in the bottle whatever you do to it.',
      },
      {
        q: 'Is it strong enough on its own?',
        a: 'It is one of the weaker options, and worth knowing where it sits. Pooled across 114 randomised trials it lowers pressure by 2.42 millimetres of mercury at three months, twelfth of fourteen first-line drops. Bimatoprost, latanoprost and travoprost all lower it by roughly double. Timolol lowers it by about 50% more. That is why brinzolamide is usually an added agent rather than the first one, and why it is also sold combined with brimonidine in a single bottle. What it offers is a mechanism nothing else in the common list shares, so it adds to a prostaglandin analogue rather than overlapping with it.',
      },
      {
        q: 'I am allergic to sulfa antibiotics. Does that apply here?',
        a: 'Raise it, because the answer is not obvious from the fact that this goes in your eye. Brinzolamide is a sulfonamide, and the label states that although it is applied topically it is absorbed systemically, so the same types of reactions attributable to sulfonamides may occur. It goes on to say that fatalities have occurred, rarely, from Stevens-Johnson syndrome, toxic epidermal necrolysis, fulminant hepatic necrosis, agranulocytosis and aplastic anaemia, and that sensitisation may recur when a sulfonamide is given again irrespective of the route. These are idiosyncratic reactions rather than dose-dependent ones, which is why a small topical dose does not put you out of range.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Silver LH. Clinical efficacy and safety of brinzolamide (Azopt), a new topical carbonic anhydrase inhibitor for primary open-angle glaucoma and ocular hypertension. Am J Ophthalmol 1998;126:400-408',
        identifier: '10.1016/s0002-9394(98)00095-6',
        kind: 'doi',
      },
      {
        label:
          'Li T et al. Comparative effectiveness of first-line medications for primary open-angle glaucoma: a systematic review and network meta-analysis. Ophthalmology 2016;123:129-140',
        identifier: '10.1016/j.ophtha.2015.09.005',
        kind: 'doi',
      },
      {
        label:
          'Strahlman E, Tipping R, Vogel R. A double-masked, randomized 1-year study comparing dorzolamide (Trusopt), timolol, and betaxolol. Arch Ophthalmol 1995;113:1009-1016',
        identifier: '10.1001/archopht.1995.01100080061030',
        kind: 'doi',
      },
      {
        label:
          'Konowal A et al. Irreversible corneal decompensation in patients treated with topical dorzolamide. Am J Ophthalmol 1999;127:403-406',
        identifier: '10.1016/s0002-9394(98)00438-3',
        kind: 'doi',
      },
      {
        label:
          'Orzalesi N et al. Effect of timolol, latanoprost, and dorzolamide on circadian IOP in glaucoma or ocular hypertension. Invest Ophthalmol Vis Sci 2000;41:2566-2573',
        identifier: '10937568',
        kind: 'pmid',
      },
      {
        label:
          'Drugs@FDA: AZOPT (brinzolamide ophthalmic suspension) 1%, NDA 020816, Sandoz — original approval 1 April 1998',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020816',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 68844 — brinzolamide structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/68844',
        kind: 'url',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey, generic listing effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 5. Bimatoprost — the strongest single glaucoma drop, sold under one name for pressure and
  //    another for eyelashes, and the subject of a decade-long argument about what it binds to.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'bimatoprost',
    name: 'Bimatoprost',
    tradeName: 'Lumigan',
    sponsor: 'AbbVie — developed and originally marketed by Allergan',
    targetGene: 'PTGFR — the human prostaglandin F2-alpha receptor gene',
    targetProtein:
      'FP prostanoid receptor, reached largely through the hydrolysed free acid, on ciliary muscle and trabecular meshwork',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2001,
    indication:
      'Reduction of elevated intraocular pressure in patients with open-angle glaucoma or ocular hypertension; separately, under a different trade name and concentration, treatment of hypotrichosis of the eyelashes',
    patientFriendlyIndication:
      'High pressure inside the eye — and, sold under a different name, thin eyelashes',
    anatomicalSite:
      'Ciliary muscle and uveoscleral outflow pathway at the front of the eye; and, for the cosmetic product, the hair follicles at the upper eyelid margin',
    conditionContext: {
      conditionExplainer:
        'Glaucoma damages the optic nerve, and the only risk factor anyone can change is the pressure inside the eye. Fluid leaves the eye by two routes, and bimatoprost widens the slower one, through the muscle behind the iris.',
      whyItMatters:
        'Of the fourteen first-line drops ranked in the pooled analysis of 114 trials, this is the one that lowers pressure most. It is also the one that reddens the eye most, and the one whose effect on eyelashes was large enough that the manufacturer registered it as a separate cosmetic drug.',
      whoTakesThis:
        'Adults with open-angle glaucoma or ocular hypertension, as a once-daily evening drop. The eyelash product is a different concentration applied to the lid margin and is not a glaucoma treatment.',
      clinicalGoals:
        'A reduction in millimetres of mercury, sustained through the day and through the year. The one-year trial reported the peak-timolol-effect comparison, which is the most demanding time of day to be measured at.',
    },
    oneSentenceVerdict:
      'A synthetic prostamide that reaches the FP prostanoid receptor mostly as its hydrolysed free acid and widens the eye’s secondary drainage route, producing the largest pressure reduction of any single first-line drop — 5.61 mmHg at three months across 114 pooled trials, and 7.6 mmHg (30%) against timolol’s 5.3 mmHg (21%) at one year in 1,198 patients — while causing the highest rate of red eye in its class and eyelash growth marked enough to be sold separately as a cosmetic.',
    laymanHowItWorks:
      'Fluid drains out of the eye through two routes, and one of them runs through the ring of muscle behind the iris. Bimatoprost switches on a receptor there, and the cells respond by dismantling some of the connective tissue packed between the muscle fibres. The spaces widen, fluid leaves faster, and pressure falls. The same receptor sits in hair follicles and in the fat pads around the eye, which is why lashes grow and the eye socket can hollow.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 83,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$8.87 per millilitre, median across the 31 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Lumigan 0.03% was approved 16 March 2001 under NDA 021275 and the reformulated 0.01% on 31 August 2010 under NDA 022184. The same molecule was separately approved in 2008 at a cosmetic concentration for eyelash hypotrichosis, and in 2020 as a biodegradable intracameral implant, so one compound supports three regulatory identities with three price structures. The generic listing carries 31 products and a median acquisition cost of US$8.87 per millilitre, about five and a half times generic latanoprost.',
      synthesisComplexity: 'Moderate',
      costSource: {
        label:
          'Nearest published cost-of-production analysis: Hill AM, Barber MJ, Gotham D. Estimated costs of production and potential prices for the WHO Essential Medicines List. BMJ Glob Health 2018;3:e000571. Its methods restrict the analysis to solid oral formulations and exclude eye drops, which is why the synthesis cost field on this page is empty.',
        identifier: '10.1136/bmjgh-2017-000571',
        kind: 'doi',
      },
      priceSource: {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey, generic listing effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    },
    substitutes: {
      summary:
        'Bimatoprost’s competitors are the other prostaglandin analogues, and the pooled ranking separates the top three by less than a millimetre of mercury with overlapping credible intervals. What separates them in practice is the side effect profile: bimatoprost reddens eyes most and lengthens lashes most. The alternative that changes the terms rather than the molecule is the intracameral implant of bimatoprost itself, or selective laser trabeculoplasty.',
      conventionalRx: [
        {
          name: 'Latanoprost (Xalatan)',
          class: 'Prostaglandin F2-alpha analogue',
          howItCompares:
            'Second in the pooled ranking at 4.85 mmHg against bimatoprost’s 5.61, with overlapping credible intervals and a difference the analysis’s authors describe as possibly not clinically meaningful. Latanoprost is the only glaucoma drop with a placebo-controlled visual field trial.',
          typicalCost:
            'US$1.57 per millilitre, median across the 13 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: about one sixth the acquisition cost, less conjunctival redness, a randomised placebo-controlled vision outcome. Cons: slightly less pressure lowering, and the same iris pigmentation and periorbitopathy.',
        },
        {
          name: 'Travoprost (Travatan)',
          class: 'Prostaglandin F2-alpha analogue',
          howItCompares:
            'Third at 4.83 mmHg, statistically indistinguishable from latanoprost. Approved on the same day as Lumigan in March 2001.',
          typicalCost:
            'US$9.33 per millilitre, median across the 14 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: comparable efficacy, a benzalkonium-free formulation available. Cons: comparable acquisition cost to bimatoprost with slightly less pressure lowering, and the same class side effects.',
        },
        {
          name: 'Bimatoprost intracameral implant (Durysta)',
          class: 'The same molecule as a biodegradable implant placed inside the eye',
          howItCompares:
            'Removes the daily drop entirely by releasing drug from a implant placed in the anterior chamber. In the pooled phase 3 analysis of 372 patients receiving the 10-microgram implant, 82% of implants were absent or at 25% or less of their initial size by 52 weeks and 95% by month 20.',
          typicalCost:
            'Not listed in the CMS National Average Drug Acquisition Cost survey consulted for this page — it is a physician-administered implant, not a dispensed drop',
          prosAndCons:
            'Pros: no daily instillation, no ocular surface preservative exposure. Cons: an intraocular procedure, variable biodegradation between patients, and the trials are still working out when re-administration is appropriate.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Wipe any excess off the eyelid skin straight away',
          action:
            'Blot the lid and surrounding skin after instilling, rather than letting the drop run.',
          patientImpact:
            'Bimatoprost darkens eyelid skin and lengthens and darkens eyelashes wherever it makes prolonged contact. The eyelash effect is large enough that the same molecule at a cosmetic concentration is separately approved and marketed for increasing eyelash length, thickness and darkness.',
          clinicalPrecaution:
            'If only one eye is treated, unwiped run-off produces visible asymmetry in lash length and lid colour. Neither effect is dangerous, and the lid darkening is generally reported to reverse while the lash change is slower to.',
        },
        {
          name: 'Say if the redness is not settling after the first few weeks',
          action:
            'Report persistent conjunctival redness rather than assuming it is a break-in effect.',
          patientImpact:
            'Hyperemia was the commonest adverse effect in the one-year trial and significantly more frequent with bimatoprost than timolol. It is the reason the manufacturer developed a lower 0.01% concentration, in which moderate to severe hyperemia occurred in 3.2% of patients against 9.1% on 0.03%.',
          clinicalPrecaution:
            'The lower concentration was shown equivalent on pressure across twelve months, with between-group differences under 0.9 mmHg. Persistent redness is therefore a reason to discuss concentration rather than to abandon the class.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CCNC(=O)CCC/C=C\\C[C@H]1[C@H](C[C@H]([C@@H]1/C=C/[C@H](CCC2=CC=CC=C2)O)O)O',
      chemicalFormula: 'C25H37NO4',
      molecularWeight: '415.60 g/mol',
      targetReceptorAffinity:
        'Bimatoprost is an ethylamide — a prostamide — rather than an ester, which is what distinguishes it chemically from latanoprost and travoprost. Its free acid, 17-phenyl-trinor prostaglandin F2-alpha, is a potent FP prostanoid receptor agonist. Aqueous humour sampled from human eyes before cataract surgery contained free acid at 22.0 nmol/l (SEM 7.0) two hours after a dose and 7.0 nmol/l (4.6) at twelve hours, against intact amide at 5.7 and 1.1 nmol/l, with both undetectable after vehicle. The manufacturer has argued for a distinct prostamide-sensitive receptor, and that measurement is the principal evidence against the argument being necessary.',
      structureSource: {
        label: 'PubChem CID 5311027 (bimatoprost) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5311027',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'bim-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Stereochemistry of the prostaglandin core and geometry of both alkene bonds',
          description:
            'Confirm all five stereocentres plus the cis geometry of the 5,6 alkene and the trans geometry of the 13,14 alkene. The 13,14 double bond is the feature that separates bimatoprost from latanoprost, which is saturated there, and the difference is not cosmetic: it is part of why the two molecules behave differently at the receptor and in the orbit.',
          reagentsAndBuffer:
            'Bimatoprost reference standard, chiral HPLC with polysaccharide stationary phase, 1H NMR with nuclear Overhauser measurements to assign alkene geometry, optical rotation',
        },
        {
          id: 'bim-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Amidation of the carboxylic acid with ethylamine',
          description:
            'Couple 17-phenyl-trinor prostaglandin F2-alpha to ethylamine to form the ethylamide. This single step is what makes the compound a prostamide rather than another ester prodrug, and it is the step the entire mechanistic argument about this drug turns on: an amide is hydrolysed far more slowly than an ester.',
          dependsOnStepId: 'bim-w1',
          reagentsAndBuffer:
            'Ethylamine, peptide coupling reagent or mixed anhydride activation, mild base, anhydrous aprotic solvent, low temperature to protect the allylic alcohols',
        },
        {
          id: 'bim-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Removal of residual free acid and 15-keto degradant',
          description:
            'Separate unreacted free acid and the 15-position oxidation product. Residual free acid matters here more than in most syntheses because it is itself the active species in the eye, so an uncontrolled amount of it changes the effective potency of the finished product rather than merely its purity.',
          dependsOnStepId: 'bim-w2',
          reagentsAndBuffer:
            'Preparative reversed-phase chromatography, ethyl acetate and heptane or acetonitrile and water gradients, amber glassware, stability-indicating HPLC with free acid as a named impurity',
        },
        {
          id: 'bim-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Aqueous humour sampling for amide and free acid after topical dosing',
          description:
            'Dose the eye, then sample aqueous humour and quantify both the intact amide and the free acid separately. This is the assay that settled the mechanism argument in humans, and it only works if both species are measured: an assay reporting total drug-related material cannot distinguish a prostamide receptor from a slow-hydrolysing prodrug.',
          dependsOnStepId: 'bim-w3',
          reagentsAndBuffer:
            'Anterior chamber paracentesis samples, high-pressure liquid chromatography with mass spectrometric detection, deuterated internal standards for both amide and acid, vehicle-treated control eyes',
        },
        {
          id: 'bim-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'FP receptor functional assay with adipocyte differentiation counter-screen',
          description:
            'Measure agonist potency of the free acid at the recombinant FP receptor, then run a preadipocyte differentiation assay. The second is not an off-target screen in the usual sense: FP activation inhibits adipogenesis, and that on-target effect in orbital fat is the mechanism of the periorbitopathy this class causes.',
          dependsOnStepId: 'bim-w4',
          reagentsAndBuffer:
            'Cells expressing recombinant human FP receptor, calcium-sensitive fluorescent dye, preadipocyte cultures with differentiation medium, lipid staining for quantification, prostaglandin F2-alpha as reference agonist',
        },
      ],
    },
    keyAudits: [
      {
        id: 'bim-a1',
        category: 'measured',
        title: 'First of fourteen first-line drops, and the margin is under a millimetre',
        laymanSummary:
          'Pooling 114 trials, bimatoprost lowers pressure more than any other single drop: 5.61 millimetres of mercury. Latanoprost is at 4.85 and travoprost at 4.83. The authors say the differences within the class may not be clinically meaningful.',
        technicalDetails:
          'In the Bayesian network meta-analysis of 114 randomised trials with data from 20,275 participants, mean reduction in intraocular pressure at 3 months was 5.61 mmHg (95% credible interval 4.94 to 6.29) for bimatoprost, the highest of fourteen first-line agents. Latanoprost followed at 4.85 (4.24 to 5.46) and travoprost at 4.83 (4.12 to 5.54), with credible intervals overlapping bimatoprost’s. Timolol was at 3.70 and the carbonic anhydrase inhibitors at roughly 2.4. The authors state that bimatoprost, latanoprost and travoprost are among the most efficacious drugs, that the within-class differences were small and may not be clinically meaningful, and that adverse effects, patient preferences and cost should all enter the choice.',
        evidenceSource: 'Li T et al., Ophthalmology 2016;123:129-140',
        doi: '10.1016/j.ophtha.2015.09.005',
        measuredMetric:
          'Mean intraocular pressure reduction at 3 months, pooled across 114 randomised trials',
        auditFlag: 'verified',
      },
      {
        id: 'bim-a2',
        category: 'measured',
        title: 'Beat timolol at every hour of every visit across a full year',
        laymanSummary:
          'Two identical year-long trials put 1,198 patients on bimatoprost once daily, bimatoprost twice daily or timolol. Once-daily bimatoprost lowered pressure more than timolol at every measurement time at every visit, and got more patients to a low target.',
        technicalDetails:
          'Two identical multicentre, randomised, double-masked, one-year trials enrolled 474 patients on bimatoprost 0.03% once daily, 483 on bimatoprost 0.03% twice daily and 241 on timolol 0.5% twice daily. Bimatoprost once daily gave significantly lower mean intraocular pressure than timolol at every time of day at each study visit (P<.001). At 10 AM, the peak timolol effect, at month 12, mean reduction from baseline was 7.6 mmHg (30%) with bimatoprost against 5.3 mmHg (21%) with timolol (P<.001). Pressure at or below 17 mmHg was reached by 58% of bimatoprost once-daily patients against 37% on timolol (P<.001). Twice-daily bimatoprost was significantly better than timolol at most time points but worse than the once-daily regimen. Hyperemia was the commonest adverse effect and significantly more frequent on bimatoprost once daily than timolol (P<.001).',
        evidenceSource: 'Higginbotham EJ et al., Arch Ophthalmol 2002;120:1286-1293',
        doi: '10.1001/archopht.120.10.1286',
        measuredMetric:
          'Diurnal intraocular pressure at 12 months, bimatoprost once and twice daily against timolol',
        auditFlag: 'verified',
      },
      {
        id: 'bim-a3',
        category: 'failed',
        title: 'More often is worse: twice daily lowered pressure less than once daily',
        laymanSummary:
          'In both the three-month and the twelve-month trials, taking bimatoprost twice a day worked less well than taking it once. That is the opposite of what a dose-response curve should look like.',
        technicalDetails:
          'In the three-month trial of 596 patients randomised 2:2:1, mean reduction from baseline at 8 AM at month 3 was 9.16 mmHg (35.2%) with bimatoprost 0.03% once daily, 7.78 mmHg (30.4%) twice daily and 6.74 mmHg (26.2%) with timolol twice daily. The one-year trials reproduced the pattern: once-daily dosing was superior to twice-daily at most time points, and the authors state directly that bimatoprost once daily provides pressure lowering superior to timolol or to bimatoprost twice daily. Once-daily dosing also produced better ocular tolerability. The usual explanation offered is receptor downregulation or desensitisation with more frequent exposure, and it remains an explanation rather than a measurement. What is not in doubt is the observation, in two independent trials totalling nearly 1,800 patients.',
        evidenceSource:
          'Brandt JD et al., Ophthalmology 2001;108:1023-1031; Higginbotham EJ et al., Arch Ophthalmol 2002;120:1286-1293',
        doi: '10.1016/s0161-6420(01)00584-x',
        measuredMetric:
          'Intraocular pressure reduction, once-daily against twice-daily dosing of the same drug',
        auditFlag: 'caution',
      },
      {
        id: 'bim-a4',
        category: 'failed',
        title: 'Reddest eye in the class, and the maker cut the dose to fix it',
        laymanSummary:
          'Conjunctival redness was the commonest side effect in every trial and clearly worse than with timolol. Allergan responded by developing a formulation at one third the concentration, and it lowered pressure just as well.',
        technicalDetails:
          'A twelve-month randomised, double-masked trial compared bimatoprost 0.01% (n=186), 0.0125% (n=188) and 0.03% (n=187). Differences in mean intraocular pressure between the lower concentrations and 0.03% were under 0.9 mmHg throughout follow-up, and bimatoprost 0.01% met predetermined equivalence criteria against 0.03% — 95% confidence interval of the between-group difference within plus or minus 1.5 mmHg at all time points and within plus or minus 1 mmHg at most. Treatment-related adverse events were significantly reduced at both lower concentrations (P ≤ .034). Moderate to severe increase from baseline in macroscopic hyperemia occurred in 3.2% on 0.01%, 9.0% on 0.0125% and 9.1% on 0.03% (P = .019 for 0.01% against 0.03%). The finding that a third of the concentration is equally effective and a third as red is a retrospective judgement on the original dose selection.',
        evidenceSource: 'Katz LJ et al., Am J Ophthalmol 2010;149:661-671',
        doi: '10.1016/j.ajo.2009.12.003',
        measuredMetric:
          'Macroscopic conjunctival hyperemia and intraocular pressure across three concentrations over 12 months',
        auditFlag: 'verified',
      },
      {
        id: 'bim-a5',
        category: 'failed',
        title: 'The orbit hollows, and the receptor being hit is the intended one',
        laymanSummary:
          'Long-term users can develop a sunken look around the treated eye. Bimatoprost is the agent in the class where it is worst, and switching to latanoprost has been shown to reverse part of it.',
        technicalDetails:
          'Prostaglandin-associated periorbitopathy — deepening of the upper eyelid sulcus, orbital fat atrophy, ptosis, periocular skin darkening — was described from clinical practice rather than from registration trials. A Japanese series specifically documented recovery from deepening of the upper eyelid sulcus after switching from bimatoprost to latanoprost, which establishes both that the effect is real and that it is dose- or agent-dependent within the class. Experimental work then showed that activation of the prostanoid FP receptor inhibits adipogenesis, giving a mechanism in which the orbital fat loss is an on-target consequence of the receptor the drug is prescribed to activate. Unilateral treatment produces visible facial asymmetry, which is how it is usually noticed, and no study provides a reliable incidence figure.',
        evidenceSource:
          'Sakata R et al., Jpn J Ophthalmol 2013;57:179-184; Taketani Y et al., Invest Ophthalmol Vis Sci 2014;55:1269-1276',
        doi: '10.1167/iovs.13-12589',
        measuredMetric:
          'Upper eyelid sulcus depth on switching from bimatoprost to latanoprost, and FP-mediated inhibition of adipogenesis in vitro',
        auditFlag: 'caution',
      },
      {
        id: 'bim-a6',
        category: 'conclusion_shift',
        title: 'The prostamide receptor argument met a mass spectrometer',
        laymanSummary:
          'The manufacturer argued for years that bimatoprost works through a receptor of its own, distinct from the one latanoprost hits. Then someone measured what was actually inside treated human eyes, and found plenty of the ordinary active acid.',
        technicalDetails:
          'Bimatoprost is an ethylamide rather than an ester, and the manufacturer’s position was that it acts intact at a distinct prostamide-sensitive receptor rather than as a prodrug of an FP agonist. A prospective, masked, vehicle-controlled study treated one eye of each of 31 cataract patients with bimatoprost 0.03% or vehicle once daily for seven days before surgery and assayed aqueous humour by high-pressure liquid chromatography and mass spectrometry at paracentesis. Free acid concentrations were 22.0 nmol/l (SEM 7.0, n=12) at two hours and 7.0 nmol/l (4.6, n=8) at twelve hours, against 5.7 and 1.1 nmol/l for the intact amide, with both undetectable after vehicle. The authors concluded that sufficient free acid — a potent FP prostanoid receptor agonist — is present to account for the pressure reduction. That does not disprove a prostamide receptor. It removes the need to invoke one, and the burden of proof moved with it.',
        evidenceSource: 'Camras CB et al., Ophthalmology 2004;111:2193-2198',
        doi: '10.1016/j.ophtha.2004.06.028',
        inferredClaim:
          'That bimatoprost acts intact at a distinct prostamide receptor rather than as a slow prodrug of an FP agonist — a mechanism claim that human aqueous humour measurement made unnecessary rather than impossible',
        auditFlag: 'contested',
      },
      {
        id: 'bim-a7',
        category: 'inferred',
        title: 'The pressure result is real, the vision result is borrowed',
        laymanSummary:
          'Every trial of this drug measures pressure. The evidence that lowering pressure preserves sight comes from trials of other drugs, and the strongest of those tested latanoprost, not this one.',
        technicalDetails:
          'The registration programme for bimatoprost, from the three-month trial in 596 patients through the one-year trials in 1,198, used intraocular pressure as the outcome throughout. No trial of bimatoprost has used visual field progression or optic disc deterioration as a primary endpoint. The placebo-controlled visual function evidence in this therapeutic area comes from UKGTS, which randomised 516 patients to latanoprost or identical placebo drops and found time to visual field deterioration delayed with an adjusted hazard ratio of 0.44 (95% CI 0.28 to 0.69). The Ocular Hypertension Treatment Study and the Early Manifest Glaucoma Trial support pressure lowering at class level, using any commercially available agent and betaxolol respectively. Bimatoprost’s claim to preserve vision is therefore an inference from its superior pressure lowering plus the class-level evidence, and the class-level evidence was not generated with this molecule.',
        evidenceSource:
          'Garway-Heath DF et al., Lancet 2015;385:1295-1304 (UKGTS); Kass MA et al., Arch Ophthalmol 2002;120:701-713 (OHTS, NCT00000125)',
        doi: '10.1016/S0140-6736(14)62111-5',
        inferredClaim:
          'That the largest pressure reduction in the class produces the best preserved vision — never tested for this drug, and the drug that was tested against placebo for vision is the one that lowers pressure slightly less',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'One evening drop, and most of it drains away',
        laymanDesc:
          'A single drop at night. The eye holds a fraction of it and the rest goes down the tear duct. Trying to help by using it twice a day makes it work less well, which is unusual for a drug.',
        molecularDetail:
          'Bimatoprost 0.03% or 0.01% is instilled once daily in the evening. Two independent randomised trials found once-daily dosing superior to twice-daily on pressure and on tolerability, a departure from ordinary dose-response usually attributed to receptor desensitisation with more frequent exposure.',
        iconName: 'Droplet',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It crosses the cornea, and enzymes cut the amide slowly',
        laymanDesc:
          'The molecule carries a chemical group that is cut off inside the eye to release the active form. Unlike similar drugs it is an amide, which is cut far more slowly than an ester, so both forms are present at once.',
        molecularDetail:
          'Bimatoprost is an ethylamide, hydrolysed by ocular amidases to 17-phenyl-trinor prostaglandin F2-alpha. In human aqueous humour after seven days of once-daily dosing, free acid reached 22.0 nmol/l at two hours against 5.7 nmol/l for the intact amide, and 7.0 against 1.1 nmol/l at twelve hours. Slow amide hydrolysis, rather than a distinct receptor, is the parsimonious explanation for the drug’s pharmacology.',
        iconName: 'Scissors',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The free acid switches on the FP receptor',
        laymanDesc:
          'The released active form binds the same receptor latanoprost and travoprost bind, on the muscle ring behind the iris.',
        molecularDetail:
          '17-phenyl-trinor prostaglandin F2-alpha is a potent agonist at the FP prostanoid receptor expressed on ciliary muscle and trabecular meshwork. The measured aqueous concentration is sufficient to account for the observed pressure reduction, which is the basis for treating bimatoprost as a slow prodrug rather than a distinct pharmacological class.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Connective tissue is remodelled and the drain widens',
        laymanDesc:
          'The receptor tells the cells to break down some of the packing between the muscle bundles. Channels open where there were none, over days to weeks rather than instantly.',
        molecularDetail:
          'FP receptor activation upregulates matrix metalloproteinases in the ciliary muscle, remodelling the extracellular matrix of the uveoscleral outflow pathway and reducing its hydraulic resistance. The response is transcriptional, which is why the full effect takes weeks to establish and why the pressure reduction is sustained rather than pulsatile.',
        iconName: 'Wrench',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Pressure falls further than with any other single drop',
        laymanDesc:
          'Pressure drops by around five and a half millimetres of mercury on average, more than any competitor. At the twelve-month mark in the big trial it was down 30% against timolol’s 21%.',
        molecularDetail:
          'Pooled reduction is 5.61 mmHg (95% credible interval 4.94 to 6.29) at three months, first of fourteen agents. At month 12 at the 10 AM peak-timolol time point, reduction was 7.6 mmHg (30%) against timolol’s 5.3 mmHg (21%), P<.001, with 58% of bimatoprost patients at or below 17 mmHg against 37%.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'The same receptor is in lashes, lids and orbital fat',
        laymanDesc:
          'Hair follicles have this receptor too, so lashes grow longer, thicker and darker — enough that the same drug is sold as a cosmetic. The fat pads around the eye have it as well, and there the effect is loss rather than growth.',
        molecularDetail:
          'FP activation in eyelash follicles lengthens the anagen growth phase, an effect large enough that the molecule is separately approved at a cosmetic concentration for eyelash hypotrichosis. FP activation in orbital preadipocytes inhibits adipogenesis, producing the deepened upper eyelid sulcus and orbital fat atrophy of prostaglandin-associated periorbitopathy. Both are on-target effects of the intended receptor in unintended tissue.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Bimatoprost Study Groups 1 and 2, one-year (Higginbotham 2002)',
        phase: 'Two identical multicentre, randomised, double-masked, 12-month trials',
        sampleSize: 1198,
        primaryEndpoint: 'Diurnal intraocular pressure at 8 AM, 10 AM and 4 PM over 12 months',
        endpointMet: true,
        statisticalPValue:
          'At 10 AM month 12, -7.6 mmHg (30%) bimatoprost once daily against -5.3 mmHg (21%) timolol, P < .001; 58% against 37% at or below 17 mmHg, P < .001',
        unreportedAdverseSignals:
          'Twice-daily bimatoprost performed worse than once-daily, an inverse dose-response the paper reports without explaining. Hyperemia was significantly more frequent on bimatoprost than timolol.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Bimatoprost Study Group three-month trial (Brandt 2001)',
        phase: 'Multicentre, 3-month, randomised, double-masked, 2:2:1 allocation',
        sampleSize: 596,
        primaryEndpoint:
          'Reduction in intraocular pressure in the eye with higher baseline pressure at month 3',
        endpointMet: true,
        statisticalPValue:
          'At 8 AM month 3, -9.16 mmHg (35.2%) once daily, -7.78 mmHg (30.4%) twice daily, -6.74 mmHg (26.2%) timolol; P < 0.001 for once daily against timolol at all time points',
        unreportedAdverseSignals:
          'Bimatoprost caused significantly more hyperemia and eyelash growth than timolol. The eyelash finding was later developed into a separate cosmetic product rather than treated only as a side effect.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Bimatoprost concentration comparison (Katz 2010)',
        phase: 'Prospective, randomised, double-masked, multicentre, 12-month',
        sampleSize: 561,
        primaryEndpoint:
          'Intraocular pressure over 12 months, bimatoprost 0.01% and 0.0125% against 0.03%',
        endpointMet: true,
        statisticalPValue:
          'Between-group differences under 0.9 mmHg throughout; 0.01% met equivalence criteria; moderate to severe hyperemia 3.2% against 9.1%, P = .019',
        unreportedAdverseSignals:
          'Sponsored by the manufacturer to support a lower-concentration product. The result is that the concentration marketed for nine years was three times what was needed, which the trial reports without saying so.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'ARTEMIS implant biodegradation (NCT02247804, NCT02250651)',
        phase: 'Two identical randomised phase 3 studies, 20-month follow-up',
        sampleSize: 372,
        primaryEndpoint:
          'Time course of biodegradation of the 10-microgram intracameral bimatoprost implant on gonioscopy',
        endpointMet: true,
        statisticalPValue:
          '82% of implants absent or ≤25% of initial size by 52 weeks, 95% by month 20; reported descriptively',
        unreportedAdverseSignals:
          'Biodegradation was variable between patients and implants frequently swelled between weeks 6 and 28 before shrinking. The paper states that studies are still in progress to determine appropriate timing for re-administration.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Mean pressure reduction of 5.61 mmHg (95% credible interval 4.94 to 6.29) at three months, first of fourteen first-line agents across 114 pooled trials',
        '7.6 mmHg (30%) reduction at month 12 against timolol’s 5.3 mmHg (21%) at the peak-timolol time point, P < .001, in 1,198 randomised patients',
        'Bimatoprost 0.01% equivalent to 0.03% over 12 months with moderate to severe hyperemia in 3.2% against 9.1% (P = .019)',
        'Free acid at 22.0 nmol/l against intact amide at 5.7 nmol/l in human aqueous humour two hours after dosing, both undetectable after vehicle',
      ],
      unsupportedInferences: [
        'That the strongest pressure lowering in the class produces the best preserved vision — no trial of this drug has used a visual outcome',
        'That bimatoprost acts intact at a distinct prostamide receptor, an argument human aqueous humour measurement made unnecessary',
        'That the sub-millimetre advantage over latanoprost and travoprost is clinically meaningful; the pooling authors say it may not be',
        'That eyelash growth and periorbitopathy are separable phenomena — both follow from FP activation in tissue the drop was not aimed at',
      ],
      whatFailedInitially: [
        'Twice-daily dosing lowered pressure less than once-daily in both the three-month and the twelve-month trials, the opposite of a dose-response',
        'Conjunctival hyperemia was the commonest adverse effect throughout and drove development of a formulation at one third the concentration nine years after launch',
        'Prostaglandin-associated periorbitopathy was not identified in the registration programme and is worst with this agent in the class',
        'The mechanism the drug was marketed on — a distinct prostamide receptor — lost its necessity to a mass spectrometry study of 31 human eyes',
      ],
      realWorldOutcome: [
        'Approved 16 March 2001 under NDA 021275, with a lower-concentration formulation approved in 2010 under NDA 022184',
        'The same molecule separately approved in 2008 at a cosmetic concentration for eyelash hypotrichosis, turning a side effect into a product line',
        'Approved in 2020 as a biodegradable intracameral implant, removing the daily drop for a subset of patients',
        'Now generic with 31 listed products, at a median United States acquisition cost of US$8.87 per millilitre',
      ],
    },
    deliverySystem: {
      type: 'Topical ophthalmic solution 0.03% and 0.01%, once daily in the evening; also a biodegradable intracameral implant',
      description:
        'An aqueous solution instilled once daily. Twice-daily dosing was tested in both pivotal programmes and lowered pressure less than once-daily, so the schedule is not a convenience choice. The intracameral implant places the same molecule inside the anterior chamber and biodegrades over roughly a year, with 82% of implants absent or at a quarter of their initial size by 52 weeks.',
      safetyProfile:
        'Conjunctival hyperemia, the commonest adverse effect and significantly more frequent than with timolol, reduced from 9.1% to 3.2% moderate-to-severe by the lower concentration. Eyelash lengthening, thickening and darkening, marked enough to support a separate cosmetic approval. Increased brown iris pigmentation, permanent. Eyelid skin darkening. Prostaglandin-associated periorbitopathy with deepening of the upper eyelid sulcus and orbital fat atrophy, described after approval, worst in this agent within the class, and partially reversible on switching. Rare macular oedema, chiefly in aphakic or pseudophakic eyes with a torn posterior capsule. No systemic beta-blockade and no respiratory or cardiac contraindications.',
    },
    commonQuestions: [
      {
        q: 'It is the strongest drop. Does that make it the best choice?',
        a: 'Not automatically, and the people who produced the ranking say so. Across 114 pooled trials bimatoprost lowers pressure 5.61 millimetres of mercury against latanoprost’s 4.85 and travoprost’s 4.83, with overlapping credible intervals, and the authors state that within-class differences were small and may not be clinically meaningful. Against that under-a-millimetre advantage, bimatoprost reddens eyes more than anything else in the class, produces the most marked eyelash growth, and is the agent where periorbital fat loss is worst. It also costs about five and a half times generic latanoprost per millilitre. And the only glaucoma drop with a placebo-controlled trial showing preserved visual field is latanoprost, not this one.',
        auditNote:
          'Ranking a class by its most precisely measured number and choosing the winner is how a sub-millimetre difference comes to outweigh three side effects and a sixfold price gap.',
      },
      {
        q: 'Why once a day and not twice?',
        a: 'Because twice a day works less well, which is genuinely odd and was found twice. In the three-month trial of 596 patients, once-daily bimatoprost lowered pressure 9.16 mmHg and twice-daily 7.78 mmHg. In the two one-year trials of 1,198 patients, once-daily was superior to twice-daily at most time points and the paper says so in its conclusion. Once-daily was also better tolerated. The usual explanation is that more frequent exposure desensitises the receptor, which is plausible and has not been measured directly in humans. The observation itself is solid: two independent trials, nearly 1,800 patients, same direction.',
      },
      {
        q: 'Is this the same drug they sell for eyelashes?',
        a: 'Yes — same molecule, different concentration, different trade name, different regulatory approval. The eyelash effect turned up in the glaucoma trials as a side effect: the three-month trial recorded significantly more eyelash growth with bimatoprost than timolol. Allergan then developed and registered it as a cosmetic product for eyelash hypotrichosis, applied to the lid margin rather than dropped into the eye. The mechanism is the same receptor doing the same thing in a different tissue: FP activation extends the growth phase of the hair follicle. This is why any bimatoprost that runs onto the eyelid should be wiped off, and why treating one eye only can leave you with visibly different lashes.',
      },
      {
        q: 'My eyes are constantly red. Is there anything to do about it?',
        a: 'Ask about the lower concentration, because this is a solved problem. Hyperemia was the commonest adverse effect in every trial of the 0.03% formulation and clearly worse than timolol. A twelve-month randomised trial then compared 0.01%, 0.0125% and 0.03% in 561 patients and found that 0.01% lowered pressure equivalently — all differences under 0.9 mmHg — while moderate to severe hyperemia fell from 9.1% to 3.2%. The 0.01% formulation was approved in 2010. In other words, for nine years the marketed concentration was three times what was needed, and a third of the dose gets the same pressure with a third of the redness.',
      },
      {
        q: 'What is a prostamide, and does it matter?',
        a: 'It matters mostly as a case study in how a mechanism claim gets settled. Bimatoprost is chemically an amide where latanoprost and travoprost are esters, and Allergan argued for years that it therefore acts intact at a distinct receptor — a prostamide receptor — rather than being converted into an ordinary FP agonist like the others. A group then treated one eye each of 31 patients before cataract surgery, sampled the fluid from inside the eye at surgery, and ran it through a mass spectrometer. The active free acid was there at 22 nanomolar two hours after a dose, four times the concentration of the intact amide, and absent in the vehicle-treated eyes. That does not prove a prostamide receptor does not exist. It does mean you no longer need one to explain what the drug does.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Higginbotham EJ et al. One-year, randomized study comparing bimatoprost and timolol in glaucoma and ocular hypertension. Arch Ophthalmol 2002;120:1286-1293',
        identifier: '10.1001/archopht.120.10.1286',
        kind: 'doi',
      },
      {
        label:
          'Brandt JD, VanDenburgh AM, Chen K, Whitcup SM. Comparison of once- or twice-daily bimatoprost with twice-daily timolol in patients with elevated IOP: a 3-month clinical trial. Ophthalmology 2001;108:1023-1031',
        identifier: '10.1016/s0161-6420(01)00584-x',
        kind: 'doi',
      },
      {
        label:
          'Katz LJ, Cohen JS, Batoosingh AL, Felix C, Shu V, Schiffman RM. Twelve-month, randomized, controlled trial of bimatoprost 0.01%, 0.0125%, and 0.03% in patients with glaucoma or ocular hypertension. Am J Ophthalmol 2010;149:661-671',
        identifier: '10.1016/j.ajo.2009.12.003',
        kind: 'doi',
      },
      {
        label:
          'Camras CB et al. Detection of the free acid of bimatoprost in aqueous humor samples from human eyes treated with bimatoprost before cataract surgery. Ophthalmology 2004;111:2193-2198',
        identifier: '10.1016/j.ophtha.2004.06.028',
        kind: 'doi',
      },
      {
        label:
          'Weinreb RN et al. Bimatoprost implant biodegradation in the phase 3, randomized, 20-month ARTEMIS studies. J Ocul Pharmacol Ther 2023;39:55-62',
        identifier: '10.1089/jop.2022.0137',
        kind: 'doi',
      },
      {
        label:
          'Li T et al. Comparative effectiveness of first-line medications for primary open-angle glaucoma: a systematic review and network meta-analysis. Ophthalmology 2016;123:129-140',
        identifier: '10.1016/j.ophtha.2015.09.005',
        kind: 'doi',
      },
      {
        label:
          'Taketani Y et al. Activation of the prostanoid FP receptor inhibits adipogenesis leading to deepening of the upper eyelid sulcus in prostaglandin-associated periorbitopathy. Invest Ophthalmol Vis Sci 2014;55:1269-1276',
        identifier: '10.1167/iovs.13-12589',
        kind: 'doi',
      },
      {
        label:
          'Sakata R et al. Recovery from deepening of the upper eyelid sulcus after switching from bimatoprost to latanoprost. Jpn J Ophthalmol 2013;57:179-184',
        identifier: '10.1007/s10384-012-0219-3',
        kind: 'doi',
      },
      {
        label: 'ARTEMIS bimatoprost implant phase 3 study 1',
        identifier: 'NCT02247804',
        kind: 'nct',
      },
      {
        label: 'ARTEMIS bimatoprost implant phase 3 study 2',
        identifier: 'NCT02250651',
        kind: 'nct',
      },
      {
        label:
          'Drugs@FDA: LUMIGAN (bimatoprost ophthalmic solution) 0.03%, NDA 021275, AbbVie — original approval 16 March 2001; LUMIGAN 0.01% is NDA 022184, approved 31 August 2010',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021275',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 5311027 — bimatoprost structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5311027',
        kind: 'url',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey, generic listing effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 6. Travoprost — approved the same day as bimatoprost, statistically tied with latanoprost, and
  //    carrying a race-based subgroup sentence on its label that has gone unresolved for 25 years.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'travoprost',
    name: 'Travoprost',
    tradeName: 'Travatan Z',
    sponsor: 'Alcon Pharmaceuticals Ltd',
    targetGene: 'PTGFR — the human prostaglandin F2-alpha receptor gene',
    targetProtein: 'FP prostanoid receptor on ciliary muscle and trabecular meshwork cells',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2001,
    indication:
      'Reduction of elevated intraocular pressure in patients with open-angle glaucoma or ocular hypertension',
    patientFriendlyIndication: 'High pressure inside the eye, and the nerve damage it causes',
    anatomicalSite:
      'Ciliary muscle and the uveoscleral outflow pathway at the front of the eye, reached through the cornea',
    conditionContext: {
      conditionExplainer:
        'Glaucoma is optic nerve damage that follows sustained pressure inside the eye. The pressure comes from an imbalance between fluid produced and fluid drained. Travoprost widens the slower of the eye’s two drainage routes.',
      whyItMatters:
        'Travoprost, latanoprost and bimatoprost are separated in the pooled ranking by less than a millimetre of mercury with overlapping intervals. Which one a patient ends up on is decided by tolerability, formulation and price rather than by measured superiority, and this page is about what actually distinguishes them.',
      whoTakesThis:
        'Adults with open-angle glaucoma or ocular hypertension, as a once-daily evening drop. A preservative-free-of-benzalkonium formulation exists for people whose ocular surface cannot tolerate the standard preservative, and an intracameral implant exists for people who cannot manage drops at all.',
      clinicalGoals:
        'A reduction in millimetres of mercury. The label reports 7 to 8 mmHg reductions from a baseline of 25 to 27 mmHg, and then adds a subgroup sentence about race that it has never been able to explain.',
    },
    oneSentenceVerdict:
      'A trifluoromethylphenoxy prostaglandin analogue that reaches the FP receptor as its hydrolysed free acid and opens the uveoscleral outflow route, lowering pressure 4.83 mmHg at three months across 114 pooled trials — third of fourteen, statistically tied with latanoprost — and carrying on its label since 2001 an unresolved subgroup finding that the reduction in black patients was up to 1.8 mmHg greater, which the label itself says may be race or may be iris pigmentation.',
    laymanHowItWorks:
      'The eye drains fluid two ways, and the slower route passes through the muscle ring behind the iris. Travoprost is inactive as supplied: enzymes in the cornea strip a chemical tail off it on the way in, releasing the working form. That switches on a receptor in the muscle, the cells break down some of the connective tissue between the fibres, gaps widen and fluid leaves faster.',
    auditConfidence: 'High Confidence',
    confidenceScore: 80,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$9.33 per millilitre, median across the 14 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Travatan was approved 16 March 2001 under NDA 021257, the same day as Lumigan, and Travatan Z followed on 21 September 2006 under NDA 021994 with the benzalkonium chloride replaced by a borate-zinc ionic buffer. A travoprost intracameral implant was approved 13 December 2023 under NDA 218010. Generic travoprost carries 14 listed products at a median acquisition cost of US$9.33 per millilitre, roughly six times generic latanoprost for a drug the pooled analysis cannot distinguish from it.',
      synthesisComplexity: 'Moderate',
      costSource: {
        label:
          'Nearest published cost-of-production analysis: Hill AM, Barber MJ, Gotham D. Estimated costs of production and potential prices for the WHO Essential Medicines List. BMJ Glob Health 2018;3:e000571. Its methods restrict the analysis to solid oral formulations and exclude eye drops, which is why the synthesis cost field on this page is empty.',
        identifier: '10.1136/bmjgh-2017-000571',
        kind: 'doi',
      },
      priceSource: {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey, generic listing effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    },
    substitutes: {
      summary:
        'Travoprost’s nearest competitor is latanoprost, and the pooled analysis puts them 0.02 mmHg apart, which is nothing. The 12-month head-to-head trial found travoprost 0.8 mmHg lower at one time of day, on a sponsor-run study. Against that, latanoprost costs about a sixth as much per millilitre and has the only placebo-controlled visual field trial in the field. The genuinely different alternatives are the travoprost implant and laser.',
      conventionalRx: [
        {
          name: 'Latanoprost (Xalatan)',
          class: 'Prostaglandin F2-alpha analogue',
          howItCompares:
            'Second in the pooled ranking at 4.85 mmHg against travoprost’s 4.83, a difference of 0.02 mmHg with heavily overlapping credible intervals. In the manufacturer-run 12-month comparison, travoprost 0.004% was 0.8 mmHg lower than latanoprost at 4 PM across pooled visits (P = .0191) with response rates of 54.7% against 49.6%.',
          typicalCost:
            'US$1.57 per millilitre, median across the 13 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: roughly one sixth the acquisition cost, and the only glaucoma drop with a placebo-controlled visual field outcome. Cons: iris pigmentation change occurred in 5.2% against 3.1% on travoprost 0.004% in the head-to-head trial.',
        },
        {
          name: 'Bimatoprost (Lumigan)',
          class: 'Prostamide, reaching the same receptor through its free acid',
          howItCompares:
            'First in the pooled ranking at 5.61 mmHg against travoprost’s 4.83, again with overlapping intervals. Approved on the same day as Travatan in March 2001.',
          typicalCost:
            'US$8.87 per millilitre, median across the 31 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: the largest pooled pressure reduction of any single drop. Cons: the most conjunctival redness in the class and the most marked periorbital fat loss.',
        },
        {
          name: 'Travoprost intracameral implant (iDose TR)',
          class: 'The same molecule as a slow-eluting implant placed inside the eye',
          howItCompares:
            'In a 590-patient randomised double-masked pivotal trial, the slow-eluting implant was non-inferior to twice-daily timolol drops at months 3, 6, 9 and 12. Of patients on glaucoma medication at screening, 83.5% of implant patients were on fewer topical medications at month 12 against 23.9% of the timolol group (P<0.0001).',
          typicalCost:
            'Not listed in the CMS National Average Drug Acquisition Cost survey consulted for this page — it is a physician-administered implant rather than a dispensed drop',
          prosAndCons:
            'Pros: removes daily instillation and preservative exposure for most patients. Cons: an intraocular procedure, treatment-emergent adverse events in 39.5% of implant patients against 20.1% on timolol, and non-inferiority was demonstrated against timolol, not against a prostaglandin analogue.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask which formulation you are being given',
          action:
            'Ask whether the bottle is preserved with benzalkonium chloride or with the borate-zinc ionic buffer, particularly if you already have dry eye or surface irritation.',
          patientImpact:
            'Travatan Z substitutes a borate, propylene glycol, sorbitol and zinc chloride buffer for benzalkonium chloride. The reformulation exists because benzalkonium damages the ocular surface over years of daily use, and generic travoprost is supplied in both preserved and ionic-buffered versions.',
          clinicalPrecaution:
            'This is a formulation difference, not a difference in the drug. Both deliver travoprost 0.04 mg per millilitre at approximately pH 5.7, and the pressure-lowering evidence applies to both.',
        },
        {
          name: 'Get a baseline iris photograph if your eyes are mixed-coloured',
          action:
            'Ask for a photograph before the first drop, especially if only one eye is being treated.',
          patientImpact:
            'Iris pigmentation change was documented in 6 of 196 patients on travoprost 0.004% (3.1%) and 10 of 201 on travoprost 0.0015% (5.0%) in the 12-month comparative trial, against 10 of 194 on latanoprost (5.2%) and none of 196 on timolol.',
          clinicalPrecaution:
            'The change is an increase in melanin within existing iris cells rather than new cells, and it does not reverse when the drug is stopped. A single treated eye can end up visibly darker than the other.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CC(C)OC(=O)CCC/C=C\\C[C@H]1[C@H](C[C@H]([C@@H]1/C=C/[C@H](COC2=CC=CC(=C2)C(F)(F)F)O)O)O',
      chemicalFormula: 'C26H35F3O6',
      molecularWeight: '500.50 g/mol',
      targetReceptorAffinity:
        'Supplied as an isopropyl ester prodrug and hydrolysed by corneal esterases to travoprost free acid, a highly selective and potent FP prostanoid receptor agonist. The structural difference from latanoprost is at the omega end: a 3-trifluoromethylphenoxy group joined through an ether oxygen, replacing latanoprost’s simple phenyl on a saturated chain, and a 13,14 double bond that latanoprost lacks. The label describes the compound as a pale yellow to yellowish viscous oil, freely soluble in acetonitrile, toluene, ethyl acetate and methanol and practically insoluble in water, which is why the finished product is a buffered aqueous solution containing a castor-oil solubiliser.',
      structureSource: {
        label: 'PubChem CID 5282226 (travoprost) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5282226',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'trv-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Stereochemistry of the cyclopentane core and the 15R configuration',
          description:
            'Confirm every stereocentre, and in particular the configuration at C15 bearing the secondary alcohol next to the trifluoromethylphenoxy ether. The label’s chemical name specifies 3R* at that position, and the epimer is a substantially weaker FP agonist rather than an equivalent one.',
          reagentsAndBuffer:
            'Travoprost reference standard, chiral HPLC with polysaccharide stationary phase, 1H, 13C and 19F NMR in deuterochloroform, optical rotation',
        },
        {
          id: 'trv-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Ether coupling of the 3-trifluoromethylphenol to the omega chain',
          description:
            'Join 3-(trifluoromethyl)phenol through an ether linkage to the omega side chain, then esterify the acid to the isopropyl ester. The aryl ether is the design element that distinguishes travoprost from latanoprost, and the trifluoromethyl group is what raises FP potency and metabolic stability at that end of the molecule.',
          dependsOnStepId: 'trv-w1',
          reagentsAndBuffer:
            '3-(trifluoromethyl)phenol, Mitsunobu or Williamson conditions, isopropyl esterification reagents, anhydrous aprotic solvent, nitrogen atmosphere, low temperature to protect the allylic alcohols',
        },
        {
          id: 'trv-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Removal of the 15-keto and 5,6-trans impurities from the viscous oil',
          description:
            'Separate the 15-position oxidation product and the alkene isomer. Travoprost is isolated as an oil rather than a crystalline solid, so there is no recrystallisation step to fall back on and the entire purity burden sits on chromatography and on protecting the material from light and air afterwards.',
          dependsOnStepId: 'trv-w2',
          reagentsAndBuffer:
            'Preparative reversed-phase or normal-phase chromatography, ethyl acetate and heptane gradient, amber glassware under nitrogen, stability-indicating HPLC with 19F NMR confirmation',
        },
        {
          id: 'trv-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Corneal esterase hydrolysis with solubiliser present',
          description:
            'Run permeation across excised cornea in the actual finished vehicle, including the polyoxyl 40 hydrogenated castor oil solubiliser, and quantify free acid on the far side. Testing the drug in a simple buffer misses the point: the compound is practically insoluble in water and its delivery depends on the surfactant system as much as on its own lipophilicity.',
          dependsOnStepId: 'trv-w3',
          reagentsAndBuffer:
            'Excised cornea in a Franz-type diffusion cell, the finished ionic buffered vehicle at pH 5.7 and 290 mOsmol/kg, LC-MS/MS quantification of travoprost and travoprost free acid',
        },
        {
          id: 'trv-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'FP potency and melanin-binding measurement in pigmented iris tissue',
          description:
            'Measure agonist potency of the free acid at the recombinant FP receptor, then measure binding to melanin in pigmented iris preparations. The second assay is the one that speaks to the label’s unresolved subgroup sentence: if heavily pigmented irides sequester or release drug differently, that is a pharmacological explanation for a difference the label attributes to race or pigmentation without deciding which.',
          dependsOnStepId: 'trv-w4',
          reagentsAndBuffer:
            'Cells expressing recombinant human FP receptor, calcium-sensitive fluorescent dye, synthetic and natural melanin preparations, pigmented and albino iris tissue, prostaglandin F2-alpha as reference agonist',
        },
      ],
    },
    keyAudits: [
      {
        id: 'trv-a1',
        category: 'measured',
        title: 'Third of fourteen, and 0.02 mmHg from second',
        laymanSummary:
          'Pooling 114 trials, travoprost lowers pressure 4.83 millimetres of mercury. Latanoprost is at 4.85. The two are indistinguishable, and both sit just behind bimatoprost.',
        technicalDetails:
          'In the Bayesian network meta-analysis of 114 randomised trials with data from 20,275 participants, travoprost reduced intraocular pressure at 3 months by 4.83 mmHg (95% credible interval 4.12 to 5.54), third of fourteen first-line agents. Latanoprost was 4.85 (4.24 to 5.46) and bimatoprost 5.61 (4.94 to 6.29). Timolol, the standard comparator, was 3.70 (3.16 to 4.24). The authors state that bimatoprost, latanoprost and travoprost are among the most efficacious drugs, that within-class differences were small and may not be clinically meaningful, and that adverse effects, patient preference and cost should be weighed alongside.',
        evidenceSource: 'Li T et al., Ophthalmology 2016;123:129-140',
        doi: '10.1016/j.ophtha.2015.09.005',
        measuredMetric:
          'Mean intraocular pressure reduction at 3 months, pooled across 114 randomised trials',
        auditFlag: 'verified',
      },
      {
        id: 'trv-a2',
        category: 'measured',
        title: 'Twelve months against both rivals in 801 patients',
        laymanSummary:
          'A year-long four-arm trial compared two strengths of travoprost, latanoprost and timolol. Travoprost was equal or slightly better than latanoprost and clearly better than timolol, with the advantage over latanoprost amounting to 0.8 millimetres of mercury at one time of day.',
        technicalDetails:
          'Eight hundred and one patients with open-angle glaucoma or ocular hypertension were randomly assigned to travoprost 0.0015%, travoprost 0.004%, latanoprost 0.005% or timolol 0.5% for 12 months. Mean intraocular pressure over visits and time of day ranged from 17.9 to 19.1 mmHg on travoprost 0.0015%, 17.7 to 19.1 on travoprost 0.004%, 18.5 to 19.2 on latanoprost and 19.4 to 20.3 on timolol. Pooled across visits at 4 PM, travoprost was 0.7 mmHg lower than latanoprost at 0.0015% (P = .0502) and 0.8 mmHg lower at 0.004% (P = .0191). By the criterion of a 30% or greater reduction from diurnal baseline or a pressure of 17 mmHg or less, response was 49.3% and 54.7% for the two travoprost strengths, 49.6% for latanoprost and 39.0% for timolol. Average ocular hyperemia scored under 1 on a 0 to 3 scale in every arm.',
        evidenceSource: 'Netland PA et al., Am J Ophthalmol 2001;132:472-484',
        doi: '10.1016/s0002-9394(01)01177-1',
        measuredMetric:
          'Mean intraocular pressure over visits and time of day across 12 months, four arms',
        auditFlag: 'verified',
      },
      {
        id: 'trv-a3',
        category: 'inferred',
        title: 'A race-based subgroup claim has been on the label since 2001, unresolved',
        laymanSummary:
          'The label states that pressure fell up to 1.8 millimetres of mercury more in black patients, then says it is not known whether that is because of race or because of darker irises. Twenty-five years later the sentence is still there, and still says that.',
        technicalDetails:
          'The Clinical Studies section of the current travoprost label reads: "In sub-group analyses of these studies, mean IOP reduction in black patients was up to 1.8 mmHg greater than in non-black patients. It is not known at this time whether this difference is attributed to race or to heavily pigmented irides." The finding originates in the registration programme and appears in the 12-month comparative trial, where travoprost 0.004% was more effective than latanoprost by up to 2.4 mmHg and than timolol by up to 4.6 mmHg in black patients, and the abstract states it as a conclusion. Three separate problems sit on top of each other. It is a subgroup analysis in trials not designed or powered for it. Race in these trials is self-identified social category, not a biological variable, while iris melanin is measurable and was not measured. And the mechanistic hypothesis the label raises — that melanin binding alters drug availability — is testable and, on the evidence of the label’s own wording, still untested after a quarter of a century.',
        evidenceSource:
          'TRAVATAN Z (travoprost ophthalmic solution) 0.004% US prescribing information, Clinical Studies section (NDA 021994); Netland PA et al., Am J Ophthalmol 2001;132:472-484',
        doi: '10.1016/s0002-9394(01)01177-1',
        inferredClaim:
          'That travoprost works better in black patients — a subgroup finding from trials not designed to test it, resting on a self-identified social category as a proxy for an unmeasured biological one, and printed on the label for 25 years with the mechanism still declared unknown',
        auditFlag: 'contested',
      },
      {
        id: 'trv-a4',
        category: 'failed',
        title: 'The sponsor ran the trial its own drug won by 0.8 mmHg',
        laymanSummary:
          'The head-to-head study that showed travoprost slightly ahead of latanoprost was run by the company that makes travoprost. The margin was 0.8 millimetres of mercury at one time of day, and the second strength missed statistical significance at 0.0502.',
        technicalDetails:
          'The 801-patient 12-month comparison was conducted by the Travoprost Study Group with authorship including multiple Alcon employees. The efficacy conclusion rests on differences of 0.7 and 0.8 mmHg against latanoprost at a single time of day pooled across visits, with the 0.0015% comparison at P = .0502 — a value on the wrong side of the conventional threshold reported without adjustment for the multiple time points and arms examined. Response rates by the trial’s own responder criterion were 54.7% for travoprost 0.004% against 49.6% for latanoprost, a difference of five percentage points. The independent pooled analysis of 114 trials, which is not sponsor-run, separates the two drugs by 0.02 mmHg. The safety comparison ran the other way: iris pigmentation change occurred in 5.2% of latanoprost patients against 3.1% on travoprost 0.004% and 5.0% on 0.0015%, so the sponsor’s own trial reports its drug ahead on efficacy at one dose and behind at the other on the same endpoint.',
        evidenceSource:
          'Netland PA et al., Am J Ophthalmol 2001;132:472-484; Li T et al., Ophthalmology 2016;123:129-140',
        doi: '10.1016/j.ophtha.2015.09.005',
        measuredMetric:
          'Sponsor-run head-to-head difference against independent pooled network estimate',
        auditFlag: 'caution',
      },
      {
        id: 'trv-a5',
        category: 'failed',
        title: 'Two reformulations for problems the original formulation caused',
        laymanSummary:
          'Travatan Z exists because the preservative in the original damaged the ocular surface. The implant exists because a daily drop is a treatment many people cannot keep up for decades. Neither improves the molecule.',
        technicalDetails:
          'Travatan Z replaced benzalkonium chloride with an ionic buffered system of boric acid, propylene glycol, sorbitol and zinc chloride, and was approved 21 September 2006 under NDA 021994, five years after the original. Benzalkonium chloride is a quaternary ammonium detergent that damages corneal and conjunctival epithelium with chronic exposure, and a glaucoma drop is chronic exposure by definition. The travoprost intracameral implant was approved 13 December 2023 under NDA 218010 after a 590-patient randomised, double-masked trial in which the slow-eluting implant was non-inferior to twice-daily timolol at months 3, 6, 9 and 12, and 83.5% of implant patients on medication at screening were on fewer topical medications at month 12 against 23.9% of the timolol group (P<0.0001). Treatment-emergent adverse events, mostly mild, occurred in 39.5% of implant eyes against 20.1% on timolol. The implant’s comparator was timolol, not a prostaglandin analogue, so it establishes non-inferiority to a weaker drug.',
        evidenceSource:
          'Sarkisian SR et al., Ophthalmol Ther 2024;13:995-1014 (NCT03519386); TRAVATAN Z US prescribing information, Description section',
        doi: '10.1007/s40123-024-00898-y',
        measuredMetric:
          'Non-inferiority of the slow-eluting implant to twice-daily timolol at 12 months, and medication burden at month 12',
        auditFlag: 'caution',
      },
      {
        id: 'trv-a6',
        category: 'conclusion_shift',
        title: 'Two drugs approved on the same day, and the field never separated them',
        laymanSummary:
          'Travoprost and bimatoprost were both approved on 16 March 2001, each with trials showing superiority to timolol. Twenty-five years and 114 pooled trials later, nobody can show a clinically meaningful difference between them or latanoprost.',
        technicalDetails:
          'Travatan was approved under NDA 021257 and Lumigan under NDA 021275 on the same date. Each brought registration trials establishing superiority to timolol, and each subsequently generated head-to-head trials against latanoprost and against each other. The independent Bayesian network meta-analysis of 114 randomised trials in 20,275 participants placed all three within 0.78 mmHg of one another with overlapping credible intervals, and its authors concluded that within-class differences were small and may not be clinically meaningful. The practical consequence is that the choice between the three prostaglandin analogues is not an efficacy question at all: the acquisition-cost survey separates them by a factor of six, from US$1.57 per millilitre for latanoprost to US$9.33 for travoprost and US$8.87 for bimatoprost, and the side effect profiles differ more than the pressure numbers do.',
        evidenceSource:
          'Li T et al., Ophthalmology 2016;123:129-140; Drugs@FDA NDA 021257 and NDA 021275',
        doi: '10.1016/j.ophtha.2015.09.005',
        inferredClaim:
          'That the three prostaglandin analogues are meaningfully different from one another on efficacy — a premise every head-to-head trial was built on and the independent pooled analysis dissolved',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'One evening drop of an oil made water-compatible',
        laymanDesc:
          'Travoprost is an oil that does not dissolve in water. The bottle contains a detergent-like ingredient whose only job is to keep it suspended in a watery drop.',
        molecularDetail:
          'The label describes travoprost as a viscous oil, practically insoluble in water. The finished product is a buffered aqueous solution at approximately pH 5.7 and 290 mOsmol/kg containing 0.04 mg per millilitre of drug with polyoxyl 40 hydrogenated castor oil as solubiliser. Travatan Z uses an ionic borate-zinc buffer in place of benzalkonium chloride as preservative.',
        iconName: 'Droplet',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The cornea cuts the ester off as the drug passes through',
        laymanDesc:
          'What goes in is not what works. Enzymes in the cornea snip off a chemical tail during the crossing, releasing the active acid on the inside.',
        molecularDetail:
          'Corneal esterases hydrolyse the isopropyl ester to travoprost free acid during passage through the epithelium and stroma. The ester exists to raise lipophilicity for corneal penetration; the acid is the species that binds the receptor and penetrates the cornea poorly on its own.',
        iconName: 'Scissors',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The free acid switches on the FP receptor',
        laymanDesc:
          'The active form binds a single receptor on the muscle behind the iris — the same one latanoprost and bimatoprost reach. The fluorinated ring on this molecule makes it stick harder.',
        molecularDetail:
          'Travoprost free acid is a highly selective and potent agonist at the FP prostanoid receptor on ciliary muscle and trabecular meshwork. The 3-trifluoromethylphenoxy group at the omega end raises FP potency and metabolic stability relative to latanoprost’s unsubstituted phenyl, and the 13,14 double bond that latanoprost lacks contributes to the conformation at the binding site.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Connective tissue is remodelled and the secondary drain opens',
        laymanDesc:
          'The receptor tells the cells to dismantle some of the packing between the muscle bundles. Channels widen over days to weeks and fluid leaves faster.',
        molecularDetail:
          'FP activation upregulates matrix metalloproteinases in the ciliary muscle, remodelling the extracellular matrix of the uveoscleral outflow pathway and reducing hydraulic resistance. The transcriptional nature of the response explains the lag to full effect and the sustained rather than pulsatile pressure reduction.',
        iconName: 'Wrench',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Pressure settles about five millimetres lower',
        laymanDesc:
          'Pressure falls by roughly five millimetres of mercury on average. The label reports seven to eight from a high starting point, and holds it for a full year in the trials.',
        molecularDetail:
          'Pooled reduction is 4.83 mmHg (95% credible interval 4.12 to 5.54) at three months, third of fourteen. The label reports 7 to 8 mmHg reductions from a baseline of 25 to 27 mmHg. In the 12-month comparison, mean pressure on travoprost 0.004% ranged 17.7 to 19.1 mmHg across visits and times of day against latanoprost’s 18.5 to 19.2.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And a sentence about race the label cannot explain',
        laymanDesc:
          'The label adds that pressure fell up to 1.8 millimetres more in black patients, then immediately says nobody knows whether that is about race or about darker irises. Both halves have been printed unchanged since 2001.',
        molecularDetail:
          'The proposed pharmacological mechanism is melanin binding: heavily pigmented irides contain more melanin, prostaglandin analogues bind melanin, and bound drug may be released differently over time. That hypothesis is measurable in pigmented and albino iris tissue and has not resolved the label’s wording. Meanwhile the variable actually recorded in the trials was self-identified race, which is not the same measurement as iris melanin content and cannot substitute for it.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Travoprost Study Group 12-month comparison (Netland 2001)',
        phase: 'Randomised, active-controlled, four-arm, 12-month',
        sampleSize: 801,
        primaryEndpoint:
          'Mean intraocular pressure over visits and time of day, two travoprost strengths against latanoprost and timolol',
        endpointMet: true,
        statisticalPValue:
          'Travoprost 0.004% 0.8 mmHg below latanoprost at 4 PM pooled across visits (P = .0191); travoprost 0.0015% 0.7 mmHg below (P = .0502)',
        unreportedAdverseSignals:
          'Sponsor-run, with the winning drug’s manufacturer among the authors. One of the two efficacy comparisons missed significance at P = .0502, and iris pigmentation change was higher on travoprost 0.0015% (5.0%) than on travoprost 0.004% (3.1%), an inconsistency the paper does not address.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'iDose TR pivotal phase 3 (NCT03519386)',
        phase: 'Prospective, multicentre, randomised, double-masked, sham-controlled, 12-month',
        sampleSize: 590,
        primaryEndpoint:
          'Mean change from baseline intraocular pressure at 8 AM and 10 AM at day 10, week 6 and month 3, implant against twice-daily timolol',
        endpointMet: true,
        statisticalPValue:
          'Non-inferiority met at all six timepoints and at months 6, 9 and 12 for the slow-eluting implant; 83.5% against 23.9% on fewer topical medications at month 12, P < 0.0001',
        unreportedAdverseSignals:
          'The comparator is timolol, which the pooled analysis ranks 1.13 mmHg below travoprost drops, so non-inferiority here is against a weaker treatment. Treatment-emergent adverse events occurred in 39.5% of implant eyes against 20.1% on timolol. Every listed author affiliation includes the sponsor or sponsor funding.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'UKGTS (ISRCTN96423140), class-level vision evidence',
        phase: 'Randomised, triple-masked, placebo-controlled',
        sampleSize: 516,
        primaryEndpoint: 'Time to visual field deterioration within 24 months',
        endpointMet: true,
        statisticalPValue: 'Adjusted hazard ratio 0.44 (95% CI 0.28 to 0.69), P = 0.0003',
        unreportedAdverseSignals:
          'Tested latanoprost, not travoprost. It is cited here because it is the only placebo-controlled visual function trial of any drop in this class, and travoprost’s claim to preserve vision is inherited from it.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Mean pressure reduction of 4.83 mmHg (95% credible interval 4.12 to 5.54) at three months, third of fourteen agents across 114 pooled trials',
        'Mean pressure 17.7 to 19.1 mmHg on travoprost 0.004% against latanoprost’s 18.5 to 19.2 across 12 months in 801 randomised patients',
        'Iris pigmentation change in 3.1% on travoprost 0.004%, 5.0% on 0.0015%, 5.2% on latanoprost and 0% on timolol',
        'Non-inferiority of the slow-eluting intracameral implant to twice-daily timolol at 12 months in 590 randomised patients',
      ],
      unsupportedInferences: [
        'That travoprost works better in black patients — a subgroup finding the label itself cannot attribute to race or to iris pigmentation, printed unchanged since 2001',
        'That the 0.8 mmHg advantage over latanoprost at one time of day in a sponsor-run trial is real; the independent pooled analysis separates them by 0.02 mmHg',
        'That travoprost preserves vision — no trial of this drug has used a visual outcome, and the placebo-controlled field trial in this class tested latanoprost',
        'That the implant is equivalent to travoprost drops, when its trial demonstrated non-inferiority to timolol',
      ],
      whatFailedInitially: [
        'The original benzalkonium-preserved formulation was replaced five years later by an ionic buffered version because the preservative damages the ocular surface with chronic use',
        'One of the two head-to-head efficacy comparisons against latanoprost missed significance at P = .0502 and is reported alongside the one that did not',
        'The race subgroup sentence has sat on the label for 25 years with its mechanism explicitly declared unknown, and the measurable alternative explanation was never measured',
        'The implant produced treatment-emergent adverse events in 39.5% of eyes against 20.1% on timolol drops',
      ],
      realWorldOutcome: [
        'Approved 16 March 2001 under NDA 021257, the same day as bimatoprost, with the benzalkonium-free Travatan Z following in 2006 under NDA 021994',
        'A travoprost intracameral implant was approved 13 December 2023 under NDA 218010, the first sustained-release prostaglandin analogue for the eye',
        'Now generic with 14 listed products at a median United States acquisition cost of US$9.33 per millilitre, roughly six times generic latanoprost',
        'Statistically indistinguishable from latanoprost in the independent pooled analysis, which makes price and formulation the operative difference',
      ],
    },
    deliverySystem: {
      type: 'Topical ophthalmic solution 0.004%, once daily in the evening; also a slow-eluting intracameral implant',
      description:
        'A buffered aqueous solution at approximately pH 5.7 containing an oil that is practically insoluble in water, held in suspension by a castor-oil-derived solubiliser. Travatan Z substitutes a boric acid, propylene glycol, sorbitol and zinc chloride ionic buffer for benzalkonium chloride. The intracameral implant places the same molecule inside the anterior chamber and elutes it over months, removing daily instillation.',
      safetyProfile:
        'Increased brown iris pigmentation, permanent, in roughly 3% of patients on the 0.004% strength in the 12-month comparison. Eyelash lengthening, thickening and darkening. Conjunctival hyperemia, scored below 1 on a 0 to 3 scale on average in the comparative trial. Eyelid skin darkening and prostaglandin-associated periorbitopathy, both class effects described after approval. Rare macular oedema, chiefly in aphakic or pseudophakic eyes with a torn posterior capsule. No systemic beta-blockade and no respiratory or cardiac contraindications. The intracameral implant carries the additional risks of an intraocular procedure, with treatment-emergent adverse events in 39.5% of implant eyes against 20.1% for timolol drops in its pivotal trial.',
    },
    commonQuestions: [
      {
        q: 'Is travoprost better than latanoprost?',
        a: 'The independent evidence says they are the same drug for practical purposes. The pooled analysis of 114 randomised trials in 20,275 people puts travoprost at 4.83 millimetres of mercury and latanoprost at 4.85, a difference of 0.02 mmHg with heavily overlapping intervals. There is one head-to-head trial in 801 patients that found travoprost 0.8 mmHg lower at 4 PM, and it was run by travoprost’s manufacturer, with the second strength missing significance at 0.0502. Against that, latanoprost costs about a sixth as much per millilitre in the same acquisition survey, and it is the one drop in this class with a placebo-controlled trial showing preserved visual field. If there is a reason to choose travoprost it is formulation or tolerability, not pressure.',
        auditNote:
          'A sponsor-run head-to-head showing 0.8 mmHg and an independent network of 114 trials showing 0.02 mmHg is the usual shape of this comparison across the whole class.',
      },
      {
        q: 'The label says it works better in black patients. What does that mean?',
        a: 'It means less than it appears to, and the label says so in the next sentence. The wording is: mean pressure reduction in black patients was up to 1.8 mmHg greater than in non-black patients, and it is not known whether this difference is attributed to race or to heavily pigmented irides. Three things are wrong with treating that as a prescribing fact. It comes from subgroup analyses of trials that were not designed or powered to test it. Race as recorded in a trial is a self-identified social category, not a biological measurement. And the biological explanation the label reaches for — that melanin in the iris binds and releases the drug differently — is measurable in tissue and, judging by the fact that the sentence has not changed since 2001, has not been settled. The honest reading is that a difference was observed, the reason is unknown, and the variable actually recorded is a proxy for something nobody measured.',
        auditNote:
          'This is the clearest example in this batch of a subgroup finding surviving on a label for a quarter of a century because nobody was required to resolve it.',
      },
      {
        q: 'What is Travatan Z and why does it exist?',
        a: 'It is the same drug with the preservative changed. The original formulation used benzalkonium chloride, a detergent that keeps the bottle sterile and damages corneal and conjunctival surface cells with prolonged exposure. A glaucoma drop is taken daily for decades, so prolonged exposure is the whole point. Travatan Z replaced it with an ionic buffered system of boric acid, propylene glycol, sorbitol and zinc chloride, approved in 2006, five years after the original. Generic travoprost is available in both versions. If your eyes are already dry or irritated, which formulation you get is a more consequential question than which prostaglandin analogue you are on.',
      },
      {
        q: 'Will my eye colour change?',
        a: 'It can, and less often than with latanoprost according to the one trial that measured both. In the 12-month four-arm comparison, iris pigmentation change was documented in 6 of 196 patients on travoprost 0.004% (3.1%), 10 of 201 on travoprost 0.0015% (5.0%), 10 of 194 on latanoprost (5.2%) and none of 196 on timolol. Note that the lower travoprost strength produced more pigmentation change than the higher one, which the paper does not explain and which is a reason not to read too much into a difference of a few patients. The change itself is an increase in melanin inside existing iris cells, it is most visible in mixed-colour irides, and it does not reverse when the drug is stopped.',
      },
      {
        q: 'There is an implant now. Should I have that instead of drops?',
        a: 'It depends what problem you are solving, and the trial answers a narrower question than it first appears. The pivotal study randomised 590 patients to a slow-eluting travoprost implant, a fast-eluting one, or twice-daily timolol drops, and the slow-eluting implant was non-inferior to timolol at 3, 6, 9 and 12 months. Of patients who were on glaucoma medication at screening, 83.5% of implant patients were on fewer topical medications at 12 months against 23.9% in the timolol group. That is a real result about treatment burden. But the comparator was timolol, which the pooled analysis ranks more than a millimetre below travoprost drops, so the trial does not show the implant matches travoprost drops. And treatment-emergent adverse events occurred in 39.5% of implant eyes against 20.1% on timolol, because it is an intraocular procedure and drops are not.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Netland PA et al. Travoprost compared with latanoprost and timolol in patients with open-angle glaucoma or ocular hypertension. Am J Ophthalmol 2001;132:472-484',
        identifier: '10.1016/s0002-9394(01)01177-1',
        kind: 'doi',
      },
      {
        label:
          'Li T et al. Comparative effectiveness of first-line medications for primary open-angle glaucoma: a systematic review and network meta-analysis. Ophthalmology 2016;123:129-140',
        identifier: '10.1016/j.ophtha.2015.09.005',
        kind: 'doi',
      },
      {
        label:
          'Sarkisian SR et al. Travoprost intracameral implant for open-angle glaucoma or ocular hypertension: 12-month results of a randomized, double-masked trial. Ophthalmol Ther 2024;13:995-1014',
        identifier: '10.1007/s40123-024-00898-y',
        kind: 'doi',
      },
      {
        label:
          'Garway-Heath DF et al. Latanoprost for open-angle glaucoma (UKGTS): a randomised, multicentre, placebo-controlled trial. Lancet 2015;385:1295-1304',
        identifier: '10.1016/S0140-6736(14)62111-5',
        kind: 'doi',
      },
      {
        label: 'iDose TR travoprost intracameral implant pivotal phase 3 trial',
        identifier: 'NCT03519386',
        kind: 'nct',
      },
      {
        label:
          'Drugs@FDA: TRAVATAN Z (travoprost ophthalmic solution) 0.004%, NDA 021994, Alcon — approved 21 September 2006; the original TRAVATAN is NDA 021257, approved 16 March 2001. Clinical Studies and Description sections quoted.',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021994',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA: iDOSE TR (travoprost intracameral implant), NDA 218010, Glaukos — original approval 13 December 2023',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=218010',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 5282226 — travoprost structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5282226',
        kind: 'url',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey, generic listing effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    ],
  },
]
