import type { SeedDossier } from '@/lib/seed-types'

/**
 * Curated flagship dossiers — the antibiotics people are actually prescribed: the two
 * cephalosporins that sit at either end of a hospital, the two aminoglycosides that share one
 * boxed warning, the four drugs that make up the tuberculosis regimen, and the sulfone that leprosy
 * control was built on and then had to be rescued from.
 *
 * Editorial layer written over the machine-enriched records: the verdict, the mechanism carousel
 * and the audits, which no pipeline can produce. The identity facts — slug, trade name, sponsor,
 * approval year, SMILES — are copied from the enriched record rather than researched again.
 *
 * Every DOI, PMID, NCT number and FDA application referenced below was resolved against the NCBI
 * E-utilities, the ClinicalTrials.gov registry or the openFDA label endpoint at the time of
 * writing. Sample sizes, relapse rates, hazard ratios, confidence intervals and p-values are copied
 * from the published abstract or the FDA label, never from memory. Where a number could not be
 * sourced, the field is absent.
 *
 * Six conventions apply to the whole group.
 *
 * 1. THE ENDPOINT OF AN ANTIBIOTIC TRIAL IS USUALLY NOT DEATH. It is clinical cure, or sputum
 *    culture conversion, or bacteriological relapse, or a change in FEV1. Those are real
 *    measurements and they are not survival, and every page says which one it is quoting. The two
 *    pages here with a mortality result — ceftazidime in melioidosis, rifampin in the tuberculosis
 *    regimen — say so explicitly, because they are the exceptions.
 *
 * 2. RESISTANCE IS PART OF THE EFFICACY RESULT, NOT A FOOTNOTE TO IT. A drug that cures this
 *    patient and selects the organism that kills the next one has been measured incompletely.
 *    Dapsone monotherapy in leprosy, third-generation cephalosporins in Enterobacter, rifampin
 *    given alone, tobramycin cycled for years in cystic fibrosis: each page carries the resistance
 *    result at the same weight as the cure result.
 *
 * 3. A LABEL CLAIM AND A LITERATURE CLAIM CAN DISAGREE, AND WHEN THEY DO BOTH ARE SHOWN. The
 *    cephalosporin labels here still warn of cross-reactivity in up to 10% of penicillin-allergic
 *    patients; the review literature puts it near 1%. The cefuroxime injection label still lists
 *    bacterial meningitis; the randomised trial that compared it with ceftriaxone found four times
 *    the hearing loss. Neither is edited out.
 *
 * 4. PRICING IS A PRICE, NOT A COST. Every price here is the CMS National Average Drug Acquisition
 *    Cost — what a United States retail pharmacy pays a wholesaler — and is labelled as such.
 *    `synthesisCostPerDose` is empty on every dossier in this file: the cost-of-production
 *    literature for the WHO Essential Medicines List publishes a method and an aggregate, and its
 *    per-molecule anti-infective figures sit in a supplementary appendix that could not be resolved
 *    and verified at the time of writing. An unverified cost is worse than an absent one.
 *
 * 5. NO DOSING, MONITORING, DURATION OR PROCUREMENT GUIDANCE. Doses appear only where they are part
 *    of a trial's description or a label's own text. Nothing here tells a reader what to take, for
 *    how long, or how to have a level checked.
 *
 * 6. THERE IS NO DIETARY SUBSTITUTE FOR AN ANTIBACTERIAL, AND EVERY PAGE SAYS SO PLAINLY. The
 *    `naturalFoods` array is empty on all ten records. The honest alternatives to an antibiotic are
 *    another antibiotic, source control, a vaccine, or in a few well-measured situations no
 *    antibiotic at all — not a food.
 */

const NADAC_SOURCE = {
  label:
    'CMS National Average Drug Acquisition Cost (NADAC) survey — what United States retail pharmacies pay to acquire a drug',
  identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
  kind: 'url' as const,
}

const COST_OF_PRODUCTION_SOURCE = {
  label:
    'Hill A, Barber MJ, Gotham D. Estimated costs of production and potential prices for the WHO Essential Medicines List. BMJ Glob Health 2018;3:e000571 — the cost-of-production literature checked for this group. It publishes an estimation method over 148 medicines and an aggregate result; its per-molecule anti-infective figures are in a supplementary appendix that could not be resolved at the time of writing, so no per-dose cost is stated on these pages',
  identifier: '10.1136/bmjgh-2017-000571',
  kind: 'doi' as const,
}

export const ENRICHED_BATCH_28_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // 1. Cefuroxime — sold on beta-lactamase stability by a label that declines to claim
  //    effectiveness against the beta-lactamase producers, and whose cleanest result is in an eye.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'cefuroxime',
    name: 'Cefuroxime',
    tradeName: 'Ceftin (oral axetil ester) / Zinacef and Kefurox (injectable sodium salt)',
    sponsor:
      'Glaxo (originator; the injection was approved in the United States in 1983 and the oral ester followed). The United States application holder on this record is Pai Holdings Pharmaceuticals, and the drug is made generically worldwide',
    targetGene:
      'Bacterial cell-wall genes ftsI, pbp2b, pbp3 and their relatives — bacterial genes, none of them human',
    targetProtein:
      'Penicillin-binding proteins (DD-transpeptidases), the enzymes that cross-link peptidoglycan in the bacterial cell wall',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1983,
    indication:
      'Oral tablets: pharyngitis and tonsillitis, acute bacterial otitis media, acute bacterial maxillary sinusitis, acute bacterial exacerbations of chronic bronchitis, uncomplicated skin and skin-structure infections, uncomplicated urinary tract infections, uncomplicated gonorrhoea and early Lyme disease, all due to susceptible bacteria. The injection additionally carries lower respiratory tract, septicaemia, bone and joint, and meningitis indications',
    patientFriendlyIndication:
      'Bacterial infections of the throat, ear, sinuses, chest, skin and urinary tract, and early Lyme disease',
    anatomicalSite:
      'The bacterial periplasm — the compartment between a bacterium’s membrane and the outside of its cell wall, where the transpeptidases and the beta-lactamases both sit',
    conditionContext: {
      conditionExplainer:
        'A bacterium is held together by a mesh that has to be cut and re-stitched every time the cell grows. Beta-lactam drugs jam the stitching enzymes, so the cell keeps cutting and cannot repair, and it bursts. Bacteria answer with beta-lactamase, an enzyme that opens the drug’s four-membered ring before it can reach the target.',
      whyItMatters:
        'Cefuroxime was the drug of the generation designed specifically to survive those enzymes. That is the entire commercial argument for a second-generation cephalosporin, and it is worth reading the label to see how far the argument is actually carried.',
      whoTakesThis:
        'Adults and older children with respiratory, skin, urinary or early Lyme infection judged to need an oral cephalosporin, and hospital patients receiving the injectable form, including as surgical prophylaxis.',
      clinicalGoals:
        'Clinical cure and eradication of the organism. Not survival: no trial on this page measured death, with the single exception of the meningitis comparison, where the endpoint that separated the drugs was hearing.',
    },
    oneSentenceVerdict:
      'A cephalosporin sold on beta-lactamase stability whose own oral label states that its effectiveness against beta-lactamase-producing Haemophilus influenzae and Moraxella catarrhalis was not established, and whose largest clean randomised result is somewhere else entirely: 1 mg injected into the eye at the end of cataract surgery, where endophthalmitis fell from 23 of 6,862 to 5 of 6,836 patients.',
    laymanHowItWorks:
      'Cefuroxime jams the enzymes a bacterium uses to stitch its cell wall together, so a growing cell tears itself open. Many bacteria defend themselves with an enzyme that cuts penicillins apart before they arrive, and cefuroxime was reshaped chemically to survive some of those enzymes — that is what made it a step up from the first cephalosporins. The tablet is not the drug itself but an inert ester of it, which the lining of the gut strips off during absorption. That is why food changes how much reaches the blood, and why the tablet and the liquid are not interchangeable.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 66,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.2925 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 21 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in 1983 and generic for decades. Two quite different products share the name: the injectable sodium salt, and the oral ester cefuroxime axetil, which is a prodrug. They carry different labels and different indications — only the injection lists meningitis — and within the oral product, the label states in its own dosage section that the tablets and the oral suspension are not bioequivalent and not substitutable on a milligram-per-milligram basis.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The comparison that matters for cefuroxime is not against other cephalosporins in general but against the specific drug that beat it in the specific setting. In children with bacterial meningitis, ceftriaxone beat it in a head-to-head randomised trial on hearing loss. In sinus and ear infection caused by beta-lactamase producers, its own label declines to claim effectiveness and amoxicillin-clavulanate is written for exactly that gap. In early Lyme disease, doxycycline is the comparator with the broader coverage. Nothing sold as a food or supplement treats a bacterial infection, and the naturalFoods list on this page is empty for that reason.',
      conventionalRx: [
        {
          name: 'Ceftriaxone',
          class: 'Third-generation cephalosporin',
          howItCompares:
            'Beat cefuroxime head to head in bacterial meningitis in children. In 106 randomised children, moderate-to-profound hearing loss at two months was present in 2 of 53 (4%) on ceftriaxone against 9 of 53 (17%) on cefuroxime (p=0.05), with more rapid sterilisation of the cerebrospinal fluid. The trade was reversible biliary pseudolithiasis, seen only in the ceftriaxone arm (16 of 35 against 0 of 35, p<0.001).',
          typicalCost:
            'Not stated: no verified CMS acquisition price for ceftriaxone was held on this record at the time of writing',
          prosAndCons:
            'Pros: better cerebrospinal fluid penetration relative to organism MIC, once-daily dosing, the winning arm of the only randomised comparison. Cons: biliary sludging, and it is a broader-spectrum drug, so it selects harder.',
        },
        {
          name: 'Amoxicillin-clavulanate',
          class: 'Aminopenicillin plus a beta-lactamase inhibitor',
          howItCompares:
            'Covers by a different route the organisms cefuroxime’s oral label will not claim. The cefuroxime axetil label states that effectiveness for sinus infections caused by beta-lactamase-producing Haemophilus influenzae or Moraxella catarrhalis was not established, because too few such isolates were obtained in the pivotal trial. The clavulanate combination’s label is written around precisely those organisms.',
          typicalCost:
            'US$0.2701 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 89 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: an explicit label claim against the beta-lactamase producers. Cons: substantially more diarrhoea, and it heads the United States drug-induced liver injury registry.',
        },
        {
          name: 'Doxycycline',
          class: 'Tetracycline',
          howItCompares:
            'The usual first choice in early Lyme disease, which cefuroxime axetil also carries an indication for. Doxycycline additionally covers Anaplasma phagocytophilum, a tick-borne co-infection transmitted by the same vector that a cephalosporin does not touch.',
          typicalCost:
            'Not stated: no verified CMS acquisition price for doxycycline was held on this record at the time of writing',
          prosAndCons:
            'Pros: covers a co-infection cefuroxime cannot; oral; cheap. Cons: photosensitivity and oesophageal irritation; historically avoided in young children and pregnancy.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Tablet and liquid are not the same dose',
          action:
            'If a prescription is switched between the tablet and the oral suspension, ask for the dose to be rewritten rather than converted.',
          patientImpact:
            'The label states in its Important Administration Instructions that the two formulations are not bioequivalent and are not substitutable on a milligram-per-milligram basis. The suspension’s area under the curve averaged 91% of the tablet’s and its peak concentration 71%.',
          clinicalPrecaution:
            'Because of this, the label records that the safety and effectiveness of the tablet and of the suspension were established in separate clinical trials. This page states the fact; it does not tell anyone what dose to use.',
        },
        {
          name: 'Food changes how much of the tablet you absorb',
          action: 'Note whether the tablet was taken with food, and mention it if a course fails.',
          patientImpact:
            'Absolute bioavailability of the tablet rises from 37% fasting to 52% taken after a meal, because the axetil ester is absorbed better in the fed state before gut esterases strip it.',
          clinicalPrecaution:
            'The label also records that in the two trials where this was assessed, clinical and bacteriological response was independent of food intake — so the pharmacokinetic difference is real and its clinical consequence was not detected. Both halves of that sentence are on the label.',
        },
        {
          name: 'A penicillin allergy in your notes is probably worth re-checking',
          action:
            'Ask whether a recorded penicillin allergy has ever been formally evaluated, and what the original reaction actually was.',
          patientImpact:
            'The cephalosporin labels warn that cross-hypersensitivity may occur in up to 10% of patients with a history of penicillin allergy. A 2012 review of the literature put the overall cross-reactivity rate near 1%, concentrated in cephalosporins sharing a similar R1 side chain, and negligible for second- and third-generation agents.',
          clinicalPrecaution:
            'This is not a licence to ignore a documented anaphylaxis. It is a reason for the label figure and the literature figure to be read together, which is a clinical assessment and not a decision this page makes.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CO/N=C(/C1=CC=CO1)\\C(=O)N[C@H]2[C@@H]3N(C2=O)C(=C(CS3)COC(=O)N)C(=O)O',
      chemicalFormula: 'C16H16N4O8S',
      molecularWeight:
        '424.40 g/mol (cefuroxime). The oral prodrug cefuroxime axetil is C20H22N4O10S at 510.48 g/mol, and is described on its own label as being in the amorphous form',
      targetReceptorAffinity:
        'Cefuroxime acylates the active-site serine of penicillin-binding proteins, forming a covalent acyl-enzyme that hydrolyses far more slowly than the natural D-Ala-D-Ala substrate. The two structural features that define it are the syn-methoxyimino group on the 7-side chain, which sterically obstructs many staphylococcal and Haemophilus beta-lactamases, and the 3-carbamoyloxymethyl group, which resists the mammalian and bacterial esterases that inactivate the older 3-acetoxymethyl cephalosporins. Its own label states only that the drug "has activity in the presence of some beta-lactamases", with no enzyme classes named. Approximately 50% of serum cefuroxime is protein bound.',
      structureSource: {
        label:
          'PubChem CID 5479529 (cefuroxime) — canonical SMILES, molecular formula and weight, as carried on the enriched record; axetil formula and weight from the cefuroxime axetil tablet label, section 11',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5479529',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'cxm-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the syn geometry of the methoxyimino group',
          description:
            'The 7-side chain carries a carbon-nitrogen double bond that can sit in two geometries, and only the syn (Z) isomer gives the beta-lactamase stability the drug exists for. The anti isomer is a related substance, not the drug, and a batch that has partly isomerised has quietly lost the property it is sold on. This is checked before anything else because a downstream potency assay against a susceptible organism would not distinguish them.',
          reagentsAndBuffer:
            'Cefuroxime sodium reference standard, reversed-phase HPLC with ultraviolet detection at 274 nm, nuclear Overhauser effect NMR to assign syn against anti, Karl Fischer titration for water content',
        },
        {
          id: 'cxm-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Acylate the 7-aminocephalosporanic acid nucleus and install the 3-carbamate',
          description:
            'The cephalosporin nucleus is acylated at the 7-amino position with the activated syn-2-furyl-2-methoxyiminoacetyl side chain, and the 3-acetoxymethyl group of the starting nucleus is replaced with a carbamoyloxymethyl group. That second change is the one that matters clinically: the older 3-acetoxymethyl cephalosporins are deacetylated in vivo to much less active metabolites, and the carbamate is not.',
          dependsOnStepId: 'cxm-w1',
          reagentsAndBuffer:
            '7-aminocephalosporanic acid, activated syn-(2-furyl)-2-methoxyiminoacetic acid derivative, base to control the acylation, carbamoylating reagent, anhydrous solvents under nitrogen at controlled low temperature',
        },
        {
          id: 'cxm-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Isolate the sodium salt, and separately the amorphous axetil ester',
          description:
            'Two products diverge here. The injectable is the crystalline sodium salt. The oral product is the 1-(acetyloxy)ethyl ester, cefuroxime axetil, which its label describes as being in the amorphous form — amorphous because the crystalline ester dissolves too poorly to be absorbed. The oral product is also a mixture of two diastereomers at the newly created ester carbon, which is why the label writes the chemical name with an (RS) descriptor.',
          dependsOnStepId: 'cxm-w2',
          reagentsAndBuffer:
            'Sodium 2-ethylhexanoate for salt formation, 1-acetoxyethyl bromide for esterification, spray drying or solvent precipitation to fix the amorphous state, powder X-ray diffraction to confirm the absence of crystallinity',
        },
        {
          id: 'cxm-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure hydrolysis by named beta-lactamase classes, not by a general claim',
          description:
            'The label says only that the drug has activity in the presence of "some" beta-lactamases. The assay that turns that into information runs purified enzymes of each relevant class against the drug and reports a hydrolysis rate for each: TEM-1 and SHV-1 penicillinases, the Haemophilus and Moraxella enzymes the sinus indication turns on, staphylococcal PC1, and the AmpC cephalosporinases it is not stable to. A drug marketed on enzyme stability should carry the enzyme list.',
          dependsOnStepId: 'cxm-w3',
          reagentsAndBuffer:
            'Purified TEM-1, SHV-1, ROB-1, BRO-1 and AmpC beta-lactamases, nitrocefin as chromogenic reporter, spectrophotometric rate assay at 486 nm, phosphate buffer at pH 7.0',
        },
        {
          id: 'cxm-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Compare the ester’s release in fed and fasted intestinal fluid',
          description:
            'The oral product only works if intestinal and blood esterases strip the axetil group. This step measures that release in simulated fed and fasted intestinal fluid, which is the mechanistic explanation for the label’s finding that absolute bioavailability rises from 37% to 52% after a meal — and for the separate finding that the tablet and the suspension are not bioequivalent.',
          dependsOnStepId: 'cxm-w4',
          reagentsAndBuffer:
            'Simulated fasted and fed state intestinal fluid, human intestinal S9 fraction and plasma esterases, LC-MS/MS quantification of intact ester against liberated cefuroxime, USP dissolution apparatus 2',
        },
      ],
    },
    keyAudits: [
      {
        id: 'cxm-a1',
        category: 'measured',
        title: 'The cleanest result this molecule has is in an eye, not a chest',
        laymanSummary:
          'A European trial randomised 16,603 cataract operations. Injecting one milligram of cefuroxime into the eye at the end of surgery cut the rate of infection inside the eye roughly five-fold. That is the largest and cleanest randomised result the drug has, and it is not what it is usually prescribed for.',
        technicalDetails:
          'The ESCRS endophthalmitis study was a prospective, randomised, partially masked, 2×2 factorial trial across 24 ophthalmology units in nine European countries, recruiting 16,603 patients. In the preliminary report on 13,698 patients with complete follow-up records, total reported endophthalmitis occurred in 23 of 6,862 patients not receiving intracameral cefuroxime against 5 of 6,836 who did (odds ratio 4.59, 95% CI 1.74 to 12.08, p=0.002). Restricted to infection-proven cases the rate was more than five times as high without the drug (odds ratio 5.32, 95% CI 1.55 to 18.26, p=0.008). The final 2007 report identified absence of an intracameral cefuroxime regimen at 1 mg in 0.1 mL saline as associated with a 4.92-fold increase in risk, alongside clear corneal incisions and silicone intraocular lenses as independent risk factors. Note what this result is: a prophylaxis effect on a rare event, in a compartment where the drug is placed directly rather than delivered by the bloodstream.',
        evidenceSource:
          'Barry P et al., J Cataract Refract Surg 2006;32:407-410 (preliminary report); ESCRS Endophthalmitis Study Group, J Cataract Refract Surg 2007;33:978-988 (principal results and risk factors)',
        doi: '10.1016/j.jcrs.2007.02.032',
        measuredMetric:
          'Postoperative endophthalmitis after cataract surgery, with against without 1 mg intracameral cefuroxime, in 16,603 randomised patients',
        auditFlag: 'verified',
      },
      {
        id: 'cxm-a2',
        category: 'failed',
        title: 'It lost the meningitis comparison, and the indication is still on the label',
        laymanSummary:
          'A randomised trial in 106 children with bacterial meningitis compared cefuroxime with ceftriaxone. Two months later, moderate-to-profound hearing loss was present in 4% of the ceftriaxone children and 17% of the cefuroxime children. The cefuroxime injection label still lists meningitis as an indication and still gives a dose for it.',
        technicalDetails:
          'Schaad and colleagues randomised 106 children with acute bacterial meningitis, mean age 3 years, to ceftriaxone 100 mg/kg/day intravenously once daily (n=53) or cefuroxime 240 mg/kg/day in four divided doses (n=53). Clinical outcomes were comparable. At follow-up two months later, moderate-to-profound hearing loss was present in 2 children (4%) on ceftriaxone and 9 (17%) on cefuroxime (p=0.05), and cerebrospinal fluid sterilised more rapidly on ceftriaxone. Reversible biliary pseudolithiasis was detected only in the ceftriaxone arm (16 of 35 against 0 of 35, p<0.001), and the authors concluded that the hearing and sterilisation advantages outweighed it. Practice followed; the label did not. The current cefuroxime for injection label still lists "Meningitis caused by Streptococcus pneumoniae, Haemophilus influenzae (including ampicillin-resistant strains), Neisseria meningitidis, and Staphylococcus aureus" among its indications and still specifies 200 to 240 mg/kg/day for it. A licensed indication is not the same thing as a defensible choice, and this is one of the clearest places in the antibiotic label corpus where the two have come apart.',
        evidenceSource:
          'Schaad UB et al., N Engl J Med 1990;322:141-147; cefuroxime for injection United States prescribing information, INDICATIONS AND USAGE and DOSAGE AND ADMINISTRATION',
        doi: '10.1056/NEJM199001183220301',
        measuredMetric:
          'Moderate-to-profound hearing loss at two months, cefuroxime against ceftriaxone, in 106 randomised children with bacterial meningitis',
        auditFlag: 'caution',
      },
      {
        id: 'cxm-a3',
        category: 'inferred',
        title:
          'Sold on beta-lactamase stability; the label declines to claim the beta-lactamase producers',
        laymanSummary:
          'The whole point of this generation of cephalosporin was surviving the enzyme that destroys penicillins. Its own oral label says its effectiveness against the enzyme-producing bacteria that cause sinus infections was not established, because the pivotal trial did not enrol enough of them.',
        technicalDetails:
          'The cefuroxime axetil tablet label indicates the drug for acute bacterial maxillary sinusitis "caused by susceptible strains of Streptococcus pneumoniae or Haemophilus influenzae (non-beta-lactamase-producing strains only)", and adds an explicit Limitation of Use: the effectiveness for sinus infections caused by beta-lactamase-producing Haemophilus influenzae or Moraxella catarrhalis was not established, because insufficient numbers of such isolates were obtained in the trial. The otitis media indication, by contrast, does name beta-lactamase-producing strains. The Clinical Pharmacology section states only that cefuroxime "has activity in the presence of some beta-lactamases, both penicillinases and cephalosporinases", naming no enzyme and no class. The laboratory property is real; the clinical claim built on it is narrower than the marketing category "beta-lactamase-stable cephalosporin" implies, and the narrowing is the label’s own.',
        evidenceSource:
          'Cefuroxime axetil tablets United States prescribing information, sections 1.2, 1.3 (Limitations of Use), 12.4 and 14.1; cefuroxime for injection prescribing information, CLINICAL PHARMACOLOGY',
        inferredClaim:
          'That a second-generation cephalosporin can be relied on against the beta-lactamase-producing respiratory organisms it was designed for — a class-level inference the sinusitis indication explicitly declines to support',
        auditFlag: 'contested',
      },
      {
        id: 'cxm-a4',
        category: 'inferred',
        title: 'The pivotal sinusitis trial’s confidence interval crosses zero',
        laymanSummary:
          'The one adequate and well-controlled sinusitis trial randomised 317 adults. Cefuroxime succeeded in 65% of United States patients against 53% on the comparator — but the confidence interval around that difference runs from below zero to well above it, meaning the trial could not tell the two drugs apart.',
        technicalDetails:
          'The label reports one adequate and well-controlled trial in acute bacterial maxillary sinusitis, with every subject having a maxillary sinus aspirate collected by sinus puncture before treatment. It randomised 317 adults, 132 in the United States and 185 in South America. Clinical success was 65% on cefuroxime axetil 250 mg twice daily against 53% on a comparator containing a beta-lactamase inhibitor in the United States subjects, with a 95% confidence interval around the success difference of −0.08 to +0.32; and 77% against 74% in the South American subjects, with an interval of −0.10 to +0.16. Both intervals include zero. Microbiological eradication was 10 of 15 for non-beta-lactamase-producing Haemophilus influenzae and 15 of 18 for Streptococcus pneumoniae. The trial supports a licence; it does not support a claim of superiority, and the label does not make one. What it demonstrates is how much of an antibiotic’s reputation can rest on a single trial of 317 people with intervals this wide.',
        evidenceSource:
          'Cefuroxime axetil tablets United States prescribing information, section 14.1 (Clinical Studies — Acute Bacterial Maxillary Sinusitis)',
        measuredMetric:
          'Clinical success in acute bacterial maxillary sinusitis, 317 randomised adults, with 95% confidence intervals around the between-group difference',
        auditFlag: 'caution',
      },
      {
        id: 'cxm-a5',
        category: 'conclusion_shift',
        title:
          'The 10% penicillin cross-reactivity figure on the label is about ten times too high',
        laymanSummary:
          'Cephalosporin labels warn that up to one in ten people with a penicillin allergy will react to them too. That figure came from the 1960s and 1970s, when cephalosporins were contaminated with traces of penicillin during manufacture. The modern review estimate is about one in a hundred, and lower still for drugs like cefuroxime.',
        technicalDetails:
          'The ceftazidime injection label, and cephalosporin labels generally, state in capitals that cross-hypersensitivity among beta-lactam antibacterials "has been clearly documented and may occur in up to 10% of patients with a history of penicillin allergy". A 2012 literature review by Campagna and colleagues found the overall cross-reactivity rate to be approximately 1%, with first-generation cephalosporins carrying most of it, negligible risk for second-generation agents, and negligible risk for third- and fourth-generation agents. The determinant is not the class but the R1 side chain: cephalosporins sharing a side chain with the culprit penicillin cross-react, and those that do not, largely do not. Cefuroxime’s furyl-methoxyimino side chain resembles no penicillin. The consequence of the old number is not neutral — it pushes patients toward broader, more toxic and more expensive alternatives on the strength of an allergy label that in most cases has never been tested.',
        evidenceSource:
          'Campagna JD, Bond MC, Schabelman E, Hayes BD. The use of cephalosporins in penicillin-allergic patients: a literature review. J Emerg Med 2012;42:612-620; ceftazidime for injection United States prescribing information, WARNINGS',
        doi: '10.1016/j.jemermed.2011.05.035',
        inferredClaim:
          'That roughly 10% of penicillin-allergic patients will cross-react to any cephalosporin — a figure that survives on labels and has been superseded by side-chain-specific estimates near 1%',
        auditFlag: 'contested',
      },
      {
        id: 'cxm-a6',
        category: 'measured',
        title: 'Two products, one name, and the label says they are not interchangeable',
        laymanSummary:
          'The tablet and the liquid are not the same drug at the same dose. The label states in its own dosing section that they are not bioequivalent and cannot be swapped milligram for milligram, and that each had to be tested in its own trials.',
        technicalDetails:
          'The cefuroxime axetil label’s Important Administration Instructions open with the statement that the tablets and the oral suspension are not bioequivalent and are therefore not substitutable on a milligram-per-milligram basis. The pharmacokinetic section quantifies it: the suspension’s area under the curve averaged 91% of the tablet’s, and its peak plasma concentration 71%. Because of that, the safety and effectiveness of the two formulations were established in separate clinical trials. Separately, absolute bioavailability of the tablet rises from 37% in the fasted state to 52% taken after food, while the label records that clinical and bacteriological responses were independent of food intake in the two trials where this was assessed. And the pharmacokinetics of cefuroxime in paediatric subjects have not been studied — the label states that the renal elimination established in adults should not be extrapolated to children.',
        evidenceSource:
          'Cefuroxime axetil tablets United States prescribing information, sections 2.1 and 12.3',
        measuredMetric:
          'Relative bioavailability of oral suspension against tablet (AUC 91%, Cmax 71%) and fed against fasted absolute bioavailability (52% against 37%)',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'The tablet is not the drug',
        laymanDesc:
          'What you swallow is an inert ester. Enzymes in the lining of the gut and in the blood snip off the added piece and release the actual antibiotic.',
        molecularDetail:
          'Cefuroxime axetil is the 1-(acetyloxy)ethyl ester of cefuroxime, supplied in the amorphous form because the crystalline ester dissolves too poorly to absorb. After oral administration it is hydrolysed by non-specific esterases in the intestinal mucosa and blood to cefuroxime; the axetil moiety is metabolised to acetaldehyde and acetic acid. Absolute bioavailability is 37% fasted and 52% fed.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It has to get past the enzyme first',
        laymanDesc:
          'Many bacteria secrete an enzyme that cuts penicillins open before they reach their target. Cefuroxime is shaped to survive some of those enzymes — not all of them.',
        molecularDetail:
          'The syn-methoxyimino group on the 7-side chain sterically hinders access by many staphylococcal and Haemophilus beta-lactamases. The label claims activity in the presence of "some beta-lactamases, both penicillinases and cephalosporinases", naming none. It is not stable to AmpC cephalosporinases or to extended-spectrum beta-lactamases.',
        iconName: 'Shield',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It binds the enzyme that stitches the wall',
        laymanDesc:
          'The drug locks onto the enzymes a bacterium uses to cross-link its cell wall, and does not let go.',
        molecularDetail:
          'Cefuroxime acylates the active-site serine of penicillin-binding proteins, mimicking the D-Ala-D-Ala terminus of the peptidoglycan precursor. The resulting acyl-enzyme hydrolyses orders of magnitude more slowly than the natural substrate, so the transpeptidase is effectively removed from service.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The wall fails where the cell is growing',
        laymanDesc:
          'A bacterium has to keep cutting its own wall to grow. With the re-stitching blocked, the cutting continues and the cell bursts.',
        molecularDetail:
          'Autolysins continue to hydrolyse peptidoglycan while cross-linking is blocked, and the cell lyses under its own turgor pressure. This is why beta-lactams are bactericidal only against dividing organisms, and why they do nothing to a quiescent population.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'In an eye, one milligram changed a rate',
        laymanDesc:
          'Injected directly into the eye at the end of cataract surgery, it cut post-operative infection roughly five-fold across 16,603 randomised operations.',
        molecularDetail:
          'ESCRS endophthalmitis study: total reported endophthalmitis 23 of 6,862 without intracameral cefuroxime against 5 of 6,836 with (odds ratio 4.59, 95% CI 1.74 to 12.08, p=0.002); infection-proven cases odds ratio 5.32 (95% CI 1.55 to 18.26, p=0.008).',
        iconName: 'Eye',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What the label will not claim',
        laymanDesc:
          'Effectiveness against the enzyme-producing sinus bacteria was never established. Rheumatic fever prevention was never established. And in meningitis it lost the only head-to-head trial.',
        molecularDetail:
          'Label Limitations of Use: effectiveness for sinusitis due to beta-lactamase-producing Haemophilus influenzae or Moraxella catarrhalis not established; efficacy in preventing rheumatic fever not established; efficacy against penicillin-resistant Streptococcus pyogenes not demonstrated. In the 106-child meningitis trial, hearing loss was 17% against 4% for ceftriaxone.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'ESCRS Endophthalmitis Study (J Cataract Refract Surg 2006;32:407-410 and 2007;33:978-988)',
        phase: 'Prospective, randomised, partially masked, 2×2 factorial multicentre study',
        sampleSize: 16603,
        primaryEndpoint:
          'Postoperative endophthalmitis after cataract surgery, with intracameral cefuroxime 1 mg in 0.1 mL and/or topical levofloxacin against neither',
        endpointMet: true,
        statisticalPValue:
          'Total reported cases 23 of 6,862 without cefuroxime against 5 of 6,836 with; odds ratio 4.59 (95% CI 1.74 to 12.08), p=0.002. Infection-proven cases: odds ratio 5.32 (95% CI 1.55 to 18.26), p=0.008',
        unreportedAdverseSignals:
          'This is prophylaxis against a rare event by direct injection into a closed compartment. It says nothing about systemic cefuroxime, and it is not the indication the drug is usually prescribed under.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'Schaad UB et al., ceftriaxone against cefuroxime in bacterial meningitis in children (N Engl J Med 1990;322:141-147)',
        phase: 'Randomised, controlled comparative trial',
        sampleSize: 106,
        primaryEndpoint:
          'Clinical and bacteriological outcome of acute bacterial meningitis, with cerebrospinal fluid sterilisation and hearing at two months',
        endpointMet: false,
        statisticalPValue:
          'Moderate-to-profound hearing loss at two months in 2 of 53 (4%) on ceftriaxone against 9 of 53 (17%) on cefuroxime, p=0.05; cerebrospinal fluid sterilised more rapidly on ceftriaxone',
        unreportedAdverseSignals:
          'Reversible biliary pseudolithiasis was detected by serial ultrasonography only in the ceftriaxone arm, 16 of 35 against 0 of 35 (p<0.001) — a real harm in the winning arm, which the authors judged outweighed by the hearing result.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId:
          'Pivotal acute bacterial maxillary sinusitis trial with pre-treatment sinus puncture (cefuroxime axetil label, section 14.1)',
        phase: 'Adequate and well-controlled randomised comparative trial',
        sampleSize: 317,
        primaryEndpoint:
          'Clinical success (cure plus improvement) in acute bacterial maxillary sinusitis confirmed by maxillary sinus aspirate',
        endpointMet: true,
        statisticalPValue:
          'United States subjects: 65% against 53%, 95% CI around the success difference −0.08 to +0.32. South American subjects: 77% against 74%, 95% CI −0.10 to +0.16. Both intervals include zero',
        unreportedAdverseSignals:
          'Insufficient numbers of beta-lactamase-producing Haemophilus influenzae and Moraxella catarrhalis isolates were obtained to evaluate effectiveness against them, which is why the label carries an explicit Limitation of Use for exactly those organisms.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Endophthalmitis after cataract surgery: 23 of 6,862 without intracameral cefuroxime against 5 of 6,836 with (OR 4.59, 95% CI 1.74 to 12.08, p=0.002) in a 16,603-patient randomised study',
        'Hearing loss at two months in bacterial meningitis: 17% on cefuroxime against 4% on ceftriaxone in 106 randomised children (p=0.05)',
        'Clinical success in the pivotal sinusitis trial: 65% against 53% in United States subjects, with a confidence interval on the difference of −0.08 to +0.32',
        'Absolute oral bioavailability 37% fasted, 52% fed; oral suspension AUC 91% and Cmax 71% of the tablet',
      ],
      unsupportedInferences: [
        'That a beta-lactamase-stable cephalosporin covers beta-lactamase-producing respiratory organisms — the sinusitis indication explicitly excludes them and the label states effectiveness was not established',
        'That roughly 10% of penicillin-allergic patients cross-react to cephalosporins, a label figure the review literature places near 1% and side-chain-dependent',
        'That the tablet and the oral suspension can be exchanged milligram for milligram, which the label’s own dosing section denies',
        'That paediatric elimination resembles adult elimination — the label states cefuroxime pharmacokinetics have not been studied in paediatric subjects and should not be extrapolated',
      ],
      whatFailedInitially: [
        'Bacterial meningitis: cefuroxime lost the randomised head-to-head comparison with ceftriaxone on hearing loss and on speed of cerebrospinal fluid sterilisation, and the indication remains on the injection label',
        'Prevention of rheumatic fever after streptococcal pharyngitis: efficacy not established in clinical trials, per the label',
        'Penicillin-resistant Streptococcus pyogenes: efficacy not demonstrated in clinical trials, per the label',
        'Sinusitis due to beta-lactamase-producing Haemophilus influenzae and Moraxella catarrhalis: too few isolates enrolled to evaluate, so no claim exists',
      ],
      realWorldOutcome: [
        'Approved in the United States in 1983; generic, with 21 products carrying a NADAC acquisition price around 29 United States cents per unit',
        'Intracameral cefuroxime became routine cataract prophylaxis across much of Europe after the ESCRS result, an indication its own product labels do not carry',
        'The meningitis indication survives on the injection label three and a half decades after the trial that ended its use in practice',
        'One name covers two non-interchangeable oral formulations and one injectable salt, each licensed on separate trials',
      ],
    },
    deliverySystem: {
      type: 'Oral tablets and oral suspension of the axetil ester; intravenous and intramuscular injection of the sodium salt',
      description:
        'The oral ester is hydrolysed by esterases in the intestinal mucosa and blood to cefuroxime. Peak plasma concentration comes at about 2 to 3 hours after a tablet, with a mean elimination half-life of 1.2 to 1.3 hours; approximately 50% is protein bound and the drug is excreted unchanged in urine, about half of a dose recovered within 12 hours. The injectable salt reaches much higher concentrations, which is the basis of the meningitis and septicaemia indications carried only by that form.',
      safetyProfile:
        'Contraindicated in known hypersensitivity to cefuroxime axetil or other beta-lactam antibacterials. Serious and occasionally fatal anaphylactic reactions have been reported, more likely in those with a history of beta-lactam hypersensitivity or sensitivity to multiple allergens. Clostridioides difficile-associated diarrhoea has been reported with nearly all antibacterials including this one and may range from mild diarrhoea to fatal colitis, sometimes beginning more than two months after the course. Superinfection with fungal or bacterial pathogens is possible. Dosage adjustment is required in renal impairment, where the elimination half-life is prolonged.',
    },
    commonQuestions: [
      {
        q: 'Is this a stronger antibiotic than amoxicillin?',
        a: 'Different rather than simply stronger. Cefuroxime was designed to survive some of the enzymes that destroy amoxicillin, which is the argument for a second-generation cephalosporin. But read the label carefully and the argument narrows: for sinus infection it is indicated only for non-beta-lactamase-producing Haemophilus influenzae, with an explicit note that effectiveness against the beta-lactamase-producing strains and against Moraxella catarrhalis was not established because too few were enrolled. For ear infection the label does name beta-lactamase-producing strains. So the answer depends on which infection and which organism, and the label draws the line in a different place for each.',
        auditNote:
          'A drug can be genuinely more stable to an enzyme in a test tube and still lack the clinical claim against the organisms that make it. Both facts are on the same label.',
      },
      {
        q: 'Why does the pharmacy say the liquid is not the same as the tablet?',
        a: 'Because the label says so. The Important Administration Instructions state that cefuroxime axetil tablets and the oral suspension are not bioequivalent and are therefore not substitutable on a milligram-per-milligram basis. The numbers behind it: the suspension delivers about 91% of the tablet’s total exposure and about 71% of its peak concentration. That difference was large enough that the safety and effectiveness of the two formulations had to be established in separate clinical trials. It is an unusual thing to find on a modern label, and it is worth knowing if a prescription is switched between forms.',
      },
      {
        q: 'Should I take it with food?',
        a: 'The label reports both halves of this honestly and they point in different directions. Absolute bioavailability of the tablet rises from 37% in the fasted state to 52% taken after a meal, so more of the drug reaches the blood with food. But in the two trials where the question was assessed, clinical and bacteriological response was independent of food intake, and the dosing section says the tablet may be administered with or without food. This page does not give dosing instructions; it reports what the label found.',
      },
      {
        q: 'I was told I am allergic to penicillin. Does that rule this out?',
        a: 'It is a question to raise rather than a settled answer. Cephalosporin labels warn that cross-hypersensitivity may occur in up to 10% of patients with a history of penicillin allergy. That figure traces to an era when cephalosporins carried trace penicillin contamination from manufacture. A 2012 review of the literature put the overall cross-reactivity rate near 1%, concentrated in first-generation agents that share a side chain with the culprit penicillin, and negligible for second- and third-generation agents; cefuroxime’s side chain resembles no penicillin. None of this applies to someone with documented anaphylaxis, and none of it is a decision this page can make. It is a reason to ask what the original reaction actually was, and whether the allergy label has ever been evaluated.',
        auditNote:
          'The cost of an unexamined allergy label is not zero: it routes patients to broader, more toxic and more expensive drugs on the strength of a number that has been superseded.',
      },
      {
        q: 'It has a meningitis indication. Is it used for that?',
        a: 'Very rarely, and the evidence explains why. A randomised trial in 106 children compared it with ceftriaxone; two months later, moderate-to-profound hearing loss was present in 17% of the cefuroxime children against 4% of the ceftriaxone children, and cerebrospinal fluid sterilised more slowly on cefuroxime. Practice moved to third-generation cephalosporins and stayed there. The indication and the dosing instruction are still printed on the injection label, which is a useful reminder that a label records what a regulator once approved, not what current evidence supports.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Schaad UB, Suter S, Gianella-Borradori A, et al. A comparison of ceftriaxone and cefuroxime for the treatment of bacterial meningitis in children. N Engl J Med 1990;322:141-147',
        identifier: '10.1056/NEJM199001183220301',
        kind: 'doi',
      },
      {
        label:
          'ESCRS Endophthalmitis Study Group. Prophylaxis of postoperative endophthalmitis following cataract surgery: results of the ESCRS multicenter study and identification of risk factors. J Cataract Refract Surg 2007;33:978-988',
        identifier: '10.1016/j.jcrs.2007.02.032',
        kind: 'doi',
      },
      {
        label:
          'Barry P, Seal DV, Gettinby G, et al. ESCRS study of prophylaxis of postoperative endophthalmitis after cataract surgery: preliminary report of principal results from a European multicenter study. J Cataract Refract Surg 2006;32:407-410',
        identifier: '16631047',
        kind: 'pmid',
      },
      {
        label:
          'Campagna JD, Bond MC, Schabelman E, Hayes BD. The use of cephalosporins in penicillin-allergic patients: a literature review. J Emerg Med 2012;42:612-620',
        identifier: '10.1016/j.jemermed.2011.05.035',
        kind: 'doi',
      },
      {
        label:
          'Cefuroxime axetil tablets, USP — United States prescribing information (Indications 1.1 to 1.8 with Limitations of Use, Dosage 2.1, Clinical Pharmacology 12.3, Clinical Studies 14.1, Description 11)',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=76cec54f-d167-4298-951b-5411a3c47f4a',
        kind: 'regulatory',
      },
      {
        label:
          'Cefuroxime for injection, USP — United States prescribing information (Indications and Usage including meningitis, Clinical Pharmacology, Dosage and Administration)',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=0a145288-733a-4966-b7ae-dc96eb103d8c',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 5479529 — cefuroxime canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5479529',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 2. Ceftazidime — halved mortality in a disease its United States label does not mention, and
  //    selects out the resistance that defeats it in the organisms its label does mention.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'ceftazidime',
    name: 'Ceftazidime',
    tradeName: 'Fortaz / Tazicef / Ceptaz / Pentacef',
    sponsor:
      'Glaxo (originator, 1980s). The United States application holder on this record is Pai Holdings Pharmaceuticals, and the drug is made generically worldwide',
    targetGene:
      'Bacterial cell-wall genes ftsI, pbpA and relatives; resistance is written in the chromosomal ampC and the plasmid-borne blaTEM, blaSHV and blaCTX-M genes — all bacterial',
    targetProtein:
      'Penicillin-binding proteins of Gram-negative bacteria, principally PBP3, the transpeptidase that builds the division septum',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1985,
    indication:
      'Infections caused by susceptible strains of the designated organisms: lower respiratory tract infections including pneumonia caused by Pseudomonas aeruginosa and other named organisms, skin and skin-structure infections, complicated and uncomplicated urinary tract infections, bacterial septicaemia, bone and joint infections, gynaecologic infections, intra-abdominal infections, and central nervous system infections including meningitis caused by Haemophilus influenzae and Neisseria meningitidis',
    patientFriendlyIndication:
      'Serious hospital infections, especially those caused by Pseudomonas aeruginosa',
    anatomicalSite:
      'The periplasm of a Gram-negative bacterium — the drug has to cross the outer membrane through a porin before it can reach the transpeptidase on the inner membrane',
    conditionContext: {
      conditionExplainer:
        'Gram-negative bacteria have two membranes with a wall between them. A drug has to squeeze through a pore in the outer membrane, survive whatever enzymes are waiting in the space behind it, and only then reach the enzyme it is meant to block. Pseudomonas aeruginosa is difficult precisely because it is good at all three obstacles: few porins, plenty of enzyme, and pumps that push drugs back out.',
      whyItMatters:
        'Ceftazidime was the first cephalosporin with reliable anti-pseudomonal activity, and for a decade it was the drug that made single-agent treatment of serious Gram-negative infection possible. It is also, more than almost any other molecule, the drug that taught the field that a laboratory report saying "susceptible" is not a promise about the patient.',
      whoTakesThis:
        'Hospital inpatients with serious Gram-negative infection — pneumonia, septicaemia, complicated urinary infection, febrile neutropenia — and, outside the United States label, patients with melioidosis.',
      clinicalGoals:
        'Clinical and bacteriological cure. The one place where a randomised trial of this drug measured death is melioidosis, and that indication is not on the United States label.',
    },
    oneSentenceVerdict:
      'The first cephalosporin that reliably killed Pseudomonas, whose single mortality trial halved deaths in severe melioidosis — 37% against 74% in a disease its United States label never mentions — while its own label warns that inducible beta-lactamase in Enterobacter, Pseudomonas and Serratia can emerge during treatment and cause clinical failure, which a 129-patient cohort measured at 6 of 31 against 1 of 89 on an aminoglycoside.',
    laymanHowItWorks:
      'Ceftazidime blocks the enzyme a bacterium uses to build the wall across its middle when it divides, so the cell elongates and then ruptures instead of splitting in two. What makes it different from earlier cephalosporins is a bulky chemical arm that both protects it from the enzymes bacteria use to destroy such drugs and lets it work against Pseudomonas, a hospital organism that shrugs off most antibiotics. The same chemistry that gave it that reach also made it the drug bacteria evolved around: the enzymes now known as extended-spectrum beta-lactamases were first noticed because they had learned to destroy exactly this molecule.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 70,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$3.70 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 2 listed generic products, survey effective 17 December 2025)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in 1985 and long generic, but with only two products carrying a NADAC acquisition price — a thin supply base for a drug on the WHO Model List of Essential Medicines and the treatment of choice for melioidosis in the countries where that disease is endemic. Its successor ceftazidime-avibactam, which pairs the same molecule with a beta-lactamase inhibitor to restore activity against the enzymes that defeated it, was approved in 2015 and is priced as a new drug.',
      synthesisComplexity: 'High',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The choice against ceftazidime is nearly always about which resistance mechanism you are trying to avoid. Against Enterobacter, Serratia and Citrobacter, its own label and a 129-patient cohort both say the problem is inducible AmpC emerging during treatment, and a carbapenem or an aminoglycoside does not have that failure mode. Against an ESBL producer, a laboratory report calling it susceptible has been associated with high failure rates, and a carbapenem is the treatment of choice. Where it is genuinely the right drug — Pseudomonas, and melioidosis — the alternatives are narrower than they look. Nothing sold as a food or supplement treats a bacterial infection, and the naturalFoods list on this page is empty for that reason.',
      conventionalRx: [
        {
          name: 'Meropenem or imipenem',
          class: 'Carbapenem',
          howItCompares:
            'Stable to the AmpC cephalosporinases and to the extended-spectrum beta-lactamases that defeat ceftazidime, which is why carbapenems are described as the treatment of choice for serious infection due to ESBL-producing organisms. Meropenem is also an accepted alternative to ceftazidime in the intensive phase of melioidosis.',
          typicalCost:
            'Not stated: no verified CMS acquisition price for meropenem was held on this record at the time of writing',
          prosAndCons:
            'Pros: covers the enzymes that make a ceftazidime susceptibility report unreliable; broader Gram-positive and anaerobic cover. Cons: the broadest available spectrum, so it selects hardest, and carbapenem-resistant isolates have been reported.',
        },
        {
          name: 'Cefepime',
          class: 'Fourth-generation cephalosporin',
          howItCompares:
            'Keeps the anti-pseudomonal reach and adds back the Gram-positive activity ceftazidime traded away, and is a poor inducer of and poor substrate for AmpC — the specific mechanism the ceftazidime label warns about in Enterobacter, Pseudomonas and Serratia.',
          typicalCost:
            'Not stated: no verified CMS acquisition price for cefepime was held on this record at the time of writing',
          prosAndCons:
            'Pros: less vulnerable to inducible AmpC; better staphylococcal and streptococcal cover. Cons: still hydrolysed by extended-spectrum beta-lactamases; the same neurotoxicity risk in unadjusted renal impairment.',
        },
        {
          name: 'Ceftazidime-avibactam',
          class: 'The same cephalosporin plus a non-beta-lactam beta-lactamase inhibitor',
          howItCompares:
            'The literal admission that the molecule needed rescuing. Avibactam inhibits class A, class C and some class D beta-lactamases, restoring ceftazidime against ESBL and AmpC producers and against KPC carbapenemases. It is the same killing molecule; what was added is protection from the enzymes that grew up around it.',
          typicalCost:
            'Not stated: no verified CMS acquisition price for ceftazidime-avibactam was held on this record at the time of writing',
          prosAndCons:
            'Pros: restores activity against the exact resistance that ended ceftazidime monotherapy in many units. Cons: priced as a new drug rather than as a generic cephalosporin; resistance to it has already been described.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'A kidney number changes what this drug does to the brain',
          action:
            'Make sure whoever is prescribing knows the current kidney function, and report new confusion, twitching or jerking during treatment.',
          patientImpact:
            'The label states that elevated ceftazidime levels in renal insufficiency can lead to seizures, non-convulsive status epilepticus, encephalopathy, coma, asterixis, neuromuscular excitability and myoclonia, and that the total daily dosage should be reduced accordingly.',
          clinicalPrecaution:
            'These are label facts about a drug given in hospital by a clinician. This page states them so a reader recognises the symptoms; it does not tell anyone what dose to use.',
        },
        {
          name: 'A susceptibility report is not a guarantee',
          action:
            'If treatment is failing while the laboratory report says susceptible, that is information, not a contradiction.',
          patientImpact:
            'The label itself records that with Enterobacter, Pseudomonas and Serratia, inducible type I beta-lactamase resistance "can develop during therapy, leading to clinical failure in some cases", and directs periodic repeat susceptibility testing. Separately, ESBL-producing organisms may test susceptible to extended-spectrum cephalosporins while treatment with them has been associated with high failure rates.',
          clinicalPrecaution:
            'This is the reasoning a clinician applies, not an instruction to a patient. It is on the page because the gap between the report and the outcome is the single most important thing to understand about this drug.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CC(C)(C(=O)O)O/N=C(/C1=CSC(=N1)N)\\C(=O)N[C@H]2[C@@H]3N(C2=O)C(=C(CS3)C[N+]4=CC=CC=C4)C(=O)[O-]',
      chemicalFormula: 'C22H22N6O7S2',
      molecularWeight: '546.60 g/mol',
      targetReceptorAffinity:
        'Two structural decisions define this molecule. The 7-side chain carries an aminothiazolyl group with a syn-oriented carboxypropyl-oxyimino substituent: the aminothiazole drives affinity for Gram-negative penicillin-binding proteins, and the bulky, negatively charged oxyimino arm sterically obstructs many beta-lactamases. The C-3 position carries a pyridinium ring, giving the molecule a permanent positive charge alongside two carboxylates, so it is zwitterionic and crosses the Pseudomonas outer membrane through porins more readily than neutral cephalosporins. The price of that chemistry is Gram-positive activity: ceftazidime is markedly weaker than a first-generation cephalosporin against Staphylococcus aureus, though the label still lists methicillin-susceptible S. aureus for several indications. Less than 10% is protein bound, and 80% to 90% of a dose is excreted unchanged by the kidney over 24 hours.',
      structureSource: {
        label:
          'PubChem CID 5481173 (ceftazidime) — canonical SMILES, molecular formula and weight, as carried on the enriched record; protein binding and renal excretion from the ceftazidime for injection label, CLINICAL PHARMACOLOGY',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5481173',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'caz-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the syn oxime and quantify pyridine',
          description:
            'Two release tests matter more than the assay. The oxime must be in the syn configuration — the anti isomer loses the beta-lactamase stability the drug exists for. And free pyridine, released when the C-3 pyridinium leaves during degradation, is a specified impurity that rises with heat and time in solution, so it doubles as a stability indicator for the reconstituted product.',
          reagentsAndBuffer:
            'Ceftazidime pentahydrate reference standard, reversed-phase HPLC with ultraviolet detection at 245 nm, headspace or ion-pair assay for free pyridine, Karl Fischer titration for the five waters of hydration',
        },
        {
          id: 'caz-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Acylate the nucleus with the aminothiazolyl carboxypropyl-oxyimino side chain',
          description:
            'The 7-aminocephalosporanic nucleus is acylated with an activated form of the (Z)-2-(2-aminothiazol-4-yl)-2-(2-carboxyprop-2-yloxyimino)acetic acid side chain. The amino group of the thiazole and the carboxylate of the oxime arm both have to be protected during the coupling and deprotected afterwards, which is most of why this molecule is expensive relative to a first-generation cephalosporin.',
          dependsOnStepId: 'caz-w1',
          reagentsAndBuffer:
            'Protected (Z)-aminothiazolyl carboxypropyl-oxyimino acetic acid, activating agent, trityl or formyl protection on the thiazole amine, tert-butyl ester protection on the oxime carboxylate, acid deprotection under controlled temperature',
        },
        {
          id: 'caz-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Install the pyridinium and crystallise the pentahydrate',
          description:
            'Pyridine displaces the 3-acetoxy group to give the quaternary pyridinium, which is what makes the molecule zwitterionic and porin-permeant. It is then crystallised as the pentahydrate — the marketed solid — with residual free pyridine controlled to specification, because pyridine is both a reagent and a degradation product here.',
          dependsOnStepId: 'caz-w2',
          reagentsAndBuffer:
            'Pyridine, iodotrimethylsilane or equivalent activation of the 3-position, controlled crystallisation from aqueous acetone, sodium carbonate co-formulation for reconstitution, HPLC release testing against a free-pyridine limit',
        },
        {
          id: 'caz-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Separate porin entry from efflux in Pseudomonas',
          description:
            'The anti-pseudomonal claim rests on getting into the periplasm faster than the organism can pump the drug out or destroy it. Testing that means comparing an isogenic panel — wild type against OprD-deficient, against MexAB-OprM efflux overexpressers, against AmpC-derepressed — rather than reporting a single MIC. A single MIC on a wild-type strain conceals which of the three mechanisms will be responsible when the drug fails.',
          dependsOnStepId: 'caz-w3',
          reagentsAndBuffer:
            'Isogenic Pseudomonas aeruginosa PAO1 porin and efflux mutants, AmpC-derepressed clinical isolates, broth microdilution in cation-adjusted Mueller-Hinton, carbonyl cyanide m-chlorophenylhydrazone as an efflux control',
        },
        {
          id: 'caz-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Measure induction, not just inhibition',
          description:
            'The failure mode the label warns about is not that the drug does not work on day one — it is that treatment selects derepressed AmpC mutants by day five. The assay that captures this is a serial-passage or hollow-fibre experiment against Enterobacter and Serratia, reporting the MIC of the population before and after exposure. An endpoint measured only at time zero cannot see the thing that makes this drug fail.',
          dependsOnStepId: 'caz-w4',
          reagentsAndBuffer:
            'Enterobacter cloacae and Serratia marcescens clinical isolates, hollow-fibre or serial-passage exposure at clinically achievable free-drug concentrations, population analysis profiling on drug-containing agar, ampC transcript quantification by RT-qPCR',
        },
      ],
    },
    keyAudits: [
      {
        id: 'caz-a1',
        category: 'measured',
        title: 'It halved mortality in a disease its United States label does not mention',
        laymanSummary:
          'In severe melioidosis — a bacterial infection of Southeast Asia and northern Australia that killed most of the people who got it — ceftazidime cut deaths from 74% to 37% in a randomised trial. Melioidosis appears nowhere in the drug’s United States prescribing information.',
        technicalDetails:
          'White and colleagues ran an open randomised trial in Thailand comparing ceftazidime 120 mg/kg/day with the then-conventional four-drug combination of chloramphenicol, doxycycline, trimethoprim and sulphamethoxazole in severe melioidosis. A paired restricted sequential design intended to detect a fall in mortality from 80% to 40% was stopped after 22 months. Of 161 patients entered, 65 had bacteriologically confirmed melioidosis and 54 of those were septicaemic. Ceftazidime was associated with a 50% lower overall mortality (95% CI 19% to 81%), 37% against 74%, p=0.009. The authors concluded it should become the treatment of choice, and it did: ceftazidime remains a first-line intensive-phase drug for melioidosis worldwide. The United States label lists lower respiratory, skin, urinary, septicaemia, bone and joint, gynaecologic, intra-abdominal and central nervous system indications, and does not mention Burkholderia pseudomallei or melioidosis anywhere. This is the only randomised mortality result the molecule has, and it belongs to a use its licence does not describe.',
        evidenceSource:
          'White NJ, Dance DA, Chaowagul W, Wattanagoon Y, Wuthiekanun V, Pitakwatchara N. Halving of mortality of severe melioidosis by ceftazidime. Lancet 1989;2:697-701; ceftazidime for injection United States prescribing information, INDICATIONS AND USAGE',
        doi: '10.1016/s0140-6736(89)90768-x',
        measuredMetric:
          'All-cause mortality in severe melioidosis, ceftazidime against conventional four-drug therapy, in a randomised trial of 161 entered patients',
        auditFlag: 'verified',
      },
      {
        id: 'caz-a2',
        category: 'failed',
        title: 'Resistance emerged during treatment in one patient in five',
        laymanSummary:
          'In a study of 129 people with Enterobacter in the bloodstream, resistance appeared during treatment in 6 of 31 patients given a third-generation cephalosporin — against 1 of 89 given an aminoglycoside. The authors advised against using these drugs for Enterobacter in the blood no matter what the susceptibility report said.',
        technicalDetails:
          'Chow and colleagues followed 129 adults with Enterobacter bacteraemia across three university tertiary centres and two Veterans Affairs medical centres. Emergence of resistance during third-generation cephalosporin therapy occurred in 6 of 31 (19%), compared with 1 of 89 on aminoglycoside therapy and 0 of 50 on other beta-lactam therapy (p=0.001 and p=0.002 respectively). Prior third-generation cephalosporin use was associated with multiresistant isolates (69% against 20%, p<0.001), and multiresistant organisms carried higher mortality (32% against 15%, p=0.03). The authors recommended avoiding third-generation cephalosporins for Enterobacter isolated from blood irrespective of susceptibility testing results. The mechanism is stable derepression of the chromosomal AmpC cephalosporinase: a small pre-existing subpopulation is selected during treatment. The ceftazidime label states the same thing in its own words — inducible type I beta-lactamase resistance has been noted with Enterobacter, Pseudomonas and Serratia, resistance can develop during therapy leading to clinical failure in some cases, and periodic susceptibility testing should be performed.',
        evidenceSource:
          'Chow JW, Fine MJ, Shlaes DM, et al. Enterobacter bacteremia: clinical features and emergence of antibiotic resistance during therapy. Ann Intern Med 1991;115:585-590; ceftazidime for injection United States prescribing information, PRECAUTIONS: General',
        doi: '10.7326/0003-4819-115-8-585',
        measuredMetric:
          'Emergence of resistance during therapy: 6 of 31 on third-generation cephalosporins against 1 of 89 on aminoglycosides in 129 patients with Enterobacter bacteraemia',
        auditFlag: 'caution',
      },
      {
        id: 'caz-a3',
        category: 'conclusion_shift',
        title: 'The drug that named its own resistance mechanism',
        laymanSummary:
          'The enzymes now called extended-spectrum beta-lactamases were first identified because bacteria had evolved versions of an old enzyme that could destroy the new cephalosporins, ceftazidime among them. Organisms carrying them can test susceptible in the laboratory while treatment fails in the patient.',
        technicalDetails:
          'Extended-spectrum beta-lactamases are, in the standard definition, enzymes able to hydrolyse third-generation cephalosporins and aztreonam while remaining inhibited by clavulanic acid. Most derive from TEM-1, TEM-2 or SHV-1 by point mutations around the active site that widen the pocket enough to admit the bulky oxyimino side chain that ceftazidime and its relatives are built on; some early variants were characterised specifically by their ceftazidime-hydrolysing activity. Paterson and Bonomo’s review states the clinically decisive point plainly: ESBL-producing organisms may appear susceptible to some extended-spectrum cephalosporins, but treatment with such antibiotics has been associated with high failure rates, and carbapenems are the treatment of choice for serious infection due to these organisms. The plasmids that carry ESBL genes frequently carry aminoglycoside resistance as well, which removes the obvious alternative at the same time. Twenty-five years later the response was to pair the same molecule with avibactam, a non-beta-lactam inhibitor of class A, C and some class D enzymes — an admission that the chemistry was still worth having and the protection had to be added back.',
        evidenceSource:
          'Paterson DL, Bonomo RA. Extended-spectrum beta-lactamases: a clinical update. Clin Microbiol Rev 2005;18:657-686',
        doi: '10.1128/CMR.18.4.657-686.2005',
        inferredClaim:
          'That an in vitro susceptibility result predicts clinical response to ceftazidime — an inference the ESBL literature contradicts directly and the label contradicts for inducible AmpC organisms',
        auditFlag: 'contested',
      },
      {
        id: 'caz-a4',
        category: 'failed',
        title: 'In a failing kidney it becomes a neurotoxin',
        laymanSummary:
          'Ceftazidime is cleared almost entirely by the kidneys. When they are not working and the dose is not reduced, the drug accumulates and can cause confusion, jerking movements, seizures that do not look like seizures, and coma.',
        technicalDetails:
          'Between 80% and 90% of a dose is excreted unchanged by the kidney within 24 hours, and less than 10% is protein bound, so renal impairment translates almost directly into serum accumulation. The label’s PRECAUTIONS section states that elevated levels in patients with renal insufficiency can lead to seizures, non-convulsive status epilepticus, encephalopathy, coma, asterixis, neuromuscular excitability and myoclonia, and the Adverse Reactions section repeats that these have been reported in renally impaired patients treated with unadjusted dosing regimens. The clinically difficult part is non-convulsive status epilepticus: it presents as unexplained confusion or reduced consciousness in a septic patient, which is exactly what the underlying illness is expected to cause, and it is diagnosed on an electroencephalogram that is not routinely performed. The label also notes a fall in prothrombin activity with cephalosporins in patients with renal or hepatic impairment or poor nutrition, and that distal necrosis can follow inadvertent intra-arterial injection.',
        evidenceSource:
          'Ceftazidime for injection United States prescribing information, WARNINGS, PRECAUTIONS: General, ADVERSE REACTIONS and CLINICAL PHARMACOLOGY',
        measuredMetric:
          'Renal excretion of 80% to 90% of an unchanged dose, and the neurological adverse events listed for unadjusted dosing in renal insufficiency',
        auditFlag: 'caution',
      },
      {
        id: 'caz-a5',
        category: 'inferred',
        title: 'Listed for Staphylococcus aureus, and it is the class’s weakest against it',
        laymanSummary:
          'The label names methicillin-susceptible Staphylococcus aureus under several indications. Ceftazidime is the cephalosporin least active against that organism — the chemistry that bought it Pseudomonas activity cost it Gram-positive activity.',
        technicalDetails:
          'The label lists Staphylococcus aureus (methicillin-susceptible strains) under lower respiratory tract, skin and skin-structure, bacterial septicaemia, bone and joint, and intra-abdominal infections. The zwitterionic pyridinium and bulky oxyimino chemistry that gives ceftazidime its Gram-negative outer-membrane penetration reduces its affinity for staphylococcal PBP2a-independent targets, and it is conventionally the least anti-staphylococcal of the widely used cephalosporins. The label’s own Microbiology section then adds a general caution that resistance is primarily through beta-lactamase hydrolysis, PBP alteration and decreased permeability, without breaking that down by organism. The practical consequence is that an empirical regimen resting on ceftazidime alone for a mixed infection is resting on the weakest part of its spectrum, which is why the label explicitly contemplates concomitant use with aminoglycosides, vancomycin or clindamycin in severe and life-threatening infection and in the immunocompromised patient.',
        evidenceSource:
          'Ceftazidime for injection United States prescribing information, INDICATIONS AND USAGE and Microbiology',
        inferredClaim:
          'That a listed organism on a label implies comparable activity against it — here the label lists methicillin-susceptible S. aureus for a drug whose defining chemistry traded Gram-positive potency for Gram-negative reach',
        auditFlag: 'caution',
      },
      {
        id: 'caz-a6',
        category: 'measured',
        title: 'An antagonism the label reports and nobody quotes',
        laymanSummary:
          'The label records that in a laboratory study, chloramphenicol and ceftazidime worked against each other rather than together.',
        technicalDetails:
          'The Microbiology section states, under Interaction with Other Antimicrobials: "In an in vitro study, antagonistic effects have been observed with the combination of chloramphenicol and ceftazidime." The mechanism is the standard one for pairing a bacteriostatic protein-synthesis inhibitor with a cell-wall agent — beta-lactams kill only actively dividing cells, and stopping protein synthesis stops division. This matters more than it looks in the melioidosis context: the trial that established ceftazidime compared it against a conventional regimen whose backbone was chloramphenicol, so the two drugs have a documented history together and a documented reason not to be combined. The label reports the finding as an in vitro observation and makes no clinical claim from it, which is the correct weight and is why it is filed here as measured rather than inferred.',
        evidenceSource:
          'Ceftazidime for injection United States prescribing information, Microbiology — Interaction with Other Antimicrobials',
        measuredMetric:
          'In vitro antagonism between chloramphenicol and ceftazidime, as reported on the label',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'It has to get through the outer wall first',
        laymanDesc:
          'Gram-negative bacteria have an extra outer membrane most antibiotics cannot cross. Ceftazidime carries both a positive and a negative charge, which lets it slip through the water-filled pores.',
        molecularDetail:
          'The C-3 pyridinium provides a permanent positive charge alongside the two carboxylates, making the molecule zwitterionic and compact enough to pass Gram-negative porin channels such as OprD and OmpF. This is the property that separates it from earlier cephalosporins against Pseudomonas aeruginosa.',
        iconName: 'DoorOpen',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It has to survive the enzymes waiting behind it',
        laymanDesc:
          'The space it enters is patrolled by enzymes that destroy antibiotics. A bulky arm on the molecule keeps most of them from getting a grip.',
        molecularDetail:
          'The syn-oriented 2-carboxyprop-2-yloxyimino group sterically hinders the active site of many class A penicillinases. It does not hinder derepressed AmpC cephalosporinases, and it is precisely the feature that extended-spectrum beta-lactamases evolved a wider active site to accommodate.',
        iconName: 'Shield',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It blocks the enzyme that builds the dividing wall',
        laymanDesc:
          'The target is the machine that builds the partition when a bacterium splits in two. Blocked, the cell stretches into a filament instead of dividing.',
        molecularDetail:
          'Ceftazidime binds preferentially to PBP3, the septal transpeptidase of Gram-negative rods, producing the characteristic filamentation seen at sub-lethal concentrations before lysis. Killing is time-dependent: what predicts effect is the fraction of the dosing interval spent above the MIC, not the peak.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The cell fails at its own seam',
        laymanDesc: 'Unable to close the wall across its middle, the elongated cell ruptures.',
        molecularDetail:
          'Continued autolysin activity without cross-linking causes osmotic lysis at the incomplete septum. Because this only happens in dividing cells, the label’s note of in vitro antagonism with chloramphenicol — which halts division — has a mechanism behind it.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'In melioidosis, deaths halved',
        laymanDesc:
          'The one randomised trial that measured survival found 37% died on ceftazidime against 74% on the previous standard regimen.',
        molecularDetail:
          'White et al., Lancet 1989: 161 patients entered, 65 bacteriologically confirmed, 54 septicaemic. Overall mortality 50% lower with ceftazidime (95% CI 19% to 81%), 37% against 74%, p=0.009. Burkholderia pseudomallei is not named anywhere in the United States label.',
        iconName: 'HeartPulse',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And then the bacteria caught up',
        laymanDesc:
          'Using it selects for the organisms it cannot kill. In one study, resistance appeared during treatment in nearly one in five patients with Enterobacter in the blood.',
        molecularDetail:
          'Chow et al., Ann Intern Med 1991: emergence of resistance during third-generation cephalosporin therapy in 6 of 31 (19%) against 1 of 89 on aminoglycosides. Separately, extended-spectrum beta-lactamases derived from TEM and SHV widened their active sites to hydrolyse the oxyimino side chain, and ESBL producers may test susceptible while treatment fails.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'White NJ et al., ceftazidime against conventional therapy in severe melioidosis (Lancet 1989;2:697-701)',
        phase: 'Open randomised paired restricted sequential trial',
        sampleSize: 161,
        primaryEndpoint:
          'Mortality in culture-positive severe melioidosis surviving beyond 48 hours, ceftazidime 120 mg/kg/day against chloramphenicol plus doxycycline plus trimethoprim-sulphamethoxazole',
        endpointMet: true,
        statisticalPValue:
          'Overall mortality 37% on ceftazidime against 74% on conventional therapy; 50% lower mortality (95% CI 19% to 81%), p=0.009. Trial stopped after 22 months on the sequential boundary',
        unreportedAdverseSignals:
          'Of 161 patients entered, only 65 had bacteriologically confirmed melioidosis and 54 of those were septicaemic, so the mortality comparison rests on a much smaller group than the enrolment number suggests. The trial was open-label, and the indication it established is not on the United States label.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'Chow JW et al., Enterobacter bacteraemia cohort (Ann Intern Med 1991;115:585-590)',
        phase: 'Prospective observational cohort across five centres',
        sampleSize: 129,
        primaryEndpoint:
          'Emergence of antibiotic resistance during therapy, and mortality by resistance pattern, in adults with Enterobacter bacteraemia',
        endpointMet: false,
        statisticalPValue:
          'Resistance emerged in 6 of 31 (19%) on third-generation cephalosporins against 1 of 89 on aminoglycosides (p=0.001) and 0 of 50 on other beta-lactams (p=0.002); multiresistant isolates carried 32% mortality against 15% (p=0.03)',
        unreportedAdverseSignals:
          'Observational, so the choice of drug was not randomised and sicker patients may have received different regimens. The finding has nonetheless held: the ceftazidime label now carries the same warning in its own PRECAUTIONS section.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Mortality in severe melioidosis 37% on ceftazidime against 74% on conventional therapy, a 50% reduction (95% CI 19% to 81%), p=0.009, in a randomised trial of 161 entered patients',
        'Emergence of resistance during therapy in 6 of 31 patients (19%) treated with third-generation cephalosporins for Enterobacter bacteraemia, against 1 of 89 on aminoglycosides',
        'Prior third-generation cephalosporin exposure associated with multiresistant Enterobacter isolates, 69% against 20% (p<0.001), and multiresistance with 32% mortality against 15% (p=0.03)',
        'Renal excretion of 80% to 90% of an unchanged dose within 24 hours, with less than 10% protein binding',
      ],
      unsupportedInferences: [
        'That an in vitro susceptibility report predicts clinical response — the label warns of failure through inducible AmpC, and the ESBL literature reports high failure rates in organisms that test susceptible',
        'That the melioidosis mortality result is a licensed use in the United States: Burkholderia pseudomallei appears nowhere in the label',
        'That a listed organism implies comparable activity, when the label names methicillin-susceptible S. aureus for a molecule whose chemistry traded Gram-positive potency away',
        'That the anti-pseudomonal advantage is durable in an individual patient, when porin loss, efflux upregulation and AmpC derepression can all appear during a single course',
      ],
      whatFailedInitially: [
        'Monotherapy against Enterobacter, Serratia and Citrobacter, where resistance emerged during treatment often enough for the label to carry a warning and for the cohort authors to advise against it irrespective of susceptibility',
        'Reliability in the face of extended-spectrum beta-lactamases, enzymes that evolved specifically to hydrolyse the oxyimino side chain this drug is built on',
        'Safety at an unadjusted dose in renal impairment, where the label lists seizures, non-convulsive status epilepticus, encephalopathy and coma',
        'Combination with chloramphenicol, where the label reports in vitro antagonism',
      ],
      realWorldOutcome: [
        'Approved in the United States in 1985 and on the WHO Model List of Essential Medicines, but with only two products carrying a United States acquisition price at about US$3.70 per unit',
        'Remains a first-line intensive-phase treatment for melioidosis throughout endemic Asia and northern Australia, on the strength of a 1989 trial and an indication the United States label does not carry',
        'Displaced from empirical use against inducible-AmpC organisms by cefepime and the carbapenems',
        'Reissued in 2015 as ceftazidime-avibactam, the same molecule with an inhibitor bolted on to restore what the enzymes had taken away',
      ],
    },
    deliverySystem: {
      type: 'Intravenous infusion or intramuscular injection of the pentahydrate, reconstituted before use',
      description:
        'After a 1 g intravenous dose over five minutes, mean peak serum concentration is about 90 mcg/mL; after a 1 g intramuscular dose, about 39 mcg/mL at one hour. The serum half-life is roughly two hours, absorption and elimination are directly proportional to dose, and less than 10% is protein bound. Hepatic dysfunction does not alter the pharmacokinetics provided renal function is intact; renal impairment alters them substantially, and the label ties dose reduction directly to it.',
      safetyProfile:
        'The label opens its WARNINGS in capitals on hypersensitivity, stating that cross-hypersensitivity among beta-lactams has been clearly documented and may occur in up to 10% of patients with a history of penicillin allergy — a figure the modern review literature places nearer 1% and side-chain-dependent. Clostridioides difficile-associated diarrhoea has been reported and may present up to two months after treatment. In renal insufficiency, accumulation can cause seizures, non-convulsive status epilepticus, encephalopathy, coma, asterixis, neuromuscular excitability and myoclonia. Cephalosporins may reduce prothrombin activity in patients with renal or hepatic impairment or poor nutrition. Adverse reactions in clinical trials were uncommon: hypersensitivity in 2%, phlebitis and gastrointestinal effects in fewer than 2%, and a positive Coombs test without haemolysis in about 1 in 23.',
    },
    commonQuestions: [
      {
        q: 'The laboratory says the bug is susceptible. Why is the doctor changing the antibiotic?',
        a: 'Because with some organisms a susceptibility result is a snapshot rather than a prediction. Enterobacter, Serratia, Citrobacter and Pseudomonas carry a chromosomal enzyme called AmpC that is normally switched down; a small fraction of any population has it permanently switched up. Treating with ceftazidime kills the ordinary cells and leaves those. In a five-centre study of 129 patients with Enterobacter in the blood, resistance emerged during third-generation cephalosporin treatment in 6 of 31 people, against 1 of 89 treated with an aminoglycoside. The drug’s own label carries this warning and tells prescribers to repeat susceptibility testing. Separately, organisms carrying extended-spectrum beta-lactamases can test susceptible while treatment fails.',
        auditNote:
          'This is the clearest example in common antibiotic use of a measured laboratory result that does not transfer to the patient, and both the label and the primary literature say so.',
      },
      {
        q: 'Is this a strong antibiotic?',
        a: 'It is a specific one rather than a broadly strong one. Ceftazidime was built to reach Pseudomonas aeruginosa, and the chemistry that achieved that — a bulky charged side arm and a pyridinium ring — cost it activity against Gram-positive bacteria. It is conventionally the weakest of the widely used cephalosporins against Staphylococcus aureus, even though its label lists methicillin-susceptible S. aureus under several indications. That is why the label itself contemplates giving it alongside an aminoglycoside, vancomycin or clindamycin in severe infection and in immunocompromised patients.',
      },
      {
        q: 'Why does it need a lower dose when kidneys are not working?',
        a: 'Because between 80% and 90% of a dose leaves the body unchanged in urine and almost none of it is bound to protein, so a failing kidney translates almost directly into a rising blood level. The label states that elevated levels in renal insufficiency can cause seizures, non-convulsive status epilepticus, encephalopathy, coma, asterixis, neuromuscular excitability and myoclonia. The one worth knowing about is non-convulsive status epilepticus, because it looks like confusion or drowsiness in an already ill patient and is only confirmed on an electroencephalogram.',
      },
      {
        q: 'I read this drug halves deaths. Is that right?',
        a: 'In one disease, and it is not a disease most readers will have. In severe melioidosis — infection with Burkholderia pseudomallei, endemic in Southeast Asia and northern Australia — a randomised trial in Thailand found mortality of 37% on ceftazidime against 74% on the previous standard regimen, a 50% reduction with a confidence interval of 19% to 81%. That result changed treatment worldwide for that infection. It is also the only randomised mortality result the molecule has, and melioidosis is not among the indications on its United States label.',
      },
      {
        q: 'What is ceftazidime-avibactam and why does it exist?',
        a: 'It is the same cephalosporin with a second molecule added whose only job is to inhibit the enzymes that learned to destroy it. Avibactam is not a beta-lactam; it inhibits class A, class C and some class D beta-lactamases, which restores ceftazidime’s activity against extended-spectrum beta-lactamase producers, derepressed AmpC organisms and KPC carbapenemase producers. Its existence is the clearest possible statement about the original drug: the killing chemistry was still worth having thirty years on, and everything that had gone wrong was defence, not attack.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'White NJ, Dance DA, Chaowagul W, Wattanagoon Y, Wuthiekanun V, Pitakwatchara N. Halving of mortality of severe melioidosis by ceftazidime. Lancet 1989;2:697-701',
        identifier: '10.1016/s0140-6736(89)90768-x',
        kind: 'doi',
      },
      {
        label:
          'Chow JW, Fine MJ, Shlaes DM, et al. Enterobacter bacteremia: clinical features and emergence of antibiotic resistance during therapy. Ann Intern Med 1991;115:585-590',
        identifier: '10.7326/0003-4819-115-8-585',
        kind: 'doi',
      },
      {
        label:
          'Paterson DL, Bonomo RA. Extended-spectrum beta-lactamases: a clinical update. Clin Microbiol Rev 2005;18:657-686',
        identifier: '10.1128/CMR.18.4.657-686.2005',
        kind: 'doi',
      },
      {
        label:
          'Campagna JD, Bond MC, Schabelman E, Hayes BD. The use of cephalosporins in penicillin-allergic patients: a literature review. J Emerg Med 2012;42:612-620',
        identifier: '10.1016/j.jemermed.2011.05.035',
        kind: 'doi',
      },
      {
        label:
          'Ceftazidime for injection, USP — United States prescribing information (Indications and Usage, Warnings, Precautions: General, Adverse Reactions, Clinical Pharmacology, Microbiology)',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=112c5457-8d71-49f5-b531-9761d7d38c93',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 5481173 — ceftazidime canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5481173',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 3. Gentamicin — a drug that kills bacteria and deafens people through the same lock, because
  //    the human mitochondrial ribosome is a bacterial one.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'gentamicin',
    name: 'Gentamicin',
    tradeName: 'Garamycin / Gentak / Gentafair',
    sponsor:
      'Schering (originator; gentamicin was isolated from the actinomycete Micromonospora purpurea and reached the United States market in 1966). Long generic and made by many manufacturers',
    targetGene:
      'The bacterial 16S ribosomal RNA gene rrs — specifically the decoding A site in helix 44 of the 30S subunit. The human gene that matters here is MT-RNR1, the mitochondrial 12S ribosomal RNA, which is bacterial in ancestry and which the drug also binds',
    targetProtein:
      'None. The target is RNA: the aminoacyl-tRNA decoding site of the bacterial 30S ribosomal subunit',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1966,
    indication:
      'Serious infections caused by susceptible strains of Pseudomonas aeruginosa, Proteus species, Escherichia coli, the Klebsiella-Enterobacter-Serratia group, Citrobacter species and Staphylococcus species — including neonatal sepsis, septicaemia, central nervous system, urinary, respiratory, gastrointestinal, skin, bone and soft tissue infections. Not indicated in uncomplicated initial urinary tract infection unless the organism is not susceptible to a less toxic antibiotic',
    patientFriendlyIndication:
      'Serious bacterial infections, usually in hospital, where a less toxic antibiotic will not do',
    anatomicalSite:
      'The bacterial ribosome. The toxicity site is the human inner ear — the hair cells of the cochlea and vestibule — and the proximal tubule of the kidney',
    conditionContext: {
      conditionExplainer:
        'A ribosome is the machine that reads genetic instructions and builds proteins. Bacterial ribosomes are built differently from the ones in the main body of a human cell, which is what makes them a drug target. But the ribosomes inside human mitochondria descend from bacteria that were swallowed by our ancestors’ cells, and they still look bacterial enough to be hit.',
      whyItMatters:
        'That single fact explains both halves of gentamicin. It is one of the cheapest and most rapidly bactericidal drugs available against Gram-negative organisms, and it causes irreversible deafness. Both effects come from the same binding site on the same kind of RNA.',
      whoTakesThis:
        'Hospital patients with serious Gram-negative infection, neonates with suspected sepsis, and patients with enterococcal or streptococcal endocarditis where synergy with a cell-wall agent is being sought.',
      clinicalGoals:
        'Bacteriological cure with the shortest possible exposure. The label states outright that it is desirable to limit the duration of aminoglycoside treatment to short term.',
    },
    oneSentenceVerdict:
      'A ribosome-binding antibiotic whose own label warns that hearing loss is usually irreversible and can occur at serum levels inside the recommended range in carriers of the mitochondrial m.1555A>G variant, and whose two most-cited additive uses have both been measured and found wanting — adding it to a beta-lactam for sepsis left mortality unchanged across 64 trials and 7,586 patients while nearly tripling nephrotoxicity, and adding it to therapy for Staphylococcus aureus bacteraemia raised clinically significant falls in creatinine clearance from 8% to 22%.',
    laymanHowItWorks:
      'Gentamicin jams the machine bacteria use to read their own genetic instructions, so the proteins they build come out wrong and the cell dies. It works fast and it works against organisms that shrug off most other drugs. The problem is that human cells contain their own small population of bacteria-like machines — the ribosomes inside mitochondria, descended from bacteria absorbed by our ancestors’ cells more than a billion years ago. Gentamicin binds those too. In the hair cells of the inner ear, which have no way to replace themselves, that damage is permanent.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 64,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.8777 per gram at United States pharmacy acquisition cost (CMS NADAC, median across 15 listed products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Reached the United States market in 1966 and has been generic for decades; it is on the WHO Model List of Essential Medicines. It is a fermentation product of Micromonospora purpurea rather than a synthetic molecule, which is why the manufacturing base is narrow relative to the price. A drug this cheap and this rapidly bactericidal is not displaced on cost — it is displaced on toxicity, and the drugs that displaced it cost far more.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Almost every alternative to gentamicin is a trade of toxicity for spectrum or for money. The honest summary of the last twenty years of evidence is that gentamicin has been removed from two places it used to be routine — added to a beta-lactam for sepsis, and added to therapy for staphylococcal bacteraemia — because randomised and cohort data showed harm without measurable benefit. Where it remains, it remains because nothing cheap does what it does. Nothing sold as a food or supplement treats a bacterial infection, and the naturalFoods list on this page is empty for that reason.',
      conventionalRx: [
        {
          name: 'A beta-lactam alone (piperacillin-tazobactam, a carbapenem, an anti-pseudomonal cephalosporin)',
          class: 'Beta-lactam monotherapy',
          howItCompares:
            'The direct comparison exists and it is large. Across 64 randomised trials and 7,586 patients with sepsis, adding an aminoglycoside to a beta-lactam left all-cause fatality unchanged (relative risk 0.90, 95% CI 0.77 to 1.06), produced no advantage in Gram-negative or Pseudomonas infections, made no difference to the emergence of resistance, and increased nephrotoxicity substantially. Clinical failure was actually more common with the combination.',
          typicalCost:
            'Not stated: no verified CMS acquisition price for these agents was held on this record at the time of writing',
          prosAndCons:
            'Pros: no nephrotoxicity or ototoxicity from the aminoglycoside; no serum level monitoring. Cons: broader spectrum agents cost more and select harder; the meta-analysis covers immunocompetent patients with sepsis and does not settle every situation.',
        },
        {
          name: 'Daptomycin',
          class: 'Cyclic lipopeptide',
          howItCompares:
            'In the trial from which the gentamicin nephrotoxicity analysis was drawn, daptomycin monotherapy for S. aureus bacteraemia and native valve endocarditis produced renal adverse events in 8 of 120 (7%), against 19% and 17% in the vancomycin and antistaphylococcal penicillin arms which received initial low-dose gentamicin.',
          typicalCost:
            'Not stated: no verified CMS acquisition price for daptomycin was held on this record at the time of writing',
          prosAndCons:
            'Pros: no aminoglycoside nephrotoxicity; once daily. Cons: far more expensive; inactivated by pulmonary surfactant so useless in pneumonia; creatine kinase monitoring required.',
        },
        {
          name: 'Amikacin',
          class: 'Aminoglycoside',
          howItCompares:
            'Same class, same boxed warning, same mitochondrial vulnerability. It differs in resistance profile: amikacin resists most of the aminoglycoside-modifying enzymes that inactivate gentamicin, so it is the aminoglycoside kept in reserve for organisms that have already defeated this one.',
          typicalCost:
            'Not stated: no verified CMS acquisition price for amikacin was held on this record at the time of writing',
          prosAndCons:
            'Pros: activity against gentamicin-resistant Gram-negatives. Cons: identical class toxicity, and using it widely destroys the reason it was kept in reserve.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'A family history of deafness after an antibiotic is a red flag worth stating',
          action:
            'Tell the team if any relative on your mother’s side lost hearing after an injected antibiotic.',
          patientImpact:
            'The label directs that in the case of a known maternal history of ototoxicity due to aminoglycoside use, or a known mitochondrial DNA variant, alternative treatments should be considered unless the risk of permanent hearing loss is outweighed by the severity of infection and the lack of safe alternatives. Mitochondrial DNA is inherited only from the mother, which is why the maternal line specifically matters.',
          clinicalPrecaution:
            'The label also states that these variants are present in less than 1% of the general United States population and that the proportion of carriers who will develop ototoxicity is unknown. This is information to give a clinician, not a decision a patient makes.',
        },
        {
          name: 'Report dizziness and ringing, not just hearing loss',
          action:
            'Say straight away if the room seems to move when you turn your head, or if there is ringing or roaring in the ears.',
          patientImpact:
            'The boxed warning lists dizziness, vertigo, tinnitus, roaring in the ears and hearing loss together as evidence of ototoxicity requiring dose adjustment or discontinuation. Gentamicin damages the balance organ at least as readily as the cochlea, and vestibular loss is often noticed as unsteadiness rather than as a hearing problem.',
          clinicalPrecaution:
            'The label notes that changes in eighth cranial nerve function may on rare occasions not become manifest until soon after treatment has finished, so the absence of symptoms during a course is not the same as the absence of damage.',
        },
        {
          name: 'Mention every other drug, especially the kidney ones',
          action:
            'List all concurrent medicines, particularly cephalosporins, other aminoglycosides, cisplatin, loop diuretics and anaesthetic or muscle-relaxant exposure.',
          patientImpact:
            'The label warns that increased nephrotoxicity has been reported when aminoglycosides are given with cephalosporins, and that neuromuscular blockade and respiratory paralysis are a consideration in patients receiving anaesthetics or neuromuscular blocking agents, or massive transfusions of citrate-anticoagulated blood.',
          clinicalPrecaution:
            'The label further cautions in neuromuscular disorders such as myasthenia gravis, because aminoglycosides have a curare-like effect at the neuromuscular junction. If blockade occurs, calcium salts may reverse it.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(C1CCC(C(O1)OC2C(CC(C(C2O)OC3C(C(C(CO3)(C)O)NC)O)N)N)N)NC',
      chemicalFormula: 'C21H43N5O7',
      molecularWeight: '477.60 g/mol',
      targetReceptorAffinity:
        'Gentamicin is a polycationic aminoglycoside: at physiological pH the amine groups are protonated, giving the molecule a strong positive charge that drives electrostatic binding to the phosphate backbone of RNA and to the anionic lipopolysaccharide of the Gram-negative outer membrane. It binds the major groove of helix 44 of 16S ribosomal RNA at the aminoacyl-tRNA decoding site, displacing two adenine residues into a flipped-out conformation that mimics the state normally produced only by a correct codon-anticodon pair. The ribosome therefore accepts near-cognate tRNAs, and the resulting mistranslated membrane proteins let more drug in — a self-amplifying loop that makes aminoglycosides bactericidal rather than merely bacteriostatic. The formula and weight recorded here, C21H43N5O7 at 477.60 g/mol, describe a single C-congener; the substance actually dispensed is described on its own label as derived by the growth of Micromonospora purpurea, and gentamicin sulfate is a fermentation-derived mixture of closely related congeners rather than one compound. Protein binding is low, between 0% and 30% depending on method, and little or no metabolic transformation occurs.',
      structureSource: {
        label:
          'PubChem CID 3467 (gentamicin) — canonical SMILES, molecular formula and weight, as carried on the enriched record; fermentation origin, protein binding and excretion from the gentamicin injection United States label, DESCRIPTION and CLINICAL PHARMACOLOGY',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3467',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'gen-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Report the congener ratio, not just the potency',
          description:
            'Gentamicin is a fermentation product and the marketed substance is a mixture of C-congeners in a ratio set by the fermentation, not by design. Different congeners differ in activity and in ototoxic potential, so two batches with identical microbiological potency can differ in composition. A release test that reports only potency in units per milligram is measuring the wrong thing for a toxicity question.',
          reagentsAndBuffer:
            'Gentamicin sulfate reference standard, HPLC with pulsed amperometric or evaporative light-scattering detection to resolve the C1, C1a, C2, C2a and C2b congeners, microbiological potency assay against Staphylococcus epidermidis as the compendial cross-check',
        },
        {
          id: 'gen-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Ferment Micromonospora purpurea and control the congener output',
          description:
            'The drug is grown, not built. The label describes it as derived by the growth of Micromonospora purpurea, an actinomycete. Because congener ratio is a property of the fermentation, the process controls that matter are the ones that shift that ratio: carbon source, cobalt availability, and the point at which the broth is harvested.',
          dependsOnStepId: 'gen-w1',
          reagentsAndBuffer:
            'Micromonospora purpurea production culture, defined carbon and nitrogen feed with cobalt supplementation, controlled dissolved oxygen and pH, in-process HPLC monitoring of congener distribution',
        },
        {
          id: 'gen-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Isolate the sulfate salt from a highly polar broth',
          description:
            'Gentamicin is intensely polar and cationic, so it does not partition into organic solvent the way most drug substances do. Purification runs on ion exchange, and the product is isolated as the sulfate salt. The absence of a chromophore is the reason the compendial assay was microbiological for so long and why modern release testing needs detectors that do not rely on ultraviolet absorbance.',
          dependsOnStepId: 'gen-w2',
          reagentsAndBuffer:
            'Weak cation-exchange resin, ammonium hydroxide eluent, sulfuric acid for salt formation, activated carbon decolourisation, endotoxin and sterility release testing for the injectable',
        },
        {
          id: 'gen-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure uptake into hair cells, not only into bacteria',
          description:
            'The toxicity is an uptake problem, not a binding problem: gentamicin enters cochlear hair cells through mechanotransduction channels and then accumulates over days. A study designed only around bacterial killing cannot see this. The relevant preparation is a cochlear explant with fluorescently tagged drug, which is what makes the accumulation and the cell death directly visible.',
          dependsOnStepId: 'gen-w3',
          reagentsAndBuffer:
            'Neonatal rodent cochlear explant culture, Texas Red-conjugated gentamicin, myosin VIIa and phalloidin immunostaining for hair cell identification, confocal time-course imaging over 24 to 72 hours',
        },
        {
          id: 'gen-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Test binding against the human mitochondrial 12S rRNA A site',
          description:
            'The whole toxicity story rests on the claim that the drug binds a human ribosomal RNA that resembles the bacterial one. The experiment that tests it, rather than assumes it, is a direct binding and misreading assay against the human mitochondrial 12S A site with and without the m.1555A>G substitution, which is the variant the label singles out. If the variant sequence binds the drug more tightly than the reference sequence, the clinical warning has a molecular basis.',
          dependsOnStepId: 'gen-w4',
          reagentsAndBuffer:
            'Synthetic RNA oligonucleotides modelling the human mitochondrial 12S A site in reference and m.1555A>G forms, bacterial 16S A site construct as comparator, isothermal titration calorimetry or fluorescence anisotropy, in vitro mitochondrial translation readout',
        },
      ],
    },
    keyAudits: [
      {
        id: 'gen-a1',
        category: 'conclusion_shift',
        title:
          'Routine low-dose gentamicin for staphylococcal bacteraemia was measured and dropped',
        laymanSummary:
          'For decades a small dose of gentamicin was added to treatment for Staphylococcus aureus in the blood, on the theory that it helped. When somebody finally measured the kidneys, 22% of the people who got it had a clinically significant fall in kidney function against 8% of those who did not, and the practice was abandoned.',
        technicalDetails:
          'Cosgrove and colleagues analysed prospective safety data from a randomised controlled trial of 236 patients with S. aureus bacteraemia and native valve infective endocarditis, drawn from 44 hospitals in four countries. Patients received either standard therapy — an antistaphylococcal penicillin or vancomycin — plus initial low-dose gentamicin (n=116), or daptomycin monotherapy (n=120). Renal adverse events occurred in 8 of 120 daptomycin recipients (7%), 10 of 53 vancomycin recipients (19%) and 11 of 63 antistaphylococcal penicillin recipients (17%). Clinically significant decreased creatinine clearance occurred in 22% of those who received any initial low-dose gentamicin against 8% of those who did not (p=0.005). Age 65 or over and receipt of any initial low-dose gentamicin were the independent predictors. The authors concluded that the practice is nephrotoxic and should not be used routinely "given the minimal existing data supporting its benefit" — which is the more damaging half of the sentence. The addition had entered practice on synergy demonstrated in vitro and in animal models, and the human benefit had never been established before the human harm was measured.',
        evidenceSource:
          'Cosgrove SE, Vigliani GA, Fowler VG Jr, et al. Initial low-dose gentamicin for Staphylococcus aureus bacteremia and endocarditis is nephrotoxic. Clin Infect Dis 2009;48:713-721',
        doi: '10.1086/597031',
        measuredMetric:
          'Clinically significant decrease in creatinine clearance, 22% with initial low-dose gentamicin against 8% without, in 236 patients across 44 hospitals',
        auditFlag: 'verified',
      },
      {
        id: 'gen-a2',
        category: 'failed',
        title:
          'Adding it to a beta-lactam for sepsis: no lives saved, three times the kidney injury',
        laymanSummary:
          'Sixty-four randomised trials and 7,586 patients compared a beta-lactam alone against the same beta-lactam plus an aminoglycoside for sepsis. Deaths were no different. Kidney injury was far more common with the combination. The authors concluded the practice should be discouraged.',
        technicalDetails:
          'Paul and colleagues pooled 64 randomised trials in 7,586 immunocompetent patients meeting criteria for sepsis. All-cause fatality by intention to treat did not differ (relative risk 0.90, 95% CI 0.77 to 1.06, with relative risk below 1 favouring monotherapy). Twelve studies compared the same beta-lactam in both arms (1.02, 0.76 to 1.38) and 31 compared different beta-lactams (0.85, 0.69 to 1.05). Clinical failure was more common with combination treatment overall (0.87, 0.78 to 0.97) and among studies comparing different beta-lactams (0.76, 0.68 to 0.86). There was no advantage to combination therapy among 1,835 patients with Gram-negative infections or 426 with Pseudomonas aeruginosa infections, and no difference in the rate of development of resistance — which removes the second common justification for the practice. Nephrotoxicity was significantly more common with combination therapy (0.36, 0.28 to 0.47). Heterogeneity was not significant for any of these comparisons. The two arguments for adding an aminoglycoside were faster killing and less resistance; the meta-analysis found neither, and found the harm.',
        evidenceSource:
          'Paul M, Benuri-Silbiger I, Soares-Weiser K, Leibovici L. Beta lactam monotherapy versus beta lactam-aminoglycoside combination therapy for sepsis in immunocompetent patients: systematic review and meta-analysis of randomised trials. BMJ 2004;328:668',
        doi: '10.1136/bmj.38028.520995.63',
        measuredMetric:
          'All-cause fatality, clinical failure, resistance emergence and nephrotoxicity across 64 randomised trials and 7,586 patients',
        auditFlag: 'verified',
      },
      {
        id: 'gen-a3',
        category: 'measured',
        title: 'Deafness at levels the monitoring says are safe',
        laymanSummary:
          'The whole system of measuring gentamicin levels in blood rests on the idea that staying in range prevents damage. The label states plainly that in people carrying a particular inherited mitochondrial variant, hearing loss has happened at levels inside the recommended range.',
        technicalDetails:
          'The label’s section on Risk of Ototoxicity Due to Mitochondrial DNA Variants reads: cases of ototoxicity with aminoglycosides have been observed in patients with certain variants in the mitochondrially encoded 12S rRNA gene (MT-RNR1), particularly the m.1555A>G variant, and "ototoxicity occurred in some patients even when their aminoglycoside serum levels were within the recommended range". The mechanism is structural: the m.1555A>G substitution makes the human mitochondrial 12S ribosomal RNA more closely resemble the bacterial 16S A site the drug is designed to bind. The label states the variants are present in less than 1% of the general United States population, that the proportion of carriers who develop ototoxicity and the severity are unknown, and that a known maternal history of aminoglycoside ototoxicity or a known variant should prompt consideration of alternatives. Mitochondrial DNA is maternally inherited, so the family history that matters runs through the mother’s line only. This is a rare pharmacogenomic warning that names an actual variant and concedes that the standard safety procedure does not detect the risk.',
        evidenceSource:
          'Gentamicin injection United States prescribing information, WARNINGS — Risk of Ototoxicity Due to Mitochondrial DNA Variants',
        measuredMetric:
          'Occurrence of aminoglycoside ototoxicity at serum concentrations within the recommended range in MT-RNR1 m.1555A>G carriers, as stated on the label',
        auditFlag: 'verified',
      },
      {
        id: 'gen-a4',
        category: 'inferred',
        title: 'Therapeutic drug monitoring is a safety ritual with a hole in it',
        laymanSummary:
          'Peaks below 12 and troughs below 2 are the numbers everyone works to. The label sets them, and in the same document concedes that damage can appear only after the course has finished and can occur at in-range levels in some people.',
        technicalDetails:
          'The boxed warning directs that peak concentrations be kept from persisting above 12 mcg/mL and troughs below 2 mcg/mL, with periodic blood urea nitrogen, creatinine or creatinine clearance, urine examination for casts and protein, and serial audiograms where feasible. It then states, in the same warning, that "on rare occasions changes in renal and eighth cranial nerve function may not become manifest until soon after completion of therapy". The mitochondrial variant section adds that toxicity has occurred at in-range levels. And the dosing section notes that in extensive burns, altered pharmacokinetics may reduce serum concentrations. So the monitoring scheme detects excessive exposure, which is one cause of toxicity; it does not detect cumulative hair-cell uptake, genetic susceptibility, or damage that declares itself late. Monitoring is worth doing and it is not a guarantee, and the label says both.',
        evidenceSource:
          'Gentamicin injection United States prescribing information, BOXED WARNINGS, WARNINGS and DOSAGE AND ADMINISTRATION',
        inferredClaim:
          'That keeping serum concentrations within the labelled range prevents aminoglycoside ototoxicity and nephrotoxicity — an inference the same label undercuts twice, for late-manifesting toxicity and for mitochondrial variant carriers',
        auditFlag: 'caution',
      },
      {
        id: 'gen-a5',
        category: 'conclusion_shift',
        title: 'Everyone gives it once daily; the label still says three times a day',
        laymanSummary:
          'Hospitals switched to giving the whole dose once a day decades ago, on the theory that a high peak kills better and a long trough lets the kidney recover. The label was never updated, and the randomised evidence for the switch is thinner than the confidence behind it.',
        technicalDetails:
          'The DOSAGE AND ADMINISTRATION section still reads: 3 mg/kg/day in three equal doses every eight hours for serious infections and normal renal function, rising to 5 mg/kg/day in three or four equal doses for life-threatening infection, with the expectation of a peak of 4 to 6 mcg/mL 30 to 60 minutes after intramuscular injection. Extended-interval dosing appears nowhere in it. The best-controlled body of randomised evidence for the switch, a Cochrane review of once-daily against thrice-daily intravenous aminoglycosides in cystic fibrosis, found four trials with 328 participants and no significant difference in forced expiratory volume in one second (mean difference 0.33, 95% CI −2.81 to 3.48), forced vital capacity, weight for height or body mass index, and no difference in ototoxicity — but with a confidence interval so wide it excludes almost nothing (relative risk 0.56, 95% CI 0.04 to 7.96). Percentage change in creatinine favoured once-daily dosing in children (mean difference −8.20, 95% CI −15.32 to −1.08) but not in adults (3.25, 95% CI −1.82 to 8.33). The trials reported neither resistance patterns nor quality of life. The change in practice is probably right and it is not backed by the size of evidence that its universality implies.',
        evidenceSource:
          'Smyth AR, Bhatt J, Nevitt SJ. Once-daily versus multiple-daily dosing with intravenous aminoglycosides for cystic fibrosis. Cochrane Database Syst Rev 2017;3:CD002009; gentamicin injection United States prescribing information, DOSAGE AND ADMINISTRATION',
        doi: '10.1002/14651858.CD002009.pub6',
        inferredClaim:
          'That once-daily aminoglycoside dosing is established as both equally effective and less toxic — a conclusion drawn from pharmacokinetic reasoning and supported by randomised data whose confidence intervals are far wider than the practice change suggests',
        auditFlag: 'contested',
      },
      {
        id: 'gen-a6',
        category: 'measured',
        title: 'It is a mixture, not a molecule',
        laymanSummary:
          'Gentamicin is grown in a fermenter, not built in a reactor, and what comes out is a family of closely related molecules rather than one compound. The single structure shown on this page is one member of that family.',
        technicalDetails:
          'The label’s DESCRIPTION states that gentamicin sulfate is "a water-soluble antibiotic of the aminoglycoside group, derived by the growth of Micromonospora purpurea, an actinomycete". Gentamicin sulfate is a fermentation-derived mixture of closely related C-congeners rather than a single chemical entity, and the composition of that mixture is set by fermentation conditions. The formula and molecular weight carried on this record and by PubChem, C21H43N5O7 at 477.60 g/mol, describe a single congener. This matters for two reasons. First, the compendial potency assay reports biological activity in units per milligram rather than the composition of the mixture, so two conforming batches can differ in what they contain. Second, congeners are not identical in ototoxic potential, so a composition difference is a safety difference that a potency-only release test does not see. None of this is hidden — it is on the label in the first sentence of the description — and it is routinely forgotten when a single structure is drawn.',
        evidenceSource:
          'Gentamicin injection United States prescribing information, DESCRIPTION; PubChem CID 3467 for the single-congener formula and weight',
        measuredMetric:
          'Composition of the marketed substance: a fermentation-derived congener mixture against the single-molecule formula recorded in the structure database',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'It tears its own way through the outer membrane',
        laymanDesc:
          'The drug carries a strong positive charge and the outside of a Gram-negative bacterium is strongly negative. It sticks, displaces the ions holding the membrane together, and lets itself in.',
        molecularDetail:
          'Polycationic aminoglycosides bind lipopolysaccharide and competitively displace the divalent magnesium and calcium bridges that cross-link adjacent LPS molecules, producing transient membrane disruption — the self-promoted uptake pathway. Entry across the inner membrane then requires an electrochemical gradient, which is why aminoglycosides are inactive against anaerobes and in acidic abscess environments.',
        iconName: 'DoorOpen',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It grips the RNA that reads the genetic code',
        laymanDesc:
          'Inside, it clamps onto the part of the bacterial protein factory that checks whether the right building block has arrived.',
        molecularDetail:
          'Gentamicin binds the major groove of helix 44 of 16S ribosomal RNA at the aminoacyl-tRNA decoding site, flipping adenines A1492 and A1493 out of the helix into the conformation that normally signals a correct codon-anticodon match.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'The bacterium starts building the wrong proteins',
        laymanDesc:
          'With the proofreading step jammed open, the cell accepts nearly-right building blocks and produces garbled proteins.',
        molecularDetail:
          'Proofreading fidelity collapses and near-cognate tRNAs are accepted. Mistranslated membrane proteins misfold in the inner membrane, increasing permeability and admitting more drug — the concentration-dependent, self-amplifying loop that makes aminoglycosides rapidly bactericidal rather than bacteriostatic.',
        iconName: 'Shuffle',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'The same lock exists inside your own cells',
        laymanDesc:
          'Mitochondria — the power plants inside human cells — descend from bacteria and still carry bacterial-style ribosomes. Gentamicin binds those too.',
        molecularDetail:
          'The human mitochondrial 12S ribosomal RNA (MT-RNR1) A site is homologous to the bacterial 16S A site. The m.1555A>G variant increases that resemblance, and the label records ototoxicity in carriers at serum concentrations within the recommended range. Mitochondrial DNA is maternally inherited.',
        iconName: 'AlertTriangle',
        visualStage: 'cellular_entry',
      },
      {
        step: 5,
        title: 'Hair cells accumulate it and do not grow back',
        laymanDesc:
          'The drug builds up in the sensory cells of the inner ear over days. Those cells are not replaced, which is why the label calls the hearing loss usually irreversible.',
        molecularDetail:
          'Aminoglycosides enter cochlear and vestibular hair cells through mechanotransduction channels and are retained for weeks. The boxed warning states that aminoglycoside-induced ototoxicity is usually irreversible, that both vestibular and auditory function are affected, and that changes may not become manifest until soon after completion of therapy.',
        iconName: 'EarOff',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Two things it was routinely added to, and neither survived measurement',
        laymanDesc:
          'Added to a beta-lactam for sepsis, it saved no lives and tripled kidney injury. Added for staphylococcal bloodstream infection, it raised significant kidney impairment from 8% to 22%.',
        molecularDetail:
          'Paul et al., BMJ 2004: 64 trials, 7,586 patients, all-cause fatality relative risk 0.90 (95% CI 0.77 to 1.06), nephrotoxicity 0.36 (0.28 to 0.47) favouring monotherapy. Cosgrove et al., Clin Infect Dis 2009: decreased creatinine clearance in 22% against 8% (p=0.005) across 236 patients.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'Paul M et al., beta-lactam monotherapy against beta-lactam plus aminoglycoside for sepsis (BMJ 2004;328:668)',
        phase: 'Systematic review and meta-analysis of randomised trials',
        sampleSize: 7586,
        primaryEndpoint:
          'All-cause fatality by intention to treat in immunocompetent patients meeting criteria for sepsis',
        endpointMet: false,
        statisticalPValue:
          'All-cause fatality relative risk 0.90 (95% CI 0.77 to 1.06), no difference. Clinical failure more common with combination (0.87, 0.78 to 0.97). Nephrotoxicity significantly more common with combination (0.36, 0.28 to 0.47)',
        unreportedAdverseSignals:
          'No advantage to combination therapy in 1,835 patients with Gram-negative infections or 426 with Pseudomonas aeruginosa, and no difference in the development of resistance — removing the second stated justification for the practice.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'Cosgrove SE et al., safety analysis of initial low-dose gentamicin in S. aureus bacteraemia and native valve endocarditis (Clin Infect Dis 2009;48:713-721)',
        phase: 'Prospective cohort analysis of safety data from a randomised controlled trial',
        sampleSize: 236,
        primaryEndpoint:
          'Renal adverse events and clinically significant decreased creatinine clearance associated with initial low-dose gentamicin',
        endpointMet: false,
        statisticalPValue:
          'Decreased creatinine clearance in 22% of patients receiving any initial low-dose gentamicin against 8% of those not receiving it, p=0.005. Renal adverse events 7% on daptomycin monotherapy, 19% on vancomycin plus gentamicin, 17% on antistaphylococcal penicillin plus gentamicin',
        unreportedAdverseSignals:
          'The authors noted that the benefit of the practice had never been established: they recommended against routine use "given the minimal existing data supporting its benefit". The harm was measured decades after the practice became standard.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'Smyth AR et al., once-daily against multiple-daily intravenous aminoglycosides in cystic fibrosis (Cochrane Database Syst Rev 2017;3:CD002009)',
        phase: 'Cochrane systematic review of randomised controlled trials',
        sampleSize: 328,
        primaryEndpoint:
          'Effectiveness and safety of once-daily against thrice-daily intravenous aminoglycoside dosing for pulmonary exacerbations',
        endpointMet: false,
        statisticalPValue:
          'No significant difference in FEV1 (mean difference 0.33, 95% CI −2.81 to 3.48) or in ototoxicity (relative risk 0.56, 95% CI 0.04 to 7.96). Percentage change in creatinine favoured once-daily dosing in children (−8.20, −15.32 to −1.08) but not adults (3.25, −1.82 to 8.33)',
        unreportedAdverseSignals:
          'Only four of fifteen identified studies could be included; three had high risk of bias from lack of blinding. The included trials reported neither antibiotic resistance patterns nor quality of life, and the ototoxicity confidence interval is wide enough to be uninformative.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Clinically significant decrease in creatinine clearance in 22% of patients given initial low-dose gentamicin against 8% of those not given it, across 236 patients in 44 hospitals (p=0.005)',
        'All-cause fatality unchanged by adding an aminoglycoside to a beta-lactam for sepsis: relative risk 0.90 (95% CI 0.77 to 1.06) across 64 trials and 7,586 patients',
        'Nephrotoxicity relative risk 0.36 (95% CI 0.28 to 0.47) favouring beta-lactam monotherapy in the same meta-analysis',
        'No difference in the rate of development of resistance between monotherapy and combination therapy in that meta-analysis',
      ],
      unsupportedInferences: [
        'That in vitro and animal synergy between an aminoglycoside and a cell-wall agent predicts patient benefit — the basis on which low-dose gentamicin entered staphylococcal treatment, and never established in humans before the harm was measured',
        'That serum concentration monitoring within the labelled range prevents ototoxicity, which the label itself contradicts for MT-RNR1 variant carriers and for late-manifesting toxicity',
        'That adding an aminoglycoside reduces the emergence of resistance, which the meta-analysis measured and did not find',
        'That once-daily dosing is proven less ototoxic, when the best randomised estimate has a confidence interval of 0.04 to 7.96',
      ],
      whatFailedInitially: [
        'Routine addition of low-dose gentamicin to therapy for Staphylococcus aureus bacteraemia and native valve endocarditis, abandoned after the nephrotoxicity was quantified',
        'Combination therapy with a beta-lactam for sepsis, where clinical failure was more common with the combination, not less',
        'The premise that a safe serum level is a safe patient, in the roughly 1 in 500 or fewer who carry the m.1555A>G mitochondrial variant',
        'The label as a description of practice: it still specifies three-times-daily dosing that almost nobody uses',
      ],
      realWorldOutcome: [
        'On the market since 1966, on the WHO Model List of Essential Medicines, and among the cheapest antibacterials available at about 88 United States cents per gram at acquisition',
        'Removed from the endocarditis and sepsis regimens where it was once automatic, on the strength of measured harm rather than measured failure to cure',
        'Retained where nothing cheap substitutes: neonatal sepsis, serious Gram-negative infection, and enterococcal synergy',
        'Carries one of the few pharmacogenomic warnings in the antibacterial class that names a specific variant and admits standard monitoring does not detect the risk',
      ],
    },
    deliverySystem: {
      type: 'Intramuscular injection or intravenous infusion; also formulated as ophthalmic drops, topical preparations and irrigation solutions',
      description:
        'Peak serum concentrations occur 30 to 60 minutes after intramuscular injection and are measurable for six to eight hours; intravenous infusion over two hours produces similar concentrations. Peak concentration is roughly four times the milligram-per-kilogram dose in patients with normal renal function. Protein binding is low, between 0% and 30% depending on method, and little or no metabolic transformation occurs — generally 70% or more of a dose is recoverable in urine within 24 hours. Half-life is inversely related to creatinine clearance. Febrile and anaemic states may shorten the half-life, and in severely burned patients it may be significantly decreased with lower resulting concentrations than the dose would predict.',
      safetyProfile:
        'Boxed warning for nephrotoxicity and for neurotoxicity manifesting as both vestibular and auditory ototoxicity, which is usually irreversible; other neurotoxic manifestations include numbness, tingling, muscle twitching and convulsions. Renal and eighth cranial nerve function must be monitored, with serial audiograms where feasible. Changes may on rare occasions not become manifest until soon after therapy ends. Increased nephrotoxicity has been reported with concomitant cephalosporins. Neuromuscular blockade and respiratory paralysis are a consideration with anaesthetics, neuromuscular blocking agents, or massive citrate-anticoagulated transfusion, and blockade may be reversible with calcium salts. Use with caution in myasthenia gravis and parkinsonism. Aminoglycosides cross the placenta and can cause fetal harm. The injection contains sodium metabisulfite, which may cause allergic-type reactions including anaphylaxis, more often in asthmatic patients.',
    },
    commonQuestions: [
      {
        q: 'Can gentamicin really make you deaf?',
        a: 'Yes, and the label says the damage is usually irreversible. The mechanism is not an accident of chemistry: gentamicin works by binding a specific pocket in bacterial ribosomal RNA, and human mitochondria — which descend from bacteria absorbed by our ancestors’ cells — carry ribosomes with a closely related pocket. The drug accumulates in the sensory hair cells of the inner ear over days and those cells are not replaced. Both balance and hearing can be affected, and unsteadiness is often the first sign rather than deafness. The label directs that dizziness, vertigo, tinnitus, roaring in the ears or hearing loss all require dose adjustment or stopping the drug.',
        auditNote:
          'This is not a rare idiosyncratic reaction bolted onto an otherwise clean drug. It is the same binding event as the therapeutic effect, occurring in the wrong ribosome.',
      },
      {
        q: 'If they measure my levels, does that keep me safe?',
        a: 'It helps and it is not a guarantee, and the label is unusually candid about the gap. It sets targets — peaks not persisting above 12 mcg/mL, troughs below 2 — and then states in the same warning that changes in kidney and eighth-nerve function may on rare occasions not become manifest until soon after the course has finished. Separately, it records that in people carrying certain mitochondrial DNA variants, particularly m.1555A>G, ototoxicity has occurred at serum levels within the recommended range. Monitoring detects excessive exposure. It does not detect cumulative uptake into hair cells, or inherited susceptibility.',
      },
      {
        q: 'Someone in my family went deaf after an antibiotic. Does that matter?',
        a: 'It may matter a great deal, and specifically if that person is on your mother’s side. The variants the label singles out sit in mitochondrial DNA, which is inherited only from the mother — so a maternal grandmother, mother, aunt or sibling who lost hearing after an injected antibiotic points at a family variant you may share. The label instructs that in the case of a known maternal history of aminoglycoside ototoxicity, or a known variant, alternative treatments should be considered unless the risk of permanent hearing loss is outweighed by the severity of infection and the absence of safe alternatives. It is worth saying out loud to whoever is prescribing.',
      },
      {
        q: 'Why do doctors give it once a day when the package says three times?',
        a: 'Because practice moved and the label did not. The reasoning behind once-daily dosing is that aminoglycoside killing depends on how high the peak goes rather than how long the level stays up, while uptake into kidney and hair cells is saturable — so one big dose kills as well and lets tissues clear the drug between doses. That reasoning is sound and the randomised evidence for it is thinner than its universal adoption suggests: the Cochrane review in cystic fibrosis found no difference in lung function, no detectable difference in ototoxicity with a confidence interval running from 0.04 to 7.96, and a kidney benefit in children but not adults. The label still specifies 3 mg/kg/day in three divided doses.',
        auditNote:
          'A practice can be correct and under-evidenced at the same time. The interesting question is why nobody ran the trial that would settle it.',
      },
      {
        q: 'Why is such an old, toxic drug still used at all?',
        a: 'Because it kills fast, it kills Gram-negative organisms that have defeated newer drugs, and it costs under a dollar a gram. Where it has been removed, it has been removed on measured harm rather than measured failure: adding it to a beta-lactam for sepsis left mortality unchanged across 64 trials while tripling kidney injury, and adding it to staphylococcal bacteraemia treatment raised significant kidney impairment from 8% to 22%. Both of those were additions, not the drug’s core use. Where it is genuinely the right choice — neonatal sepsis, serious Gram-negative infection, enterococcal synergy — the alternatives cost twenty to a hundred times more.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Cosgrove SE, Vigliani GA, Fowler VG Jr, et al. Initial low-dose gentamicin for Staphylococcus aureus bacteremia and endocarditis is nephrotoxic. Clin Infect Dis 2009;48:713-721',
        identifier: '10.1086/597031',
        kind: 'doi',
      },
      {
        label:
          'Paul M, Benuri-Silbiger I, Soares-Weiser K, Leibovici L. Beta lactam monotherapy versus beta lactam-aminoglycoside combination therapy for sepsis in immunocompetent patients: systematic review and meta-analysis of randomised trials. BMJ 2004;328:668',
        identifier: '10.1136/bmj.38028.520995.63',
        kind: 'doi',
      },
      {
        label:
          'Smyth AR, Bhatt J, Nevitt SJ. Once-daily versus multiple-daily dosing with intravenous aminoglycosides for cystic fibrosis. Cochrane Database Syst Rev 2017;3:CD002009',
        identifier: '10.1002/14651858.CD002009.pub6',
        kind: 'doi',
      },
      {
        label:
          'Gentamicin sulfate injection, USP — United States prescribing information (Description, Boxed Warnings, Warnings including Risk of Ototoxicity Due to Mitochondrial DNA Variants, Precautions, Clinical Pharmacology, Dosage and Administration)',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=977180b3-a222-4282-d485-4a3217674305',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 3467 — gentamicin canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3467',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 4. Tobramycin — the aminoglycoside that was turned into an inhaler, where it works, and where
  //    the same trial that proved it also measured the resistance it selects.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'tobramycin',
    name: 'Tobramycin',
    tradeName:
      'Nebcin (injection) / TOBI and Bethkis (inhalation solution) / TOBI Podhaler / Tobrex (ophthalmic)',
    sponsor:
      'Eli Lilly (originator of the injectable; tobramycin is produced by Streptomyces tenebrarius). The inhalation solution was developed by PathoGenesis and is now held by Novartis; the drug is generic in most forms',
    targetGene:
      'The bacterial 16S ribosomal RNA gene rrs — the decoding A site of the 30S subunit. The human gene the label names is MT-RNR1, the mitochondrial 12S ribosomal RNA',
    targetProtein:
      'None. The target is RNA: the aminoacyl-tRNA decoding site of the bacterial 30S ribosomal subunit',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1975,
    indication:
      'Injection: serious bacterial infections caused by susceptible strains, including septicaemia in the neonate, child and adult caused by Pseudomonas aeruginosa, Escherichia coli and Klebsiella species, lower respiratory tract infections and serious central nervous system infections. Inhalation solution: management of cystic fibrosis in adults and children 6 years and older with Pseudomonas aeruginosa',
    patientFriendlyIndication:
      'Serious hospital infections when injected; long-term control of Pseudomonas lung infection in cystic fibrosis when inhaled',
    anatomicalSite:
      'The bacterial ribosome. When inhaled, the drug is deposited on the airway surface liquid of the cystic fibrosis lung rather than delivered by the bloodstream',
    conditionContext: {
      conditionExplainer:
        'In cystic fibrosis, thick airway mucus is colonised permanently by Pseudomonas aeruginosa, which forms biofilms that no course of antibiotics eradicates. The realistic goal is not cure but suppression: keeping the bacterial load down so that lung function declines more slowly.',
      whyItMatters:
        'Inhaling an aminoglycoside puts an enormous local concentration onto the airway surface while keeping blood levels low. That is the entire premise of the inhaled product, and it is a genuinely good idea whose limits are documented on its own label.',
      whoTakesThis:
        'People with cystic fibrosis aged 6 and over with Pseudomonas aeruginosa, on repeated 28-day-on, 28-day-off cycles; and separately, hospital patients receiving the injectable form for serious Gram-negative infection.',
      clinicalGoals:
        'For the inhaled product: lung function and hospitalisation, both of which were measured. Not survival, which was not.',
    },
    oneSentenceVerdict:
      'An aminoglycoside repurposed as an inhaler, whose two 520-patient placebo-controlled trials raised FEV1 by about 10% at week 20 against a 2% decline on placebo and cut hospitalisation by 26% — in the same trials in which the proportion of patients carrying Pseudomonas with a tobramycin MIC of 8 mcg/mL or higher rose from 25% to 32% while falling from 20% to 17% on placebo, and whose label states that the relationship between susceptibility testing and clinical outcome is not clear.',
    laymanHowItWorks:
      'Tobramycin jams the machine bacteria use to read their own genetic code, so they build broken proteins and die. Swallowing it does nothing — it is not absorbed from the gut — and injecting it risks the kidneys and hearing. Breathing it in as a mist puts a very high concentration directly onto the surface of the lung where the bacteria live, while keeping the amount reaching the bloodstream low. The bacteria in cystic fibrosis are never eliminated; they are held down, in month-on, month-off cycles, and each cycle works slightly less well than the one before.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 72,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$1.16 per millilitre at United States pharmacy acquisition cost (CMS NADAC, median across 34 listed products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'The injectable has been generic since the 1980s. Tobramycin is not on the WHO Model List of Essential Medicines as a systemic antibacterial — gentamicin holds the aminoglycoside listing, and tobramycin appears there only as a named therapeutic alternative to gentamicin eye drops. The inhalation solution is the commercially significant product: reformulating an old, cheap, off-patent molecule into a preservative-free nebuliser solution at a specific concentration created a new, separately protected product with a price that bears no relationship to the cost of the active ingredient. The dry-powder Podhaler was a further reformulation of the same molecule.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Inhaled tobramycin has real, replicated evidence in cystic fibrosis and much weaker evidence outside it. The honest alternatives split by setting: within cystic fibrosis, other inhaled anti-pseudomonals and, far more importantly, CFTR modulator therapy, which addresses the defect rather than the infection; outside cystic fibrosis, in non-CF bronchiectasis, a randomised trial found a very large fall in bacterial density with no change in lung function and more cough, wheeze and breathlessness. Nothing sold as a food or supplement treats a bacterial infection, and the naturalFoods list on this page is empty for that reason.',
      conventionalRx: [
        {
          name: 'Inhaled aztreonam lysine',
          class: 'Monobactam formulated for nebulisation',
          howItCompares:
            'A different mechanism — cell wall rather than ribosome — so it is not cross-resistant with tobramycin, which matters after years of cycling. It is commonly alternated with tobramycin precisely to reduce the selection pressure that the tobramycin trials measured.',
          typicalCost:
            'Not stated: no verified CMS acquisition price for inhaled aztreonam was held on this record at the time of writing',
          prosAndCons:
            'Pros: no aminoglycoside class toxicity; no cross-resistance. Cons: three times daily; bronchospasm; expensive.',
        },
        {
          name: 'CFTR modulator therapy',
          class: 'Small-molecule corrector and potentiator combinations',
          howItCompares:
            'Not an antibiotic and not a substitute in the usual sense: it acts on the defective chloride channel rather than on the organism. It is on this list because it changes the disease that inhaled tobramycin was developed to manage, and the two 1990s trials that established inhaled tobramycin were conducted in a population that no longer resembles today’s treated cohort.',
          typicalCost:
            'Not stated: no verified CMS acquisition price for CFTR modulators was held on this record at the time of writing',
          prosAndCons:
            'Pros: addresses the underlying defect. Cons: genotype-restricted; very high cost; does not eradicate established Pseudomonas infection.',
        },
        {
          name: 'Intravenous anti-pseudomonal therapy',
          class: 'Beta-lactam with or without an aminoglycoside, given systemically',
          howItCompares:
            'What the inhaled product is measured against indirectly: in the pivotal trials, patients on inhaled tobramycin needed an average of 9.6 days of parenteral antipseudomonal treatment against 14.1 on placebo, and 40% against 53% needed any at all.',
          typicalCost:
            'Not stated: no verified CMS acquisition price for these agents was held on this record at the time of writing',
          prosAndCons:
            'Pros: reaches the whole body, including infection outside the airway. Cons: full systemic aminoglycoside toxicity where an aminoglycoside is used; intravenous access; hospitalisation.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ringing in the ears is the sentinel symptom, even with the inhaler',
          action: 'Report tinnitus at once, and any change in hearing.',
          patientImpact:
            'The label states that transient tinnitus occurred in eight TOBI-treated patients against none on placebo in the clinical studies, and that tinnitus "may be a sentinel symptom of ototoxicity, and therefore the onset of this symptom warrants further clinical investigation". Hearing loss did not occur during the clinical studies but has been reported in postmarketing use.',
          clinicalPrecaution:
            'The inhaled route lowers systemic exposure; it does not abolish it. The label carries the same mitochondrial variant warning as the injectable.',
        },
        {
          name: 'A maternal family history of antibiotic deafness applies to the inhaler too',
          action:
            'Tell the cystic fibrosis team about any hearing loss on your mother’s side that followed an injected antibiotic.',
          patientImpact:
            'The inhaled tobramycin label carries the same MT-RNR1 warning as the injectable: ototoxicity has been observed in carriers of the m.1555A>G variant, in some patients even when aminoglycoside serum levels were within the recommended range, and a known maternal history should prompt consideration of alternatives.',
          clinicalPrecaution:
            'The label states these variants are present in less than 1% of the general United States population and that the proportion of carriers who develop ototoxicity is unknown. This is information for a clinician, not a decision a patient makes alone.',
        },
        {
          name: 'Expect the coughing at the start of a dose',
          action: 'Report wheeze or chest tightness during or after inhaling.',
          patientImpact:
            'Bronchospasm can occur with inhalation. The label notes that in the clinical studies, the change in FEV1 measured after the inhaled dose was similar in the tobramycin and placebo groups — so the average patient did not bronchoconstrict, while individuals can.',
          clinicalPrecaution:
            'The label directs that bronchospasm occurring during use should be treated as medically appropriate. What that treatment is, is a clinical decision this page does not make.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'C1[C@@H]([C@H]([C@@H]([C@H]([C@@H]1N)O[C@@H]2[C@@H]([C@H]([C@@H]([C@H](O2)CO)O)N)O)O)O[C@@H]3[C@@H](C[C@@H]([C@H](O3)CN)O)N)N',
      chemicalFormula: 'C18H37N5O9',
      molecularWeight: '467.50 g/mol',
      targetReceptorAffinity:
        'Tobramycin is a 4,6-disubstituted 2-deoxystreptamine aminoglycoside, differing from kanamycin B by the absence of a 3′-hydroxyl group. That single missing hydroxyl is why it resists the APH(3′) phosphotransferases that inactivate kanamycin, and it is why tobramycin is generally two- to fourfold more potent than gentamicin against Pseudomonas aeruginosa while being weaker against Serratia. Like all aminoglycosides it is polycationic at physiological pH and binds the major groove of helix 44 of 16S ribosomal RNA at the decoding A site, flipping out adenines A1492 and A1493 and destroying translational fidelity. The label states it "acts primarily by disrupting protein synthesis, leading to altered cell membrane permeability, progressive disruption of the cell envelope, and eventual cell death". Practically no serum protein binding occurs, and after parenteral administration the drug is eliminated almost exclusively by glomerular filtration with a serum half-life of about 2 hours in normal individuals.',
      structureSource: {
        label:
          'PubChem CID 36294 (tobramycin) — canonical SMILES, molecular formula and weight, as carried on the enriched record; mechanism, protein binding and elimination from the tobramycin injection and TOBI United States labels',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/36294',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'tob-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Separate tobramycin from its fermentation relatives',
          description:
            'Tobramycin is produced by Streptomyces tenebrarius, which also makes apramycin, kanamycin B and nebramycin factors. Because none of these carries an ultraviolet chromophore, the release assay needs derivatisation or a non-optical detector, and the specified impurities are structurally near-identical aminoglycosides that a microbiological potency assay will happily count as drug.',
          reagentsAndBuffer:
            'Tobramycin reference standard, HPLC with pulsed amperometric detection or 2,4-dinitrofluorobenzene pre-column derivatisation, kanamycin B and nebramycin factor 4 impurity standards, Karl Fischer titration',
        },
        {
          id: 'tob-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Ferment Streptomyces tenebrarius under controlled conditions',
          description:
            'Like gentamicin, tobramycin is grown rather than built. The label names Streptomyces tenebrarius as the producing organism. Fermentation conditions determine the ratio of the nebramycin factors produced, and tobramycin is one factor recovered from that mixture rather than the sole product of the culture.',
          dependsOnStepId: 'tob-w1',
          reagentsAndBuffer:
            'Streptomyces tenebrarius production culture, defined carbon and nitrogen feed, controlled dissolved oxygen and pH, in-process monitoring of nebramycin factor distribution',
        },
        {
          id: 'tob-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Ion exchange, then two very different finished forms',
          description:
            'The polycationic drug is recovered on cation-exchange resin. From there the paths diverge sharply: the injectable becomes a sulfate salt in solution, while the inhalation product is a preservative-free, pH- and osmolality-adjusted solution at a specific concentration designed for a specific nebuliser. That formulation work, not the molecule, is what made the inhaled product a new drug.',
          dependsOnStepId: 'tob-w2',
          reagentsAndBuffer:
            'Weak cation-exchange resin, ammonium hydroxide eluent, sulfuric acid for the injectable salt, quarter-normal saline with adjusted pH and osmolality for the inhalation solution, endotoxin and sterility release testing',
        },
        {
          id: 'tob-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure what the nebuliser actually delivers to the airway',
          description:
            'The clinical result belongs to a drug-device pair, not to a molecule. The pivotal trials used a specific hand-held nebuliser and compressor, and the label names them. Particle size distribution determines whether the dose lands in the large airways or reaches the small ones, so a different nebuliser is a different exposure even at an identical labelled dose.',
          dependsOnStepId: 'tob-w3',
          reagentsAndBuffer:
            'Cascade impactor or laser diffraction for aerodynamic particle size distribution, breathing simulator at defined tidal volume, the reference nebuliser and compressor pairing used in the registration trials, gravimetric and HPLC assay of delivered dose',
        },
        {
          id: 'tob-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Track the MIC distribution across cycles, not just the mean',
          description:
            'The pivotal trials reported the proportion of patients whose Pseudomonas isolates had a tobramycin MIC of 8 mcg/mL or higher rising from 25% to 32% over 24 weeks. A mean MIC would have hidden that. The assay that captures the real question is a population distribution across successive on-off cycles, alongside sputum drug concentration, because inhaled dosing produces airway concentrations far above any systemic breakpoint.',
          dependsOnStepId: 'tob-w4',
          reagentsAndBuffer:
            'Serial sputum isolates across treatment cycles, broth microdilution MIC panels in cation-adjusted Mueller-Hinton, sputum tobramycin quantification by immunoassay or LC-MS/MS, population analysis profiling for heteroresistance',
        },
      ],
    },
    keyAudits: [
      {
        id: 'tob-a1',
        category: 'measured',
        title: 'Two identical trials, 520 patients, and a real change in lung function',
        laymanSummary:
          'Two matched placebo-controlled trials in 520 people with cystic fibrosis found that inhaling tobramycin in month-on, month-off cycles raised lung function by about 10% at week 20 while placebo patients declined by 2%, and cut the chance of hospital admission by about a quarter.',
        technicalDetails:
          'Ramsey and colleagues ran two multicentre, double-blind, placebo-controlled trials of 300 mg inhaled tobramycin twice daily for 28 days followed by 28 days off, for three cycles over 24 weeks, in 520 patients with cystic fibrosis and Pseudomonas aeruginosa (mean age 21). Patients on tobramycin had an average increase in FEV1 of 10% at week 20 relative to week 0, against a 2% decline on placebo (p<0.001). Sputum Pseudomonas density fell by an average 0.8 log10 colony-forming units per gram against a rise of 0.3 log10 on placebo (p<0.001). Patients on tobramycin were 26% less likely to be hospitalised (95% CI 2% to 43%). No detectable ototoxic or nephrotoxic effects and no serum accumulation were observed. The label’s own account of the same programme adds the granularity: Study 1 showed about an 11% average relative increase in FEV1 percent predicted against no average change on placebo, and Study 2 about 7% against a 1% decline; hospitalisation averaged 5.1 days against 8.1; parenteral antipseudomonal treatment averaged 9.6 days against 14.1; and 40% of tobramycin patients against 53% of placebo patients required any parenteral antipseudomonal antibacterial over six months. This is a genuine, replicated, placebo-controlled result on a functional endpoint, and it is what the drug rests on.',
        evidenceSource:
          'Ramsey BW, Pepe MS, Quan JM, et al. Intermittent administration of inhaled tobramycin in patients with cystic fibrosis. N Engl J Med 1999;340:23-30; TOBI United States prescribing information, section 14',
        doi: '10.1056/NEJM199901073400104',
        measuredMetric:
          'Change in FEV1 percent predicted at week 20, sputum Pseudomonas density, and risk of hospitalisation, across two matched trials in 520 patients',
        auditFlag: 'verified',
      },
      {
        id: 'tob-a2',
        category: 'failed',
        title: 'The trial that proved it also measured the resistance it selects',
        laymanSummary:
          'In the same two trials, the proportion of patients whose Pseudomonas needed a high concentration of tobramycin to be inhibited rose from 25% to 32% over six months in the treated group, while it fell from 20% to 17% on placebo. And each successive treatment cycle knocked back the bacteria less than the one before.',
        technicalDetails:
          'The published trial reports that the proportion of patients with Pseudomonas aeruginosa isolates for which the minimum inhibitory concentration of tobramycin was 8 mcg/mL or higher increased from 25% at week 0 to 32% at week 24 in the tobramycin group, compared with a decrease from 20% to 17% in the placebo group. The label adds a second decay signal from the same programme: "Sputum bacterial density returned to baseline during the off-drug periods" and "Reductions in sputum bacterial density were smaller in each successive cycle." These are not adverse events buried in a supplementary appendix — they are in the primary report and on the label, and they describe the central limitation of chronic suppressive therapy: the intervention selects for the organisms it does not kill, and the effect it produces shrinks with repetition. The 24-week trials cannot show where that curve ends, and patients take this drug for decades.',
        evidenceSource:
          'Ramsey BW et al., N Engl J Med 1999;340:23-30; TOBI United States prescribing information, section 14',
        doi: '10.1056/NEJM199901073400104',
        measuredMetric:
          'Proportion of patients with Pseudomonas MIC ≥8 mcg/mL at week 0 against week 24 (25% to 32% on tobramycin, 20% to 17% on placebo), and reduction in sputum density by cycle',
        auditFlag: 'caution',
      },
      {
        id: 'tob-a3',
        category: 'inferred',
        title: 'The label says susceptibility testing may not predict the outcome',
        laymanSummary:
          'Inhaling the drug produces concentrations in the lung far above anything a blood test is calibrated for. So a laboratory report calling the organism resistant may not mean the treatment will fail — and the label says outright that the relationship is unclear.',
        technicalDetails:
          'The TOBI label states: "The relationship between in vitro susceptibility test results and clinical outcome with TOBI therapy is not clear." It then records that four TOBI patients who began the clinical studies with Pseudomonas isolates above the systemic breakpoint nonetheless responded. The reason is arithmetic: nebulised delivery produces sputum concentrations of tobramycin orders of magnitude higher than achievable serum concentrations, and susceptibility breakpoints are defined against achievable serum concentrations. This cuts both ways, and both directions are unproven. An organism reported resistant may still be suppressed. An organism reported susceptible may sit in a biofilm the drug never penetrates at any concentration. The honest position is the one the label takes: the test that clinicians rely on has not been shown to predict what this route does.',
        evidenceSource:
          'TOBI (tobramycin) inhalation solution United States prescribing information, section 14',
        inferredClaim:
          'That a Pseudomonas susceptibility report predicts response to inhaled tobramycin — an inference the label explicitly declines to make in either direction',
        auditFlag: 'contested',
      },
      {
        id: 'tob-a4',
        category: 'failed',
        title: 'Outside cystic fibrosis, the bacteria fell and the lungs did not improve',
        laymanSummary:
          'A randomised trial gave inhaled tobramycin to 74 people with bronchiectasis who were not cystic fibrosis patients. Bacterial counts collapsed and a third had the organism eradicated — and lung function was no different from placebo, while more patients coughed, wheezed and became breathless.',
        technicalDetails:
          'Barker and colleagues randomised 74 patients with bronchiectasis and Pseudomonas aeruginosa to inhaled tobramycin solution (n=37) or placebo (n=37) twice daily for four weeks, followed by two weeks off. At week 4 the treated group had a mean decrease in Pseudomonas density of 4.54 log10 colony-forming units per gram of sputum against no change on placebo (p<0.01), and at week 6 the organism had been eradicated in 35% of treated patients while being detected in every placebo patient. Investigators rated 62% of treated patients as showing an improved medical condition against 38% on placebo (odds ratio 2.7, 95% CI 1.1 to 6.9). But the mean percent change in FEV1 percent predicted from week 0 to week 4 was similar in the two groups (p=0.41). More treated patients reported increased cough, dyspnoea, wheezing and non-cardiac chest pain. Tobramycin-resistant strains developed in 11% of treated patients against 3% on placebo (p=0.36). This is the cleanest available demonstration that killing the organism and helping the patient are separate measurements: a four-and-a-half-log kill produced no measurable change in lung function.',
        evidenceSource:
          'Barker AF, Couch L, Fiel SB, et al. Tobramycin solution for inhalation reduces sputum Pseudomonas aeruginosa density in bronchiectasis. Am J Respir Crit Care Med 2000;162:481-485',
        doi: '10.1164/ajrccm.162.2.9910086',
        measuredMetric:
          'Sputum Pseudomonas density and FEV1 percent predicted at four weeks in 74 randomised patients with non-cystic-fibrosis bronchiectasis',
        auditFlag: 'caution',
      },
      {
        id: 'tob-a5',
        category: 'inferred',
        title: 'Inhaled does not mean systemically absent',
        laymanSummary:
          'The argument for the inhaler is that almost none of the drug reaches the bloodstream, so the class toxicity does not apply. Hearing loss was not detected in the trials — and has been reported since the drug went on the market, and the mitochondrial warning applies to the inhaled form too.',
        technicalDetails:
          'The label’s ototoxicity section reads: transient tinnitus occurred in eight TOBI-treated patients against none on placebo in the clinical studies; "Ototoxicity, as measured by complaints of hearing loss or by audiometric evaluations, did not occur with TOBI therapy during clinical studies, however in postmarketing experience, patients receiving TOBI have reported hearing loss." It carries the same Risk of Ototoxicity Due to Mitochondrial DNA Variants warning as the injectable, including that ototoxicity has occurred in variant carriers even when serum levels were within the recommended range. Nephrotoxicity is listed as an aminoglycoside class effect with the direction to consider discontinuation if it develops, and neuromuscular blockade is listed because aminoglycosides may aggravate muscle weakness through a curare-like effect. The 24-week registration trials were the wrong instrument for detecting slowly cumulative cochlear damage in patients who will inhale the drug in alternating months for thirty years, and the postmarketing sentence is the label conceding it.',
        evidenceSource:
          'TOBI (tobramycin) inhalation solution United States prescribing information, sections 5.1 to 5.5',
        inferredClaim:
          'That the inhaled route eliminates aminoglycoside ototoxicity and nephrotoxicity — an inference supported by the trials’ negative findings and contradicted by the label’s own postmarketing sentence and its mitochondrial warning',
        auditFlag: 'caution',
      },
      {
        id: 'tob-a6',
        category: 'failed',
        title: 'The sickest patients were excluded from the evidence',
        laymanSummary:
          'The trials enrolled only people whose lung function was between a quarter and three-quarters of predicted. Those below a quarter — the most severely affected — were left out, and the label states that safety and efficacy have not been demonstrated in them.',
        technicalDetails:
          'The label’s indication carries an explicit limitation: safety and efficacy have not been demonstrated in patients under the age of 6 years, in patients with FEV1 below 25% or above 75% predicted, or in patients colonised with Burkholderia cepacia. The Clinical Studies section confirms the enrolment criteria: all subjects had baseline FEV1 percent predicted between 25% and 75%, and those under 6, with a baseline creatinine above 2 mg/dL, or with Burkholderia cepacia in sputum were excluded. The result is a well-recognised inversion: the patients with the most to gain from suppressing Pseudomonas — the most severely obstructed, and those carrying the organism most associated with rapid decline — are the ones the evidence does not cover. The drug is used in them anyway, which is a clinical judgement rather than a licensed claim, and the label says which is which.',
        evidenceSource:
          'TOBI (tobramycin) inhalation solution United States prescribing information, sections 1 and 14',
        measuredMetric:
          'Enrolment criteria of the two pivotal trials against the population in which the drug is used',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A mist instead of a drip',
        laymanDesc:
          'The same molecule that is normally injected is nebulised into a fine mist, so it lands directly on the surface of the lung instead of travelling there through the blood.',
        molecularDetail:
          'Tobramycin is poorly absorbed from the gastrointestinal tract and, when nebulised, poorly absorbed across the airway epithelium — which is the point. The registration trials used a specific hand-held nebuliser and compressor pairing, named on the label, because the delivered particle size distribution is part of the intervention.',
        iconName: 'Wind',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It forces its own entry into the bacterium',
        laymanDesc:
          'The drug carries a strong positive charge and the outside of Pseudomonas is strongly negative. It sticks, breaks the membrane packing, and gets in.',
        molecularDetail:
          'Polycationic binding to lipopolysaccharide displaces the divalent cation bridges cross-linking adjacent LPS molecules, allowing self-promoted uptake. Crossing the inner membrane requires an electrochemical gradient, so aminoglycosides are inactive against anaerobes and in acidic environments.',
        iconName: 'DoorOpen',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It jams the proofreading step',
        laymanDesc:
          'Inside, it clamps onto the part of the bacterial protein factory that checks the right building block has arrived.',
        molecularDetail:
          'Binding in the major groove of helix 44 of 16S ribosomal RNA at the decoding A site flips adenines A1492 and A1493 out of the helix, the conformation that normally signals a correct codon-anticodon pair, and near-cognate tRNAs are accepted.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Broken proteins wreck the envelope',
        laymanDesc:
          'The garbled proteins the cell now builds cannot fold properly in its membrane, so the envelope leaks — and lets in still more drug.',
        molecularDetail:
          'The label describes the sequence directly: disruption of protein synthesis, leading to altered cell membrane permeability, progressive disruption of the cell envelope, and eventual cell death. The permeability step is what makes the killing self-amplifying and concentration-dependent.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Lung function rises, hospital days fall',
        laymanDesc:
          'Across two matched trials in 520 patients, FEV1 rose about 10% at week 20 against a 2% decline on placebo, and hospitalisation fell by about a quarter.',
        molecularDetail:
          'Ramsey et al., NEJM 1999: FEV1 +10% against −2% (p<0.001); sputum Pseudomonas density −0.8 log10 CFU/g against +0.3 log10 (p<0.001); 26% less likely to be hospitalised (95% CI 2% to 43%). Label: hospitalisation 5.1 days against 8.1; parenteral antipseudomonal treatment 9.6 days against 14.1.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And each cycle works a little less well',
        laymanDesc:
          'The bacteria come back between courses, and each successive course knocks them down less. The proportion of patients carrying harder-to-kill Pseudomonas rose during treatment and fell on placebo.',
        molecularDetail:
          'Label: sputum bacterial density returned to baseline during off-drug periods, and reductions were smaller in each successive cycle. Trial: proportion of patients with isolates at MIC ≥8 mcg/mL rose 25% to 32% on tobramycin over 24 weeks and fell 20% to 17% on placebo.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'Ramsey BW et al., two matched trials of intermittent inhaled tobramycin in cystic fibrosis (N Engl J Med 1999;340:23-30)',
        phase:
          'Phase 3, two identically designed multicentre, double-blind, placebo-controlled trials',
        sampleSize: 520,
        primaryEndpoint:
          'Change in FEV1 percent predicted at week 20, with sputum Pseudomonas aeruginosa density and hospitalisation as co-endpoints, over three 28-day-on/28-day-off cycles',
        endpointMet: true,
        statisticalPValue:
          'FEV1 +10% at week 20 against −2% on placebo (p<0.001); sputum Pseudomonas density −0.8 log10 CFU/g against +0.3 log10 (p<0.001); 26% less likely to be hospitalised (95% CI 2% to 43%)',
        unreportedAdverseSignals:
          'The proportion of patients with Pseudomonas isolates at a tobramycin MIC of 8 mcg/mL or higher rose from 25% to 32% in the tobramycin group over 24 weeks while falling from 20% to 17% on placebo. Reductions in sputum bacterial density were smaller in each successive cycle, and density returned to baseline during off-drug periods. Patients with FEV1 below 25% or above 75% predicted, under 6 years old, or colonised with Burkholderia cepacia were excluded.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'Barker AF et al., inhaled tobramycin in non-cystic-fibrosis bronchiectasis (Am J Respir Crit Care Med 2000;162:481-485)',
        phase: 'Randomised, double-blind, placebo-controlled trial',
        sampleSize: 74,
        primaryEndpoint:
          'Microbiological efficacy — sputum Pseudomonas aeruginosa density at four weeks — with FEV1 and safety as secondary measures',
        endpointMet: true,
        statisticalPValue:
          'Mean decrease in Pseudomonas density 4.54 log10 CFU/g against no change on placebo (p<0.01); eradication in 35% at week 6 against 0%; investigator-rated improvement 62% against 38% (odds ratio 2.7, 95% CI 1.1 to 6.9)',
        unreportedAdverseSignals:
          'The mean percent change in FEV1 percent predicted from week 0 to week 4 was similar in both groups (p=0.41) — a four-and-a-half-log bacterial kill with no measurable change in lung function. More treated patients reported increased cough, dyspnoea, wheezing and non-cardiac chest pain, and tobramycin-resistant strains developed in 11% against 3% (p=0.36).',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'FEV1 +10% at week 20 against −2% on placebo across two matched trials in 520 cystic fibrosis patients (p<0.001)',
        'Sputum Pseudomonas density −0.8 log10 CFU/g against +0.3 log10 on placebo (p<0.001), and 26% lower risk of hospitalisation (95% CI 2% to 43%)',
        'Proportion of patients with Pseudomonas at MIC ≥8 mcg/mL rising from 25% to 32% on tobramycin over 24 weeks while falling from 20% to 17% on placebo',
        'In non-cystic-fibrosis bronchiectasis, a 4.54 log10 CFU/g fall in Pseudomonas density with no significant change in FEV1 (p=0.41)',
      ],
      unsupportedInferences: [
        'That a susceptibility report predicts response to the inhaled route — the label states the relationship between in vitro testing and clinical outcome is not clear',
        'That the inhaled route eliminates aminoglycoside ototoxicity, when the label records postmarketing hearing loss and carries the same mitochondrial variant warning as the injectable',
        'That reducing bacterial density improves lung function, which the bronchiectasis trial measured directly and did not find',
        'That a 24-week result describes a therapy taken in alternating months for decades, when the label itself records that each successive cycle achieved less',
      ],
      whatFailedInitially: [
        'Lung function in non-cystic-fibrosis bronchiectasis, unchanged despite a four-and-a-half-log fall in bacterial density, with more cough, wheeze and breathlessness',
        'Durability: sputum bacterial density returned to baseline during every off-drug period and reductions shrank with each cycle',
        'Resistance containment: the proportion of patients carrying less susceptible Pseudomonas rose during treatment and fell on placebo',
        'Coverage of the sickest patients: FEV1 below 25% predicted, age under 6, and Burkholderia cepacia colonisation were all excluded and remain outside the licensed claim',
      ],
      realWorldOutcome: [
        'Approved as an injectable in 1975 and generic since the 1980s, and not on the WHO Model List of Essential Medicines as a systemic antibacterial — gentamicin holds the aminoglycoside listing',
        'Reformulated as a preservative-free nebuliser solution and later a dry powder, creating new protected products from a molecule whose patent had long expired',
        'Standard chronic suppressive therapy in cystic fibrosis, given in alternating months, usually rotated with an inhaled drug of a different class to slow the resistance the trials measured',
        'Used outside the licensed population — below 25% predicted FEV1, and in non-cystic-fibrosis bronchiectasis — on clinical judgement rather than on the evidence the label describes',
      ],
    },
    deliverySystem: {
      type: 'Nebulised inhalation solution, dry-powder inhaler, intravenous and intramuscular injection, and ophthalmic drops',
      description:
        'The inhaled product is delivered by a specific hand-held nebuliser and compressor pairing named on the label, in 28-day-on, 28-day-off cycles. Parenterally, peak serum concentrations occur 30 to 90 minutes after intramuscular administration, reaching about 4 mcg/mL after 1 mg/kg, with therapeutic levels generally considered 4 to 6 mcg/mL. Tobramycin is poorly absorbed from the gastrointestinal tract, undergoes practically no serum protein binding and little metabolic transformation, and is eliminated almost exclusively by glomerular filtration with a serum half-life of about 2 hours in normal individuals — rising sharply as creatinine clearance falls.',
      safetyProfile:
        'The injectable carries a boxed warning: auditory and vestibular ototoxicity, with auditory changes that are irreversible and usually bilateral, and nephrotoxicity, with risk rising with exposure to high peak or high trough concentrations. Patients who develop cochlear damage may have no warning symptoms during therapy, and irreversible bilateral deafness may continue to develop after the drug has stopped. Prolonged levels above 12 mcg/mL and rising troughs above 2 mcg/mL should be avoided. The inhaled product’s warnings are bronchospasm, ototoxicity, nephrotoxicity, neuromuscular blockade and embryo-fetal toxicity, and it carries the same MT-RNR1 mitochondrial variant warning. Both forms contain the class caution that aminoglycosides may aggravate muscle weakness through a curare-like effect at the neuromuscular junction. The injectable contains sodium metabisulfite, which may provoke allergic-type reactions including anaphylaxis.',
    },
    commonQuestions: [
      {
        q: 'Does inhaling it avoid the hearing damage that injected aminoglycosides cause?',
        a: 'It reduces the risk, and the label does not claim it removes it. In the clinical studies, ototoxicity measured by hearing complaints or audiometry did not occur — but transient tinnitus occurred in eight treated patients against none on placebo, and the label states plainly that in postmarketing experience patients receiving the inhaled product have reported hearing loss. It also carries the same warning as the injectable about mitochondrial DNA variants, where hearing loss has occurred even at serum levels inside the recommended range. Twenty-four-week trials are the wrong instrument for detecting slowly cumulative cochlear damage in someone who will inhale the drug in alternating months for decades.',
        auditNote:
          'A negative finding in a 24-week trial is a statement about that trial’s power, not a statement about the drug.',
      },
      {
        q: 'Why is it given a month on and a month off?',
        a: 'Because that is how it was tested, and because continuous exposure would select resistance faster. The pivotal trials used three cycles of 28 days on and 28 days off over 24 weeks, and every result the drug is licensed on comes from that schedule. The label also records what happens in between: sputum bacterial density returned to baseline during the off-drug periods, and reductions in bacterial density were smaller in each successive cycle. So the cycling is not a cure schedule; it is a suppression schedule with a documented decay.',
      },
      {
        q: 'My laboratory report says the Pseudomonas is resistant. Should the inhaler be stopped?',
        a: 'That is exactly the question the label declines to answer. It states that the relationship between in vitro susceptibility test results and clinical outcome with inhaled tobramycin is not clear, and notes that four patients whose isolates were above the systemic breakpoint at the start of the trials nonetheless responded. The reason is that nebulising the drug produces airway concentrations enormously higher than anything reachable in blood, while susceptibility breakpoints are calibrated against blood levels. It also runs the other way: an organism reported susceptible may sit in a biofilm the drug never reaches. This is a decision for the treating team, and the honest starting point is that the usual test was not validated for this route.',
      },
      {
        q: 'I have bronchiectasis but not cystic fibrosis. Will this help me?',
        a: 'The one randomised trial in that population is sobering. Seventy-four patients with bronchiectasis and Pseudomonas were randomised to inhaled tobramycin or placebo for four weeks. Bacterial density fell by 4.54 log10 — a colossal kill — and the organism was eradicated in 35% by week 6 while every placebo patient still carried it. Lung function was no different between the groups (p=0.41). More treated patients reported increased cough, breathlessness, wheezing and chest pain. Investigators rated more of them as improved overall, which is a softer endpoint than a spirometer. It is the clearest available illustration that killing the bacteria and helping the patient are two different measurements.',
      },
      {
        q: 'Why does the inhaled version cost so much when tobramycin itself is ancient and cheap?',
        a: 'Because what was developed and protected was the formulation and the delivery, not the molecule. Tobramycin has been off patent since the 1980s and the injectable costs very little. Turning it into a preservative-free, pH- and osmolality-adjusted solution at a specific concentration, matched to a specific nebuliser that produces a specific particle size, and then proving that combination in two 260-patient trials, produced a new product with new protection. The later dry-powder version repeated the exercise. The active ingredient is the cheap part.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Ramsey BW, Pepe MS, Quan JM, et al. Intermittent administration of inhaled tobramycin in patients with cystic fibrosis. Cystic Fibrosis Inhaled Tobramycin Study Group. N Engl J Med 1999;340:23-30',
        identifier: '10.1056/NEJM199901073400104',
        kind: 'doi',
      },
      {
        label:
          'Barker AF, Couch L, Fiel SB, et al. Tobramycin solution for inhalation reduces sputum Pseudomonas aeruginosa density in bronchiectasis. Am J Respir Crit Care Med 2000;162:481-485',
        identifier: '10.1164/ajrccm.162.2.9910086',
        kind: 'doi',
      },
      {
        label:
          'TOBI (tobramycin) inhalation solution — United States prescribing information (Indications 1, Warnings and Precautions 5.1 to 5.5, Clinical Studies 14, Mechanism of Action 12.1 and Microbiology 12.4)',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=3d044738-a715-fdee-7849-521e8981e6ec',
        kind: 'regulatory',
      },
      {
        label:
          'Tobramycin injection — United States prescribing information (Boxed Warning, Warnings including Risk of Ototoxicity Due to Mitochondrial DNA Variants, Clinical Pharmacology)',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=c4751a4f-c9c1-60c5-e053-2995a90aeba9',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 36294 — tobramycin canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/36294',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 5. Rifampin — the drug that made six-month tuberculosis treatment possible, given at a dose
  //    nobody optimised, and added to two other infections where the trials found little.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'rifampin',
    name: 'Rifampin',
    tradeName: 'Rifadin / Rimactane / Rifadin IV',
    sponsor:
      'Rifampicin was semi-synthesised in the mid-1960s at the Lepetit research laboratories in Milan from rifamycin B, a fermentation product of the soil actinomycete originally described as Streptomyces mediterranei and now classified in the genus Amycolatopsis. The United States application holder on this record is Sanofi-Aventis; the drug is generic and made worldwide',
    targetGene:
      'rpoB, the gene encoding the beta subunit of bacterial DNA-dependent RNA polymerase. Essentially all clinical resistance is point mutation within an 81-base-pair rifampicin resistance-determining region of that gene',
    targetProtein:
      'The beta subunit of bacterial DNA-dependent RNA polymerase. The mammalian enzyme is not inhibited',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1971,
    indication:
      'All forms of tuberculosis, in combination with other antituberculosis agents; and treatment of asymptomatic carriers of Neisseria meningitidis to eliminate meningococci from the nasopharynx. Explicitly not indicated for the treatment of meningococcal disease itself',
    patientFriendlyIndication:
      'Tuberculosis, always alongside other drugs; and clearing meningococcus from the throats of carriers',
    anatomicalSite:
      'Inside the bacterium, at the RNA polymerase. In tuberculosis that means inside macrophages and inside cavity walls, which is why penetration matters as much as potency',
    conditionContext: {
      conditionExplainer:
        'Tuberculosis is slow. The organism divides perhaps once a day at best and much of the population is barely dividing at all, sitting in acidic pockets and in the walls of cavities. Killing the actively growing bacilli takes weeks; killing the dormant ones — sterilising — is what determines whether the disease comes back, and that is what treatment length is really about.',
      whyItMatters:
        'Rifampin is the sterilising drug. Before it, tuberculosis treatment ran to eighteen months or two years. With it, and with pyrazinamide, six months became possible. Almost everything else about tuberculosis chemotherapy is arranged around protecting this one molecule from resistance.',
      whoTakesThis:
        'Anyone treated for active tuberculosis, in combination; people treated for latent tuberculosis on a four-month rifampin regimen; contacts of meningococcal disease; and, off the tuberculosis label, patients with staphylococcal infection of prosthetic material.',
      clinicalGoals:
        'Cure without relapse. Uniquely among the drugs on this page, tuberculosis treatment is measured in relapse rates years after the last tablet, not in symptom resolution at two weeks.',
    },
    oneSentenceVerdict:
      'The drug that shortened tuberculosis treatment from eighteen months to six, still given at the 10 mg/kg dose chosen in the 1960s even though 35 mg/kg cut median time to culture conversion from 62 days to 48 in a randomised trial, and whose two most enthusiastic off-label additions have diverged sharply on measurement — 100% cure against 58% in 24 evaluable patients with infected orthopaedic implants, and no benefit at all across 758 patients with Staphylococcus aureus bacteraemia.',
    laymanHowItWorks:
      'Every cell has to copy its genes into RNA before it can build anything. Rifampin plugs the channel of the bacterial machine that does that copying, so the RNA strand cannot grow past a few letters. Human cells use a different machine, which the drug does not touch. What makes it special in tuberculosis is that it kills bacteria that are barely alive — the dormant ones sitting in scar tissue that other drugs cannot reach — and those are the ones that cause relapse. The same molecule also switches on the liver’s drug-destroying enzymes so aggressively that it lowers the levels of most other medicines a person is taking.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 76,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.6802 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 14 listed products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Reached the market in the late 1960s and the United States in 1971; long generic and on the WHO Model List of Essential Medicines. It is a semi-synthetic derivative of a fermentation product, which is why it is more expensive than isoniazid or ethambutol despite comparable age. The dose question is partly an economic one: the 10 mg/kg standard dates from an era when the drug was costly, and the randomised evidence that 35 mg/kg sterilises faster arrived roughly fifty years later.',
      synthesisComplexity: 'High',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'In tuberculosis rifampin has no substitute in the ordinary sense — losing it converts a six-month cure into a much longer and more toxic regimen, which is what multidrug-resistant tuberculosis means. What it does have is successors within its own family: rifapentine, with a longer half-life and higher exposure, has now replaced it in both a four-month active-disease regimen and the short latent-infection regimens. Outside tuberculosis the picture is different, and the two headline additions point in opposite directions. Nothing sold as a food or supplement treats a bacterial infection, and the naturalFoods list on this page is empty for that reason.',
      conventionalRx: [
        {
          name: 'Rifapentine',
          class: 'Rifamycin with a longer half-life',
          howItCompares:
            'The same target and the same resistance gene, with pharmacokinetics that permit less frequent dosing and higher exposure. Substituting rifapentine for rifampin and moxifloxacin for ethambutol produced a four-month regimen non-inferior to the standard six-month regimen in 2,516 randomised participants — the first successful shortening of drug-susceptible tuberculosis treatment in about forty years.',
          typicalCost:
            'Not stated: no verified CMS acquisition price for rifapentine was held on this record at the time of writing',
          prosAndCons:
            'Pros: enables four-month active treatment and short-course latent treatment. Cons: same CYP induction problem, same class resistance, and the four-month result required moxifloxacin as well — rifapentine substituted alone was not shown to be non-inferior.',
        },
        {
          name: 'Isoniazid, nine months, for latent tuberculosis',
          class: 'The regimen four months of rifampin was tested against',
          howItCompares:
            'In 6,859 adults with latent tuberculosis, four months of rifampin was non-inferior to nine months of isoniazid for preventing active disease, with a treatment-completion rate 15.1 percentage points higher (95% CI 12.7 to 17.4) and grade 3 to 5 hepatotoxic events 1.2 percentage points lower (95% CI 0.7 to 1.7).',
          typicalCost:
            'US$3.49 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 12 listed products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros of isoniazid: no drug interactions of consequence; the longest track record. Cons: more than twice the duration, worse completion, and more liver injury.',
        },
        {
          name: 'Standard therapy alone for Staphylococcus aureus bacteraemia',
          class: 'Flucloxacillin or vancomycin without adjunctive rifampicin',
          howItCompares:
            'The direct randomised comparison found no overall benefit from adding rifampicin. Bacteriological failure, recurrence or death by 12 weeks occurred in 62 of 370 (16.8%) with rifampicin against 71 of 388 (18.3%) with placebo — hazard ratio 0.96 (95% CI 0.68 to 1.35), p=0.81 — while drug-modifying adverse events rose from 10.1% to 17.0% and drug interactions from 1.5% to 6.5%.',
          typicalCost:
            'Not stated: no verified CMS acquisition price for these agents was held on this record at the time of writing',
          prosAndCons:
            'Pros: avoids the interaction burden entirely. Cons: the trial did find fewer bacteriological recurrences with rifampicin, 3 against 16 (p=0.01), which is a real secondary signal in a trial whose primary endpoint was flat.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Bring the full list of everything you take, including the pill',
          action:
            'List every prescription, over-the-counter medicine and supplement, and specifically raise hormonal contraception.',
          patientImpact:
            'Rifampin induces CYP1A2, 2B6, 2C8, 2C9, 2C19 and 3A4, the UDP-glucuronyltransferases, sulfotransferases, carboxylesterases and the transporters P-glycoprotein and MRP2 — so it can reduce the effectiveness of a very large fraction of all medicines. The label’s own interaction table records falls in exposure such as 72% for atazanavir, 82% for fosamprenavir and 84% for lenacapavir.',
          clinicalPrecaution:
            'The label directs that concomitant drug dosages be adjusted according to approved labelling and, where applicable, therapeutic monitoring. Which drug is affected and what to do about it is a prescribing decision this page does not make.',
        },
        {
          name: 'Orange is expected; yellow eyes are not',
          action:
            'Expect urine, sweat, tears and saliva to turn reddish-orange. Report yellowing of the eyes or skin, dark urine, persistent nausea or right-sided abdominal pain.',
          patientImpact:
            'The discolouration is harmless and permanently stains soft contact lenses. Hepatotoxicity is the reaction that matters: the label describes a range from asymptomatic enzyme elevation through symptomatic hepatitis to fulminant liver failure and death, with severe outcomes concentrated in people with existing liver disease or taking other hepatotoxic drugs.',
          clinicalPrecaution:
            'The label directs monitoring for symptoms and signs of liver injury, especially where treatment is prolonged or combined with other hepatotoxic drugs, and states that rifampin should be discontinued if signs of hepatic damage occur or worsen.',
        },
        {
          name: 'Do not take it in stops and starts',
          action: 'Report any interruption in treatment rather than simply resuming.',
          patientImpact:
            'The label warns that systemic hypersensitivity reactions have been reported and that intermittent or interrupted dosing is associated with them; separately, it notes that rifampin may cause vitamin K-dependent coagulation disorders and bleeding, and directs monitoring of coagulation tests.',
          clinicalPrecaution:
            'Resistance is the other reason. The label states that the small number of resistant cells present within large populations of susceptible cells can rapidly become the predominant type, which is what makes rifampin uniquely unforgiving of irregular treatment.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'C[C@H]1/C=C/C=C(\\C(=O)NC2=C(C(=C3C(=C2O)C(=C(C4=C3C(=O)[C@](O4)(O/C=C/[C@@H]([C@H]([C@H]([C@@H]([C@@H]([C@@H]([C@H]1O)C)O)C)OC(=O)C)C)OC)C)C)O)O)/C=N/N5CCN(CC5)C)/C',
      chemicalFormula: 'C43H58N4O12',
      molecularWeight: '822.90 g/mol',
      targetReceptorAffinity:
        'Rifampin is an ansamycin: a naphthoquinone core bridged by a long aliphatic ansa chain, giving a rigid basket-shaped molecule. It binds a pocket in the beta subunit of bacterial DNA-dependent RNA polymerase about 12 angstroms from the active site, inside the RNA exit channel, and physically blocks the growing transcript once it reaches two or three nucleotides. The mechanism is steric obstruction rather than active-site inhibition, which is why single amino acid substitutions lining that pocket — the 81-base-pair rifampicin resistance-determining region of rpoB — confer high-level resistance in one step. The label states that rifampin "interacts with bacterial RNA polymerase but does not inhibit the mammalian enzyme". It is about 80% protein bound, and most of the unbound fraction is un-ionised and diffuses freely into tissues, which is the basis of its unusual penetration into cerebrospinal fluid, caseum and biofilm. Absorption is reduced by about 30% when taken with food; the mean serum half-life after a 600 mg oral dose is 3.35 ± 0.66 hours and falls to about 2 to 3 hours with repeated administration as the drug induces its own metabolism.',
      structureSource: {
        label:
          'PubChem CID 135398735 (rifampicin) — canonical SMILES, molecular formula and weight, as carried on the enriched record; mechanism, protein binding, food effect and half-life from the Rifadin United States label, CLINICAL PHARMACOLOGY',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/135398735',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'rif-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Assay the quinone and the oxidised impurity together',
          description:
            'Rifampin oxidises readily to rifampicin quinone, and the oxidised material is both less active and a specified impurity. Because the drug is deeply coloured, visual inspection is a poor guide and the assay has to separate the parent from its oxidation and hydrolysis products. This is also why the fixed-dose combination tablets used in tuberculosis programmes have a documented history of bioavailability problems: rifampin degrades in the presence of isoniazid under humid conditions.',
          reagentsAndBuffer:
            'Rifampin reference standard, reversed-phase HPLC with ultraviolet detection at 254 nm and 334 nm, rifampicin quinone and 3-formylrifamycin impurity standards, ascorbate-protected sample preparation, humidity-controlled stability chambers',
        },
        {
          id: 'rif-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Ferment rifamycin B and derivatise the aldehyde',
          description:
            'The ansamycin skeleton is not built synthetically. Rifamycin B is produced by fermentation of an Amycolatopsis actinomycete and converted through rifamycin S to 3-formylrifamycin SV; rifampin is then made by condensing that aldehyde with 1-amino-4-methylpiperazine. The semi-synthetic step is short, which is why rifampin exists at all — the natural product was too poorly absorbed to be given orally.',
          dependsOnStepId: 'rif-w1',
          reagentsAndBuffer:
            'Amycolatopsis fermentation broth yielding rifamycin B, oxidative conversion of rifamycin B to rifamycin S, Mannich formylation to 3-formylrifamycin SV, 1-amino-4-methylpiperazine, inert atmosphere to limit quinone formation',
        },
        {
          id: 'rif-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise under conditions that do not oxidise the product',
          description:
            'Purification has to be done without exposing the naphthohydroquinone to air, because the oxidised quinone is the principal degradant. The finished capsule then has to be protected from humidity, particularly in fixed-dose combinations with isoniazid, where moisture drives a documented interaction that lowers rifampin bioavailability.',
          dependsOnStepId: 'rif-w2',
          reagentsAndBuffer:
            'Crystallisation from acetone or ethyl acetate under nitrogen, antioxidant control, moisture-barrier packaging with desiccant, dissolution testing against a specified profile',
        },
        {
          id: 'rif-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure penetration into caseum and biofilm, not just into plasma',
          description:
            'Rifampin’s two distinctive clinical claims — sterilising tuberculosis lesions and curing infections on implanted metal — are both penetration claims. A plasma concentration says nothing about either. The relevant measurements are drug concentration inside the necrotic core of a granuloma and inside a mature staphylococcal biofilm, which is where the organisms that cause relapse actually sit.',
          dependsOnStepId: 'rif-w3',
          reagentsAndBuffer:
            'Rabbit or C3HeB/FeJ mouse caseous granuloma model with matrix-assisted laser desorption imaging mass spectrometry, mature Staphylococcus aureus biofilm on titanium and polymethylmethacrylate coupons, LC-MS/MS quantification of drug in caseum and biofilm matrix',
        },
        {
          id: 'rif-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Count the resistant mutants before and after monotherapy',
          description:
            'Rifampin resistance is a single-step, high-level event in an 81-base-pair window of rpoB, at a spontaneous frequency around one in a hundred million. In a cavity holding a hundred million to a billion organisms, that means resistant mutants are present before the first dose. The assay that makes this visible is a mutant frequency determination followed by rpoB sequencing after exposure — and it is the entire experimental justification for never giving this drug alone.',
          dependsOnStepId: 'rif-w4',
          reagentsAndBuffer:
            'Mycobacterium tuberculosis or Staphylococcus aureus inoculum at defined density, rifampin-containing selective agar at multiples of the MIC, colony counting for mutant frequency, Sanger or targeted next-generation sequencing across the rpoB resistance-determining region',
        },
      ],
    },
    keyAudits: [
      {
        id: 'rif-a1',
        category: 'failed',
        title: 'Adding it to staphylococcal bloodstream infection did nothing measurable',
        laymanSummary:
          'A 758-patient randomised trial across 29 hospitals added rifampicin to standard treatment for Staphylococcus aureus in the blood. The main outcome — bacteriological failure, recurrence or death by twelve weeks — was 16.8% with rifampicin and 18.3% with placebo. Drug interactions were four times as common.',
        technicalDetails:
          'ARREST randomised 758 adults with S. aureus bacteraemia who had received 96 hours or less of active therapy to two weeks of adjunctive rifampicin at 600 to 900 mg per day (n=370) or identical placebo (n=388), on top of standard antibiotic therapy. Median age was 65; 64.0% of infections were community acquired; 6.2% were meticillin-resistant; 39.7% had an initial deep focus; and 81.7% received flucloxacillin, for a median of 29 days. By 12 weeks, all-cause bacteriological failure, recurrence or death occurred in 62 of 370 (16.8%) against 71 of 388 (18.3%): absolute risk difference −1.4% (95% CI −7.0% to 4.3%), hazard ratio 0.96 (95% CI 0.68 to 1.35), p=0.81. There was no evidence of difference in clinically defined failure or recurrence (p=0.84), all-cause mortality (p=0.60), or serious adverse events (p=0.17). What did differ: antibiotic or trial-drug-modifying adverse events in 63 (17.0%) against 39 (10.1%), p=0.004, and drug interactions in 24 (6.5%) against 6 (1.5%), p=0.0005. One secondary signal favoured rifampicin — bacteriological recurrences in 3 (0.8%) against 16 (4.1%), p=0.01 — offset by deaths without bacteriological failure of 55 (14.9%) against 50 (12.9%). The conclusion was that adjunctive rifampicin provided no overall benefit.',
        evidenceSource:
          'Thwaites GE, Scarborough M, Szubert A, et al. Adjunctive rifampicin for Staphylococcus aureus bacteraemia (ARREST): a multicentre, randomised, double-blind, placebo-controlled trial. Lancet 2018;391:668-678 (ISRCTN37666216)',
        doi: '10.1016/S0140-6736(17)32456-X',
        measuredMetric:
          'Bacteriological failure, recurrence or death through 12 weeks: 16.8% with adjunctive rifampicin against 18.3% with placebo in 758 randomised adults',
        auditFlag: 'verified',
      },
      {
        id: 'rif-a2',
        category: 'measured',
        title: 'The implant-infection result is real, and it rests on 24 patients',
        laymanSummary:
          'The trial behind the practice of adding rifampin to treat infected joint replacements cured 12 of 12 patients against 7 of 12 on placebo. It randomised 33 people, and 9 of them dropped out.',
        technicalDetails:
          'Zimmerli and colleagues randomised 33 patients with culture-proven staphylococcal infection associated with stable orthopaedic implants and a short symptom duration to two weeks of intravenous flucloxacillin or vancomycin with rifampin or placebo, followed by long-term ciprofloxacin-rifampin or ciprofloxacin-placebo. Cure required absence of clinical signs, C-reactive protein below 5 mg/L, and no radiological signs of loosening or infection at 24 months. Eighteen were allocated to ciprofloxacin-rifampin and 15 to ciprofloxacin-placebo; 24 fully completed the trial. Cure was 12 of 12 (100%) with rifampin against 7 of 12 (58%) without (p=0.02). Nine of 33 dropped out — six for adverse events, one non-compliance, two protocol violations — and seven of those nine were subsequently treated with rifampin combinations, of whom five were cured without removing the device. This is a real, positive, double-blind result and it is small enough that the 100% figure rests on twelve people. It is also the foundation of a doctrine — retain the implant, add rifampin — applied to a vastly larger population than the one enrolled, and the enrolment criteria were narrow: stable implant, short duration of symptoms, initial debridement.',
        evidenceSource:
          'Zimmerli W, Widmer AF, Blatter M, Frei R, Ochsner PE. Role of rifampin for treatment of orthopedic implant-related staphylococcal infections: a randomized controlled trial. JAMA 1998;279:1537-1541',
        doi: '10.1001/jama.279.19.1537',
        measuredMetric:
          'Cure at 24 months: 12 of 12 on ciprofloxacin-rifampin against 7 of 12 on ciprofloxacin-placebo, from 33 randomised patients',
        auditFlag: 'verified',
      },
      {
        id: 'rif-a3',
        category: 'conclusion_shift',
        title: 'The standard dose was never the best dose',
        laymanSummary:
          'Rifampin has been given at about 10 mg per kilogram since the 1960s. A randomised trial testing 35 mg/kg found it cleared the bacteria from sputum substantially faster — a median of 48 days against 62 — with no more serious side effects.',
        technicalDetails:
          'The PanACEA MAMS-TB trial randomised 365 patients with newly diagnosed, rifampicin-sensitive pulmonary tuberculosis across seven sites in South Africa and Tanzania to one of four experimental arms or a standard control arm of 10 mg/kg rifampicin with isoniazid, pyrazinamide and ethambutol. Time to stable culture conversion in liquid media was faster in the 35 mg/kg rifampicin group than in the control group — median 48 days against 62, adjusted hazard ratio 1.78 (95% CI 1.22 to 2.58), p=0.003 — and was not faster in any other experimental arm. There was no difference in any group in time to culture conversion on solid media. Grade 3 to 5 adverse events were reported in 45 of 365 patients (12%), in similar proportions across arms. The investigators concluded that 35 mg/kg was safe, reduced time to culture conversion, and could be a component of shorter regimens. The historical point is uncomfortable: the 10 mg/kg standard was set when rifampin was expensive and dose-ranging was rudimentary, and it was never revisited for roughly half a century while tuberculosis remained the world’s leading infectious cause of death. Blinding was impossible in this trial because higher doses turn body fluids more intensely orange.',
        evidenceSource:
          'Boeree MJ, Heinrich N, Aarnoutse R, et al. High-dose rifampicin, moxifloxacin, and SQ109 for treating tuberculosis: a multi-arm, multi-stage randomised controlled trial. Lancet Infect Dis 2017;17:39-49 (NCT01785186)',
        doi: '10.1016/S1473-3099(16)30274-2',
        measuredMetric:
          'Median time to stable culture conversion in liquid media, 35 mg/kg against 10 mg/kg rifampicin: 48 days against 62, adjusted HR 1.78 (95% CI 1.22 to 2.58)',
        auditFlag: 'contested',
      },
      {
        id: 'rif-a4',
        category: 'measured',
        title: 'Four months of it beat nine months of isoniazid on everything except efficacy',
        laymanSummary:
          'In 6,859 adults with latent tuberculosis, four months of rifampin prevented just as much active disease as nine months of isoniazid — and 15 percentage points more people finished the course, with fewer serious liver reactions.',
        technicalDetails:
          'Menzies and colleagues ran an open-label trial in nine countries. Among 3,443 patients in the rifampin group, confirmed active tuberculosis developed in 4 and clinically diagnosed active tuberculosis in 4 during 7,732 person-years, against 4 and 5 respectively among 3,416 patients in the isoniazid group during 7,652 person-years. Rate differences were below 0.01 cases per 100 person-years for confirmed tuberculosis (95% CI −0.14 to 0.16) and for confirmed or clinically diagnosed tuberculosis (95% CI −0.23 to 0.22), with the upper confidence bounds below the prespecified non-inferiority margin of 0.75 percentage points; rifampin was not superior. The treatment-completion difference was 15.1 percentage points (95% CI 12.7 to 17.4). Grade 3 to 5 adverse events within 146 days differed by −1.1 percentage points (95% CI −1.9 to −0.4) overall and by −1.2 percentage points (95% CI −1.7 to −0.7) for hepatotoxic events, both favouring rifampin. Note what is being measured: with only 17 cases across 15,384 person-years, this trial is powered on an extremely rare event, and its practical case rests on completion and tolerability rather than on any demonstrated efficacy advantage.',
        evidenceSource:
          'Menzies D, Adjobimey M, Ruslami R, et al. Four months of rifampin or nine months of isoniazid for latent tuberculosis in adults. N Engl J Med 2018;379:440-453 (NCT00931736)',
        doi: '10.1056/NEJMoa1714283',
        measuredMetric:
          'Confirmed active tuberculosis, treatment completion and grade 3 to 5 hepatotoxicity in 6,859 adults randomised to 4 months of rifampin or 9 months of isoniazid',
        auditFlag: 'verified',
      },
      {
        id: 'rif-a5',
        category: 'inferred',
        title: 'It quietly turns off most of the rest of the medicine cabinet',
        laymanSummary:
          'Rifampin switches on the liver enzymes that destroy drugs, so hard that it can strip more than 80% of some medicines out of the bloodstream. Hormonal contraception is the classic casualty; several HIV drugs are outright contraindicated with it.',
        technicalDetails:
          'The label lists the affected pathways: cytochromes P450 1A2, 2B6, 2C8, 2C9, 2C19 and 3A4, the UDP-glucuronyltransferases, sulfotransferases, carboxylesterases, and the transporters P-glycoprotein and multidrug resistance-associated protein 2. Because most drugs are substrates for one or more of these, and because rifampin induces them simultaneously, the label states it "has the potential to perpetuate clinically important drug-drug interactions against many drugs and across many drug classes". The magnitudes in the label’s own interaction table are not marginal: atazanavir exposure falls by 72%, saquinavir by 70%, fosamprenavir by 82% at 300 mg rifampin daily, cabotegravir by 59%, fostemsavir by 82% and lenacapavir by 84%. Concomitant use with several antiretrovirals is contraindicated, and co-administration with ritonavir-boosted saquinavir produced severe hepatocellular toxicity in healthy volunteers. Rifampin also induces its own metabolism, which is why its serum half-life falls from about 3.35 hours after a single dose to roughly 2 to 3 hours with repeated administration. This is not a rare interaction warning; it is a structural property of the drug, and it is the most common reason a patient on rifampin comes to harm from something other than rifampin.',
        evidenceSource:
          'Rifadin and Rifadin IV (rifampin) United States prescribing information, DRUG INTERACTIONS Table 1, CONTRAINDICATIONS and CLINICAL PHARMACOLOGY',
        inferredClaim:
          'That an interaction warning list is a manageable footnote — when the inducing effect spans six cytochrome enzymes, three conjugating systems and two transporters simultaneously, and removes up to 84% of a co-administered drug’s exposure',
        auditFlag: 'caution',
      },
      {
        id: 'rif-a6',
        category: 'failed',
        title: 'Given alone, it loses — and its own label says so twice',
        laymanSummary:
          'Resistance to rifampin needs only a single mutation, and a tuberculosis cavity already contains enough bacteria for that mutation to be present before treatment starts. The label warns about this in its first paragraph and refuses to license the drug for meningococcal disease for the same reason.',
        technicalDetails:
          'The INDICATIONS AND USAGE section opens: "In the treatment of both tuberculosis and the meningococcal carrier state, the small number of resistant cells present within large populations of susceptible cells can rapidly become the predominant type." The WARNINGS section repeats it: "The possibility of rapid emergence of resistant meningococci restricts the use of RIFADIN to short-term treatment of the asymptomatic carrier state. RIFADIN is not to be used for the treatment of meningococcal disease." The molecular reason is that resistance is conferred by point mutations in an 81-base-pair region of rpoB — a single-step, high-level event, unlike the graded, multi-locus resistance seen with most other antibacterials. A pulmonary cavity can hold a hundred million to a billion organisms and the spontaneous rifampicin-resistance frequency is roughly one in a hundred million, so the mutants are present before the first dose. Everything about tuberculosis chemotherapy — combination therapy, directly observed treatment, fixed-dose combination tablets — is architecture built to stop this one thing happening, and rifampicin resistance is the definition of multidrug-resistant tuberculosis.',
        evidenceSource:
          'Rifadin (rifampin) United States prescribing information, INDICATIONS AND USAGE and WARNINGS',
        measuredMetric:
          'Label statements on single-step emergence of rifampin resistance and the explicit exclusion of meningococcal disease from the indication',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'It gets almost everywhere',
        laymanDesc:
          'Rifampin is absorbed well from the gut and spreads into places most antibiotics cannot reach — spinal fluid, scar tissue, the film bacteria build on metal implants.',
        molecularDetail:
          'About 80% protein bound, with most of the unbound fraction un-ionised and therefore freely diffusible into tissues. The label records effective concentrations in many organs and body fluids including cerebrospinal fluid. Absorption falls by about 30% when taken with food.',
        iconName: 'Waves',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It plugs the exit of the copying machine',
        laymanDesc:
          'Genes have to be copied into RNA before anything can be built from them. Rifampin blocks the channel the new RNA strand comes out of.',
        molecularDetail:
          'It binds a pocket in the beta subunit of bacterial DNA-dependent RNA polymerase about 12 angstroms from the catalytic centre, inside the RNA exit channel, sterically blocking extension of the transcript beyond two or three nucleotides. The label states it does not inhibit the mammalian enzyme.',
        iconName: 'Ban',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'Even barely-alive bacteria stop',
        laymanDesc:
          'Most antibiotics only kill bacteria that are actively growing. Rifampin also kills the dormant ones sitting in scar tissue, and those are the ones that cause the disease to come back.',
        molecularDetail:
          'Transcription continues at a low rate in non-replicating persisters, so blocking RNA polymerase kills them where cell-wall agents cannot. This sterilising activity, alongside pyrazinamide, is what made six-month tuberculosis treatment possible where eighteen months had been required.',
        iconName: 'Snowflake',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'One mutation is enough to defeat it',
        laymanDesc:
          'A single change in one bacterial gene makes the drug useless. In a lung cavity holding a billion organisms, that change is already present before treatment starts.',
        molecularDetail:
          'Essentially all clinical resistance arises from point mutations within an 81-base-pair rifampicin resistance-determining region of rpoB, at a spontaneous frequency of roughly one in a hundred million. The label warns that resistant cells within a large susceptible population can rapidly become predominant.',
        iconName: 'AlertTriangle',
        visualStage: 'cellular_entry',
      },
      {
        step: 5,
        title: 'It also switches on the liver',
        laymanDesc:
          'The same drug turns up the enzymes that destroy other medicines, cutting their levels dramatically — and it does this to itself as well.',
        molecularDetail:
          'Induction spans CYP1A2, 2B6, 2C8, 2C9, 2C19 and 3A4, the UGTs, sulfotransferases, carboxylesterases, P-glycoprotein and MRP2. Label examples: atazanavir AUC −72%, fosamprenavir −82%, lenacapavir −84%. Autoinduction shortens rifampin’s own half-life from about 3.35 hours to 2 to 3 hours on repeated dosing.',
        iconName: 'Flame',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What it does and does not add elsewhere',
        laymanDesc:
          'Added to treatment for infected joint implants, it cured 12 of 12 against 7 of 12. Added to treatment for staphylococcus in the blood, it changed nothing across 758 patients.',
        molecularDetail:
          'Zimmerli et al., JAMA 1998: cure 100% against 58% (p=0.02) among 24 evaluable of 33 randomised. ARREST, Lancet 2018: bacteriological failure/recurrence/death 16.8% against 18.3%, HR 0.96 (95% CI 0.68 to 1.35), p=0.81, in 758 randomised, with drug interactions 6.5% against 1.5%.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'ARREST — adjunctive rifampicin for Staphylococcus aureus bacteraemia (Lancet 2018;391:668-678; ISRCTN37666216)',
        phase: 'Phase 3, multicentre, randomised, double-blind, placebo-controlled',
        sampleSize: 758,
        primaryEndpoint:
          'All-cause bacteriological (microbiologically confirmed) failure, recurrence or death through 12 weeks from randomisation',
        endpointMet: false,
        statisticalPValue:
          '62 of 370 (16.8%) with rifampicin against 71 of 388 (18.3%) with placebo; absolute risk difference −1.4% (95% CI −7.0% to 4.3%), hazard ratio 0.96 (95% CI 0.68 to 1.35), p=0.81',
        unreportedAdverseSignals:
          'Antibiotic or trial-drug-modifying adverse events in 17.0% against 10.1% (p=0.004) and drug interactions in 6.5% against 1.5% (p=0.0005). One secondary result favoured rifampicin — bacteriological recurrences 3 (0.8%) against 16 (4.1%), p=0.01 — against deaths without bacteriological failure of 14.9% against 12.9%.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'Menzies D et al., 4 months of rifampin against 9 months of isoniazid for latent tuberculosis (N Engl J Med 2018;379:440-453)',
        phase: 'Phase 3, open-label, randomised, non-inferiority, nine countries',
        sampleSize: 6859,
        primaryEndpoint:
          'Confirmed active tuberculosis within 28 months of randomisation, against a non-inferiority margin of 0.75 percentage points in cumulative incidence',
        endpointMet: true,
        statisticalPValue:
          'Rate difference below 0.01 cases per 100 person-years (95% CI −0.14 to 0.16); treatment completion difference 15.1 percentage points (95% CI 12.7 to 17.4); grade 3 to 5 hepatotoxic events −1.2 percentage points (95% CI −1.7 to −0.7)',
        unreportedAdverseSignals:
          'Only 17 tuberculosis cases occurred across roughly 15,384 person-years, so the efficacy comparison rests on a very small number of events, and rifampin was not superior. The practical case for the shorter regimen is completion and tolerability, not efficacy.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'Zimmerli W et al., rifampin for orthopaedic implant-related staphylococcal infection (JAMA 1998;279:1537-1541)',
        phase: 'Randomised, double-blind, placebo-controlled',
        sampleSize: 33,
        primaryEndpoint:
          'Cure at final follow-up: absence of clinical signs, C-reactive protein below 5 mg/L, and no radiological signs of loosening or infection',
        endpointMet: true,
        statisticalPValue:
          'Cure in 12 of 12 (100%) with rifampin against 7 of 12 (58%) without, p=0.02',
        unreportedAdverseSignals:
          'Nine of 33 randomised patients dropped out — six for adverse events, one for non-compliance, two for protocol violations — so a headline of 100% rests on twelve people. Enrolment was narrow: stable implant, symptom duration under 21 days in practice, and initial debridement in every case.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId:
          'PanACEA MAMS-TB — high-dose rifampicin (Lancet Infect Dis 2017;17:39-49; NCT01785186)',
        phase: 'Phase 2b, randomised, open-label, multi-arm multi-stage',
        sampleSize: 365,
        primaryEndpoint: 'Time to stable culture conversion in liquid media within 12 weeks',
        endpointMet: true,
        statisticalPValue:
          '35 mg/kg rifampicin against 10 mg/kg control: median 48 days against 62, adjusted hazard ratio 1.78 (95% CI 1.22 to 2.58), p=0.003. No difference in any arm in time to conversion on solid media',
        unreportedAdverseSignals:
          'Blinding was impossible because higher rifampicin doses intensify the orange discolouration of body fluids. The endpoint is a surrogate — time to culture conversion — not relapse-free cure, and the SQ109 arms were stopped early for failing prespecified efficacy thresholds.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Adjunctive rifampicin in S. aureus bacteraemia: 16.8% against 18.3% for bacteriological failure, recurrence or death at 12 weeks, hazard ratio 0.96 (95% CI 0.68 to 1.35) in 758 randomised adults',
        'Four months of rifampin non-inferior to nine months of isoniazid for latent tuberculosis in 6,859 adults, with completion 15.1 percentage points higher and hepatotoxic grade 3 to 5 events 1.2 points lower',
        'High-dose rifampicin at 35 mg/kg: median time to stable culture conversion 48 days against 62 at the standard dose, adjusted HR 1.78 (95% CI 1.22 to 2.58), p=0.003',
        'Cure of stable orthopaedic implant infection in 12 of 12 with rifampin against 7 of 12 without, p=0.02, among 24 evaluable of 33 randomised',
      ],
      unsupportedInferences: [
        'That biofilm penetration demonstrated in the laboratory transfers to bloodstream infection — ARREST tested that inference directly and the primary endpoint was flat',
        'That the 10 mg/kg dose in universal use is the right dose, which was set in the 1960s and first seriously challenged by randomised evidence in 2017',
        'That a 33-patient trial establishes a doctrine for implant retention across the far broader population in which it is now applied',
        'That the drug interaction burden is a manageable footnote rather than a structural property that removes most of the exposure to some co-administered drugs',
      ],
      whatFailedInitially: [
        'Adjunctive rifampicin in Staphylococcus aureus bacteraemia: no difference in the primary endpoint, no difference in mortality, and significantly more drug interactions and treatment-modifying adverse events',
        'Monotherapy in any indication: single-step rpoB resistance means the label refuses even to license the drug for meningococcal disease, only for the carrier state',
        'Superiority over isoniazid in latent tuberculosis: non-inferiority was shown, superiority explicitly was not',
        'Time to culture conversion on solid media in the high-dose trial, where no arm differed — the benefit appeared only in liquid culture',
      ],
      realWorldOutcome: [
        'Turned tuberculosis from an eighteen-month to a six-month illness, and remains the molecule the entire regimen is designed to protect',
        'Rifampicin resistance is now the operational definition of multidrug-resistant tuberculosis and the target of the rapid molecular tests used worldwide',
        'Four months of rifampin has replaced nine months of isoniazid as a preferred latent tuberculosis regimen in several national guidelines, on completion and safety rather than efficacy',
        'Superseded within its own family for regimen shortening: the first successful four-month active-tuberculosis regimen in four decades replaced rifampin with rifapentine and ethambutol with moxifloxacin',
      ],
    },
    deliverySystem: {
      type: 'Oral capsules and oral suspension; intravenous infusion where the drug cannot be taken by mouth',
      description:
        'Readily absorbed from the gastrointestinal tract, with wide interindividual variation: after a single 600 mg oral dose the peak serum concentration averages 7 mcg/mL but ranges from 4 to 32 mcg/mL. Food reduces absorption by about 30%. The drug is rapidly eliminated in bile and undergoes enterohepatic circulation with progressive deacetylation to an active metabolite; up to 30% of a dose appears in urine, about half of that unchanged. Mean serum half-life is 3.35 ± 0.66 hours after 600 mg orally, falling to about 2 to 3 hours with repeated administration because the drug induces its own metabolism. Half-life does not change in renal failure at doses up to 600 mg daily.',
      safetyProfile:
        'Hepatotoxicity of hepatocellular, cholestatic and mixed patterns has been reported, ranging from asymptomatic enzyme elevation through symptomatic hepatitis to fulminant liver failure and death, with severe outcomes concentrated in existing liver disease and in combination with other hepatotoxic agents; the label directs monitoring every two to four weeks in impaired liver function. Systemic hypersensitivity reactions, and severe cutaneous adverse reactions including Stevens-Johnson syndrome, toxic epidermal necrolysis, acute generalised exanthematous pustulosis and DRESS, have been reported. Rifampin may cause vitamin K-dependent coagulation disorders and bleeding, and coagulation tests should be monitored. It induces delta-aminolaevulinic acid synthetase and has been associated with porphyria exacerbation. Body fluids turn reddish-orange and soft contact lenses may be permanently stained. Concomitant use with ritonavir-boosted saquinavir is contraindicated after severe hepatocellular toxicity in healthy volunteers, and concomitant halothane should be avoided.',
    },
    commonQuestions: [
      {
        q: 'Why can rifampin never be given on its own?',
        a: 'Because resistance takes a single mutation, and the mutation is usually already there. Rifampin resistance in tuberculosis arises almost entirely from point changes in an 81-base-pair stretch of one gene, rpoB, at a spontaneous rate of roughly one in a hundred million bacteria. A lung cavity can contain a hundred million to a billion organisms, so a rifampin-resistant mutant exists before the first tablet is swallowed; giving the drug alone simply kills its competitors. The label puts this in its opening paragraph and applies it beyond tuberculosis — it licenses rifampin for clearing meningococcus from the throats of carriers and states explicitly that it is not to be used to treat meningococcal disease, for the same reason.',
        auditNote:
          'Combination therapy in tuberculosis is not about broadening the spectrum. It is entirely about preventing one gene from mutating.',
      },
      {
        q: 'Why does everything turn orange?',
        a: 'Because rifampin is intensely coloured and is excreted in essentially every body fluid. Urine, sweat, tears and saliva turn reddish-orange, and soft contact lenses can be stained permanently. It is harmless and it is a useful adherence check — an absence of orange urine on a drug being taken daily is informative. It also had a methodological consequence: the trial of high-dose rifampicin could not be blinded, because higher doses make the discolouration more intense.',
      },
      {
        q: 'Will it stop my contraceptive pill working?',
        a: 'Rifampin is one of the strongest enzyme inducers in clinical medicine, and hormonal contraception is the classic casualty. It induces six cytochrome P450 enzymes together with the glucuronidation, sulfation and carboxylesterase pathways and the P-glycoprotein and MRP2 transporters, all at once. The label’s own table shows exposure reductions of 72% for atazanavir, 82% for fosamprenavir and 84% for lenacapavir to give a sense of scale. What to do about any specific medicine is a prescribing decision, and the label’s instruction is that concomitant drug dosages be adjusted according to their own approved labelling. The practical point for a patient is simply to disclose everything, including anything bought without a prescription.',
      },
      {
        q: 'I read rifampin cures infected joint replacements. Is that established?',
        a: 'It is established on a very small trial, and worth knowing the size of. Thirty-three patients with staphylococcal infection of a stable orthopaedic implant were randomised; twenty-four completed. Cure at final follow-up was 12 of 12 with rifampin against 7 of 12 without, p=0.02. That is a real double-blind result and it is twelve people, in a narrowly selected group: stable implant, very short duration of symptoms, and surgical debridement in every case. The doctrine built on it — retain the implant and add rifampin — is applied far more widely than the trial population. And when the same reasoning was tested in a much larger trial in staphylococcal bloodstream infection, 758 patients, it produced no benefit.',
        auditNote:
          'Two trials, same drug, same organism, same biofilm rationale, opposite results, and the difference is where the biofilm is. That is the argument for reading the population rather than the conclusion.',
      },
      {
        q: 'Is the dose right?',
        a: 'Possibly not, and that is a remarkable thing to have to say about a drug used by millions of people for fifty years. Rifampin is given at about 10 mg per kilogram, a figure set when the drug was new and expensive. A randomised trial in 365 patients compared 35 mg/kg with the standard dose and found the time to stable culture conversion in liquid media fell from a median of 62 days to 48, an adjusted hazard ratio of 1.78, with no excess of serious adverse events. That is a surrogate endpoint rather than relapse-free cure, and it is a phase 2 trial — but it points at a question that went unasked for decades in the world’s leading infectious cause of death.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Thwaites GE, Scarborough M, Szubert A, et al. Adjunctive rifampicin for Staphylococcus aureus bacteraemia (ARREST): a multicentre, randomised, double-blind, placebo-controlled trial. Lancet 2018;391:668-678',
        identifier: '10.1016/S0140-6736(17)32456-X',
        kind: 'doi',
      },
      {
        label:
          'Menzies D, Adjobimey M, Ruslami R, et al. Four months of rifampin or nine months of isoniazid for latent tuberculosis in adults. N Engl J Med 2018;379:440-453',
        identifier: '10.1056/NEJMoa1714283',
        kind: 'doi',
      },
      {
        label:
          'Boeree MJ, Heinrich N, Aarnoutse R, et al. High-dose rifampicin, moxifloxacin, and SQ109 for treating tuberculosis: a multi-arm, multi-stage randomised controlled trial. Lancet Infect Dis 2017;17:39-49',
        identifier: '10.1016/S1473-3099(16)30274-2',
        kind: 'doi',
      },
      {
        label:
          'Zimmerli W, Widmer AF, Blatter M, Frei R, Ochsner PE. Role of rifampin for treatment of orthopedic implant-related staphylococcal infections: a randomized controlled trial. JAMA 1998;279:1537-1541',
        identifier: '10.1001/jama.279.19.1537',
        kind: 'doi',
      },
      {
        label:
          'PanACEA MAMS-TB-01 — ClinicalTrials.gov registration for the high-dose rifampicin trial (ARREST itself is registered as ISRCTN37666216, not on ClinicalTrials.gov)',
        identifier: 'NCT01785186',
        kind: 'nct',
      },
      {
        label:
          'Four months of rifampin against nine months of isoniazid for latent tuberculosis — ClinicalTrials.gov registration',
        identifier: 'NCT00931736',
        kind: 'nct',
      },
      {
        label:
          'Rifampin capsules — United States prescribing information (Indications and Usage, Warnings, Drug Interactions Table 1, Clinical Pharmacology, Mechanism of Action)',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=b389b1a3-672f-47e3-916c-4a9c044b211b',
        kind: 'regulatory',
      },
      {
        label:
          'Rifadin IV (rifampin) for injection — United States prescribing information (Warnings, Drug Interactions, Clinical Pharmacology)',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=036ab68e-5085-4edc-bd83-784b43d64eab',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 135398735 — rifampicin canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/135398735',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 6. Isoniazid — the nine-month regimen that was never tested at nine months, and a boxed
  //    warning still quoting hepatitis rates an order of magnitude above the modern measurement.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'isoniazid',
    name: 'Isoniazid',
    tradeName: 'Nydrazid / Laniazid / Rimifon / Hyzyd / Stanozide',
    sponsor:
      'Antituberculous activity in isonicotinic acid hydrazide was reported independently by more than one research group in 1952, decades after the compound itself was first described in the chemical literature. The United States application holder on this record is Epic Pharma; the drug is generic and made worldwide',
    targetGene:
      'inhA, encoding the enoyl-acyl carrier protein reductase of the mycolic acid pathway. Activation requires the mycobacterial catalase-peroxidase gene katG, and resistance arises through katG, inhA, kasA and ahpC',
    targetProtein:
      'InhA, the NADH-dependent enoyl-ACP reductase of mycobacterial fatty acid synthase II, inhibited by an isonicotinoyl-NAD adduct formed inside the bacterium',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1952,
    indication:
      'All forms of tuberculosis in which organisms are susceptible, always in combination with other antituberculosis medications for active disease; and as preventive therapy for defined groups with latent infection. The label states that single-drug treatment of active tuberculosis is inadequate therapy',
    patientFriendlyIndication:
      'Tuberculosis — both active disease, alongside other drugs, and dormant infection, to stop it waking up',
    anatomicalSite:
      'Inside the mycobacterium, at the fatty acid synthase that builds the mycolic acid layer of its cell envelope. The toxicity site is the liver and the peripheral nerves',
    conditionContext: {
      conditionExplainer:
        'Mycobacterium tuberculosis is wrapped in an unusually thick, waxy envelope built from very long-chain fatty acids called mycolic acids. That envelope is why the organism survives inside macrophages and why ordinary antibiotics bounce off it. Isoniazid attacks the machinery that builds it.',
      whyItMatters:
        'Around a quarter of the world’s population carries latent tuberculosis, and most people treated with isoniazid are not ill. That changes the arithmetic entirely: the drug is being given to a well person to prevent a future event, so the acceptable rate of liver injury is very low, and the exact duration matters enormously to whether anyone finishes the course.',
      whoTakesThis:
        'People with active tuberculosis, in combination; and far more people with latent infection taking it alone for six, nine or twelve months depending on the guideline and the era.',
      clinicalGoals:
        'For active disease, cure without relapse. For latent infection, prevention of a disease that most untreated people would never develop — which is why the harm side of the ledger dominates.',
    },
    oneSentenceVerdict:
      'A prodrug activated by the bacterium’s own catalase that shuts down mycolic acid synthesis, prescribed for latent infection in a nine-month regimen that no trial ever tested — the 28,000-person trial underlying it compared 12, 24 and 52 weeks — and carrying a boxed warning that still quotes 1970s hepatitis rates of up to 23 per 1,000 when a 7-year prospective cohort of 11,141 patients under modern monitoring found 11 cases, or 0.10%.',
    laymanHowItWorks:
      'Isoniazid arrives inert. Inside the tuberculosis bacterium an enzyme the organism uses to protect itself from oxidation turns the drug into something reactive, which then locks onto the machine that builds the waxy coat the bacterium depends on. Without the coat the cell cannot survive. The elegance is that the bacterium activates its own poison; the consequence is that a mutation switching off that protective enzyme makes the drug useless while barely inconveniencing the organism.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 68,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$3.49 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 12 listed products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'On the market since 1952 and on the WHO Model List of Essential Medicines. It is one of the structurally simplest drugs in medicine — a pyridine ring with a hydrazide attached, molecular weight 137 — and in high-burden countries it costs a few cents a tablet. The United States acquisition price recorded here, US$3.49 per unit across 12 listed products, is roughly five times what rifampin costs on the same survey, for a molecule about a sixth of its size and far simpler to make. That gap is a supply and market-structure fact, not a chemistry fact.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'For active tuberculosis there is no substitute for isoniazid within a first-line regimen; losing it to resistance is half the definition of multidrug-resistant disease. For latent infection the alternatives are real and have been directly compared, and they mostly win on the endpoints that decide whether treatment works in practice — completion and liver injury — rather than on efficacy, where nothing has beaten it. Nothing sold as a food or supplement treats a bacterial infection, and the naturalFoods list on this page is empty for that reason.',
      conventionalRx: [
        {
          name: 'Four months of daily rifampin',
          class: 'Rifamycin monotherapy for latent tuberculosis',
          howItCompares:
            'Directly compared in 6,859 adults across nine countries. Non-inferior for preventing active tuberculosis, with a treatment-completion rate 15.1 percentage points higher (95% CI 12.7 to 17.4) and grade 3 to 5 hepatotoxic events 1.2 percentage points lower (95% CI 0.7 to 1.7). It was not superior on efficacy.',
          typicalCost:
            'US$0.6802 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 14 listed products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: less than half the duration, better completion, less liver injury, and cheaper on this survey. Cons: rifampin induces six cytochrome P450 enzymes and two transporters, so it is a poor choice for anyone on multiple other medicines.',
        },
        {
          name: 'Isoniazid plus rifapentine, once weekly for three months',
          class: 'Short-course combination for latent tuberculosis',
          howItCompares:
            'Keeps isoniazid but compresses the schedule. It is included here because the practical failure mode of isoniazid monotherapy is not inefficacy but non-completion, and the shorter regimens are attempts on that specific problem rather than on the drug.',
          typicalCost:
            'Not stated: no verified CMS acquisition price for rifapentine was held on this record at the time of writing',
          prosAndCons:
            'Pros: twelve doses instead of about 270. Cons: carries rifamycin drug interactions; flu-like hypersensitivity reactions are recognised with weekly rifapentine.',
        },
        {
          name: 'Six months of isoniazid rather than nine or twelve',
          class: 'The same drug, a duration the trial evidence actually covered',
          howItCompares:
            'The IUAT trial measured 12, 24 and 52 weeks against placebo in 28,000 people. Twenty-four weeks eliminated about two-thirds of tuberculosis risk and 52 weeks the most — but 24 weeks prevented more tuberculosis cases per case of hepatitis caused, and moving from 52 to 24 weeks was estimated to cut hepatitis by a third while increasing tuberculosis by 40%.',
          typicalCost: 'The same tablet at the same acquisition price, for a shorter time',
          prosAndCons:
            'Pros: a duration that was directly measured, with a better harm-per-benefit ratio in the trial’s own analysis. Cons: measurably less protection than 52 weeks; and 9 months, the most widely recommended duration, sits between the tested arms rather than on one.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask about pyridoxine if you are at risk of nerve damage',
          action:
            'Mention malnutrition, alcohol use, diabetes, pregnancy, HIV infection or kidney failure before starting.',
          patientImpact:
            'The label records peripheral neuropathy as the most common toxic effect, dose-related, occurring most often in the malnourished and those predisposed to neuritis such as people with alcohol dependence or diabetes, usually preceded by pins and needles in the feet and hands, and more frequent in slow acetylators. Pyridoxine deficiency is listed among the metabolic adverse reactions.',
          clinicalPrecaution:
            'Whether and how much pyridoxine to give is a prescribing decision this page does not make. The point here is that the risk groups are known in advance and are worth naming before the first tablet.',
        },
        {
          name: 'Report the liver symptoms, and know the timing',
          action:
            'Report unexplained loss of appetite, nausea, vomiting, dark urine, yellow eyes, rash, persistent tingling of hands and feet, persistent fatigue, weakness, fever lasting more than three days, or right-upper abdominal tenderness.',
          patientImpact:
            'That list is quoted from the boxed warning. Isoniazid-associated hepatitis usually occurs in the first three months. Mild transient transaminase elevation occurs in 10% to 20% of patients and usually resolves without stopping the drug; progressive damage is rare under 20 and occurs in up to 2.3% of those over 50.',
          clinicalPrecaution:
            'The label directs monthly clinical review for everyone and adds baseline and periodic AST and ALT for people 35 and older, and states that liver function tests are not a substitute for a monthly clinical evaluation.',
        },
        {
          name: 'Alcohol changes the arithmetic',
          action: 'Be straightforward about how much you drink.',
          patientImpact:
            'The boxed warning states that the risk of hepatitis is increased with daily consumption of alcohol, and lists daily alcohol use, chronic liver disease and injection drug use among the factors associated with increased risk.',
          clinicalPrecaution:
            'The label also flags an increased risk of fatal hepatitis among women, particularly Black and Hispanic women, and possibly in the post-partum period, and suggests more careful monitoring in those groups.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1=CN=CC=C1C(=O)NN',
      chemicalFormula: 'C6H7N3O',
      molecularWeight: '137.14 g/mol',
      targetReceptorAffinity:
        'Isoniazid is a prodrug with no intrinsic activity against its target. Inside Mycobacterium tuberculosis it is oxidised by the mycobacterial catalase-peroxidase KatG to an isonicotinoyl radical, which couples to NAD+ to form an isonicotinoyl-NAD adduct. That adduct is the actual inhibitor: it binds InhA, the NADH-dependent enoyl-acyl carrier protein reductase of the fatty acid synthase II system, blocking elongation of the very long-chain fatty acids from which mycolic acids are built. The label puts it plainly: "Isoniazid inhibits the synthesis of mycoloic acids, an essential component of the bacterial cell wall", and it is bactericidal against actively growing intracellular and extracellular organisms at therapeutic concentrations. Because activation depends on a bacterial enzyme that is dispensable to the organism, loss-of-function mutation in katG confers high-level resistance in a single step — the commonest resistance mechanism — while promoter mutations in inhA raise target expression and give lower-level resistance. Metabolism in the host is by acetylation and dehydrazination, at a genetically determined rate: the label states that approximately 50% of Black and Caucasian patients are slow inactivators, that the majority of Inuit and East Asian populations are rapid inactivators, and that acetylation rate does not significantly alter effectiveness but slow acetylation may raise blood levels and toxic reactions.',
      structureSource: {
        label:
          'PubChem CID 3767 (isoniazid) — canonical SMILES, molecular formula and weight, as carried on the enriched record; mechanism, resistance genes and acetylation from the isoniazid tablets United States label, CLINICAL PHARMACOLOGY',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3767',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'inh-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Assay hydrazine and the free hydrazide together',
          description:
            'Isoniazid hydrolyses to isonicotinic acid and hydrazine, and hydrazine is a genotoxic impurity with a very low specification limit. It also reacts with reducing sugars, which is why the choice of tablet excipient matters and why the fixed-dose combinations used in tuberculosis programmes need humidity control. A potency assay alone is not a release test for this molecule.',
          reagentsAndBuffer:
            'Isoniazid reference standard, HPLC with ultraviolet detection at 263 nm, derivatised hydrazine assay by GC-MS or LC-MS/MS against a parts-per-million specification, humidity-controlled stability chambers',
        },
        {
          id: 'inh-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Condense the pyridine ester with hydrazine',
          description:
            'The molecule is about as simple as a drug gets: isonicotinic acid is esterified and the ester is treated with hydrazine hydrate to give the hydrazide. Two steps from a commodity feedstock, which is why isoniazid costs a few cents a tablet in most of the world, and why a United States acquisition price of several dollars is a market fact rather than a manufacturing one.',
          dependsOnStepId: 'inh-w1',
          reagentsAndBuffer:
            'Isonicotinic acid or its methyl ester, hydrazine hydrate, methanol or ethanol at reflux, controlled excess hydrazine with downstream removal',
        },
        {
          id: 'inh-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Recrystallise and keep it away from rifampin and moisture',
          description:
            'Recrystallisation from ethanol or water gives the drug substance. The formulation problem is downstream: isoniazid degrades rifampin in fixed-dose combination tablets under humid conditions, a documented cause of sub-potent combination products in high-burden settings. A drug this cheap and this simple has had a persistent quality problem, and it lives in the packaging rather than the chemistry.',
          dependsOnStepId: 'inh-w2',
          reagentsAndBuffer:
            'Recrystallisation from aqueous ethanol, moisture-barrier blister packaging with desiccant, dissolution testing on the combination product, accelerated stability at 40 degrees Celsius and 75% relative humidity',
        },
        {
          id: 'inh-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Show that activation requires the bacterium’s own enzyme',
          description:
            'The claim that isoniazid is a prodrug activated by KatG is testable rather than assumed: a katG knockout should be resistant and should regain susceptibility on complementation, and purified KatG plus isoniazid plus NAD+ should generate the isonicotinoyl-NAD adduct in a tube. This is also the experiment that explains the resistance epidemiology, since the commonest resistant isolates carry katG mutations.',
          dependsOnStepId: 'inh-w3',
          reagentsAndBuffer:
            'Mycobacterium tuberculosis katG deletion mutant and complemented strain, purified recombinant KatG, NAD+, manganese and peroxide as activation conditions, LC-MS detection of the isonicotinoyl-NAD adduct, InhA enzyme inhibition assay',
        },
        {
          id: 'inh-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Genotype the acetylator and measure exposure, not dose',
          description:
            'Two patients on the same milligram dose can carry very different drug exposures because NAT2 acetylation is genetically determined. The label states the rate does not significantly alter effectiveness but that slow acetylation may raise blood levels and toxicity. Testing that properly means pairing NAT2 genotype with an actual area-under-the-curve measurement and with transaminase and neuropathy outcomes, rather than inferring exposure from the prescription.',
          dependsOnStepId: 'inh-w4',
          reagentsAndBuffer:
            'NAT2 genotyping panel covering the common slow-acetylator haplotypes, serial plasma sampling with LC-MS/MS quantification of isoniazid and acetylisoniazid, paired AST and ALT monitoring and structured neuropathy assessment',
        },
      ],
    },
    keyAudits: [
      {
        id: 'inh-a1',
        category: 'inferred',
        title: 'Nine months was never one of the arms',
        laymanSummary:
          'The nine-month isoniazid course, recommended for decades, was never tested. The 28,000-person trial that underlies the whole practice compared 12 weeks, 24 weeks and 52 weeks against placebo. Nine months sits between two of those arms and was inferred from them.',
        technicalDetails:
          'The International Union Against Tuberculosis trial followed 28,000 people with fibrotic pulmonary lesions compatible with tuberculosis for five years after receiving 12, 24 or 52 weeks of isoniazid or placebo. Compared with placebo, 12 weeks eliminated less than one-third of the tuberculosis risk and 24 weeks eliminated two-thirds; adopting a 24-week regimen where none was practised was estimated to cut tuberculosis incidence by 65%. Fifty-two weeks prevented the most tuberculosis, but 24 weeks prevented more cases per case of hepatitis caused, and moving from 52 to 24 weeks was estimated to cut hepatitis by one-third while increasing tuberculosis by 40%. Hepatitis, the only serious side effect encountered, occurred in 0.5% of isoniazid recipients against 0.1% of placebo recipients. What the trial did not do is test 9 months, the duration that became the most widely recommended regimen in the United States. The nine-month recommendation is an interpolation across two measured arms — a reasonable one, and an interpolation. It matters because duration is the single largest determinant of whether a well person finishes a preventive course, and because the trial’s own harm-benefit analysis favoured the shorter tested arm.',
        evidenceSource:
          'International Union Against Tuberculosis Committee on Prophylaxis. Efficacy of various durations of isoniazid preventive therapy for tuberculosis: five years of follow-up in the IUAT trial. Bull World Health Organ 1982;60:555-564',
        inferredClaim:
          'That nine months of isoniazid is the optimal preventive duration — a value between the 24-week and 52-week arms of the only large placebo-controlled duration trial, and one that trial never randomised anyone to',
        auditFlag: 'contested',
      },
      {
        id: 'inh-a2',
        category: 'conclusion_shift',
        title: 'The boxed warning quotes hepatitis rates ten times the modern measurement',
        laymanSummary:
          'The warning on the label gives hepatitis rates rising with age to 23 per 1,000 for people aged 50 to 64. A seven-year prospective study of 11,141 people treated under modern monitoring found 11 cases in total — one in a thousand.',
        technicalDetails:
          'The boxed warning states approximate case rates by age of less than 1 per 1,000 under 20 years, 3 per 1,000 for ages 20 to 34, 12 per 1,000 for 35 to 49, 23 per 1,000 for 50 to 64, and 8 per 1,000 over 65, and cites a United States Public Health Service Surveillance Study of 13,838 people in which there were 8 deaths among 174 cases of hepatitis. Nolan, Goldberg and Buskin prospectively followed 11,141 consecutive patients starting isoniazid preventive therapy at a public health tuberculosis clinic from 1989 to 1995 under then-current guidelines. Eleven patients — 0.10% of those starting and 0.15% of those completing — had hepatotoxic reactions. The rate rose with age (chi-square for linear trend 5.22, p=0.02), with non-significant trends toward higher rates in women (odds ratio 3.30, 95% CI 0.87 to 12.45) and in white patients (2.60, 0.75 to 8.95). The authors concluded that clinicians should have greater confidence in the safety of isoniazid preventive therapy. The difference is largely definitional and procedural — modern diagnosis, monthly symptom review, and stopping the drug on symptoms rather than on enzyme levels alone — but the practical consequence is that the number most often quoted to patients, straight off the label, is roughly an order of magnitude above what monitored practice produces.',
        evidenceSource:
          'Nolan CM, Goldberg SV, Buskin SE. Hepatotoxicity associated with isoniazid preventive therapy: a 7-year survey from a public health tuberculosis clinic. JAMA 1999;281:1014-1018; isoniazid tablets United States prescribing information, boxed warning',
        doi: '10.1001/jama.281.11.1014',
        measuredMetric:
          'Isoniazid hepatotoxicity: 11 of 11,141 patients (0.10%) under monitored modern practice against the label’s age-stratified rates of up to 23 per 1,000',
        auditFlag: 'contested',
      },
      {
        id: 'inh-a3',
        category: 'failed',
        title: 'One mutation in an enzyme the bacterium does not need',
        laymanSummary:
          'Isoniazid only works because the tuberculosis bacterium activates it. Switching off the activating enzyme makes the drug useless, and the bacterium survives fine without it. That is why resistance appears fast whenever the drug is given alone.',
        technicalDetails:
          'The label states that resistance occurs because of mutations in the katG, inhA, kasA and ahpC genes, and that "resistance in M. tuberculosis develops rapidly when isoniazid monotherapy is administered". The Indications section opens by requiring that active tuberculosis be treated with multiple concomitant medications, and adds that single-drug treatment with isoniazid or any other medication is inadequate therapy. The mechanistic reason is unusually clean: isoniazid is a prodrug activated by KatG, the mycobacterial catalase-peroxidase, and KatG is not essential for growth. A loss-of-function mutation therefore abolishes activation in one step at the cost of some oxidative fragility, which is a bargain the organism can afford inside a granuloma. Promoter mutations in inhA give lower-level resistance by overproducing the target and, unlike katG mutations, confer cross-resistance to ethionamide. Isoniazid resistance together with rifampicin resistance is the definition of multidrug-resistant tuberculosis, and the two drugs are the two whose loss the entire architecture of tuberculosis treatment exists to prevent.',
        evidenceSource:
          'Isoniazid tablets United States prescribing information, INDICATIONS AND USAGE and CLINICAL PHARMACOLOGY — Resistance',
        measuredMetric:
          'Label statement that resistance develops rapidly under isoniazid monotherapy, with the resistance genes named',
        auditFlag: 'verified',
      },
      {
        id: 'inh-a4',
        category: 'measured',
        title: 'The same tablet is a different dose in different people',
        laymanSummary:
          'Isoniazid is broken down by an enzyme whose speed is inherited. About half of some populations are slow at it and end up with higher drug levels and more side effects from the same tablet.',
        technicalDetails:
          'The label states that isoniazid is metabolised primarily by acetylation and dehydrazination, that the rate of acetylation is genetically determined, that approximately 50% of Black and Caucasian patients are slow inactivators while the majority of Inuit and East Asian populations are rapid inactivators, and — the operative sentence — that "the rate of acetylation does not significantly alter the effectiveness of isoniazid. However, slow acetylation may lead to higher blood levels of the drug and, thus, to an increase in toxic reactions." The Adverse Reactions section adds that the incidence of peripheral neuropathy, the most common toxic effect, is higher in slow inactivators. So the label describes a pharmacogenomic split that affects only the harm side of the ledger, in about half the population, and then does not recommend testing for it. This is a rare and instructive shape: a documented, common, clinically consequential genetic difference that has never been operationalised, largely because the drug is cheap, the alternative is a longer regimen, and monthly clinical review was judged sufficient.',
        evidenceSource:
          'Isoniazid tablets United States prescribing information, CLINICAL PHARMACOLOGY and ADVERSE REACTIONS — Nervous System Reactions',
        measuredMetric:
          'Acetylator status: approximately 50% slow inactivators in Black and Caucasian populations, with higher blood levels, more toxic reactions and more peripheral neuropathy but unchanged effectiveness',
        auditFlag: 'verified',
      },
      {
        id: 'inh-a5',
        category: 'measured',
        title: 'Most of the liver signal is noise, and telling them apart is the whole problem',
        laymanSummary:
          'Between one and two in every ten people taking isoniazid get a mild rise in liver enzymes that settles by itself and does not require stopping. A small number go on to real liver damage. There is no test that reliably separates them early.',
        technicalDetails:
          'The label states that mild hepatic dysfunction, evidenced by mild and transient elevation of serum transaminase levels, occurs in 10% to 20% of patients taking isoniazid, usually appearing in the first one to three months but possible at any time, and that in most cases enzyme levels return to normal with no necessity to discontinue. In occasional instances progressive liver damage occurs. The frequency of progressive damage increases with age: rare under 20, and up to 2.3% in those over 50. The label sets a threshold — consider discontinuation if AST exceeds three to five times the upper limit of normal — and then explicitly subordinates it: "Liver function tests are not a substitute for a clinical evaluation at monthly intervals or for the prompt assessment of signs or symptoms of adverse reactions." That is an unusually candid admission that the biochemical monitoring most patients associate with this drug is a poor discriminator, and that the actual safety mechanism is a monthly conversation and an instructed patient.',
        evidenceSource:
          'Isoniazid tablets United States prescribing information, boxed warning and ADVERSE REACTIONS — Hepatic Reactions',
        measuredMetric:
          'Mild transient transaminase elevation in 10% to 20% of patients; progressive liver damage rare under 20 years and up to 2.3% over 50',
        auditFlag: 'caution',
      },
      {
        id: 'inh-a6',
        category: 'conclusion_shift',
        title: 'The label is a document from a different tuberculosis era',
        laymanSummary:
          'The indications section still frames who should be treated in terms of skin-test millimetres and risk groups written in the 1990s, and still specifies twelve months for people with HIV — a duration current practice has moved away from.',
        technicalDetails:
          'The Indications and Usage section lists candidates for preventive therapy by tuberculin skin test induration thresholds — 5 mm for HIV-infected persons and close contacts, 10 mm for recent converters under 35, 15 mm for converters aged 35 and over — and states that candidates with HIV infection "should have a minimum of 12 months of therapy", and that candidates with fibrotic pulmonary lesions or silicosis should have 12 months of isoniazid or 4 months of isoniazid and rifampin concomitantly. It predates the interferon-gamma release assays now widely used instead of skin testing, the 3-month weekly isoniazid-rifapentine regimen, the 4-month rifampin regimen, and the shift away from 12-month courses in HIV. Meanwhile the WARNINGS section has been genuinely updated — severe cutaneous adverse reactions including toxic epidermal necrolysis, Stevens-Johnson syndrome, DRESS and acute generalised exanthematous pustulosis, and a cerebellar syndrome reported in postmarketing use, mostly but not only in chronic kidney disease. A label is a regulatory document maintained by amendment, not a clinical guideline, and this one shows the seams clearly enough to be worth reading as history alongside current practice.',
        evidenceSource:
          'Isoniazid tablets United States prescribing information, INDICATIONS AND USAGE and WARNINGS',
        inferredClaim:
          'That a current label describes current practice — when this one still specifies 12-month HIV preventive courses and skin-test criteria that guidelines have moved past',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'It arrives doing nothing',
        laymanDesc:
          'The tablet contains an inert molecule. It has no activity against the bacterium until the bacterium itself changes it.',
        molecularDetail:
          'Isoniazid is a prodrug: isonicotinic acid hydrazide, molecular weight 137. It is well absorbed, peaks in blood within one to two hours, and diffuses readily into all body fluids, tissues and organs including cerebrospinal, pleural and ascitic fluid, crossing the placenta and entering milk at concentrations comparable to plasma.',
        iconName: 'Package',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The bacterium activates its own poison',
        laymanDesc:
          'An enzyme the tuberculosis bacterium uses to protect itself from oxidation converts the drug into a reactive form.',
        molecularDetail:
          'The mycobacterial catalase-peroxidase KatG oxidises isoniazid to an isonicotinoyl radical, which couples with NAD+ to form an isonicotinoyl-NAD adduct. Activation happens only inside the organism, which is why the drug is inert in human tissue.',
        iconName: 'Sparkles',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The adduct jams the wax factory',
        laymanDesc:
          'The activated molecule locks onto the enzyme that builds the long fatty acids of the bacterium’s waxy coat.',
        molecularDetail:
          'The isonicotinoyl-NAD adduct inhibits InhA, the NADH-dependent enoyl-ACP reductase of fatty acid synthase II, halting elongation of the very long-chain fatty acids from which mycolic acids are assembled. The label states that isoniazid inhibits the synthesis of mycolic acids, an essential component of the bacterial cell wall.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Growing bacteria die; dormant ones do not',
        laymanDesc:
          'Cells that are actively building their coat cannot survive without it. Cells that are barely alive and building nothing are largely unaffected.',
        molecularDetail:
          'The label describes isoniazid as bactericidal at therapeutic levels against actively growing intracellular and extracellular Mycobacterium tuberculosis. Its early bactericidal activity is the highest of the first-line drugs and its sterilising activity against non-replicating persisters is poor — which is why rifampin and pyrazinamide, not isoniazid, are what shortened treatment.',
        iconName: 'Activity',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Your own enzyme decides your exposure',
        laymanDesc:
          'The liver removes the drug at a speed set by inherited genetics. Slow removers carry higher levels and get more side effects from the same tablet.',
        molecularDetail:
          'Metabolism is by acetylation and dehydrazination at a genetically determined rate; the label puts roughly 50% of Black and Caucasian patients in the slow inactivator group and most Inuit and East Asian populations in the rapid group. Acetylation rate does not significantly alter effectiveness, but slow acetylation raises blood levels and toxic reactions, including peripheral neuropathy.',
        iconName: 'Filter',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And one mutation ends it',
        laymanDesc:
          'Because the drug depends on a bacterial enzyme the bacterium can live without, switching that enzyme off makes the drug useless in a single step.',
        molecularDetail:
          'Loss-of-function katG mutations abolish activation and confer high-level resistance; inhA promoter mutations overproduce the target and give lower-level resistance with ethionamide cross-resistance. The label states resistance develops rapidly under monotherapy and names katG, inhA, kasA and ahpC.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'IUAT trial of isoniazid preventive therapy durations (Bull World Health Organ 1982;60:555-564)',
        phase: 'Randomised, placebo-controlled, multicentre, five-year follow-up',
        sampleSize: 28000,
        primaryEndpoint:
          'Incidence of tuberculosis over five years in persons with fibrotic pulmonary lesions, after 12, 24 or 52 weeks of isoniazid against placebo',
        endpointMet: true,
        statisticalPValue:
          'Against placebo, 12 weeks eliminated less than one-third of tuberculosis risk and 24 weeks two-thirds (a 65% reduction). Fifty-two weeks prevented the most tuberculosis. Hepatitis occurred in 0.5% of isoniazid recipients against 0.1% of placebo recipients',
        unreportedAdverseSignals:
          'Nine months — the duration most widely recommended in later United States guidelines — was not one of the arms. The trial’s own harm-benefit analysis favoured 24 weeks: it prevented more tuberculosis cases per case of hepatitis caused, and moving from 52 to 24 weeks was estimated to reduce hepatitis by a third while increasing tuberculosis by 40%.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'Nolan CM et al., seven-year prospective survey of isoniazid hepatotoxicity (JAMA 1999;281:1014-1018)',
        phase: 'Prospective cohort study in a public health tuberculosis clinic',
        sampleSize: 11141,
        primaryEndpoint:
          'Rate of clinically apparent hepatotoxicity among consecutive patients starting isoniazid preventive therapy under current guidelines',
        endpointMet: true,
        statisticalPValue:
          '11 patients (0.10% of those starting, 0.15% of those completing) had hepatotoxic reactions. Rate increased with age (chi-square for linear trend 5.22, p=0.02); non-significant trends toward higher rates in women (OR 3.30, 95% CI 0.87 to 12.45) and white patients (OR 2.60, 95% CI 0.75 to 8.95)',
        unreportedAdverseSignals:
          'Observational and single-centre, in a clinic operating monthly symptom review — so it measures hepatotoxicity under good monitoring rather than hepatotoxicity in general. The label’s far higher age-stratified figures, drawn from 1970s surveillance, remain the ones printed in the boxed warning.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId:
          'Menzies D et al., 4 months of rifampin against 9 months of isoniazid for latent tuberculosis (N Engl J Med 2018;379:440-453; NCT00931736)',
        phase: 'Phase 3, open-label, randomised, non-inferiority, nine countries',
        sampleSize: 6859,
        primaryEndpoint:
          'Confirmed active tuberculosis within 28 months, against a non-inferiority margin of 0.75 percentage points',
        endpointMet: true,
        statisticalPValue:
          'Rate difference below 0.01 cases per 100 person-years (95% CI −0.14 to 0.16); rifampin not superior. Treatment completion 15.1 percentage points higher with rifampin (95% CI 12.7 to 17.4); grade 3 to 5 hepatotoxic events 1.2 percentage points lower (95% CI 0.7 to 1.7)',
        unreportedAdverseSignals:
          'This is the trial in which the nine-month isoniazid regimen was the comparator — and it is the first head-to-head evidence that a well person is substantially more likely to finish four months of a different drug than nine months of this one. Only 17 tuberculosis cases occurred across roughly 15,384 person-years.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Twenty-four weeks of isoniazid eliminated two-thirds of tuberculosis risk and 12 weeks less than one-third, against placebo, in 28,000 people followed five years',
        'Hepatitis in 0.5% of isoniazid recipients against 0.1% of placebo recipients in that trial',
        'Eleven hepatotoxic reactions among 11,141 patients (0.10%) starting preventive therapy under monitored modern practice',
        'Mild transient transaminase elevation in 10% to 20% of patients, and progressive liver damage in up to 2.3% of those over 50',
      ],
      unsupportedInferences: [
        'That nine months is the correct preventive duration, a value interpolated between the 24-week and 52-week arms of a trial that randomised neither',
        'That the boxed warning’s 1970s age-stratified hepatitis rates describe risk under current monitoring, when a prospective cohort of 11,141 measured a tenth of them',
        'That the label describes current practice, when it still specifies 12-month preventive courses in HIV and pre-dates interferon-gamma release assays and the short rifamycin regimens',
        'That biochemical monitoring is the safety mechanism, when the label states liver function tests are not a substitute for monthly clinical evaluation',
      ],
      whatFailedInitially: [
        'Monotherapy for active tuberculosis: the label states it is inadequate therapy and that resistance develops rapidly',
        'Twelve weeks of preventive therapy, which eliminated less than a third of the risk and was abandoned',
        'Fifty-two weeks on a harm-benefit basis: it prevented the most tuberculosis and fewer cases per case of hepatitis caused than 24 weeks',
        'Completion: in the head-to-head trial, 15.1 percentage points fewer people finished nine months of isoniazid than four months of rifampin',
      ],
      realWorldOutcome: [
        'On the market since 1952, on the WHO Model List of Essential Medicines, and still the highest early bactericidal activity of any first-line tuberculosis drug',
        'Isoniazid resistance combined with rifampicin resistance is the definition of multidrug-resistant tuberculosis',
        'Displaced as the default latent-infection regimen in several national guidelines by shorter rifamycin-containing courses, on completion and tolerability rather than efficacy',
        'Priced at US$3.49 per unit on the United States acquisition survey — about five times rifampin — for one of the simplest molecules in the pharmacopoeia',
      ],
    },
    deliverySystem: {
      type: 'Oral tablets and oral solution; also available for intramuscular injection',
      description:
        'Peak blood levels occur within one to two hours of an oral dose and decline to 50% or less within six hours. The drug diffuses readily into all body fluids — cerebrospinal, pleural and ascitic — and into tissues, organs and excreta including saliva, sputum and faeces, and passes the placenta and into milk at concentrations comparable to plasma. Between 50% and 70% of a dose is excreted in urine within 24 hours. Metabolism is by acetylation and dehydrazination at a genetically determined rate.',
      safetyProfile:
        'Boxed warning for severe and sometimes fatal hepatitis, which may develop even after many months of treatment, with risk rising with age and with daily alcohol consumption; the label directs monthly clinical review for all patients and baseline plus periodic AST and ALT for those aged 35 and over. Peripheral neuropathy is the most common toxic effect, dose-related and more frequent in slow inactivators and the malnourished. Severe cutaneous adverse reactions including toxic epidermal necrolysis, Stevens-Johnson syndrome, DRESS and acute generalised exanthematous pustulosis have been reported and require immediate discontinuation. A cerebellar syndrome — gait, trunk and limb ataxia, dysmetria, intention tremor, dysarthria or nystagmus — has been reported in postmarketing use, mostly but not exclusively in chronic kidney disease. Other reported reactions include convulsions, toxic encephalopathy, optic neuritis and atrophy, agranulocytosis and haemolytic, sideroblastic or aplastic anaemia, pyridoxine deficiency, pellagra, and a lupus-like syndrome.',
    },
    commonQuestions: [
      {
        q: 'Why nine months?',
        a: 'That is the interesting question, because no trial tested nine months. The large placebo-controlled trial that underpins isoniazid preventive therapy followed 28,000 people for five years after 12, 24 or 52 weeks of treatment. Twenty-four weeks eliminated about two-thirds of the tuberculosis risk; 52 weeks prevented the most disease overall but caused more hepatitis per case of tuberculosis prevented. Nine months is a compromise between the two tested arms, adopted by inference. It is a defensible inference. It is also the reason it is worth knowing that the recommendation you are given sits between the arms rather than on one, and that the trial’s own analysis favoured the shorter one on harm-benefit grounds.',
        auditNote:
          'Duration is not a detail in preventive therapy — it is the main determinant of whether a well person finishes the course, and the head-to-head trial found 15 percentage points more people completed four months of rifampin than nine months of this.',
      },
      {
        q: 'How likely is it to damage my liver?',
        a: 'Less likely than the label implies, and not negligible. The boxed warning gives rates rising with age to 23 per 1,000 for people aged 50 to 64, taken from surveillance in the 1970s. A prospective study of 11,141 consecutive patients treated under modern monitoring found 11 hepatotoxic reactions — 0.10% of those who started. The difference comes from tighter diagnostic criteria, better patient selection, monthly symptom review and stopping the drug on symptoms rather than waiting on blood tests. Separately, 10% to 20% of people get a mild transient rise in liver enzymes that settles on its own and does not require stopping. The two things are different, and telling them apart early is the actual clinical problem.',
      },
      {
        q: 'Do the blood tests keep me safe?',
        a: 'Partly, and the label is unusually blunt about the limit. It directs baseline and periodic AST and ALT for people aged 35 and over, sets a threshold at three to five times the upper limit of normal, and then states outright that "liver function tests are not a substitute for a clinical evaluation at monthly intervals or for the prompt assessment of signs or symptoms of adverse reactions occurring between regularly scheduled evaluations". In other words the safety mechanism is a monthly conversation and a patient who knows which symptoms to report — loss of appetite, nausea, vomiting, dark urine, yellow eyes, persistent tiredness, fever over three days, right-sided abdominal tenderness — not the blood test.',
      },
      {
        q: 'Why do some people get nerve tingling and others do not?',
        a: 'Largely because of an inherited difference in how fast the liver clears the drug. Isoniazid is removed by acetylation at a genetically determined rate, and the label puts roughly half of Black and Caucasian patients in the slow group while most Inuit and East Asian populations are fast. Slow acetylators carry higher blood levels from the same tablet and, the label says, have a higher incidence of peripheral neuropathy — the most common toxic effect, which usually begins as pins and needles in the feet and hands. The label also states that acetylation rate does not significantly change how well the drug works. So it is a difference that affects harm and not benefit, in about half the population, and it is not routinely tested for.',
      },
      {
        q: 'Why can it not be used alone for active tuberculosis?',
        a: 'Because resistance takes one mutation in a gene the bacterium can spare. Isoniazid is inert until the tuberculosis organism activates it, using its own catalase-peroxidase enzyme KatG. A bacterium that loses KatG loses the ability to activate the drug and survives perfectly well without it, so a single loss-of-function mutation produces high-level resistance. The label says this directly: resistance develops rapidly when isoniazid monotherapy is administered, and single-drug treatment of active tuberculosis with isoniazid or any other medication is inadequate therapy. Preventive therapy in latent infection is a different situation — the bacterial population is tiny, so the resistant mutant is usually not there to select.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'International Union Against Tuberculosis Committee on Prophylaxis. Efficacy of various durations of isoniazid preventive therapy for tuberculosis: five years of follow-up in the IUAT trial. Bull World Health Organ 1982;60(4):555-564',
        identifier: '6754120',
        kind: 'pmid',
      },
      {
        label:
          'Nolan CM, Goldberg SV, Buskin SE. Hepatotoxicity associated with isoniazid preventive therapy: a 7-year survey from a public health tuberculosis clinic. JAMA 1999;281:1014-1018',
        identifier: '10.1001/jama.281.11.1014',
        kind: 'doi',
      },
      {
        label:
          'Menzies D, Adjobimey M, Ruslami R, et al. Four months of rifampin or nine months of isoniazid for latent tuberculosis in adults. N Engl J Med 2018;379:440-453',
        identifier: '10.1056/NEJMoa1714283',
        kind: 'doi',
      },
      {
        label:
          'Isoniazid tablets, USP — United States prescribing information (boxed warning, Indications and Usage, Warnings, Clinical Pharmacology including Mechanism of Action and Resistance, Adverse Reactions)',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=f0b46d1d-2300-457d-a7bd-a88a3f8d2235',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 3767 — isoniazid canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3767',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 7. Ethambutol — a label that contraindicates it in young children while the world gives it to
  //    them, and a mechanism sentence written before anyone knew what the drug did.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'ethambutol',
    name: 'Ethambutol',
    tradeName: 'Myambutol',
    sponsor:
      'Lederle Laboratories (originator; ethambutol emerged from a screening programme in the early 1960s). The United States application holder on this record is Kanchan Healthcare; the drug is generic and made worldwide',
    targetGene:
      'embA and embB, the translationally coupled genes encoding the mycobacterial arabinosyl transferase, with embR as an adjacent regulator. Resistance is overwhelmingly embB point mutation',
    targetProtein:
      'The EmbAB arabinosyl transferase, which polymerises arabinose into the arabinan of cell-wall arabinogalactan. The drug’s own label does not name it',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1967,
    indication:
      'Treatment of pulmonary tuberculosis, in conjunction with at least one other antituberculosis drug. The label states it should not be used as the sole antituberculous drug, in initial treatment or in retreatment',
    patientFriendlyIndication: 'Tuberculosis of the lungs, always alongside other drugs',
    anatomicalSite:
      'The mycobacterial cell envelope, at the arabinosyl transferase that builds the arabinan scaffold. The toxicity site is the optic nerve',
    conditionContext: {
      conditionExplainer:
        'The tuberculosis bacterium survives inside human cells because of an extraordinary cell envelope: a lattice of sugars, arabinogalactan, anchoring a waxy outer layer of mycolic acids. Isoniazid attacks the wax. Ethambutol attacks the sugar scaffold the wax is attached to.',
      whyItMatters:
        'Ethambutol is the fourth drug in the standard four-drug tuberculosis regimen, and its job is not what most people assume. It contributes relatively little to cure. It is there as insurance — to stop unrecognised isoniazid resistance from turning the regimen into effective rifampin monotherapy while the susceptibility result is pending.',
      whoTakesThis:
        'Almost everyone starting treatment for tuberculosis, for the first two months, unless isoniazid resistance is known to be very unlikely. Also used long-term in Mycobacterium avium complex disease.',
      clinicalGoals:
        'Preventing the amplification of resistance during the intensive phase, and contributing to bacterial killing. The measurable endpoint associated with the drug alone is dose-related, and so is the harm.',
    },
    oneSentenceVerdict:
      'The fourth drug in the tuberculosis regimen, whose efficacy and whose blindness sit on the same dose axis — over 40% of adults developed ocular toxicity above 50 mg/kg against 0% to 3% at 15 mg/kg, while 25 mg/kg outperformed 15 mg/kg on efficacy — and whose United States label contraindicates it outright in anyone unable to report visual change, including young children, while a review of 3,811 treated children found ethambutol stopped for possible ocular toxicity in two of them.',
    laymanHowItWorks:
      'The tuberculosis bacterium builds its armour in layers: a scaffold of linked sugars with a waxy coat bolted onto it. Ethambutol blocks the enzyme that assembles the sugar scaffold, so the whole structure cannot be completed and the wall becomes leaky — which also lets the other drugs in more easily. The problem is that the same molecule, at higher doses, damages the optic nerve, and the higher the dose the better it works. Almost everything about how this drug is used is an attempt to sit on the right point of that single line.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 67,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.4575 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 6 listed products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'On the market since 1967, long generic, and on the WHO Model List of Essential Medicines. Only six products carry a NADAC acquisition price, which is a thin base for a drug taken by a large fraction of everyone treated for tuberculosis worldwide. It is a small, symmetrical, achiral-looking molecule that is in fact a single stereoisomer, and the stereochemistry is the expensive part of making it.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Ethambutol occupies a slot rather than a role, and the slot has been filled by other things. Streptomycin was the original occupant and the rifampin label still names it as the alternative fourth drug. Moxifloxacin replaced it in the four-month regimen that became the first successful shortening of tuberculosis treatment in four decades. And where isoniazid resistance is known to be very unlikely, the drug’s own regimen guidance contemplates leaving the fourth drug out entirely. Nothing sold as a food or supplement treats a bacterial infection, and the naturalFoods list on this page is empty for that reason.',
      conventionalRx: [
        {
          name: 'Streptomycin',
          class: 'Aminoglycoside',
          howItCompares:
            'The alternative fourth drug named in the rifampin label: the Advisory Council for the Elimination of Tuberculosis, the American Thoracic Society and the CDC recommend that either streptomycin or ethambutol be added as a fourth drug to isoniazid, rifampin and pyrazinamide unless the likelihood of isoniazid resistance is very low.',
          typicalCost:
            'Not stated: no verified CMS acquisition price for streptomycin was held on this record at the time of writing',
          prosAndCons:
            'Pros: no ocular toxicity. Cons: injection only, and it carries the full aminoglycoside boxed-warning profile of irreversible hearing loss and nephrotoxicity — which is why ethambutol displaced it.',
        },
        {
          name: 'Moxifloxacin, within a rifapentine-based four-month regimen',
          class: 'Fluoroquinolone',
          howItCompares:
            'In the trial that produced the first successful shortening of drug-susceptible tuberculosis treatment in about forty years, ethambutol was replaced by moxifloxacin and rifampin by rifapentine. Among 2,516 randomised participants, that regimen was non-inferior to the standard six-month regimen: 15.5% against 14.6% unfavourable outcomes in the microbiologically eligible population, difference 1.0 percentage point (95% CI −2.6 to 4.5).',
          typicalCost:
            'Not stated: no verified CMS acquisition price for moxifloxacin was held on this record at the time of writing',
          prosAndCons:
            'Pros: enables a four-month regimen; no optic neuritis. Cons: fluoroquinolone class warnings including tendinopathy and QT prolongation; fluoroquinolones are also the backbone of drug-resistant tuberculosis treatment, so using them first-line has a resistance cost.',
        },
        {
          name: 'Omitting the fourth drug where isoniazid resistance is very unlikely',
          class: 'Three-drug intensive phase',
          howItCompares:
            'The rifampin label states the rule explicitly: "If community rates of INH resistance are currently less than 4%, an initial treatment regimen with less than four drugs may be considered", and that the need for a fourth drug should be reassessed once susceptibility results are known.',
          typicalCost: 'No cost, and no optic neuritis',
          prosAndCons:
            'Pros: removes an ocular risk that contributes little to cure. Cons: depends on knowing the local resistance rate, and on susceptibility testing arriving in time.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Check each eye separately, and check colour',
          action:
            'Cover one eye at a time when reading something, and mention any change in how red looks, or any blurred patch in the middle of vision.',
          patientImpact:
            'The label states the change in visual acuity may be unilateral or bilateral, so each eye must be tested separately and both together. Optic neuropathy may present as decreased acuity, scotoma, colour blindness or a visual field defect, and these have been reported even without a formal diagnosis of optic or retrobulbar neuritis.',
          clinicalPrecaution:
            'The label directs visual acuity testing before starting and periodically during treatment, and monthly when the dose exceeds 15 mg/kg per day. Whether and how often that happens is a clinical arrangement this page does not prescribe.',
        },
        {
          name: 'Antacids and this tablet do not sit well together',
          action: 'Mention any aluminium-containing antacid.',
          patientImpact:
            'The label records a study in 13 patients with tuberculosis in which co-administration of an aluminium hydroxide antacid with ethambutol at 50 mg/kg reduced mean serum concentrations by about 20% and urinary excretion by about 13%, suggesting reduced oral absorption.',
          clinicalPrecaution:
            'Food, by contrast, does not significantly alter absorption according to the same label. What to do about an interaction is a prescribing decision.',
        },
        {
          name: 'Kidney function sets the dose here',
          action: 'Make sure recent kidney function is known before starting.',
          patientImpact:
            'The label states that patients with decreased renal function need the dosage reduced, since the main path of excretion is the kidney, and notes that marked accumulation has been demonstrated in renal insufficiency, while no accumulation occurs with 25 mg/kg daily in patients with normal kidney function.',
          clinicalPrecaution:
            'Because the ocular toxicity is dose- and duration-related, accumulation in renal impairment moves a patient along the toxicity axis without any change in the prescribed dose.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC[C@@H](CO)NCCN[C@@H](CC)CO',
      chemicalFormula: 'C10H24N2O2',
      molecularWeight:
        '204.31 g/mol (free base); dispensed as the dihydrochloride, which the label gives as C10H24N2O2 • 2HCl at molecular weight 277.23',
      targetReceptorAffinity:
        'Ethambutol is a small symmetrical diamine with two stereocentres, and only one of the three possible stereoisomers is the drug. The label names it as the (+) isomer — "(+)-2,2′-(ethylenediimino)-di-1-butanol dihydrochloride" — and the primary literature describes the antimycobacterial compound as dextro-2,2′-(ethylenediimino)-di-1-butanol. The meso form and the (−) enantiomer are far less active, so the manufacturing problem for this otherwise trivial molecule is entirely a stereochemical one. Its molecular target is the EmbAB arabinosyl transferase, identified in 1996 by showing that the translationally coupled embA and embB genes are necessary and sufficient to confer ethambutol resistance in a copy-number-dependent manner, and that overexpression of embAB produces high-level ethambutol-resistant arabinosyl transferase activity in a cell-free arabinan biosynthesis assay. The United States label, unchanged in substance since the 1960s, says only that the drug "appears to inhibit the synthesis of one or more metabolites, thus causing impairment of cell metabolism, arrest of multiplication, and cell death". Erythrocyte concentrations reach about twice plasma and hold that ratio through 24 hours; roughly 50% of a dose is excreted unchanged in urine within 24 hours with 8% to 15% as metabolites, and 20% to 22% appears unchanged in faeces.',
      structureSource: {
        label:
          'PubChem CID 14052 (ethambutol) — canonical SMILES, molecular formula and weight, as carried on the enriched record; dihydrochloride weight, stereochemical designation and pharmacokinetics from the ethambutol hydrochloride tablets United States label, DESCRIPTION and CLINICAL PHARMACOLOGY',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/14052',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'emb-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Resolve the meso impurity from the active isomer',
          description:
            'Ethambutol has two identical stereocentres, which gives three stereoisomers: the (+) and (−) enantiomers and an achiral meso form. Only the (+) isomer is the drug. Because all three have identical mass, identical formula and near-identical ordinary chromatographic behaviour, a conventional assay counts the meso form as product. This is the release test that actually matters for potency.',
          reagentsAndBuffer:
            'Ethambutol hydrochloride reference standard, chiral HPLC or derivatisation with a chiral reagent followed by reversed-phase separation, optical rotation measurement against a specified range, Karl Fischer titration',
        },
        {
          id: 'emb-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Join two chiral aminobutanol units through an ethylene bridge',
          description:
            'The molecule is two (S)-2-amino-1-butanol units linked by a two-carbon bridge. The chemistry is short; the difficulty is obtaining the aminobutanol in high enantiomeric purity, because racemic starting material produces a statistical mixture in which half the product is the inactive meso compound.',
          dependsOnStepId: 'emb-w1',
          reagentsAndBuffer:
            '(S)-2-amino-1-butanol of specified enantiomeric excess, 1,2-dichloroethane or ethylene dibromide as the bridging electrophile, base, hydrogen chloride for salt formation',
        },
        {
          id: 'emb-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise the dihydrochloride and specify the optical rotation',
          description:
            'The dihydrochloride is crystallised to a specified optical rotation, which is the practical surrogate for stereochemical purity in a compendial setting. The label reports the salt as C10H24N2O2 • 2HCl at molecular weight 277.23, so a milligram of tablet is about 74% ethambutol base — a conversion that matters when a dose is expressed per kilogram.',
          dependsOnStepId: 'emb-w2',
          reagentsAndBuffer:
            'Recrystallisation from aqueous ethanol, hydrogen chloride, polarimetry against a specified rotation range, dissolution testing on the film-coated tablet',
        },
        {
          id: 'emb-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Show the target by gene dosage, not by inference',
          description:
            'The identification of the arabinosyl transferase as the target was done by selection rather than assumption: cloning the emb region into a susceptible Mycobacterium smegmatis host made it resistant, resistance depended on gene copy number, and a cell-free arabinan biosynthesis assay showed that embAB overexpression produced ethambutol-resistant transferase activity. This is the experiment the label never absorbed.',
          dependsOnStepId: 'emb-w3',
          reagentsAndBuffer:
            'Mycobacterium smegmatis host with multicopy plasmid carrying embR, embA and embB, cell-free arabinan biosynthesis assay with radiolabelled decaprenylphosphoryl arabinose donor, copy-number quantification, embB sequencing of resistant clinical isolates',
        },
        {
          id: 'emb-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Plot efficacy and optic toxicity on the same dose axis',
          description:
            'The defining property of this drug is that its benefit and its blindness are both dose-related. Any honest evaluation therefore has to report both on the same axis rather than reporting efficacy at one dose and toxicity at another. The published dose-response is explicit: 15 mg/kg outperformed 6 mg/kg and 25 mg/kg outperformed 15 mg/kg, while ocular toxicity ran above 40% at doses over 50 mg/kg and between 0% and 3% at 15 mg/kg daily.',
          dependsOnStepId: 'emb-w4',
          reagentsAndBuffer:
            'Dose-ranging early bactericidal activity measurement by serial sputum colony counts, paired Snellen acuity, colour discrimination and finger perimetry at each dose level, population pharmacokinetic sampling to relate exposure rather than dose to both endpoints',
        },
      ],
    },
    keyAudits: [
      {
        id: 'emb-a1',
        category: 'failed',
        title: 'Efficacy and blindness are the same line',
        laymanSummary:
          'Ethambutol works better the higher the dose, and damages the optic nerve more the higher the dose. Above 50 mg/kg, more than four in ten adults developed eye toxicity. At 15 mg/kg it was between none and three in a hundred — and 25 mg/kg worked better than 15.',
        technicalDetails:
          'Donald and colleagues reviewed the published evidence on ethambutol dosage, toxicity and pharmacokinetics from 1961 onward. The efficacy finding: ethambutol has a dose-related efficacy, best seen when given to adults alone or with a single other drug; together with isoniazid, 15 mg/kg gave better results than 6 mg/kg, and 25 mg/kg better than 15 mg/kg. The toxicity finding, on the same axis: ocular toxicity occurred in more than 40% of adults at doses above 50 mg/kg and in 0% to 3% at 15 mg/kg daily. The label operationalises this without naming it — the initial treatment dose is 15 mg/kg, retreatment is 25 mg/kg for 60 days and then reduced to 15 mg/kg, and monthly eye examinations are advised specifically during the 25 mg/kg period. It also warns that the effect may be related to dose and duration, is generally reversible if the drug is stopped promptly, and that irreversible blindness has been reported. There is no dose at which the drug is fully effective and fully safe; the entire dosing scheme is a chosen point on one curve, and the label does not present it that way.',
        evidenceSource:
          'Donald PR, Maher D, Maritz JS, Qazi S. Ethambutol dosage for the treatment of children: literature review and recommendations. Int J Tuberc Lung Dis 2006;10:1318-1330; ethambutol hydrochloride tablets United States prescribing information, WARNINGS, ADVERSE REACTIONS and DOSAGE AND ADMINISTRATION',
        measuredMetric:
          'Dose-related efficacy (25 mg/kg > 15 mg/kg > 6 mg/kg) against dose-related ocular toxicity (>40% above 50 mg/kg, 0% to 3% at 15 mg/kg daily)',
        auditFlag: 'caution',
      },
      {
        id: 'emb-a2',
        category: 'conclusion_shift',
        title: 'Contraindicated in young children, and given to them everywhere',
        laymanSummary:
          'The United States label contraindicates ethambutol in anyone who cannot report a change in vision, naming young children explicitly, and says it is not recommended under 13. A review of 3,811 children given it found it was stopped for possible eye toxicity in two of them.',
        technicalDetails:
          'The label’s CONTRAINDICATIONS read: "Ethambutol hydrochloride is contraindicated in patients who are unable to appreciate and report visual side effects or changes in vision (e.g., young children, unconscious patients)." The PRECAUTIONS add that it is not recommended in paediatric patients under 13 years of age since safe conditions for use have not been established. The Donald review assembled the paediatric data: in only 2 of 3,811 children (0.05%) receiving ethambutol at 15 to 30 mg/kg was the drug stopped because of possible ocular toxicity, and it concluded that children of all ages can be given daily doses of 20 mg/kg (range 15 to 25) and thrice-weekly intermittent doses of 30 mg/kg without undue concern. It also identified the pharmacokinetic reason the older fear was misdirected: peak serum concentrations rise with dose but are significantly lower in children receiving the same milligram-per-kilogram dosage than in adults. The World Health Organization recommends ethambutol in the intensive phase for children. So the drug is contraindicated by its United States label in a population that international guidance treats routinely, on evidence the label has never incorporated — a discrepancy of nearly two decades standing between a regulatory document and the practice of tuberculosis care.',
        evidenceSource:
          'Donald PR, Maher D, Maritz JS, Qazi S. Ethambutol dosage for the treatment of children: literature review and recommendations. Int J Tuberc Lung Dis 2006;10:1318-1330; ethambutol hydrochloride tablets United States prescribing information, CONTRAINDICATIONS and PRECAUTIONS',
        measuredMetric:
          'Ethambutol discontinued for possible ocular toxicity in 2 of 3,811 children receiving 15 to 30 mg/kg, against a label contraindication in young children',
        auditFlag: 'contested',
      },
      {
        id: 'emb-a3',
        category: 'inferred',
        title: 'The label’s mechanism sentence describes nothing, thirty years after the answer',
        laymanSummary:
          'The prescribing information says ethambutol "appears to inhibit the synthesis of one or more metabolites". The actual target — the enzyme that builds the sugar scaffold of the bacterial wall — was identified in 1996 and never made it onto the label.',
        technicalDetails:
          'The CLINICAL PHARMACOLOGY section states: "Ethambutol hydrochloride diffuses into actively growing Mycobacterium cells such as tubercle bacilli. Ethambutol hydrochloride appears to inhibit the synthesis of one or more metabolites, thus causing impairment of cell metabolism, arrest of multiplication, and cell death." That sentence is compatible with almost any antibacterial mechanism and identifies no target. Belanger and colleagues resolved the question in 1996: cloning the Mycobacterium avium emb region rendered a susceptible Mycobacterium smegmatis host resistant; the translationally coupled embA and embB genes proved necessary and sufficient for the resistant phenotype in a gene-copy-number-dependent way; and an ethambutol-sensitive cell-free assay for arabinan biosynthesis showed that overexpression of embAB produced high-level ethambutol-resistant arabinosyl transferase activity. The drug inhibits the arabinosyl transferase that polymerises arabinose into the arabinan of cell-wall arabinogalactan. Clinical resistance is now known to be predominantly embB point mutation, and the label’s Resistance paragraph — which says only that resistance develops "in a step-like manner" and "has been unpredictable" — never names the gene. Rapid molecular resistance testing depends on knowing which gene to sequence, so the gap is not merely cosmetic.',
        evidenceSource:
          'Belanger AE, Besra GS, Ford ME, et al. The embAB genes of Mycobacterium avium encode an arabinosyl transferase involved in cell wall arabinan biosynthesis that is the target for the antimycobacterial drug ethambutol. Proc Natl Acad Sci USA 1996;93:11919-11924; ethambutol hydrochloride tablets United States prescribing information, CLINICAL PHARMACOLOGY',
        doi: '10.1073/pnas.93.21.11919',
        inferredClaim:
          'That a current label states the current understanding of a drug’s mechanism — when this one still offers a 1960s formulation that names no target, three decades after the arabinosyl transferase was identified and the resistance gene sequenced',
        auditFlag: 'caution',
      },
      {
        id: 'emb-a4',
        category: 'inferred',
        title: 'It is in the regimen as insurance, not as a contributor',
        laymanSummary:
          'The fourth drug in the tuberculosis regimen is there mainly to stop unrecognised resistance to isoniazid from quietly turning the treatment into rifampin alone. Where isoniazid resistance is rare enough, the guidance says the fourth drug can be left out.',
        technicalDetails:
          'The rifampin label sets out the standard architecture and the reason for it: a three-drug intensive phase of rifampin, isoniazid and pyrazinamide, with the Advisory Council for the Elimination of Tuberculosis, the American Thoracic Society and the CDC recommending that either streptomycin or ethambutol be added as a fourth drug "unless the likelihood of INH resistance is very low", the need for the fourth drug to be reassessed when susceptibility results are known, and the explicit statement that "if community rates of INH resistance are currently less than 4%, an initial treatment regimen with less than four drugs may be considered". The ethambutol label supplies the mechanism of that insurance from its own side: "Ethambutol hydrochloride has reduced the incidence of the emergence of mycobacterial resistance to isoniazid when both drugs have been used concurrently." So the fourth drug’s stated job is resistance protection during a window of diagnostic uncertainty, and its removal is contemplated in the guidance once that uncertainty resolves. It is a real job. It is not the job most people assume a drug in a regimen is doing, and the difference matters when weighing an ocular risk.',
        evidenceSource:
          'Rifampin capsules United States prescribing information, INDICATIONS AND USAGE — Tuberculosis; ethambutol hydrochloride tablets United States prescribing information, CLINICAL PHARMACOLOGY',
        inferredClaim:
          'That every drug in a combination regimen contributes proportionally to cure — when the fourth drug’s documented role is preventing resistance amplification during a period of diagnostic uncertainty',
        auditFlag: 'caution',
      },
      {
        id: 'emb-a5',
        category: 'conclusion_shift',
        title: 'Its slot in the regimen has now been successfully filled by something else',
        laymanSummary:
          'The first shortening of standard tuberculosis treatment in about forty years replaced ethambutol with moxifloxacin, and rifampin with rifapentine. That four-month regimen matched the standard six-month one across 2,516 randomised patients.',
        technicalDetails:
          'Study 31/A5349 was an open-label phase 3 trial in 13 countries comparing two four-month rifapentine-based regimens against the standard six-month regimen of rifampin, isoniazid, pyrazinamide and ethambutol, with a non-inferiority margin of 6.6 percentage points and a primary outcome of survival free of tuberculosis at 12 months. Of 2,516 randomised, 2,343 were microbiologically eligible. The regimen in which rifampin was replaced by rifapentine and ethambutol by moxifloxacin was non-inferior in the microbiologically eligible population (15.5% against 14.6% unfavourable outcomes; difference 1.0 percentage point, 95% CI −2.6 to 4.5) and in the assessable population (11.6% against 9.6%; difference 2.0 percentage points, 95% CI −1.1 to 5.1). The regimen substituting rifapentine but keeping ethambutol was not shown to be non-inferior in either population — 17.7% against 14.6% in the microbiologically eligible population (difference 3.0 percentage points, 95% CI −0.6 to 6.6). Grade 3 or higher adverse events on treatment occurred in 19.3% of the control group, 18.8% of the rifapentine-moxifloxacin group and 14.3% of the rifapentine group. Read carefully, that is a result about the fluoroquinolone as much as about the rifamycin — and the arm that kept ethambutol is the one that failed to demonstrate non-inferiority.',
        evidenceSource:
          'Dorman SE, Nahid P, Kurbatova EV, et al. Four-month rifapentine regimens with or without moxifloxacin for tuberculosis. N Engl J Med 2021;384:1705-1718 (NCT02410772)',
        doi: '10.1056/NEJMoa2033400',
        measuredMetric:
          'Unfavourable outcome at 12 months, four-month rifapentine-moxifloxacin regimen against the standard six-month ethambutol-containing regimen, in 2,516 randomised participants',
        auditFlag: 'verified',
      },
      {
        id: 'emb-a6',
        category: 'measured',
        title: 'The label’s own eye test admits it cannot tell signal from noise',
        laymanSummary:
          'The prescribing information prints a table of how many lines of a Snellen chart a patient must drop before the change counts — because tuberculosis patients not taking ethambutol routinely fluctuate by one or two lines anyway.',
        technicalDetails:
          'The ADVERSE REACTIONS section carries a table pairing initial Snellen readings with the reading that would indicate a significant decrease, and states the reason: "Studies have shown that there are definite fluctuations of one or two lines of the Snellen chart in the visual acuity of many tuberculous patients not receiving ethambutol hydrochloride." Changes smaller than the tabulated threshold may be due to chance variation, limitations of the testing method or physiological variability; changes equalling or exceeding it indicate retesting and careful evaluation. The label adds further confounders: corrective glasses must be worn during testing, a refractive error may develop over one to two years of therapy and must be corrected, and testing through a pinhole eliminates refractive error. In patients with cataracts, recurrent inflammatory eye conditions, existing optic neuritis or diabetic retinopathy, the evaluation of change is more difficult still. This is an unusually honest piece of labelling: it publishes the noise floor of its own monitoring test, and the noise floor is not small relative to the signal it is looking for.',
        evidenceSource:
          'Ethambutol hydrochloride tablets United States prescribing information, ADVERSE REACTIONS and PRECAUTIONS',
        measuredMetric:
          'Baseline variability of one to two Snellen lines in tuberculosis patients not receiving ethambutol, against the threshold used to detect drug-induced change',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'One of three near-identical molecules is the drug',
        laymanDesc:
          'Ethambutol is a small symmetrical molecule that can exist in three mirror-image arrangements. Only one of them works.',
        molecularDetail:
          'The label names the active substance as the (+) isomer, (+)-2,2′-(ethylenediimino)-di-1-butanol dihydrochloride, C10H24N2O2 • 2HCl at 277.23 g/mol. The meso form and the (−) enantiomer are far less active, so the manufacturing challenge for an otherwise trivial molecule is stereochemical purity.',
        iconName: 'Split',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It gets into growing mycobacteria',
        laymanDesc:
          'The drug diffuses into bacteria that are actively multiplying. Dormant ones are largely unaffected.',
        molecularDetail:
          'The label states that ethambutol diffuses into actively growing Mycobacterium cells such as tubercle bacilli. Peak serum concentration of 2 to 5 mcg/mL is reached 2 to 4 hours after a 25 mg/kg dose, and erythrocyte concentrations run at about twice plasma throughout the 24 hours.',
        iconName: 'DoorOpen',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It blocks the enzyme that builds the sugar scaffold',
        laymanDesc:
          'The bacterium’s armour is a lattice of linked sugars with a waxy coat attached. Ethambutol stops the enzyme that assembles the sugar lattice.',
        molecularDetail:
          'The target is the EmbAB arabinosyl transferase, which polymerises arabinose into the arabinan of cell-wall arabinogalactan — established in 1996 by copy-number-dependent resistance on embAB overexpression and a cell-free arabinan biosynthesis assay. The label names no target and says only that the drug "appears to inhibit the synthesis of one or more metabolites".',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The wall cannot be completed, and multiplication stops',
        laymanDesc:
          'Without the scaffold, the wall becomes incomplete and leaky, the cell stops dividing, and it dies — and the other drugs get in more easily.',
        molecularDetail:
          'The label describes impairment of cell metabolism, arrest of multiplication and cell death. Because the arabinan scaffold anchors the mycolate layer, blocking it also increases envelope permeability, which is the accepted explanation for ethambutol’s synergy with the other first-line agents.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'And the same dose axis damages the optic nerve',
        laymanDesc:
          'Higher doses work better and blind more people. Above 50 mg/kg more than four in ten adults had eye toxicity; at 15 mg/kg it was under three in a hundred.',
        molecularDetail:
          'Dose-related efficacy: 25 mg/kg outperformed 15 mg/kg, which outperformed 6 mg/kg. Dose-related toxicity: over 40% above 50 mg/kg, 0% to 3% at 15 mg/kg daily. Recovery generally occurs over weeks to months after stopping, and irreversible blindness has been reported.',
        iconName: 'EyeOff',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Its real job is protecting the other drugs',
        laymanDesc:
          'The fourth drug is largely there to stop unrecognised isoniazid resistance from turning the regimen into rifampin on its own.',
        molecularDetail:
          'The ethambutol label states it has reduced the emergence of mycobacterial resistance to isoniazid when the two are used together. The rifampin label states the fourth drug may be omitted where community isoniazid resistance is under 4%, and that the need for it should be reassessed once susceptibility results are known.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'Study 31/A5349 — four-month rifapentine regimens with or without moxifloxacin (N Engl J Med 2021;384:1705-1718; NCT02410772)',
        phase: 'Phase 3, open-label, randomised, controlled, non-inferiority, 13 countries',
        sampleSize: 2516,
        primaryEndpoint:
          'Survival free of tuberculosis at 12 months, against a non-inferiority margin of 6.6 percentage points, comparing four-month rifapentine regimens with the standard six-month rifampin-isoniazid-pyrazinamide-ethambutol regimen',
        endpointMet: true,
        statisticalPValue:
          'Rifapentine with moxifloxacin (ethambutol replaced) non-inferior: 15.5% against 14.6% unfavourable outcomes, difference 1.0 percentage point (95% CI −2.6 to 4.5) in the microbiologically eligible population. Rifapentine without moxifloxacin (ethambutol retained) not shown non-inferior: 17.7% against 14.6%, difference 3.0 points (95% CI −0.6 to 6.6)',
        unreportedAdverseSignals:
          'The arm that retained ethambutol is the arm that failed to demonstrate non-inferiority, which makes this as much a result about the fluoroquinolone as about the rifamycin. Grade 3 or higher on-treatment adverse events: 19.3% control, 18.8% rifapentine-moxifloxacin, 14.3% rifapentine.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'Donald PR et al., ethambutol dosage literature review — efficacy and ocular toxicity by dose (Int J Tuberc Lung Dis 2006;10:1318-1330)',
        phase:
          'Systematic literature review of dosage, toxicity and pharmacokinetics from 1961 onward',
        sampleSize: 3811,
        primaryEndpoint:
          'Dose-related efficacy and dose-related ocular toxicity of ethambutol, and derivation of a paediatric dose',
        endpointMet: true,
        statisticalPValue:
          'Ocular toxicity in more than 40% of adults at doses above 50 mg/kg and 0% to 3% at 15 mg/kg daily. Ethambutol stopped for possible ocular toxicity in 2 of 3,811 children (0.05%) receiving 15 to 30 mg/kg. Efficacy: 25 mg/kg better than 15 mg/kg, which was better than 6 mg/kg alongside isoniazid',
        unreportedAdverseSignals:
          'A review rather than a trial, aggregating heterogeneous studies from 1961 onward with varying toxicity definitions and follow-up. Its central finding remains uncomfortable: the same dose increase that improves efficacy increases ocular toxicity, and the review found peak serum concentrations significantly lower in children than adults at the same milligram-per-kilogram dose.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Dose-related efficacy: 25 mg/kg outperformed 15 mg/kg, which outperformed 6 mg/kg, alongside isoniazid',
        'Dose-related ocular toxicity: over 40% of adults above 50 mg/kg, 0% to 3% at 15 mg/kg daily',
        'Ethambutol stopped for possible ocular toxicity in 2 of 3,811 children (0.05%) receiving 15 to 30 mg/kg',
        'A four-month regimen replacing ethambutol with moxifloxacin was non-inferior to the standard six-month regimen: 15.5% against 14.6% unfavourable outcomes across 2,516 randomised participants',
      ],
      unsupportedInferences: [
        'That the label’s mechanism sentence describes the drug’s action — the arabinosyl transferase target was identified in 1996 and appears nowhere in it',
        'That the contraindication in young children reflects current evidence, when the paediatric review it postdates found ocular toxicity requiring discontinuation in 0.05% of 3,811 children',
        'That every drug in the regimen contributes proportionally to cure, when this one’s documented role is preventing resistance amplification',
        'That a documented drop in visual acuity is attributable to the drug, when the label itself reports one- to two-line Snellen fluctuation in tuberculosis patients not receiving it',
      ],
      whatFailedInitially: [
        'Monotherapy: the label states the drug should not be used alone, in initial treatment or in retreatment, and that resistance develops in an unpredictable, step-like manner',
        'The 25 mg/kg retreatment dose as a durable regimen: the label reduces it to 15 mg/kg after 60 days and advises monthly eye examinations during the higher-dose period',
        'Non-inferiority of the four-month rifapentine arm that retained ethambutol, which was not demonstrated while the arm replacing it with moxifloxacin was',
        'The label as a description of paediatric practice, where a contraindication has coexisted with routine international use for nearly two decades',
      ],
      realWorldOutcome: [
        'On the market since 1967, on the WHO Model List of Essential Medicines, and part of the intensive phase of tuberculosis treatment for most patients worldwide',
        'Recommended by the World Health Organization for children of all ages at 20 mg/kg daily, against a United States label that contraindicates it in young children',
        'Displaced by moxifloxacin in the first successful four-month regimen for drug-susceptible tuberculosis',
        'Its molecular target and resistance gene, embB, are now central to rapid molecular susceptibility testing and still absent from the label',
      ],
    },
    deliverySystem: {
      type: 'Oral tablets of 100 mg and 400 mg, taken once every 24 hours',
      description:
        'A single 25 mg/kg oral dose gives a serum peak of 2 to 5 mcg/mL at 2 to 4 hours, and daily administration at that dose produces similar levels without accumulation in patients with normal kidney function; serum levels fall to undetectable by 24 hours except in renal impairment. Erythrocyte concentrations reach about twice plasma and hold that ratio through the day. About 50% of a dose is excreted unchanged in urine within 24 hours with a further 8% to 15% as metabolites, and 20% to 22% appears unchanged in the faeces. Absorption is not significantly altered by food, but is reduced by roughly 20% when taken with an aluminium hydroxide antacid.',
      safetyProfile:
        'The principal warning is decreased visual acuity due to optic neuritis, related to dose and duration, generally reversible on prompt discontinuation but with irreversible blindness reported. Presentations include decreased acuity, scotoma, colour blindness and visual field defect, unilateral or bilateral, and these have been reported without a formal diagnosis of optic or retrobulbar neuritis. Visual acuity should be tested before and periodically during therapy, monthly at doses above 15 mg/kg per day, with each eye tested separately. The drug is contraindicated in known hypersensitivity, in known optic neuritis unless clinical judgment determines otherwise, and in patients unable to appreciate and report visual change. Liver toxicity including fatalities has been reported and baseline and periodic hepatic assessment is directed. Dose reduction is required in decreased renal function. Other reported reactions include anaphylactoid reactions, dermatitis, erythema multiforme, joint pain, gastrointestinal upset, fever, headache, dizziness and mental confusion.',
    },
    commonQuestions: [
      {
        q: 'Why am I being asked about my eyesight every month?',
        a: 'Because the characteristic harm of this drug is optic nerve damage, and it is dose- and duration-related. The label directs visual acuity testing before starting and periodically during treatment, and monthly if the dose is above 15 mg/kg per day. It also asks for each eye to be tested separately, because the change can be one-sided. The things to report are not only blurring: colour vision changes, a blind patch in the middle of vision, or a narrowed field all count. Recovery generally happens over weeks to months if the drug is stopped promptly, and irreversible blindness has been reported when it is not.',
        auditNote:
          'The label prints a table of how many Snellen lines a patient must drop before the change is meaningful, because tuberculosis patients not on the drug fluctuate by one or two lines anyway. That is the noise floor of the safety test, published on the label.',
      },
      {
        q: 'Should children take it?',
        a: 'International practice and the United States label disagree, and the disagreement is old. The label contraindicates ethambutol in patients unable to appreciate and report visual change, naming young children, and states it is not recommended under 13 because safe conditions of use have not been established. A 2006 review assembling the paediatric literature found ethambutol was stopped for possible ocular toxicity in 2 of 3,811 children who received it at 15 to 30 mg/kg — 0.05% — and concluded that children of all ages can be given 20 mg/kg daily without undue concern; it also found that children reach lower peak serum concentrations than adults at the same weight-based dose. The World Health Organization recommends it in the intensive phase for children. This page reports the conflict; it does not resolve it.',
      },
      {
        q: 'What does the fourth drug actually do?',
        a: 'Less than most people assume, and something specific. Ethambutol’s documented contribution is that it reduces the emergence of resistance to isoniazid when the two are given together — its label says exactly that. The guidance reproduced in the rifampin label is correspondingly conditional: a fourth drug is recommended unless the likelihood of isoniazid resistance is very low, the need for it should be reassessed when susceptibility results arrive, and where community isoniazid resistance is under 4% a regimen of fewer than four drugs may be considered. So it is insurance against a diagnostic gap, held for the two months it takes to close that gap.',
      },
      {
        q: 'How does ethambutol actually work?',
        a: 'It blocks the enzyme that builds the arabinan sugar scaffold of the mycobacterial cell wall — an arabinosyl transferase encoded by the genes embA and embB. That was established in 1996 by showing that putting the emb genes into a susceptible mycobacterium made it resistant in proportion to gene copy number, and that overexpressing them produced ethambutol-resistant transferase activity in a cell-free assay. It is worth knowing because the United States label does not say this. Its mechanism paragraph, essentially unchanged since the 1960s, says the drug "appears to inhibit the synthesis of one or more metabolites, thus causing impairment of cell metabolism, arrest of multiplication, and cell death" — a sentence that would fit almost any antibacterial.',
        auditNote:
          'The gap is not only academic. Rapid molecular resistance tests work by sequencing a named gene, and embB is the one that matters here.',
      },
      {
        q: 'Is it still needed, now that shorter regimens exist?',
        a: 'Its slot has been successfully filled once. In the trial that produced the first four-month regimen for drug-susceptible tuberculosis in about forty years, ethambutol was replaced by moxifloxacin and rifampin by rifapentine, and that combination matched the standard six-month regimen across 2,516 randomised patients. Notably, the arm that swapped in rifapentine but kept ethambutol was not shown to be non-inferior. That does not make ethambutol useless — the six-month regimen it belongs to remains the global standard and is far cheaper — but it does mean the fourth-drug slot has now been shown to be substitutable.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Donald PR, Maher D, Maritz JS, Qazi S. Ethambutol dosage for the treatment of children: literature review and recommendations. Int J Tuberc Lung Dis 2006;10(12):1318-1330',
        identifier: '17167947',
        kind: 'pmid',
      },
      {
        label:
          'Belanger AE, Besra GS, Ford ME, et al. The embAB genes of Mycobacterium avium encode an arabinosyl transferase involved in cell wall arabinan biosynthesis that is the target for the antimycobacterial drug ethambutol. Proc Natl Acad Sci USA 1996;93:11919-11924',
        identifier: '10.1073/pnas.93.21.11919',
        kind: 'doi',
      },
      {
        label:
          'Dorman SE, Nahid P, Kurbatova EV, et al. Four-month rifapentine regimens with or without moxifloxacin for tuberculosis. N Engl J Med 2021;384:1705-1718',
        identifier: '10.1056/NEJMoa2033400',
        kind: 'doi',
      },
      {
        label: 'Study 31/A5349 — ClinicalTrials.gov registration',
        identifier: 'NCT02410772',
        kind: 'nct',
      },
      {
        label:
          'Ethambutol hydrochloride tablets, USP — United States prescribing information (Description, Clinical Pharmacology, Indications and Usage, Contraindications, Warnings, Precautions, Adverse Reactions, Dosage and Administration)',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=3f6428d6-3745-4337-ad78-ebfff9f49135',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 14052 — ethambutol canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/14052',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 8. Pyrazinamide — the drug that shortened tuberculosis treatment to six months, whose label
  //    says its mechanism of action is unknown and that there are few reliable tests for it.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'pyrazinamide',
    name: 'Pyrazinamide',
    tradeName: '',
    sponsor:
      'Antituberculous activity in the pyrazine analogue of nicotinamide was reported in the early 1950s, and its requirement for an acid pH and its sterilising activity in the mouse were established by the classic Cornell University experiments. The United States application holder on this record is Sanofi-Aventis; the drug is generic and made worldwide',
    targetGene:
      'pncA, encoding the pyrazinamidase that converts the prodrug to pyrazinoic acid, is where most resistance sits. Candidate target genes include rpsA and panD; the label names none of them',
    targetProtein:
      'Not established. The label states the mechanism of action is unknown. Candidate targets in the literature include ribosomal protein S1 (RpsA), aspartate decarboxylase (PanD), energy production and trans-translation',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1971,
    indication:
      'Initial treatment of active tuberculosis in adults and children when combined with other antituberculous agents, and after treatment failure with other primary drugs. It is administered for the initial 2 months of a 6-month or longer regimen and should only be used alongside other effective antituberculous agents',
    patientFriendlyIndication: 'The first two months of tuberculosis treatment',
    anatomicalSite:
      'Acidic microenvironments — inside macrophage phagolysosomes and in areas of active inflammation, where the drug is active and almost nowhere else',
    conditionContext: {
      conditionExplainer:
        'Tuberculosis treatment used to run for nine to twelve months not because the bacteria were hard to kill but because a small population of barely-metabolising organisms survived everything and caused relapse months later. Those survivors sit in acidic pockets where most antibiotics work poorly.',
      whyItMatters:
        'Pyrazinamide is the drug that reaches them, and it is the reason a six-month regimen exists. That is a very large clinical achievement resting on a mechanism that nobody has pinned down, using a drug whose susceptibility test is unreliable enough that its own label says so.',
      whoTakesThis:
        'Almost everyone starting treatment for active tuberculosis, for the first two months; and it remains an important component of drug-resistant regimens.',
      clinicalGoals:
        'Preventing relapse — the endpoint that matters here is not symptom resolution or culture conversion but bacteriological relapse a year or two after the last tablet.',
    },
    oneSentenceVerdict:
      'The drug that cut tuberculosis treatment from eight or nine months to six — omitting it from the first two months raised bacteriological relapse from 13% to 18% in a six-month regimen and from 0% to 6% in an eight-month one — given for seventy years under a label that states in its own words that "the mechanism of action is unknown" and that "there are few reliable in vitro tests for pyrazinamide resistance".',
    laymanHowItWorks:
      'Pyrazinamide arrives inactive. Inside the tuberculosis bacterium an enzyme strips it into pyrazinoic acid, which leaks back out — and then, in the acidic pockets where the surviving bacteria hide, picks up a proton and gets pulled back in, faster than the cell can pump it out. It accumulates and the cell fails. What exactly it breaks once it accumulates is genuinely still argued about; several candidate targets have been proposed and none is settled. The drug only works where the surroundings are acidic, which is why it kills the dormant survivors that other drugs miss and does nothing in a normal laboratory culture.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 71,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$1.33 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 11 listed products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'In use since the 1950s and licensed in the United States under the record carried here from 1971; long generic and on the WHO Model List of Essential Medicines. It is the smallest molecule on this page at 123 g/mol — a pyrazine ring with an amide — and the pyrazine analogue of nicotinamide, which is how it was found. Its United States acquisition price of US$1.33 per unit sits well above rifampin and ethambutol on the same survey, for a molecule that is trivially cheap to make.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'There is no substitute for pyrazinamide in the intensive phase of a six-month regimen, and the measured consequence of dropping it is not failure but relapse — which appears a year later, in someone who was declared cured. The alternatives that exist are longer regimens without it, and for latent infection the two-month rifampin-pyrazinamide combination that was withdrawn in 2003 after a randomised comparison found eight times the rate of severe liver injury. Nothing sold as a food or supplement treats a bacterial infection, and the naturalFoods list on this page is empty for that reason.',
      conventionalRx: [
        {
          name: 'A regimen without pyrazinamide, run for eight months instead of six',
          class: 'Longer standard therapy',
          howItCompares:
            'Directly measured in the Third East African/British Medical Research Council study. With pyrazinamide in the two-month intensive phase, bacteriological relapse was 13% at six months and 0% at eight. With pyrazinamide omitted, it was 18% at six months and 6% at eight. That comparison is what pyrazinamide is worth: roughly two extra months of everything else.',
          typicalCost:
            'Two additional months of three other drugs, plus the supervision to deliver them',
          prosAndCons:
            'Pros: no hepatotoxicity and no hyperuricaemia from this drug; usable in acute gout and severe hepatic damage, where it is contraindicated. Cons: measurably more relapse at every duration tested, and two more months of treatment to complete.',
        },
        {
          name: 'Two months of rifampin plus pyrazinamide for latent infection',
          class: 'A withdrawn short-course preventive regimen',
          howItCompares:
            'Listed here because it is the clearest thing that has been measured about this drug and then acted on. In a 589-patient multicentre trial against six months of isoniazid, grade 3 or 4 hepatotoxicity occurred in 16 of 207 (7.7%) on rifampin-pyrazinamide against 2 of 204 (1%) on isoniazid, odds ratio 8.46 (95% CI 1.9 to 76.5), p=0.001. In 2003 the ATS and CDC recommended the regimen should generally not be offered.',
          typicalCost: 'No longer recommended for this indication',
          prosAndCons:
            'Pros: two months instead of six or nine. Cons: high rates of hospitalisation and death from liver injury in surveillance, and an eightfold odds of severe hepatotoxicity in the head-to-head trial.',
        },
        {
          name: 'Four months of rifapentine with moxifloxacin, isoniazid and pyrazinamide',
          class: 'The shortened active-tuberculosis regimen',
          howItCompares:
            'Worth noting for what it kept. The four-month regimen that proved non-inferior to standard therapy in 2,516 randomised participants replaced rifampin with rifapentine and ethambutol with moxifloxacin — and retained pyrazinamide throughout the intensive phase.',
          typicalCost:
            'Not stated: no verified CMS acquisition price for rifapentine or moxifloxacin was held on this record at the time of writing',
          prosAndCons:
            'Pros: four months rather than six. Cons: still contains pyrazinamide, so the hepatotoxicity and hyperuricaemia of this drug are unchanged.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Aching joints are expected; a hot swollen joint is not',
          action: 'Report pain or swelling in a joint, and any new severe joint attack.',
          patientImpact:
            'The label records mild arthralgia and myalgia as frequently reported, and separately states that pyrazinamide inhibits renal excretion of urates, frequently producing hyperuricaemia that is usually asymptomatic. If hyperuricaemia is accompanied by acute gouty arthritis, the label directs that the drug be discontinued.',
          clinicalPrecaution:
            'Acute gout is a listed contraindication, alongside severe hepatic damage and known hypersensitivity. Baseline uric acid and liver function are directed before starting.',
        },
        {
          name: 'Know the liver symptom list before you start',
          action:
            'Report fever, loss of appetite, malaise, nausea and vomiting, darkened urine, or yellowing of the skin and eyes promptly.',
          patientImpact:
            'That list is the label’s own Information for Patients section. Hepatotoxicity is the principal adverse effect, appears dose-related, and may appear at any time during therapy.',
          clinicalPrecaution:
            'The label directs baseline ALT, AST and uric acid before therapy with periodic testing thereafter, and states that pyrazinamide should be discontinued and not resumed if signs of hepatocellular damage appear.',
        },
        {
          name: 'A urine test may read oddly',
          action: 'Mention that you are taking it if a urine ketone test is being run.',
          patientImpact:
            'The label records that pyrazinamide has been reported to interfere with Acetest and Ketostix urine tests, producing a pink-brown colour.',
          clinicalPrecaution:
            'A laboratory artefact rather than a clinical effect, but one that can be misread as ketosis in a person with diabetes — and the label separately advises caution in diabetes because management may be more difficult during treatment.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1=CN=C(C=N1)C(=O)N',
      chemicalFormula: 'C5H5N3O',
      molecularWeight: '123.11 g/mol',
      targetReceptorAffinity:
        'The label describes pyrazinamide as the pyrazine analogue of nicotinamide, and is unusually direct about the limits of what is known: "Pyrazinamide may be bacteriostatic or bactericidal against Mycobacterium tuberculosis depending on the concentration of the drug attained at the site of infection. The mechanism of action is unknown. In vitro and in vivo the drug is active only at a slightly acidic pH." The accepted account, which the label does not carry, is that pyrazinamide enters the bacillus by passive diffusion, is converted to pyrazinoic acid by the mycobacterial nicotinamidase/pyrazinamidase encoded by pncA, and is exported by an inefficient efflux pump. Under acid conditions the protonated form is reabsorbed and accumulates because export cannot keep pace, causing cellular damage. Unlike other antibacterials it has no single defined target of action; proposed targets include ribosomal protein S1, trans-translation, and pantothenate and coenzyme A synthesis through aspartate decarboxylase. Resistance is mostly loss-of-function mutation in pncA, with rpsA and panD mutations found in some resistant strains lacking pncA changes. It is well absorbed, peaks within 2 hours at 30 to 50 mcg/mL on 20 to 25 mg/kg, is roughly 10% protein bound, has a half-life of 9 to 10 hours, and is hydrolysed in the liver to pyrazinoic acid and then to 5-hydroxypyrazinoic acid, with about 70% of an oral dose excreted in urine by glomerular filtration within 24 hours.',
      structureSource: {
        label:
          'PubChem CID 1046 (pyrazinamide) — canonical SMILES, molecular formula and weight, as carried on the enriched record; mechanism statement, pH dependence and pharmacokinetics from the pyrazinamide tablets United States label; mechanistic account from Zhang Y, Mitchison D, Int J Tuberc Lung Dis 2003;7:6-21',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/1046',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'pza-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Separate the drug from its acid and from nicotinamide',
          description:
            'Pyrazinamide hydrolyses to pyrazinoic acid, which is also its active metabolite, so the release assay has to distinguish parent from product rather than simply measure total pyrazine. Because the molecule is the pyrazine analogue of nicotinamide, the related-substance panel also has to exclude nicotinamide and pyrazine-2-carboxylic acid at low levels.',
          reagentsAndBuffer:
            'Pyrazinamide reference standard, reversed-phase HPLC with ultraviolet detection at 268 nm, pyrazinoic acid and nicotinamide impurity standards, Karl Fischer titration, room-temperature stability confirmation',
        },
        {
          id: 'pza-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Amidate pyrazine-2-carboxylic acid',
          description:
            'Pyrazine-2-carboxylic acid is converted to the amide, most simply through the ester and ammonia. Two commodity steps from a bulk heterocycle, which is the manufacturing reason this drug costs a few cents a tablet in most of the world.',
          dependsOnStepId: 'pza-w1',
          reagentsAndBuffer:
            'Pyrazine-2-carboxylic acid or its methyl ester, ammonia in methanol or aqueous ammonium hydroxide, controlled temperature to limit hydrolysis back to the acid',
        },
        {
          id: 'pza-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Recrystallise and control particle size for a 500 mg tablet',
          description:
            'The drug substance is only sparingly soluble in water and the tablet is large — 500 mg of a compound with a molecular weight of 123 — so dissolution depends on particle size and on the starch disintegrants in the formulation. This matters more than usual because pyrazinamide is a weight-based dose given as a fixed tablet strength, often in fixed-dose combination.',
          dependsOnStepId: 'pza-w2',
          reagentsAndBuffer:
            'Recrystallisation from water or aqueous ethanol, particle size distribution by laser diffraction, corn starch and pregelatinised starch as disintegrants per the label formulation, dissolution testing',
        },
        {
          id: 'pza-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Test activity at acid pH against a neutral-pH control',
          description:
            'Standard susceptibility testing at neutral pH will report pyrazinamide as inactive, because it is. The drug is active only at slightly acidic pH, and mycobacteria grow poorly at that pH, so the assay has to run at pH 5.5 with a carefully controlled inoculum — which is precisely why the label says there are few reliable in vitro tests for pyrazinamide resistance and why false resistance is common.',
          dependsOnStepId: 'pza-w3',
          reagentsAndBuffer:
            'Middlebrook 7H12 medium adjusted to pH 5.5 and to pH 6.8 as a paired control, standardised low inoculum, radiometric or liquid-culture readout, paired pncA sequencing on every isolate called resistant',
        },
        {
          id: 'pza-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Measure relapse, not culture conversion',
          description:
            'What pyrazinamide contributes is sterilising activity, and sterilising activity is invisible on any endpoint measured during treatment. The only assay that detects it is bacteriological relapse after treatment ends, which is why the trials that established this drug followed patients for 30 months rather than reporting sputum conversion at eight weeks.',
          dependsOnStepId: 'pza-w4',
          reagentsAndBuffer:
            'Serial sputum culture on solid and liquid media for 24 to 30 months after the end of chemotherapy, drug susceptibility testing on every relapse isolate to distinguish relapse from reinfection, strain genotyping where available',
        },
      ],
    },
    keyAudits: [
      {
        id: 'pza-a1',
        category: 'measured',
        title: 'The label says the mechanism of action is unknown',
        laymanSummary:
          'Pyrazinamide has been part of standard tuberculosis treatment since the 1950s and is the reason a six-month course works. Its prescribing information states, in four words, that how it works is unknown.',
        technicalDetails:
          'The CLINICAL PHARMACOLOGY section reads: "Pyrazinamide may be bacteriostatic or bactericidal against Mycobacterium tuberculosis depending on the concentration of the drug attained at the site of infection. The mechanism of action is unknown. In vitro and in vivo the drug is active only at a slightly acidic pH." The literature agrees on the shape of the problem. Zhang and Mitchison’s review states that pyrazinamide enters M. tuberculosis by passive diffusion, is converted to pyrazinoic acid by the pncA-encoded pyrazinamidase, is exported by a weak efflux pump, and that protonated pyrazinoic acid is reabsorbed and accumulates under acid conditions — and then states directly that "unlike other antibacterials, PZA has no defined target of action". A later review lists the candidates: energy production, trans-translation via ribosomal protein S1, and pantothenate and coenzyme A synthesis via aspartate decarboxylase. This is not a footnote about a minor drug. It is the drug that shortened tuberculosis chemotherapy by a third, in a disease that remains one of the world’s leading infectious causes of death, and the target has been argued about for seventy years.',
        evidenceSource:
          'Pyrazinamide tablets United States prescribing information, CLINICAL PHARMACOLOGY; Zhang Y, Mitchison D. The curious characteristics of pyrazinamide: a review. Int J Tuberc Lung Dis 2003;7:6-21; Zhang Y, Shi W, Zhang W, Mitchison D. Mechanisms of pyrazinamide action and resistance. Microbiol Spectr 2014;2:MGM2-0023-2013',
        doi: '10.1128/microbiolspec.MGM2-0023-2013',
        measuredMetric:
          'The label’s own mechanism statement, and the absence of an established molecular target in the review literature',
        auditFlag: 'verified',
      },
      {
        id: 'pza-a2',
        category: 'measured',
        title: 'Removing it raised relapse from 13% to 18%',
        laymanSummary:
          'A controlled trial ran the same tuberculosis regimen with and without pyrazinamide in the first two months. Without it, bacteriological relapse rose from 13% to 18% in the six-month version, and from none at all to 6% in the eight-month version.',
        technicalDetails:
          'The Third East African/British Medical Research Council study compared four short-course regimens, each given for both six and eight months, with follow-up to 30 months. The reference regimen was streptomycin, isoniazid, rifampicin and pyrazinamide daily for two months followed by thiacetazone plus isoniazid. Given for six months it had a bacteriological relapse rate of 13%, and given for eight months there were no relapses. When pyrazinamide was omitted from the first two months, relapse rates were 18% for the six-month series and 6% for the eight-month series. The later Fifth Collaborative Study of the same programme, which held a four-drug intensive phase constant and varied the continuation phase, found that the six-month regimen with rifampicin throughout produced bacteriological relapse in only 2% of 166 patients with fully sensitive strains within 24 months of stopping. Read together, these trials measure the two drugs that made short-course chemotherapy possible, and they measure them on the only endpoint that detects sterilising activity: relapse after treatment has stopped. A trial reporting sputum conversion at eight weeks could not have seen any of this.',
        evidenceSource:
          'Third East African/British Medical Research Council Study. Controlled clinical trial of four short-course regimens of chemotherapy for two durations in the treatment of pulmonary tuberculosis. Second report. Tubercle 1980;61:59-69; East and Central African/British Medical Research Council Fifth Collaborative Study. Tubercle 1986;67:5-15',
        doi: '10.1016/0041-3879(80)90012-4',
        measuredMetric:
          'Bacteriological relapse to 30 months with against without pyrazinamide in the two-month intensive phase: 13% against 18% at six months, 0% against 6% at eight months',
        auditFlag: 'verified',
      },
      {
        id: 'pza-a3',
        category: 'conclusion_shift',
        title: 'Its short-course preventive regimen was withdrawn after deaths',
        laymanSummary:
          'A two-month course of rifampin plus pyrazinamide was recommended for latent tuberculosis because it was short. A head-to-head trial found eight times the odds of severe liver injury compared with isoniazid, and in 2003 the recommendation was reversed.',
        technicalDetails:
          'The SCRIPT trial enrolled 589 adults with latent tuberculosis at three urban public health clinics and assigned them in alternate weeks to two months of daily rifampin and pyrazinamide (n=307) or six months of daily isoniazid (n=282). Grade 3 or 4 hepatotoxicity occurred in 16 of 207 (7.7%) assigned to rifampin-pyrazinamide against 2 of 204 (1%) assigned to isoniazid: odds ratio 8.46 (95% CI 1.9 to 76.5), p=0.001. The rifampin-pyrazinamide regimen was also more likely to be discontinued because of hepatotoxicity (odds ratio 5.19, p=0.033). In parallel, the CDC collected surveillance data on patients receiving the regimen in the United States between January 2000 and June 2002 and, in an MMWR report published in August 2003, found high rates of hospitalisation and death from liver injury; on that basis the American Thoracic Society and CDC recommended that the regimen should generally not be offered to persons with latent tuberculosis infection, a position endorsed by the Infectious Diseases Society of America. The same report was explicit that rifampin and pyrazinamide should continue to be administered in multidrug regimens for active tuberculosis disease — the withdrawal was of a specific two-drug combination in a specific well population, not of either drug.',
        evidenceSource:
          'Jasmer RM, Saukkonen JJ, Blumberg HM, et al. Short-course rifampin and pyrazinamide compared with isoniazid for latent tuberculosis infection: a multicenter clinical trial. Ann Intern Med 2002;137:640-647; Centers for Disease Control and Prevention and American Thoracic Society. Update: adverse event data and revised ATS/CDC recommendations against the use of rifampin and pyrazinamide for treatment of latent tuberculosis infection — United States, 2003. MMWR Morb Mortal Wkly Rep 2003;52:735-739',
        doi: '10.7326/0003-4819-137-8-200210150-00007',
        measuredMetric:
          'Grade 3 or 4 hepatotoxicity: 16 of 207 (7.7%) on rifampin-pyrazinamide against 2 of 204 (1%) on isoniazid, odds ratio 8.46 (95% CI 1.9 to 76.5), p=0.001',
        auditFlag: 'contested',
      },
      {
        id: 'pza-a4',
        category: 'failed',
        title: 'The susceptibility test does not work, and the label admits it',
        laymanSummary:
          'Pyrazinamide only kills bacteria in acid conditions, and tuberculosis bacteria grow badly in acid. So the laboratory test for whether a strain is resistant frequently reports resistance that is not real, and the label says there are few reliable tests.',
        technicalDetails:
          'The PRECAUTIONS section states: "There are few reliable in vitro tests for pyrazinamide resistance. A reference laboratory capable of performing these studies must be employed." The reason is structural. The drug is active only at slightly acidic pH, so susceptibility testing must be performed at around pH 5.5, where Mycobacterium tuberculosis grows poorly and where inoculum size, medium composition and incubation all shift the result. The review literature is blunter still: current phenotype-based pyrazinamide susceptibility testing is described as not reliable because of false resistance, and sequencing of the pncA gene is recommended as a more rapid, cost-effective and reliable molecular test. The clinical consequence is asymmetric — a false resistance result removes from a patient’s regimen the one drug that shortens it, and the removal is invisible because the endpoint it affects is relapse a year later. The same label paragraph also notes that primary resistance of M. tuberculosis to pyrazinamide is uncommon, which makes an unconfirmed resistance report all the more likely to be wrong.',
        evidenceSource:
          'Pyrazinamide tablets United States prescribing information, PRECAUTIONS — General Precautions; Zhang Y, Shi W, Zhang W, Mitchison D. Mechanisms of pyrazinamide action and resistance. Microbiol Spectr 2014;2:MGM2-0023-2013',
        doi: '10.1128/microbiolspec.MGM2-0023-2013',
        measuredMetric:
          'Reliability of phenotypic pyrazinamide susceptibility testing, per the label’s own statement and the review literature on false resistance',
        auditFlag: 'caution',
      },
      {
        id: 'pza-a5',
        category: 'measured',
        title: 'It raises uric acid in nearly everyone and matters in almost nobody',
        laymanSummary:
          'Pyrazinamide blocks the kidney from excreting uric acid, so levels rise in most people who take it. Usually nothing happens. Occasionally it triggers gout, and acute gout is a contraindication.',
        technicalDetails:
          'The label states that pyrazinamide inhibits renal excretion of urates, frequently resulting in hyperuricaemia which is usually asymptomatic, and that if hyperuricaemia is accompanied by acute gouty arthritis the drug should be discontinued. Acute gout is one of only three contraindications, alongside severe hepatic damage and known hypersensitivity. Baseline uric acid and liver function are directed before therapy. Mild arthralgia and myalgia are separately listed as frequently reported adverse effects and are not the same thing as gout — which is the practical difficulty, because the common benign symptom and the rare contraindicating one present in the same place. The mechanism is well characterised even though the antibacterial mechanism is not: pyrazinoic acid, the active metabolite, is a potent inhibitor of renal urate secretion. It is an unusual situation in which a drug’s effect on human physiology is better understood than its effect on the organism it is given to kill.',
        evidenceSource:
          'Pyrazinamide tablets United States prescribing information, CONTRAINDICATIONS, WARNINGS, PRECAUTIONS and ADVERSE REACTIONS',
        measuredMetric:
          'Hyperuricaemia as a frequent and usually asymptomatic effect, with acute gouty arthritis as a discontinuation trigger and acute gout as a contraindication',
        auditFlag: 'verified',
      },
      {
        id: 'pza-a6',
        category: 'inferred',
        title: 'A drug defined by where it works, not by what it hits',
        laymanSummary:
          'Almost everything said about pyrazinamide is about the environment rather than the target: it works in acid, it works on dormant bacteria, it works better in old cultures than growing ones. Those are descriptions of conditions, not of a mechanism.',
        technicalDetails:
          'The characterisation that has stood since the Cornell experiments of the 1950s is environmental: pyrazinamide requires an acid pH for activity, has sterilising activity in the mouse, is more active against old cultures than against actively growing ones, and had no apparent in vitro activity when first discovered despite working in murine tuberculosis. The proposed explanation is that low bacterial metabolism slows both energy production and the weak efflux pump, so protonated pyrazinoic acid accumulates. Each of those statements is a claim about conditions under which the drug acts, and the field has repeatedly proposed and then contested a molecular target on top of them — ribosomal protein S1 and trans-translation, aspartate decarboxylase and coenzyme A synthesis, fatty acid synthase I. The honest position is the one the label takes and the reviews restate: the mechanism is unknown, and the drug is defined operationally. It is worth stating plainly on a page like this, because a mechanism diagram for pyrazinamide is necessarily a hypothesis drawn with confident arrows.',
        evidenceSource:
          'Zhang Y, Mitchison D. The curious characteristics of pyrazinamide: a review. Int J Tuberc Lung Dis 2003;7:6-21; Zhang Y, Shi W, Zhang W, Mitchison D. Mechanisms of pyrazinamide action and resistance. Microbiol Spectr 2014;2:MGM2-0023-2013',
        doi: '10.1128/microbiolspec.MGM2-0023-2013',
        inferredClaim:
          'That the published mechanism diagrams for pyrazinamide describe an established pathway — when the drug has no defined target of action and the candidates remain contested',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'It walks in, inactive',
        laymanDesc:
          'The molecule is tiny and passes straight through the bacterial envelope without needing a transporter. It does nothing in that form.',
        molecularDetail:
          'Pyrazinamide is the pyrazine analogue of nicotinamide at 123 g/mol, and enters Mycobacterium tuberculosis by passive diffusion. It is well absorbed orally, peaking within 2 hours at 30 to 50 mcg/mL on 20 to 25 mg/kg, with about 10% protein binding and a half-life of 9 to 10 hours.',
        iconName: 'Package',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The bacterium unmasks it',
        laymanDesc:
          'An enzyme inside the bacterium clips the molecule into an acid. That acid is what does the damage.',
        molecularDetail:
          'The mycobacterial nicotinamidase/pyrazinamidase encoded by pncA converts pyrazinamide to pyrazinoic acid. Loss-of-function pncA mutation abolishes conversion and is the commonest resistance mechanism; rpsA and panD mutations are found in some resistant strains without pncA changes.',
        iconName: 'Scissors',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Acid outside traps the acid inside',
        laymanDesc:
          'The acid leaks back out, picks up a proton in the acidic surroundings, and is pulled straight back in — faster than the cell can push it out. It builds up.',
        molecularDetail:
          'Pyrazinoic acid is exported by a weak efflux pump. Under acid conditions the protonated form is reabsorbed and accumulates because export is inefficient. The label states the drug is active only at a slightly acidic pH, in vitro and in vivo.',
        iconName: 'Repeat',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'And then something breaks, and nobody is sure what',
        laymanDesc:
          'Once it accumulates the cell fails. Exactly which machine it wrecks is still argued about, and the prescribing information says so.',
        molecularDetail:
          'The label states the mechanism of action is unknown. Candidate targets in the review literature include energy production, trans-translation through ribosomal protein S1, and pantothenate and coenzyme A synthesis through aspartate decarboxylase. No single target is established.',
        iconName: 'HelpCircle',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The survivors are the ones it reaches',
        laymanDesc:
          'The bacteria that other drugs miss are the barely-alive ones sitting in acid pockets, and those are precisely the conditions this drug needs.',
        molecularDetail:
          'Pyrazinamide is more active against old cultures than actively growing ones, probably because low bacterial metabolism slows both energy production and the efflux pump. This sterilising activity, synergistic with rifampicin, is what shortened chemotherapy.',
        iconName: 'Snowflake',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Two months of it saves two months of everything else',
        laymanDesc:
          'Take it out of the first two months and relapse rises from 13% to 18% in a six-month regimen, and from none to 6% in an eight-month one.',
        molecularDetail:
          'Third East African/BMRC study, follow-up to 30 months: with pyrazinamide in the two-month intensive phase, bacteriological relapse 13% at six months and 0% at eight; without it, 18% and 6%. Relapse after treatment ends is the only endpoint that detects sterilising activity.',
        iconName: 'Timer',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'SCRIPT — rifampin and pyrazinamide against isoniazid for latent tuberculosis (Ann Intern Med 2002;137:640-647)',
        phase: 'Multicentre, prospective, open-label trial with alternate-week assignment',
        sampleSize: 589,
        primaryEndpoint:
          'Hepatotoxicity, other adverse events, and percentage of patients completing treatment, comparing two months of rifampin plus pyrazinamide with six months of isoniazid',
        endpointMet: false,
        statisticalPValue:
          'Grade 3 or 4 hepatotoxicity in 16 of 207 (7.7%) on rifampin-pyrazinamide against 2 of 204 (1%) on isoniazid; odds ratio 8.46 (95% CI 1.9 to 76.5), p=0.001. Discontinuation for hepatotoxicity more likely with rifampin-pyrazinamide (odds ratio 5.19, p=0.033)',
        unreportedAdverseSignals:
          'Assignment was by alternate week rather than individual randomisation, and the trial was open-label. The confidence interval on the odds ratio runs to 76.5, which is very wide — the direction of the finding was nonetheless confirmed by national surveillance and the regimen was withdrawn from recommendation in 2003.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'East and Central African/British Medical Research Council Fifth Collaborative Study, final report (Tubercle 1986;67:5-15)',
        phase: 'Controlled clinical trial of four short-course regimens, 30-month follow-up',
        sampleSize: 609,
        primaryEndpoint:
          'Bacteriological relapse up to 30 months after a common two-month intensive phase of streptomycin, isoniazid, rifampicin and pyrazinamide, with four different continuation phases',
        endpointMet: true,
        statisticalPValue:
          'Relapse in 2% of 166 patients on rifampicin throughout, against 10% of 156 on isoniazid alone for four months (p<0.02) and 8% of 164 on isoniazid plus pyrazinamide for four months (p=0.05); 3% of 123 on six months of isoniazid',
        unreportedAdverseSignals:
          'Pyrazinamide in the continuation phase did not differ significantly from isoniazid alone — the drug’s contribution is concentrated in the intensive phase. Among patients with pretreatment isoniazid-resistant strains, none of 23 on the rifampicin- or pyrazinamide-containing continuation regimens had an unfavourable status at the end of chemotherapy, against 8 of 17 on isoniazid-only regimens (p<0.005).',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Bacteriological relapse with against without pyrazinamide in the two-month intensive phase: 13% against 18% for a six-month regimen, 0% against 6% for an eight-month regimen',
        'Relapse in 2% of 166 patients given rifampicin throughout a six-month regimen after a common four-drug intensive phase',
        'Grade 3 or 4 hepatotoxicity in 7.7% on two months of rifampin-pyrazinamide against 1% on six months of isoniazid, odds ratio 8.46 (95% CI 1.9 to 76.5)',
        'Hyperuricaemia as a frequent, usually asymptomatic consequence of inhibited renal urate excretion',
      ],
      unsupportedInferences: [
        'That the published mechanism of pyrazinamide is established — its own label states the mechanism of action is unknown and the review literature says it has no defined target',
        'That a phenotypic pyrazinamide resistance report is reliable, when the label states there are few reliable in vitro tests and false resistance is well described',
        'That a shorter regimen is a safer regimen, which the two-month rifampin-pyrazinamide preventive combination disproved at the cost of hospitalisations and deaths',
        'That sterilising activity can be inferred from culture conversion during treatment, when it is only visible as relapse after treatment ends',
      ],
      whatFailedInitially: [
        'The two-month rifampin-pyrazinamide regimen for latent tuberculosis, recommended and then withdrawn in 2003 after high rates of hospitalisation and death from liver injury',
        'In vitro testing at the time of discovery: the drug appeared to have no activity in culture despite working in murine tuberculosis, because standard media are not acidic',
        'Pyrazinamide in the continuation phase, which in the Fifth Collaborative Study did not significantly outperform isoniazid alone — the benefit is an intensive-phase effect',
        'Seventy years of attempts to identify a single molecular target, none of which has become the accepted answer',
      ],
      realWorldOutcome: [
        'The reason standard tuberculosis treatment is six months rather than eight or nine, and part of every first-line regimen worldwide',
        'Retained in the four-month rifapentine-moxifloxacin regimen that proved non-inferior to standard therapy in 2,516 randomised participants',
        'Still tested by a phenotypic assay its own label calls unreliable, with pncA sequencing recommended in the review literature as the more dependable alternative',
        'Contraindicated in acute gout and severe hepatic damage — two of only three contraindications on a very short list',
      ],
    },
    deliverySystem: {
      type: 'Oral tablets of 500 mg, given once daily during the initial two months of treatment',
      description:
        'Well absorbed from the gastrointestinal tract with peak plasma concentrations within 2 hours, generally 30 to 50 mcg/mL on doses of 20 to 25 mg/kg. Widely distributed in body tissues and fluids including liver, lung and cerebrospinal fluid, where the concentration is approximately equal to concurrent steady-state plasma concentrations in patients with inflamed meninges. About 10% protein bound, with a half-life of 9 to 10 hours in normal renal and hepatic function and prolongation in impairment. Hydrolysed in the liver to pyrazinoic acid, the major active metabolite, then hydroxylated to 5-hydroxypyrazinoic acid; approximately 70% of an oral dose is excreted in urine by glomerular filtration within 24 hours.',
      safetyProfile:
        'Contraindicated in severe hepatic damage, known hypersensitivity, and acute gout. Baseline uric acid and liver function determinations are directed before starting, with close follow-up in pre-existing liver disease or increased risk of drug-related hepatitis. The drug should be discontinued and not resumed if signs of hepatocellular damage or hyperuricaemia with acute gouty arthritis appear. Hepatotoxicity is the principal adverse effect, appears dose-related and may occur at any time during therapy. Hyperuricaemia is frequent and usually asymptomatic. Mild arthralgia and myalgia are frequently reported. Rare reports include thrombocytopenia, sideroblastic anaemia with erythroid hyperplasia, adverse effects on clotting, porphyria, dysuria, interstitial nephritis, photosensitivity and hypersensitivity reactions. Caution is advised in diabetes mellitus, where management may be more difficult, and the drug interferes with Acetest and Ketostix urine tests to produce a pink-brown colour.',
    },
    commonQuestions: [
      {
        q: 'Do we really not know how this drug works?',
        a: 'Not fully, and the prescribing information says so in plain words: "The mechanism of action is unknown." What is well established is the route. Pyrazinamide diffuses into the tuberculosis bacterium, an enzyme called pyrazinamidase converts it to pyrazinoic acid, that acid leaks out, and in acidic surroundings it becomes protonated and is pulled back in faster than the cell’s weak pump can expel it, so it accumulates. What the accumulated acid actually breaks is contested — proposals include energy production, a ribosomal protein involved in rescuing stalled ribosomes, and coenzyme A synthesis — and the review literature states that unlike other antibacterials, pyrazinamide has no defined target of action.',
        auditNote:
          'This is worth sitting with. A drug that shortened treatment for one of the world’s deadliest infections by a third has been in daily use for seventy years without a settled target.',
      },
      {
        q: 'Why is it only given for the first two months?',
        a: 'Because that is where its benefit was measured, and it does not appear to add much afterwards. The controlled trials that established short-course chemotherapy varied the intensive phase and the continuation phase separately. Omitting pyrazinamide from the two-month intensive phase raised bacteriological relapse from 13% to 18% in a six-month regimen and from none to 6% in an eight-month one. But in the trial that kept a four-drug intensive phase constant and varied what followed, pyrazinamide continued through the continuation phase did not significantly outperform isoniazid alone. The drug earns its place early and then stops earning it.',
      },
      {
        q: 'Why does it need to be tested in a special laboratory?',
        a: 'Because the test is genuinely difficult, and the label says so: "There are few reliable in vitro tests for pyrazinamide resistance. A reference laboratory capable of performing these studies must be employed." The drug is only active at slightly acidic pH, and tuberculosis bacteria grow poorly at that pH, so a test that reproduces the drug’s working conditions is also a test in which the organism is stressed. The result is false resistance — strains reported resistant that are not. The review literature recommends sequencing the pncA gene instead as a faster and more dependable method. The stakes are asymmetric: a wrong resistance result removes from the regimen the one drug that makes it six months instead of eight or nine.',
      },
      {
        q: 'Why has my uric acid gone up, and does it matter?',
        a: 'It has gone up because pyrazinamide blocks the kidney from excreting urate — the label states this outright and notes that the resulting hyperuricaemia is frequent and usually asymptomatic. Mild aching in joints and muscles is also frequently reported and is not gout. What matters is the combination: if raised uric acid is accompanied by acute gouty arthritis, the label directs that the drug be stopped. Acute gout is one of only three contraindications, alongside severe liver damage and known hypersensitivity. Baseline uric acid and liver tests are meant to be taken before starting for exactly this reason.',
      },
      {
        q: 'I read that rifampin and pyrazinamide together can be used for latent tuberculosis. Is that still true?',
        a: 'No, and the reversal is one of the clearest examples of measurement changing practice. A two-month course of the two drugs was recommended because it was short and completion rates matter. Then a 589-patient trial compared it head to head with six months of isoniazid and found grade 3 or 4 liver toxicity in 7.7% against 1% — an odds ratio of 8.46. National surveillance found high rates of hospitalisation and death from liver injury. In August 2003 the American Thoracic Society and the CDC recommended the regimen should generally not be offered for latent infection. Both drugs continue to be used in multidrug regimens for active tuberculosis disease; it was the specific two-drug preventive combination that was withdrawn.',
        auditNote:
          'The lesson generalises. A shorter regimen improves completion, which is a real benefit, and it does not automatically make the regimen safer.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Third East African/British Medical Research Council Study. Controlled clinical trial of four short-course regimens of chemotherapy for two durations in the treatment of pulmonary tuberculosis. Second report. Tubercle 1980;61:59-69',
        identifier: '10.1016/0041-3879(80)90012-4',
        kind: 'doi',
      },
      {
        label:
          'East and Central African/British Medical Research Council Fifth Collaborative Study. Controlled clinical trial of 4 short-course regimens of chemotherapy (three 6-month and one 8-month) for pulmonary tuberculosis: final report. Tubercle 1986;67:5-15',
        identifier: '10.1016/0041-3879(86)90027-9',
        kind: 'doi',
      },
      {
        label:
          'Jasmer RM, Saukkonen JJ, Blumberg HM, et al. Short-course rifampin and pyrazinamide compared with isoniazid for latent tuberculosis infection: a multicenter clinical trial. Ann Intern Med 2002;137:640-647',
        identifier: '10.7326/0003-4819-137-8-200210150-00007',
        kind: 'doi',
      },
      {
        label:
          'Centers for Disease Control and Prevention; American Thoracic Society. Update: adverse event data and revised American Thoracic Society/CDC recommendations against the use of rifampin and pyrazinamide for treatment of latent tuberculosis infection — United States, 2003. MMWR Morb Mortal Wkly Rep 2003;52(31):735-739',
        identifier: '12904741',
        kind: 'pmid',
      },
      {
        label:
          'Zhang Y, Shi W, Zhang W, Mitchison D. Mechanisms of pyrazinamide action and resistance. Microbiol Spectr 2014;2(4):MGM2-0023-2013',
        identifier: '10.1128/microbiolspec.MGM2-0023-2013',
        kind: 'doi',
      },
      {
        label:
          'Zhang Y, Mitchison D. The curious characteristics of pyrazinamide: a review. Int J Tuberc Lung Dis 2003;7(1):6-21',
        identifier: '12701830',
        kind: 'pmid',
      },
      {
        label:
          'Pyrazinamide tablets, USP — United States prescribing information (Description, Clinical Pharmacology, Indications and Usage, Contraindications, Warnings, Precautions, Adverse Reactions, Dosage and Administration)',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=262d8829-728c-48db-b89b-88d13b87e684',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 1046 — pyrazinamide canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/1046',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 9. Dapsone — the drug leprosy control was built on until it was used alone for twenty years,
  //    and whose acne gel was licensed without a single microbiology study.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'dapsone',
    name: 'Dapsone',
    tradeName: 'Aczone (topical gel); oral dapsone tablets are sold without a brand name',
    sponsor:
      'The sulfone was described in the chemical literature long before its antimycobacterial use, and reached leprosy programmes in the 1940s. The application holder on this record is Almirall, which holds the topical acne gel; the oral tablets are generic and made by several manufacturers',
    targetGene:
      'folP1, encoding the dihydropteroate synthase of Mycobacterium leprae; resistance is folP1 point mutation. The target of the anti-inflammatory effect in dermatitis herpetiformis and acne is not identified',
    targetProtein:
      'Dihydropteroate synthase, in the bacterial folate pathway. In its two dermatological indications the label states in both cases that the mechanism has not been established',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1979,
    indication:
      'Oral tablets: dermatitis herpetiformis, and all forms of leprosy except cases of proven dapsone resistance. Topical gel: acne vulgaris. Widely used off-label in the United States for Pneumocystis jirovecii prophylaxis, an indication the oral label does not carry',
    patientFriendlyIndication:
      'Leprosy, the blistering skin disease dermatitis herpetiformis, and — as a gel — acne',
    anatomicalSite:
      'The bacterial folate pathway in Mycobacterium leprae. In dermatitis herpetiformis and acne the site of action is not established; the harm site is the red blood cell',
    conditionContext: {
      conditionExplainer:
        'Bacteria have to make their own folate; humans absorb it from food. That difference is what a sulfone exploits. But dapsone is also used for two skin conditions in which no infection is being treated at all, and in those the drug is doing something to inflammation that has never been pinned down.',
      whyItMatters:
        'For four decades dapsone was leprosy treatment, given alone because it was cheap and there was nothing else. That worked until resistance arrived, at which point the field discovered that the endpoint everyone had been using — negative skin smears — had not been measuring cure.',
      whoTakesThis:
        'People with leprosy, as one component of multidrug therapy; people with dermatitis herpetiformis; people using a topical gel for acne; and, off the United States label, immunosuppressed patients taking it to prevent Pneumocystis pneumonia.',
      clinicalGoals:
        'In leprosy, cure without relapse and without transmitting resistant organisms. In dermatitis herpetiformis, control of an intensely itchy blistering rash. In acne, lesion counts.',
    },
    oneSentenceVerdict:
      'A folate-pathway antibacterial whose oral label now excludes "cases of proven Dapsone resistance" because two decades of monotherapy in leprosy produced it, whose own label states the mechanism in dermatitis herpetiformis has not been established and that the mechanism of the acne gel is not known — with no microbiology or resistance study conducted in the gel’s clinical programme at all — and whose most dangerous reaction, a hypersensitivity syndrome with a reported 9.9% mortality, is predicted by an HLA allele identified in 2013 at an odds ratio of 20.53.',
    laymanHowItWorks:
      'Bacteria cannot absorb folate from their surroundings the way people can — they have to build it. Dapsone blocks an early step of that assembly line, so the bacterium runs out of the raw material it needs to copy its DNA. That accounts for leprosy. It does not account for the other two uses: in the blistering disease dermatitis herpetiformis and in acne, the drug damps down inflammation by a route the prescribing information states has not been established. The characteristic harm has nothing to do with any of that — dapsone oxidises haemoglobin, so essentially everyone taking it by mouth loses some red cells.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 63,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.7335 per gram at United States pharmacy acquisition cost (CMS NADAC, median across 53 listed products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'The molecule is very old, unpatented as a substance, and on the WHO Model List of Essential Medicines; in leprosy programmes multidrug therapy has been supplied without charge to endemic-country programmes through the World Health Organization. The commercially significant product in the United States is not the tablet but the 5% and 7.5% topical gel for acne, which took a molecule with no remaining composition protection and created a new, separately protected product around a formulation — the same manoeuvre performed with inhaled tobramycin. The 53 products carrying a NADAC price here span both oral and topical forms.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Dapsone occupies three unrelated places, and the alternatives differ in every one. In leprosy it is no longer used alone — that is the whole lesson of the drug — and the alternative is the multidrug combination it now forms part of. In Pneumocystis prophylaxis, an indication its United States label does not carry, trimethoprim-sulfamethoxazole is the standard and dapsone is the fallback for people who cannot take it. In acne, a topical gel whose mechanism its own label says is unknown competes with topicals whose mechanisms are established. Nothing sold as a food or supplement treats a bacterial infection, and the naturalFoods list on this page is empty for that reason.',
      conventionalRx: [
        {
          name: 'Multidrug therapy with rifampicin and clofazimine',
          class: 'The combination that replaced dapsone monotherapy in leprosy',
          howItCompares:
            'The direct answer to what went wrong. Sulfone resistance was documented in 100 consecutive proven cases in Malaysia between 1963 and 1974, appearing 5 to 24 years after the start of sulphone treatment, confined to lepromatous patients — those with the largest bacterial populations — and favoured by low dosage. Dapsone is retained inside the combination; what was abandoned was giving it alone.',
          typicalCost:
            'Multidrug therapy blister packs have been supplied without charge to endemic-country programmes through the World Health Organization',
          prosAndCons:
            'Pros: prevents the selection that a single drug against a large bacterial population guarantees. Cons: more drugs, more adverse effects, and clofazimine causes marked skin discolouration that carries its own stigma in this particular disease.',
        },
        {
          name: 'Trimethoprim-sulfamethoxazole',
          class: 'Folate-pathway combination',
          howItCompares:
            'The standard for Pneumocystis prophylaxis, where dapsone is the alternative for people who cannot tolerate it — an indication that appears nowhere on the United States oral dapsone label, which lists only dermatitis herpetiformis and leprosy. Note the interaction: the dapsone label records that trimethoprim-sulfamethoxazole raises dapsone exposure by about 40% and more than doubles exposure to dapsone hydroxylamine, the metabolite responsible for haemolysis.',
          typicalCost:
            'Not stated: no verified CMS acquisition price for trimethoprim-sulfamethoxazole was held on this record at the time of writing',
          prosAndCons:
            'Pros: broader prophylactic cover; established first-line status. Cons: its own rash and marrow toxicity; and it is a poor partner for dapsone because it increases the haemolytic metabolite.',
        },
        {
          name: 'A gluten-free diet, in dermatitis herpetiformis',
          class: 'Dietary treatment of the underlying disease',
          howItCompares:
            'Dapsone controls the rash of dermatitis herpetiformis without treating the gluten-sensitive enteropathy that drives it. The label states that the mechanism of action in dermatitis herpetiformis has not been established, and the drug is a symptomatic control rather than a treatment of cause.',
          typicalCost: 'No drug cost; a substantial and permanent change in how a person eats',
          prosAndCons:
            'Pros: addresses the underlying immunological trigger rather than the skin sign; no haemolysis, no agranulocytosis. Cons: works slowly where dapsone works within days, and requires strict lifelong adherence.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask about G6PD before the first tablet',
          action:
            'Mention any family or personal history of jaundice, dark urine after certain foods or drugs, or known G6PD deficiency, and any ancestry from Africa, South Asia, the Middle East or the Mediterranean.',
          patientImpact:
            'The label states that oral dapsone produces dose-related haemolysis and haemolytic anaemia, that individuals with G6PD deficiency are more prone to haemolysis, and that G6PD deficiency is most prevalent in populations of African, South Asian, Middle Eastern and Mediterranean ancestry. Almost all patients, deficient or not, lose 1 to 2 g of haemoglobin.',
          clinicalPrecaution:
            'Whether to test and what to do with the result is a prescribing decision this page does not make. The point is that the risk group is identifiable in advance.',
        },
        {
          name: 'Blue lips are an emergency, not a cosmetic problem',
          action:
            'Seek immediate medical attention for a grey-blue discolouration of the lips, gums, nail beds or inside of the mouth.',
          patientImpact:
            'The label instructs exactly this. Methaemoglobinaemia presents as slate-grey cyanosis in the mucous membranes, lips and nail beds, and signs may be delayed some hours after exposure. Cases with resulting hospitalisation have been reported after marketing even with the 5% topical gel.',
          clinicalPrecaution:
            'The gel label directs avoiding use in congenital or idiopathic methaemoglobinaemia and lists a long set of co-administered drugs — including local anaesthetics, nitrates, sulfonamides, antimalarials and several anticonvulsants — that raise the risk.',
        },
        {
          name: 'The blood count schedule is on the label for a reason',
          action:
            'Report sore throat, fever, pallor, purpura or jaundice at once, and keep to whatever blood-count schedule is arranged.',
          patientImpact:
            'The label states that deaths from agranulocytosis, aplastic anaemia and other blood dyscrasias have been reported with dapsone, and records the FDA Dermatology Advisory Committee recommendation that counts be done weekly for the first month, monthly for six months and semi-annually thereafter where feasible.',
          clinicalPrecaution:
            'The label also notes that patients on weekly pyrimethamine with dapsone have developed agranulocytosis during the second and third months, and that folic acid antagonists may increase haematologic reactions.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1=CC(=CC=C1N)S(=O)(=O)C2=CC=C(C=C2)N',
      chemicalFormula: 'C12H12N2O2S',
      molecularWeight: '248.30 g/mol',
      targetReceptorAffinity:
        'Dapsone is 4,4′-diaminodiphenyl sulfone: two aniline rings joined by a sulfone bridge, and a structural analogue of para-aminobenzoic acid. Like the sulfonamides it competes with PABA at dihydropteroate synthase in the bacterial folate pathway, which is where its antimycobacterial action comes from; resistance in Mycobacterium leprae is folP1 point mutation. The label’s own statement of what is known is narrower: "By the kinetic method in mice, Dapsone is bactericidal as well as bacteriostatic against Mycobacterium leprae", and, separately, "the mechanism of action in Dermatitis herpetiformis has not been established". The topical gel label goes further: "The mechanism of action of dapsone gel in treating acne vulgaris is not known." The toxicologically important chemistry is not the sulfone bridge but the aromatic amines: N-hydroxylation gives dapsone hydroxylamine, which oxidises haemoglobin to methaemoglobin and shortens red cell survival. Oral absorption is rapid and almost complete, peak concentration comes at 4 to 8 hours, plasma half-life varies between individuals from ten to fifty hours and averages twenty-eight, and about 85% of the daily intake is recoverable from urine mainly as water-soluble metabolites. At 200 mg daily the plateau blood level averaged 2.3 mcg/mL with a range of 0.1 to 7.0 — a seventy-fold spread across individuals on the same dose.',
      structureSource: {
        label:
          'PubChem CID 2955 (dapsone) — canonical SMILES, molecular formula and weight, as carried on the enriched record; pharmacokinetics, mechanism statements and metabolite chemistry from the dapsone tablets and dapsone gel United States labels',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2955',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'dds-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Control the aromatic amine impurities',
          description:
            'The molecule is built from aromatic amines and its principal degradation and process-related impurities are also aromatic amines, a structural class handled under tight genotoxic-impurity limits. Because the toxic metabolite is itself an N-hydroxylated aromatic amine, the impurity profile and the toxicity mechanism sit in the same chemical family, which is unusual and worth testing for deliberately.',
          reagentsAndBuffer:
            'Dapsone reference standard, reversed-phase HPLC with ultraviolet detection at 285 nm, aniline and 4-aminophenyl sulfone-related impurity standards at parts-per-million limits, LC-MS/MS confirmation, Karl Fischer titration',
        },
        {
          id: 'dds-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Build the sulfone bridge and unmask the two amines',
          description:
            'Two para-substituted benzene rings are joined through a sulfone linkage, with the amine functions protected as acetamides or introduced by reduction of nitro groups at the end. It is a short route from commodity aromatics, which is why the drug substance costs almost nothing and why the expensive product in the United States is a gel rather than a tablet.',
          dependsOnStepId: 'dds-w1',
          reagentsAndBuffer:
            'Chlorobenzene or acetanilide-derived feedstocks, chlorosulfonic acid, Friedel-Crafts sulfonylation, oxidation of the sulfide to the sulfone, hydrolytic or reductive deprotection of the amines',
        },
        {
          id: 'dds-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise for a tablet; micronise and suspend for a gel',
          description:
            'Dapsone is practically insoluble in water and insoluble in fixed and vegetable oils, which the label states outright. That is a formulation problem in both directions: for the tablet it governs dissolution, and for the topical gel it means the drug is suspended rather than dissolved, so particle size determines how much crosses the stratum corneum.',
          dependsOnStepId: 'dds-w2',
          reagentsAndBuffer:
            'Recrystallisation from ethanol or acetone, particle size distribution by laser diffraction, aqueous gel base with a solubilising vehicle for the topical product, in vitro release testing through a synthetic membrane',
        },
        {
          id: 'dds-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure hydroxylamine formation, not just parent exposure',
          description:
            'The quantity that predicts haemolysis is not dapsone concentration but dapsone hydroxylamine concentration, and the two do not track each other because the converting enzymes are inducible and inhibitable. The label demonstrates this directly: co-administration with trimethoprim-sulfamethoxazole raised dapsone exposure by about 40% while more than doubling hydroxylamine exposure. A study reporting only parent drug would have missed the clinically relevant half.',
          dependsOnStepId: 'dds-w3',
          reagentsAndBuffer:
            'Human liver microsomes with CYP2C9, CYP2E1 and CYP3A4 selective inhibitors, LC-MS/MS quantification of dapsone, N-acetyl-dapsone and dapsone hydroxylamine, G6PD-normal and G6PD-deficient erythrocyte incubations, methaemoglobin measurement by co-oximetry',
        },
        {
          id: 'dds-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Genotype HLA-B before treating, where the allele is common',
          description:
            'The dapsone hypersensitivity syndrome has a reported mortality near 10% and a strong single-allele predictor. Testing that in practice means four-digit HLA-B typing before treatment in populations where HLA-B*13:01 is common, paired with prospective follow-up for the syndrome — the design that would establish whether screening prevents cases rather than merely predicts them.',
          dependsOnStepId: 'dds-w4',
          reagentsAndBuffer:
            'Next-generation sequencing for four-digit HLA-B and HLA-C typing, imputation panels validated in the relevant ancestry groups, prospective ascertainment of dapsone hypersensitivity syndrome against standardised criteria',
        },
      ],
    },
    keyAudits: [
      {
        id: 'dds-a1',
        category: 'conclusion_shift',
        title: 'Twenty years of monotherapy, and the endpoint was not measuring cure',
        laymanSummary:
          'Dapsone was given alone for leprosy for decades. Resistance appeared in patients five to twenty-four years after starting, and the authors of the defining series stated flatly that negative skin smears — the test everyone had been relying on — were no test of cure.',
        technicalDetails:
          'Pearson, Rees and Waters reported the first hundred consecutive proven cases of sulphone resistance in leprosy, detected in Malaysia between 1963 and 1974. Proof was clinical in 80 patients and obtained by drug-sensitivity testing in mice in 96; 76 cases were proved by both methods with no discrepancy between them. Three findings shaped what followed. Resistance was confined to patients with lepromatous-type leprosy — that is, to patients with a large bacterial population, exactly as with rifampin in a tuberculosis cavity. Clinical relapse due to drug resistance appeared 5 to 24 years after the start of sulphone treatment, a latency long enough that a monotherapy programme could run for a generation before the failure became visible. And low dosage favoured the appearance of resistance, so the economising that made mass treatment affordable was itself part of the mechanism. The paper’s closing sentence is the audit: "The attainment of ‘skin smears negative for leprosy bacilli’ is no test of cure of lepromatous leprosy." Multidrug therapy — dapsone with rifampicin and clofazimine — became World Health Organization policy in the early 1980s, and the drug’s own United States label now indicates it for "All forms of leprosy except for cases of proven Dapsone resistance."',
        evidenceSource:
          'Pearson JM, Rees RJ, Waters MF. Sulphone resistance in leprosy. A review of one hundred proven clinical cases. Lancet 1975;2:69-72; dapsone tablets United States prescribing information, INDICATIONS AND USAGE',
        doi: '10.1016/s0140-6736(75)90508-5',
        measuredMetric:
          'One hundred consecutive proven cases of sulphone resistance, confined to lepromatous leprosy, with relapse 5 to 24 years after starting monotherapy and low dosage favouring emergence',
        auditFlag: 'verified',
      },
      {
        id: 'dds-a2',
        category: 'measured',
        title: 'A predictive genetic test exists for its deadliest reaction',
        laymanSummary:
          'The dapsone hypersensitivity syndrome kills about one in ten of the people who develop it. A genome-wide study in 2013 found a single tissue-type allele that raises the risk twentyfold — and whose absence cuts the risk sevenfold.',
        technicalDetails:
          'Zhang and colleagues performed a genome-wide association study in 872 participants who had received dapsone as part of multidrug therapy for leprosy — 39 with dapsone hypersensitivity syndrome and 833 controls — with replication genotyping in a further 31 cases and 1,089 controls, and four-digit HLA-B and HLA-C typing by next-generation sequencing in an independent series of 37 cases and 201 controls. SNP rs2844573, between the HLA-B and MICA loci, was associated at odds ratio 6.18 (P=3.84×10⁻¹³), and HLA-B*13:01 was confirmed as the risk factor at odds ratio 20.53 (P=6.84×10⁻²⁵). As a predictor of the syndrome, the presence of HLA-B*13:01 had a sensitivity of 85.5% and a specificity of 85.7%, and its absence was associated with a sevenfold reduction in risk, from 1.4% to 0.2%. The paper records the syndrome’s reported mortality as 9.9% and its incidence as 0.5% to 3.6% of treated persons. The allele frequency is highly population-specific: about 2% to 20% of Chinese people, 1.5% of Japanese, 1% to 12% of Indians and 2% to 4% of Southeast Asians carry it, and it is largely absent in Europeans and Africans. So this is a rare thing — a lethal drug reaction with a validated, ancestry-targeted, single-allele screening test — and the drug it applies to is one of the cheapest antibacterials in the world, used mostly in the countries where the allele is commonest.',
        evidenceSource:
          'Zhang FR, Liu H, Irwanto A, et al. HLA-B*13:01 and the dapsone hypersensitivity syndrome. N Engl J Med 2013;369:1620-1628',
        doi: '10.1056/NEJMoa1213096',
        measuredMetric:
          'HLA-B*13:01 as a risk factor for dapsone hypersensitivity syndrome: odds ratio 20.53, sensitivity 85.5%, specificity 85.7%, absolute risk 1.4% in carriers against 0.2% in non-carriers',
        auditFlag: 'verified',
      },
      {
        id: 'dds-a3',
        category: 'inferred',
        title: 'Two of its three indications have no stated mechanism',
        laymanSummary:
          'Dapsone treats leprosy by blocking a bacterial pathway. For the blistering disease dermatitis herpetiformis, the label says the mechanism has not been established. For acne, the gel’s label says the mechanism is not known.',
        technicalDetails:
          'The oral label’s CLINICAL PHARMACOLOGY section opens: "The mechanism of action in Dermatitis herpetiformis has not been established", and follows with the only mechanistic claim it does make — "By the kinetic method in mice, Dapsone is bactericidal as well as bacteriostatic against Mycobacterium leprae." The topical gel’s label states, as its entire section 12.1: "The mechanism of action of dapsone gel in treating acne vulgaris is not known." Neither condition is an infection in the sense leprosy is. Dermatitis herpetiformis is the cutaneous expression of gluten-sensitive enteropathy, and the drug controls the rash within days without affecting the enteropathy. Acne involves Cutibacterium acnes, but the gel label separately records that no microbiology studies were performed. The working hypothesis in both is that dapsone has an anti-neutrophil, anti-inflammatory action independent of its folate-pathway antibacterial effect — a hypothesis with a substantial laboratory literature and no regulatory endorsement. Two of the three licensed uses of this molecule therefore rest on an effect that is real, reproducible and unexplained.',
        evidenceSource:
          'Dapsone tablets United States prescribing information, CLINICAL PHARMACOLOGY — Actions; dapsone gel 5% United States prescribing information, section 12.1',
        inferredClaim:
          'That dapsone’s dermatological effects follow from its antibacterial mechanism — an inference neither label makes, both stating instead that the mechanism has not been established',
        auditFlag: 'caution',
      },
      {
        id: 'dds-a4',
        category: 'failed',
        title: 'An antibacterial licensed for acne with no microbiology done at all',
        laymanSummary:
          'Dapsone gel is an antibacterial drug approved for acne. Its own label states that no microbiology or immunology studies were conducted in its clinical programme, and no resistance studies either — so nobody knows whether it selects for resistant skin bacteria.',
        technicalDetails:
          'The gel label’s Microbiology section reads, in full on these points: "In Vivo Activity: No microbiology or immunology studies were conducted during dapsone gel clinical trials. Drug Resistance: No dapsone resistance studies were conducted during dapsone gel clinical trials. Because no microbiology studies were done, there are no data available as to whether dapsone treatment may have resulted in decreased susceptibility of Propionibacterium acnes, an organism associated with acne, to other antimicrobials that may be used to treat acne." It then adds the one sentence that makes the omission consequential: "Therapeutic resistance to dapsone has been reported for Mycobacterium leprae, when patients have been treated with oral dapsone." So the label knows this molecule selects resistance in a mycobacterium, and states that whether the same happens on the face of an acne patient was not investigated. Topical antibacterial use in acne is one of the largest reservoirs of long-duration, low-concentration antibacterial exposure in medicine. A licence granted on lesion counts, with the resistance question explicitly unasked, is a clean example of a regulatory endpoint and a public-health question failing to overlap.',
        evidenceSource:
          'Dapsone gel 5% United States prescribing information, section 12.4 Microbiology',
        measuredMetric:
          'Microbiology and resistance studies conducted during the dapsone gel clinical programme: none, per the label',
        auditFlag: 'caution',
      },
      {
        id: 'dds-a5',
        category: 'measured',
        title: 'Everybody haemolyses — it is the expected effect, not a rare reaction',
        laymanSummary:
          'Oral dapsone destroys red cells in essentially everyone who takes it, whether or not they have any enzyme deficiency. Almost all patients lose one to two grams of haemoglobin.',
        technicalDetails:
          'The label states it as a class fact rather than an adverse event: "Dose-related hemolysis is the most common adverse effect and is seen in patients with or without G6PD deficiency. Almost all patients demonstrate the inter-related changes of a loss of 1 to 2g of hemoglobin, an increase in the reticulocytes (2 to 12%), a shortened red cell life span and a rise in methemoglobin. G6PD deficient patients have greater responses." The mechanism is metabolic: N-hydroxylation produces dapsone hydroxylamine, which oxidises haemoglobin iron and damages the red cell membrane. Two consequences follow that are easy to miss. First, the drug interaction that matters is not the one that raises dapsone levels but the one that raises hydroxylamine levels — the label records that trimethoprim-sulfamethoxazole increases dapsone and N-acetyl-dapsone exposure by about 40% and 20% while more than doubling dapsone hydroxylamine, and that rifampin, anticonvulsants and St John’s wort may increase hydroxylamine formation. Second, haemolysis and methaemoglobinaemia may be poorly tolerated in severe cardiopulmonary disease, which the label notes separately. On top of that sits the far rarer but lethal end: deaths from agranulocytosis, aplastic anaemia and other blood dyscrasias, with a monitoring schedule of weekly counts for the first month, monthly for six months and semi-annually thereafter.',
        evidenceSource:
          'Dapsone tablets United States prescribing information, WARNINGS and ADVERSE REACTIONS — Hematologic Effects; dapsone gel 5% prescribing information, section 7.3',
        measuredMetric:
          'Loss of 1 to 2 g of haemoglobin with reticulocytosis of 2% to 12% in almost all patients on oral dapsone, with or without G6PD deficiency',
        auditFlag: 'verified',
      },
      {
        id: 'dds-a6',
        category: 'inferred',
        title: 'Topical exposure is a hundredth of oral — and people were still hospitalised',
        laymanSummary:
          'The safety case for the acne gel is that almost none of the drug reaches the bloodstream — about one per cent of an oral dose. Methaemoglobinaemia serious enough to require hospital admission has still been reported since it went on sale.',
        technicalDetails:
          'The gel label quantifies the exposure argument precisely. In an open-label crossover study, applying dapsone gel 5% twice daily for 14 days over about 22.5% of body surface area produced a mean day-14 area under the curve of 415 ± 224 ng·h/mL, against 52,641 ± 36,223 ng·h/mL after a single 100 mg oral dose — exposure roughly 100 times greater by mouth. In a long-term safety study of about 500 patients over 12 months there was no evidence of increasing systemic exposure over the year. On that basis the label reports no clinically relevant haemolysis or anaemia in gel-treated patients, including those who were G6PD deficient. And then: "Cases of methemoglobinemia, with resultant hospitalization, have been reported postmarketing in association with dapsone gel, 5% treatment", and "Some subjects with G6PD deficiency using dapsone gel developed laboratory changes suggestive of hemolysis." The inference — that a hundredfold reduction in exposure removes the class toxicity — held for the average patient in the trials and did not hold for everyone in the market. The label’s response is not to withdraw the claim but to add the warnings, list the co-administered drugs that induce methaemoglobinaemia, and instruct patients to stop and seek immediate attention on cyanosis.',
        evidenceSource:
          'Dapsone gel 5% United States prescribing information, sections 5.1, 5.2, 7.4 and 12.3',
        inferredClaim:
          'That a hundredfold lower systemic exposure eliminates dapsone’s haematological toxicity — supported by the trial data and contradicted by the postmarketing methaemoglobinaemia hospitalisations recorded on the same label',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A slow drug with a wide spread',
        laymanDesc:
          'Swallowed dapsone is absorbed almost completely and leaves the body slowly, and how slowly varies enormously from person to person.',
        molecularDetail:
          'Detectable within minutes and peaking at 4 to 8 hours; daily dosing for at least eight days is needed to reach a plateau. Plasma half-life ranges from ten to fifty hours between individuals and averages twenty-eight. At 200 mg daily the plateau level averaged 2.3 mcg/mL with a range of 0.1 to 7.0 mcg/mL — but repeat tests in the same individual are constant.',
        iconName: 'Hourglass',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It looks like the bacterium’s raw material',
        laymanDesc:
          'Bacteria must build their own folate. Dapsone resembles one of the building blocks closely enough to take its place and stall the assembly line.',
        molecularDetail:
          'As a structural analogue of para-aminobenzoic acid, dapsone competes at dihydropteroate synthase in the bacterial folate pathway. Resistance in Mycobacterium leprae is folP1 point mutation. The label’s own claim is narrower: bactericidal as well as bacteriostatic against M. leprae by the kinetic method in mice.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'In the skin diseases, nobody can say what it does',
        laymanDesc:
          'For dermatitis herpetiformis and for acne, the drug works and the prescribing information states that the mechanism has not been established.',
        molecularDetail:
          'Oral label: "The mechanism of action in Dermatitis herpetiformis has not been established." Gel label, section 12.1 in full: "The mechanism of action of dapsone gel in treating acne vulgaris is not known." The working hypothesis is an anti-neutrophil, anti-inflammatory effect independent of folate inhibition, which neither label endorses.',
        iconName: 'HelpCircle',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'Your liver makes the part that hurts you',
        laymanDesc:
          'The body converts some of the drug into a related molecule that oxidises haemoglobin. That conversion, not the drug itself, causes the red cell damage.',
        molecularDetail:
          'N-hydroxylation gives dapsone hydroxylamine, which oxidises haemoglobin iron to methaemoglobin and shortens red cell survival. The label records that trimethoprim-sulfamethoxazole more than doubles hydroxylamine exposure while raising parent drug by only about 40%, and that rifampin, anticonvulsants and St John’s wort may increase hydroxylamine formation.',
        iconName: 'Flame',
        visualStage: 'cellular_entry',
      },
      {
        step: 5,
        title: 'Almost everyone loses some blood',
        laymanDesc:
          'Haemolysis is not a rare side effect of oral dapsone. It is the expected result, in people with and without any enzyme deficiency.',
        molecularDetail:
          'The label: dose-related haemolysis is the most common adverse effect and is seen with or without G6PD deficiency; almost all patients lose 1 to 2 g of haemoglobin with reticulocytes rising 2% to 12%, shortened red cell life span and a rise in methaemoglobin. G6PD-deficient patients have greater responses.',
        iconName: 'Droplet',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And used alone, it eventually loses',
        laymanDesc:
          'Given by itself to leprosy patients carrying enormous bacterial loads, it selected resistant organisms over decades. Its label now excludes proven dapsone-resistant disease.',
        molecularDetail:
          'One hundred consecutive proven cases of sulphone resistance in Malaysia between 1963 and 1974: confined to lepromatous leprosy, relapse 5 to 24 years after starting treatment, low dosage favouring emergence. Multidrug therapy with rifampicin and clofazimine followed, and the label now reads "All forms of leprosy except for cases of proven Dapsone resistance."',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'Zhang FR et al., genome-wide association study of the dapsone hypersensitivity syndrome (N Engl J Med 2013;369:1620-1628)',
        phase:
          'Genome-wide association study with independent replication and four-digit HLA typing',
        sampleSize: 872,
        primaryEndpoint:
          'Genetic association with the dapsone hypersensitivity syndrome among leprosy patients receiving dapsone as part of multidrug therapy',
        endpointMet: true,
        statisticalPValue:
          'HLA-B*13:01 associated at odds ratio 20.53 (P=6.84×10⁻²⁵); SNP rs2844573 between HLA-B and MICA at odds ratio 6.18 (P=3.84×10⁻¹³). Sensitivity 85.5%, specificity 85.7%; absolute risk 1.4% in carriers against 0.2% in non-carriers',
        unreportedAdverseSignals:
          'The discovery cohort contained only 39 cases, with replication in 31 more and 37 in the sequencing series. The allele is common in East and South Asian populations and largely absent in Europeans and Africans, so the test is ancestry-specific and the trial establishes prediction rather than demonstrating that screening prevents cases.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'Pearson JM et al., one hundred proven cases of sulphone resistance in leprosy (Lancet 1975;2:69-72)',
        phase: 'Consecutive clinical case series with mouse footpad drug-sensitivity confirmation',
        sampleSize: 100,
        primaryEndpoint:
          'Confirmation of sulphone resistance in relapsing leprosy patients, by clinical criteria and by drug-sensitivity testing in mice',
        endpointMet: true,
        statisticalPValue:
          'Resistance proved clinically in 80 patients and experimentally in 96, with 76 proved by both and no discrepancy between methods. Resistance confined to lepromatous-type leprosy; relapse appeared 5 to 24 years after the start of sulphone treatment',
        unreportedAdverseSignals:
          'A case series rather than a controlled study, and by design it counts only detected resistance — the true denominator of treated patients is not in it. Its most consequential sentence is a negative one: negative skin smears are no test of cure of lepromatous leprosy, which invalidated the monitoring endpoint the programme had been run on.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'Dapsone gel 5% systemic exposure and 12-month safety programme (Aczone label, sections 12.3 and 5)',
        phase: 'Open-label crossover pharmacokinetic study and long-term open-label safety study',
        sampleSize: 500,
        primaryEndpoint:
          'Systemic exposure to dapsone after topical application against a single 100 mg oral dose, and haematological safety over 12 months of topical use',
        endpointMet: true,
        statisticalPValue:
          'Day-14 topical AUC 415 ± 224 ng·h/mL against oral single-dose AUC 52,641 ± 36,223 ng·h/mL — oral exposure approximately 100 times greater. No evidence of increasing systemic exposure over 12 months in approximately 500 patients',
        unreportedAdverseSignals:
          'The label records that cases of methaemoglobinaemia with resulting hospitalisation have been reported postmarketing with the 5% gel, and that some G6PD-deficient subjects using the gel developed laboratory changes suggestive of haemolysis — findings the pre-approval programme did not produce. No microbiology or resistance studies were conducted at any point in the gel programme.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'One hundred consecutive proven cases of sulphone resistance in leprosy, confined to lepromatous disease, appearing 5 to 24 years after the start of monotherapy and favoured by low dosage',
        'HLA-B*13:01 associated with the dapsone hypersensitivity syndrome at odds ratio 20.53 (P=6.84×10⁻²⁵), sensitivity 85.5%, specificity 85.7%, absolute risk 1.4% against 0.2%',
        'Loss of 1 to 2 g of haemoglobin with reticulocytes rising 2% to 12% in almost all patients on oral dapsone, with or without G6PD deficiency',
        'Topical systemic exposure approximately one hundredth of a 100 mg oral dose (AUC 415 ± 224 against 52,641 ± 36,223 ng·h/mL)',
      ],
      unsupportedInferences: [
        'That dapsone’s effect in dermatitis herpetiformis and acne follows from its antibacterial mechanism — both labels state the mechanism has not been established',
        'That the topical gel does not select for antibacterial resistance on the skin, when the label states no microbiology or resistance studies were conducted at all',
        'That a hundredfold lower systemic exposure removes the class haematological toxicity, contradicted by postmarketing methaemoglobinaemia hospitalisations on the same label',
        'That negative skin smears indicate cure in lepromatous leprosy — the monitoring endpoint the sulphone resistance series explicitly invalidated',
      ],
      whatFailedInitially: [
        'Dapsone monotherapy in leprosy, abandoned for multidrug therapy after resistance emerged across a generation of treated patients',
        'Low-dose regimens, which the resistance series identified as favouring the emergence of resistance — the economy that made mass treatment possible was part of the mechanism',
        'The pre-approval safety programme for the topical gel, which found no clinically relevant haemolysis and was followed by postmarketing methaemoglobinaemia hospitalisations',
        'The resistance question for topical use, which was never asked: the label states no microbiology or resistance studies were conducted in the gel programme',
      ],
      realWorldOutcome: [
        'On the WHO Model List of Essential Medicines and part of leprosy multidrug therapy, which has been supplied without charge to endemic-country programmes',
        'Its United States oral indication now reads "All forms of leprosy except for cases of proven Dapsone resistance" — the exclusion is the historical record',
        'Widely used for Pneumocystis prophylaxis in the United States on an indication its oral label does not carry',
        'Reformulated as a topical gel for acne, creating a commercially protected product from an unpatentable molecule, with a mechanism its own label says is unknown',
      ],
    },
    deliverySystem: {
      type: 'Oral tablets of 25 mg and 100 mg; topical gel at 5% and 7.5% for acne',
      description:
        'Oral dapsone is rapidly and almost completely absorbed, detectable within minutes and peaking at 4 to 8 hours, with daily administration for at least eight days needed to reach a plateau. Plasma half-life varies between individuals from ten to fifty hours and averages twenty-eight, and repeat tests in the same individual are constant. About 85% of the daily intake is recoverable from urine, mainly as water-soluble metabolites. Topical application of the 5% gel twice daily over roughly a fifth of the body surface produced a mean day-14 area under the curve of 415 ± 224 ng·h/mL, against 52,641 ± 36,223 ng·h/mL after a single 100 mg oral dose. The substance is practically insoluble in water and insoluble in fixed and vegetable oils.',
      safetyProfile:
        'Oral dapsone: deaths from agranulocytosis, aplastic anaemia and other blood dyscrasias have been reported, and the label carries the FDA Dermatology Advisory Committee recommendation of weekly blood counts for the first month, monthly for six months and semi-annually thereafter where feasible. Patients should be warned to report sore throat, fever, pallor, purpura or jaundice. Dose-related haemolysis is the most common adverse effect and occurs with or without G6PD deficiency. Cutaneous reactions including exfoliative dermatitis, toxic epidermal necrolysis, erythema multiforme and Stevens-Johnson syndrome are among the most serious complications and require prompt discontinuation. Peripheral neuropathy with predominant motor loss is an unusual complication in non-leprosy patients and generally recovers on withdrawal. Leprosy reactional states are not hypersensitivity reactions and do not require discontinuation. Topical gel: methaemoglobinaemia with resulting hospitalisation has been reported after marketing; it should be avoided in congenital or idiopathic methaemoglobinaemia and in patients taking oral dapsone or antimalarials, and combination with trimethoprim-sulfamethoxazole may increase haemolysis in G6PD deficiency. Benzoyl peroxide applied at the same time can cause temporary yellow or orange discolouration of skin and facial hair.',
    },
    commonQuestions: [
      {
        q: 'Why does the label say "except for cases of proven Dapsone resistance"?',
        a: 'Because that clause is a scar. Dapsone was given alone for leprosy for decades, largely because it was cheap enough to treat everyone. A series of the first hundred proven cases of sulphone resistance, detected in Malaysia between 1963 and 1974, showed the pattern: resistance was confined to patients with lepromatous disease, who carry the largest bacterial loads; relapse appeared five to twenty-four years after treatment started; and low dosage — the economising that made mass treatment affordable — favoured its emergence. Multidrug therapy with rifampicin and clofazimine followed. The most quoted line from that paper is not about resistance at all: the attainment of skin smears negative for leprosy bacilli is no test of cure of lepromatous leprosy. The programme had been monitored on the wrong measurement.',
        auditNote:
          'This is the clearest antibiotic example on this site of a surrogate endpoint that did not convert. Skin smears cleared. The disease did not.',
      },
      {
        q: 'Will it make me anaemic?',
        a: 'To some degree, almost certainly, if you take it by mouth. The label does not treat this as a rare reaction: "Dose-related hemolysis is the most common adverse effect and is seen in patients with or without G6PD deficiency. Almost all patients demonstrate the inter-related changes of a loss of 1 to 2g of hemoglobin, an increase in the reticulocytes (2 to 12%), a shortened red cell life span and a rise in methemoglobin." People with G6PD deficiency have greater responses. The mechanism is that the liver converts some of the drug into dapsone hydroxylamine, which oxidises haemoglobin. That is also why the interactions that matter most are the ones that increase that metabolite rather than the drug itself.',
      },
      {
        q: 'Should I be tested for anything before starting?',
        a: 'Two tests are worth knowing about, and how they are used differs. G6PD deficiency raises the degree of haemolysis, and the label notes it is most prevalent in people of African, South Asian, Middle Eastern and Mediterranean ancestry. Separately, a 2013 genome-wide study identified HLA-B*13:01 as a risk allele for the dapsone hypersensitivity syndrome — a reaction with a reported mortality near 10% — at an odds ratio of 20.53, with 85.5% sensitivity and 85.7% specificity, and absence of the allele associated with a sevenfold lower risk. That allele is carried by roughly 2% to 20% of Chinese people and is largely absent in Europeans and Africans, so it is an ancestry-specific test. Whether either test is done before treatment is a clinical decision this page does not make.',
      },
      {
        q: 'The gel is the same drug. Is it as risky?',
        a: 'Far less, and not zero, and the label carries both halves. Applying the 5% gel twice daily over about a fifth of the body produced roughly one-hundredth of the systemic exposure of a single 100 mg tablet, and a twelve-month study in about 500 patients found no increase in exposure over time and no clinically relevant haemolysis or anaemia, including in G6PD-deficient patients. Then the postmarketing sentence: cases of methaemoglobinaemia with resulting hospitalisation have been reported with the 5% gel, and some G6PD-deficient users developed laboratory changes suggestive of haemolysis. The label’s instruction is specific and worth remembering — a slate-grey discolouration of the lips, gums or nail beds means stop and seek immediate medical attention, and the signs can be delayed some hours.',
      },
      {
        q: 'Does using an antibacterial gel on my face breed resistant bacteria?',
        a: 'Nobody knows, and the label says so in as many words. Its Microbiology section states that no microbiology or immunology studies were conducted during the gel’s clinical trials, that no dapsone resistance studies were conducted, and that because no microbiology studies were done there are no data on whether treatment reduced the susceptibility of the acne organism to other antimicrobials. It then notes, in the same paragraph, that therapeutic resistance to dapsone has been reported for Mycobacterium leprae in patients treated with oral dapsone. So the label knows the molecule can select resistance, and records that the question was not investigated for the product it is describing.',
        auditNote:
          'A licence granted on lesion counts and a public-health question about resistance are different measurements, and here the second one was never taken.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Pearson JM, Rees RJ, Waters MF. Sulphone resistance in leprosy. A review of one hundred proven clinical cases. Lancet 1975;2(7924):69-72',
        identifier: '10.1016/s0140-6736(75)90508-5',
        kind: 'doi',
      },
      {
        label:
          'Zhang FR, Liu H, Irwanto A, et al. HLA-B*13:01 and the dapsone hypersensitivity syndrome. N Engl J Med 2013;369:1620-1628',
        identifier: '10.1056/NEJMoa1213096',
        kind: 'doi',
      },
      {
        label:
          'Dapsone tablets USP, 25 mg and 100 mg — United States prescribing information (Description, Clinical Pharmacology, Indications and Usage, Warnings, Adverse Reactions)',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=839d7440-ba0e-4c56-b648-d374b155cf03',
        kind: 'regulatory',
      },
      {
        label:
          'Dapsone gel, 5% — United States prescribing information (Indications 1, Warnings and Precautions 5.1 to 5.4, Drug Interactions 7.1 to 7.4, Clinical Pharmacology 12.1, 12.3 and Microbiology 12.4)',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=0f1301f6-884d-4fc7-a5b2-421b2375b985',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 2955 — dapsone canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2955',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
]
