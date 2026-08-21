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
]
