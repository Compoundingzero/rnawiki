import type { SeedDossier } from '@/lib/seed-types'

/**
 * Small molecules: anti-infectives and oncology, plus the widely prescribed generics whose evidence
 * base is most often over-read.
 *
 * Four conventions govern this file, and all four exist because these pages will be read
 * adversarially.
 *
 * 1. EVERY STRUCTURE IS THE PUBCHEM CANONICAL SMILES, fetched at research time from
 *    `/rest/pug/compound/name/<name>/property/SMILES,MolecularFormula,MolecularWeight/JSON` and put
 *    through the repository's own deterministic sweep before being written here. The chemical
 *    formula and molecular weight quoted on each record are PubChem's for that exact CID, not a
 *    recollection. Ivermectin is the one compound with no single molecule: the marketed drug is a
 *    mixture of at least 80% component B1a and not more than 20% B1b, so the SMILES stored is
 *    B1a (CID 6321424) and the dossier says so in as many words.
 *
 * 2. PRICING APPEARS ON FOUR PAGES ONLY, because `SeedPricing` demands a cost of production with a
 *    citable source and only four of these drugs have one. Hill, Barber & Gotham (J Virus Erad
 *    2020) published per-day minimum manufacturing costs for hydroxychloroquine, azithromycin and
 *    remdesivir; Hill and colleagues (BMJ Open 2016) published a target generic price for imatinib.
 *    Everywhere else the retail number appears as an acquisition cost from the CMS National Average
 *    Drug Acquisition Cost file, inside `substitutes` or a common question, and the manufacturing
 *    cost is simply absent. Estimating a synthesis cost from the chemistry would be this file
 *    inventing a number, and a reader cannot tell an invented number from a researched one.
 *
 * 3. TWO PAGES HERE ARE INFERENCE-OVERREACH CASE STUDIES AND ARE WRITTEN AS SUCH. Hydroxychloroquine
 *    and ivermectin both have a real in-vitro result, a real published mechanism, a body of
 *    retracted or withdrawn clinical literature, and large randomised trials that found nothing.
 *    Every step of that chain is cited here, retractions included, by their own DOIs. Neither page
 *    argues that the drug is useless: hydroxychloroquine has been an FDA-approved antimalarial and
 *    antirheumatic since 1955 and ivermectin an approved antiparasitic since 1996. The audit is
 *    about one specific inference, made in 2020, from one specific cell-culture experiment.
 *
 * 4. `endpointMet: false` ON A TRIAL THAT HAS NOT REPORTED MEANS "no result exists yet", not "the
 *    endpoint was missed". Where that applies, the trial record says so in
 *    `unreportedAdverseSignals`.
 */
export const SMALL_MOLECULE_INFECTIOUS_ONC_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // Amoxicillin — the most prescribed antibiotic on earth, and the clearest case of a drug that
  // works beautifully for the indication it was tested in and does almost nothing for the one it is
  // most often given for.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'amoxicillin',
    name: 'Amoxicillin',
    tradeName: 'Amoxil / Moxatag',
    sponsor: 'Beecham Research Laboratories (originator); now manufactured generically worldwide',
    targetGene: 'ftsI, pbpA and related bacterial penicillin-binding-protein genes',
    targetProtein: 'Bacterial penicillin-binding proteins (DD-transpeptidases)',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1976,
    indication:
      'Infections caused by susceptible bacteria, including acute otitis media, pharyngitis, sinusitis, community-acquired pneumonia, urinary tract infection, and as part of combination regimens for Helicobacter pylori eradication',
    patientFriendlyIndication: 'Bacterial infections of the ear, throat, sinuses, chest and urine',
    conditionContext: {
      conditionExplainer:
        'Bacteria hold themselves together with a mesh called peptidoglycan, which they must keep rebuilding as they grow. The enzymes that stitch that mesh are called penicillin-binding proteins. Amoxicillin looks enough like the natural building block that the enzyme grabs it and then cannot let go.',
      whyItMatters:
        'Untreated bacterial infections still kill. But most sore throats, coughs and earaches are viral or self-limiting, and an antibiotic given for those cannot help and can harm. The whole clinical question is which infections are which.',
      whoTakesThis:
        'Children with acute otitis media diagnosed on strict otoscopic criteria, adults and children with confirmed streptococcal pharyngitis or community-acquired pneumonia, and patients on Helicobacter pylori eradication regimens.',
      clinicalGoals:
        'Clear the specific bacterial infection with the narrowest effective agent, over the shortest duration a trial has shown to be non-inferior.',
    },
    oneSentenceVerdict:
      'A beta-lactam that jams the enzyme bacteria use to build their cell wall, with a large randomised benefit in strictly diagnosed acute otitis media and essentially none in acute cough where pneumonia is not suspected.',
    laymanHowItWorks:
      'A bacterium is held together by a rigid outer mesh it has to keep repairing as it grows. Amoxicillin is shaped like the piece the repair enzyme normally picks up, so the enzyme picks up the drug instead and is permanently stuck. The mesh stops being repaired, the cell swells under its own internal pressure, and it bursts. Human cells have no such mesh and no such enzyme, which is why the drug can be given to a six-month-old.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 88,
    anatomicalSite: 'Bacterial periplasm and cell wall, at the site of infection',
    substitutes: {
      summary:
        'For the infections amoxicillin treats, the honest alternative is usually not another antibiotic but no antibiotic at all, watched. Where an antibiotic is genuinely indicated, penicillin V, cephalexin and doxycycline cover most of the same ground for a similar few dollars. The comparison that matters is not potency, it is whether a placebo-controlled trial found a benefit in the condition being treated.',
      conventionalRx: [
        {
          name: 'Amoxicillin-clavulanate (Augmentin)',
          class: 'Beta-lactam plus beta-lactamase inhibitor',
          howItCompares:
            'Adds clavulanate to block the bacterial enzyme that destroys amoxicillin, extending cover to beta-lactamase-producing organisms. This is the combination used in the Hoberman otitis media trial, so the strongest randomised evidence in young children is for the combination and not for amoxicillin alone.',
          typicalCost:
            'Amoxicillin itself is US$0.078 per 500 mg capsule at pharmacy acquisition cost (CMS NADAC, effective 19 Aug 2026); the clavulanate combination costs more',
          prosAndCons:
            'Pros: the exact regimen tested in the pivotal paediatric trial. Cons: diarrhoea and diaper dermatitis were both more common than placebo in that trial.',
        },
        {
          name: 'Cephalexin (generic)',
          class: 'First-generation cephalosporin',
          howItCompares:
            'Same mechanism, different beta-lactam scaffold. Commonly used for skin and soft-tissue infection where amoxicillin cover is inadequate.',
          typicalCost:
            'US$0.121 per 500 mg capsule at pharmacy acquisition cost (CMS NADAC, effective 19 Aug 2026)',
          prosAndCons:
            'Pros: cheap, oral, well characterised. Cons: cross-reactivity in a minority of genuinely penicillin-allergic patients.',
        },
        {
          name: 'Doxycycline (generic)',
          class: 'Tetracycline, bacterial 30S ribosome inhibitor',
          howItCompares:
            'A different mechanism entirely, covering atypical respiratory pathogens amoxicillin misses. Not interchangeable, and not for children under eight or in pregnancy.',
          typicalCost:
            'US$0.105 per 100 mg capsule at pharmacy acquisition cost (CMS NADAC, effective 19 Aug 2026)',
          prosAndCons:
            'Pros: covers Mycoplasma and Chlamydophila. Cons: photosensitivity, and it is contraindicated in young children.',
        },
        {
          name: 'Watchful waiting with analgesia',
          class: 'No antibiotic',
          howItCompares:
            'In the Tahtinen placebo-controlled trial of acute otitis media, most children in the placebo group recovered without an antibiotic. The trial measured a real benefit for treatment, but from a baseline of substantial spontaneous resolution.',
          typicalCost: 'The cost of paracetamol or ibuprofen',
          prosAndCons:
            'Pros: no resistance selection, no drug adverse effects. Cons: a longer symptomatic course, and it requires a safety net for the child who deteriorates.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask what was actually diagnosed, and on what',
          action:
            'Ask whether the diagnosis was made by looking at the eardrum, by a throat swab or chest film, or by the pattern of symptoms alone.',
          patientImpact:
            'The two positive randomised trials in acute otitis media both used stringent otoscopic entry criteria. The trial that found essentially no benefit, GRACE, enrolled adults with acute cough in whom pneumonia was not suspected. The same drug, tested against placebo, gave opposite answers in the two settings.',
          clinicalPrecaution:
            'This is a question about diagnosis, not a reason to stop a prescribed course early. Stopping partway through is not one of the strategies any of these trials tested.',
        },
        {
          name: 'Get a penicillin allergy label checked rather than inherited',
          action:
            'If a penicillin allergy was recorded in childhood and never re-tested, ask about formal assessment.',
          patientImpact:
            'In the PALACE randomised trial, a direct oral penicillin challenge in adults scored as low risk on the PEN-FAST rule was non-inferior to skin testing followed by challenge, with one positive challenge in 187 patients in each arm. Fewer than 5% of people carrying a penicillin allergy label are actually allergic.',
          clinicalPrecaution:
            'Direct oral challenge is an in-clinic procedure for patients assessed as low risk. It is never something to attempt at home.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1([C@@H](N2[C@H](S1)[C@@H](C2=O)NC(=O)[C@@H](C3=CC=C(C=C3)O)N)C(=O)O)C',
      chemicalFormula: 'C16H19N3O5S',
      molecularWeight: '365.4 g/mol (PubChem CID 33613, amoxicillin anhydrous free acid)',
      targetReceptorAffinity:
        'Acylates the active-site serine of bacterial DD-transpeptidases irreversibly; potency is reported clinically as a minimum inhibitory concentration against the isolate, not as a binding constant',
      structureSource: {
        label: 'PubChem CID 33613 — Amoxicillin, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/33613',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'amx-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity and purity control of 6-aminopenicillanic acid and the side-chain acid',
          description:
            'Confirm the identity, water content and optical purity of the 6-aminopenicillanic acid nucleus and of D-(-)-4-hydroxyphenylglycine before any coupling. The wrong enantiomer of the side chain produces a diastereomer with no antibacterial activity that co-crystallises with the product.',
          reagentsAndBuffer:
            '6-aminopenicillanic acid reference standard, D-(-)-4-hydroxyphenylglycine, Karl Fischer titration, chiral HPLC on a teicoplanin stationary phase, 1H NMR in D2O with sodium 3-(trimethylsilyl)propionate',
        },
        {
          id: 'amx-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Enzymatic acylation of 6-aminopenicillanic acid',
          description:
            'Couple the activated D-4-hydroxyphenylglycine derivative onto the free amine of 6-aminopenicillanic acid using immobilised penicillin G acylase in aqueous suspension, holding the pH so that the kinetically controlled acylation outruns hydrolysis of both the acyl donor and the product.',
          dependsOnStepId: 'amx-w1',
          reagentsAndBuffer:
            'Immobilised penicillin G acylase from Escherichia coli, D-4-hydroxyphenylglycine methyl ester, 0.1 M phosphate buffer held at pH 6.3 and 15 degrees C, ammonia for pH-stat control',
        },
        {
          id: 'amx-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Isoelectric crystallisation of the trihydrate',
          description:
            'Precipitate amoxicillin at its isoelectric point, where the zwitterion has minimum solubility, then recrystallise to the trihydrate and dry under controlled humidity. Over-drying converts the trihydrate to a less stable form and the residual solvent specification then fails.',
          dependsOnStepId: 'amx-w2',
          reagentsAndBuffer:
            'Dilute hydrochloric acid and ammonia for pH adjustment to approximately 4.7, water for injection, isopropanol antisolvent, controlled-humidity vacuum drying',
        },
        {
          id: 'amx-w4',
          stepNumber: 4,
          phase: 'Assay_Quantification',
          name: 'Potency by HPLC and activity by broth microdilution',
          description:
            'Quantify assay and related substances by reversed-phase HPLC against the pharmacopoeial reference standard, then measure the minimum inhibitory concentration against reference strains by broth microdilution so that chemical potency and biological activity are confirmed separately.',
          dependsOnStepId: 'amx-w3',
          reagentsAndBuffer:
            'C18 column with phosphate buffer and acetonitrile gradient, USP amoxicillin reference standard, cation-adjusted Mueller-Hinton broth, Streptococcus pneumoniae ATCC 49619 and Escherichia coli ATCC 25922 quality-control strains',
        },
      ],
    },
    keyAudits: [
      {
        id: 'amx-a1',
        category: 'measured',
        title:
          'Acute otitis media in children aged 6 to 23 months: clinical failure fell from 51% to 16%',
        laymanSummary:
          'In 291 young children whose eardrums were examined against strict criteria, treatment cut the rate of persistent infection on examination from about half to about one in six.',
        technicalDetails:
          'Randomised, double-blind, placebo-controlled. Amoxicillin-clavulanate for 10 days versus placebo. Clinical failure, defined as persistence of signs of acute infection on otoscopy, occurred in 4% versus 23% at or before day 4 or 5 (P<0.001) and 16% versus 51% at or before day 10 to 12 (P<0.001). Sustained symptom resolution favoured treatment (P=0.04) but initial symptom resolution did not (P=0.14): the drug changed what the ear looked like sooner than it changed how the child felt.',
        evidenceSource: 'Hoberman A et al., N Engl J Med 2011;364:105-115 (NCT00377260)',
        doi: '10.1056/NEJMoa0912254',
        measuredMetric: 'Rate of clinical failure on otoscopic examination at day 10 to 12',
        auditFlag: 'verified',
      },
      {
        id: 'amx-a2',
        category: 'failed',
        title:
          'GRACE: no benefit for acute lower respiratory tract infection in 2,061 primary-care adults',
        laymanSummary:
          'In the largest placebo-controlled trial of amoxicillin for an acute cough, the drug did not shorten symptoms, and it caused more side effects than it prevented complications.',
        technicalDetails:
          'Twelve countries, 1,038 patients on amoxicillin 1 g three times daily for 7 days versus 1,023 on placebo, all with cough of 28 days or less and no clinical suspicion of pneumonia. Duration of symptoms rated moderately bad or worse: hazard ratio 1.06 (95% CI 0.96 to 1.18; P=0.229). Mean symptom severity 1.62 versus 1.69 (P=0.074). New or worsening symptoms were less common on amoxicillin (15.9% versus 19.3%; P=0.043; number needed to treat 30) while nausea, rash or diarrhoea were more common (number needed to harm 21), and there was one case of anaphylaxis. No selective benefit was found in patients aged 60 or over.',
        evidenceSource: 'Little P et al., Lancet Infect Dis 2013;13:123-129',
        doi: '10.1016/S1473-3099(12)70300-6',
        measuredMetric: 'Duration of symptoms rated moderately bad or worse',
        auditFlag: 'verified',
      },
      {
        id: 'amx-a3',
        category: 'conclusion_shift',
        title: 'CAP-IT: three days was non-inferior to seven in childhood pneumonia',
        laymanSummary:
          'A randomised trial found that three days of amoxicillin worked as well as seven for children discharged with community-acquired pneumonia, on the outcome of needing another antibiotic.',
        technicalDetails:
          'A 2x2 factorial non-inferiority trial in 824 children aged 6 months and over, discharged from emergency departments or wards in 28 UK hospitals and one Irish hospital. Antibiotic re-treatment for respiratory infection within 28 days occurred in 12.5% with 3 days and 12.5% with 7 days (difference 0.1%, one-sided 95% CI up to 3.9%, non-inferiority margin 8%), and in 12.6% with the lower dose versus 12.4% with the higher (difference 0.2%). Cough lasted a median of 12 days on 3 days of treatment versus 10 days on 7 days (HR 1.2; P=0.04), so the shorter course was not free of cost.',
        evidenceSource: 'Bielicki JA et al., JAMA 2021;326:1713-1724 (ISRCTN76888927)',
        doi: '10.1001/jama.2021.17843',
        measuredMetric: 'Clinically indicated antibiotic re-treatment within 28 days',
        auditFlag: 'verified',
      },
      {
        id: 'amx-a4',
        category: 'inferred',
        title: 'The penicillin allergy label is inherited far more often than it is verified',
        laymanSummary:
          'Most people carrying a penicillin allergy label are not allergic, and the label pushes them onto broader, more expensive antibiotics for the rest of their lives.',
        technicalDetails:
          'Fewer than 5% of patients labelled penicillin-allergic are truly allergic. In PALACE, a multicentre randomised non-inferiority trial across six specialist centres in North America and Australia, adults scoring below 3 on the PEN-FAST decision rule were assigned to direct oral penicillin challenge or to skin testing followed by challenge. A physician-verified positive immune-mediated challenge occurred in 1 of 187 (0.5%) and 1 of 190 (0.5%), risk difference 0.0084 percentage points (90% CI -1.22 to 1.24), within the 5-percentage-point non-inferiority margin. No serious adverse events occurred.',
        evidenceSource: 'Copaescu AM et al., JAMA Intern Med 2023;183:944-952 (NCT04454229)',
        doi: '10.1001/jamainternmed.2023.2986',
        inferredClaim:
          'That a childhood rash recorded as a penicillin allergy predicts a current IgE-mediated reaction',
        auditFlag: 'verified',
      },
      {
        id: 'amx-a5',
        category: 'measured',
        title: 'Tahtinen: the parallel placebo-controlled trial replicated the otitis media result',
        laymanSummary:
          'A second randomised trial published in the same issue of the same journal, run by a different group in a different country, found the same thing.',
        technicalDetails:
          'A placebo-controlled trial of amoxicillin-clavulanate in children aged 6 to 35 months with acute otitis media diagnosed on stringent criteria, published alongside Hoberman. Two independent trials reaching a concordant conclusion in the same population is the reason this indication is graded as replicated here, and the reason the acute-cough result is graded separately.',
        evidenceSource: 'Tahtinen PA et al., N Engl J Med 2011;364:116-126',
        doi: '10.1056/NEJMoa1007174',
        auditFlag: 'verified',
      },
      {
        id: 'amx-a6',
        category: 'inferred',
        title: 'Resistance is a population-level cost that no individual prescription trial measures',
        laymanSummary:
          'Every trial here counts what happened to the patients in it. None of them count what the prescribing did to the bacteria everyone else will meet.',
        technicalDetails:
          'The GBD antimicrobial resistance study estimated 4.95 million deaths (95% UI 3.62 to 6.57 million) associated with bacterial antimicrobial resistance in 2019, of which 1.27 million (0.911 to 1.71 million) were attributable to it. Lower respiratory infections were the most burdensome syndrome. That figure is an ecological estimate across 204 countries, not an outcome measured in any amoxicillin trial, and the two cannot be added together or traded off within a single randomised comparison.',
        evidenceSource: 'Murray CJL et al., Lancet 2022;399:629-655',
        doi: '10.1016/S0140-6736(21)02724-0',
        inferredClaim:
          'That the individual benefit measured in a treatment trial is the whole of the benefit-harm calculation for an antibiotic',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed, absorbed and delivered to the infected tissue',
        laymanDesc:
          'Amoxicillin survives stomach acid better than the penicillin it was derived from, so most of an oral dose reaches the bloodstream and then the infected tissue.',
        molecularDetail:
          'The para-hydroxyl and alpha-amino groups on the phenylglycine side chain raise acid stability and oral bioavailability relative to benzylpenicillin. Distribution is mainly extracellular, with penetration into middle-ear fluid, sinus secretions and lung tissue; clearance is predominantly renal and largely unchanged drug.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Through the bacterial outer layers to the periplasm',
        laymanDesc:
          'The drug has to get past the bacterium outer coat to reach the space where the wall is being built.',
        molecularDetail:
          'In Gram-negative organisms the drug crosses the outer membrane through porin channels into the periplasmic space. In Gram-positive organisms the thick peptidoglycan layer is directly accessible. Where a bacterium expresses a beta-lactamase in that space, the drug is hydrolysed before it ever reaches its target, which is why the clavulanate combination exists.',
        iconName: 'ArrowDown',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The beta-lactam ring mimics the natural substrate',
        laymanDesc:
          'The strained four-membered ring at the heart of the molecule looks like the end of the chain the wall-building enzyme normally grabs.',
        molecularDetail:
          'The beta-lactam ring is a structural analogue of the D-alanyl-D-alanine terminus of the peptidoglycan pentapeptide. Penicillin-binding proteins recognise it as substrate and the active-site serine attacks the carbonyl.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The enzyme is acylated and never released',
        laymanDesc:
          'The enzyme grabs the drug, opens the ring and then cannot let go. Every enzyme that does this is permanently out of service.',
        molecularDetail:
          'Nucleophilic attack by the active-site serine opens the strained beta-lactam ring, forming a covalent penicilloyl-enzyme ester that hydrolyses orders of magnitude more slowly than the natural acyl-enzyme intermediate. Transpeptidation stops, so new peptidoglycan strands are laid down without being cross-linked.',
        iconName: 'Lock',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The wall fails and the cell lyses',
        laymanDesc:
          'With the mesh no longer being cross-linked while the cell keeps growing, internal pressure tears it open.',
        molecularDetail:
          'Uncross-linked peptidoglycan cannot resist turgor pressure, and the bacterium activates its own autolysins, so killing is bactericidal rather than merely inhibitory. This is a time-dependent effect: efficacy tracks the fraction of the dosing interval during which free drug exceeds the minimum inhibitory concentration, not the peak level.',
        iconName: 'Zap',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Hoberman acute otitis media trial (NCT00377260)',
        phase: 'Phase 4 randomised placebo-controlled',
        sampleSize: 291,
        primaryEndpoint:
          'Time to resolution of symptoms and rate of clinical failure on otoscopy in children aged 6 to 23 months',
        endpointMet: true,
        statisticalPValue: 'P < 0.001 for clinical failure at day 10 to 12',
        unreportedAdverseSignals:
          'Diarrhoea and diaper-area dermatitis were both more common with amoxicillin-clavulanate than with placebo.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Tahtinen acute otitis media trial',
        phase: 'Randomised placebo-controlled',
        sampleSize: 319,
        primaryEndpoint: 'Time to treatment failure in children aged 6 to 35 months',
        endpointMet: true,
        statisticalPValue: 'Reported as significant in favour of amoxicillin-clavulanate',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'GRACE-10 (ISRCTN52261229, EudraCT 2007-001586-15)',
        phase: 'Randomised placebo-controlled, 12 countries',
        sampleSize: 2061,
        primaryEndpoint:
          'Duration of symptoms rated moderately bad or worse in acute lower respiratory tract infection without suspected pneumonia',
        endpointMet: false,
        statisticalPValue: 'P = 0.229 (hazard ratio 1.06, 95% CI 0.96 to 1.18)',
        unreportedAdverseSignals:
          'Nausea, rash or diarrhoea were significantly more common on amoxicillin, number needed to harm 21, and one case of anaphylaxis occurred.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'CAP-IT (ISRCTN76888927)',
        phase: 'Phase 4 randomised 2x2 factorial non-inferiority',
        sampleSize: 824,
        primaryEndpoint:
          'Clinically indicated antibiotic re-treatment for respiratory infection within 28 days',
        endpointMet: true,
        statisticalPValue: 'Non-inferiority met for both dose and duration; margin 8%',
        unreportedAdverseSignals:
          'Cough lasted a median of two days longer on the three-day course, and sleep disturbed by cough was likewise longer.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'PALACE (NCT04454229)',
        phase: 'Randomised open-label non-inferiority',
        sampleSize: 382,
        primaryEndpoint:
          'Physician-verified positive immune-mediated oral penicillin challenge within 1 hour',
        endpointMet: true,
        statisticalPValue:
          'Risk difference 0.0084 percentage points (90% CI -1.22 to 1.24), within the 5-point margin',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Clinical failure on otoscopy fell from 51% to 16% by day 10 to 12 in 291 children aged 6 to 23 months with stringently diagnosed acute otitis media',
        'Three days of amoxicillin was non-inferior to seven days for antibiotic re-treatment within 28 days in 824 children with community-acquired pneumonia',
        'Direct oral penicillin challenge was non-inferior to skin testing in 382 adults assessed as low risk, with one positive challenge in each arm',
      ],
      unsupportedInferences: [
        'That because amoxicillin works in strictly diagnosed acute otitis media it also works for acute cough: the GRACE trial tested that directly in 2,061 adults and found a hazard ratio of 1.06',
        'That a penicillin allergy recorded in childhood is a current allergy',
        'That the benefit measured in an individual patient trial is the whole benefit-harm calculation, when resistance selection is a population-level cost no such trial measures',
      ],
      whatFailedInitially: [
        'GRACE: no reduction in symptom duration or severity for acute lower respiratory tract infection in primary care, with a number needed to harm of 21 for nausea, rash or diarrhoea',
        'In the Hoberman trial, initial symptom resolution did not differ significantly from placebo (P=0.14) even though otoscopic failure did',
      ],
      realWorldOutcome: [
        'Amoxicillin remains one of the most prescribed medicines in the world, at US$0.078 per 500 mg capsule in the US acquisition-cost dataset',
        'The GBD study estimated 1.27 million deaths attributable to bacterial antimicrobial resistance in 2019, a burden that accrues from prescribing decisions no individual trial captures',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule, tablet, chewable tablet and powder for oral suspension',
      description:
        'Given by mouth two or three times daily. Acid stability is what distinguishes amoxicillin from benzylpenicillin: the para-hydroxyl and alpha-amino substituents on the side chain let it survive gastric acid and be absorbed largely intact, which is why the same molecular target can be reached with a capsule rather than an injection.',
      safetyProfile:
        'The most common adverse effects are diarrhoea, nausea and rash. A morbilliform rash during amoxicillin treatment of infectious mononucleosis is common and is not evidence of IgE-mediated penicillin allergy. True anaphylaxis is rare but occurred once in the 1,038 patients treated in the GRACE trial. Clostridioides difficile infection is a recognised complication of any broad-spectrum antibacterial course.',
    },
    commonQuestions: [
      {
        q: 'If it works so well for ear infections, why not for a chest cough?',
        a: 'Because the two were tested separately and gave opposite answers. In 291 young children with acute otitis media diagnosed by strict examination of the eardrum, treatment cut otoscopic failure from 51% to 16%. In 2,061 adults with acute cough in whom pneumonia was not suspected, the hazard ratio for symptom duration was 1.06, meaning no difference, while side effects were more common than in placebo. The drug did not change; the disease being treated did.',
        auditNote:
          'This is the single most useful sentence on this page: an antibiotic that is highly effective for one infection is not thereby effective for a different one.',
      },
      {
        q: 'Do I have to finish the whole course?',
        a: 'Finish the course you were prescribed, and separately ask your prescriber how long the course should be. Those are different questions. The CAP-IT trial randomised 824 children to three days or seven days of amoxicillin for pneumonia and found three days non-inferior for the need for re-treatment, and SCOUT-CAP reached a comparable conclusion in a US paediatric population. What no trial has tested is a patient deciding mid-course to stop.',
      },
      {
        q: 'Why does this page have no manufacturing cost?',
        a: 'Because no published per-unit cost-of-production figure for amoxicillin was verified for this record. Hill and colleagues showed in BMJ Global Health that a wide range of essential medicines can be made profitably at very low cost, with estimated generic prices from US$0.01 to US$1.45 per unit, but that paper reports the method and the aggregate rather than a per-drug figure this page could quote. The retail acquisition cost is quoted where a government dataset publishes it: US$0.078 per 500 mg capsule in the CMS NADAC file effective 19 August 2026.',
      },
      {
        q: 'I was told I am allergic to penicillin. Is that final?',
        a: 'Usually not. Fewer than 5% of people carrying the label turn out to be allergic on testing, and the label pushes patients onto broader and costlier antibiotics for decades. The PALACE randomised trial showed that in adults scored as low risk on the PEN-FAST rule, a direct oral challenge in clinic was as safe as the older two-stage skin-testing pathway, with one positive challenge in 187 patients versus one in 190. That is a conversation for a clinician, not an experiment to run at home.',
      },
      {
        q: 'What is the strongest argument against taking it?',
        a: 'That the infection may not be bacterial, or may resolve on its own. In the placebo arm of the Tahtinen otitis media trial most children recovered without an antibiotic, and in GRACE the placebo group did as well as the treated group. Against that, resistance is a real and quantified population harm: the GBD study estimated 1.27 million deaths attributable to bacterial resistance in 2019. Neither point argues against treating a confirmed bacterial infection.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Hoberman A et al. Treatment of Acute Otitis Media in Children under 2 Years of Age. N Engl J Med 2011;364:105-115',
        identifier: '10.1056/NEJMoa0912254',
        kind: 'doi',
      },
      {
        label:
          'Tahtinen PA et al. A Placebo-Controlled Trial of Antimicrobial Treatment for Acute Otitis Media. N Engl J Med 2011;364:116-126',
        identifier: '10.1056/NEJMoa1007174',
        kind: 'doi',
      },
      {
        label:
          'Little P et al. Amoxicillin for acute lower-respiratory-tract infection in primary care when pneumonia is not suspected. Lancet Infect Dis 2013;13:123-129',
        identifier: '10.1016/S1473-3099(12)70300-6',
        kind: 'doi',
      },
      {
        label:
          'Bielicki JA et al. Effect of Amoxicillin Dose and Treatment Duration on the Need for Antibiotic Re-treatment in Children With Community-Acquired Pneumonia (CAP-IT). JAMA 2021;326:1713-1724',
        identifier: '10.1001/jama.2021.17843',
        kind: 'doi',
      },
      {
        label:
          'Williams DJ et al. Short- vs Standard-Course Outpatient Antibiotic Therapy for Community-Acquired Pneumonia in Children (SCOUT-CAP). JAMA Pediatr 2022;176:253-261',
        identifier: '10.1001/jamapediatrics.2021.5547',
        kind: 'doi',
      },
      {
        label:
          'Copaescu AM et al. Efficacy of a Clinical Decision Rule to Enable Direct Oral Challenge in Patients With Low-Risk Penicillin Allergy: The PALACE Randomized Clinical Trial. JAMA Intern Med 2023;183:944-952',
        identifier: '10.1001/jamainternmed.2023.2986',
        kind: 'doi',
      },
      {
        label:
          'Murray CJL et al. Global burden of bacterial antimicrobial resistance in 2019: a systematic analysis. Lancet 2022;399:629-655',
        identifier: '10.1016/S0140-6736(21)02724-0',
        kind: 'doi',
      },
      {
        label:
          'Hill A, Barber MJ, Gotham D. Estimated costs of production and potential prices for the WHO Essential Medicines List. BMJ Glob Health 2018;3:e000571',
        identifier: '10.1136/bmjgh-2017-000571',
        kind: 'doi',
      },
      {
        label: 'Acute Otitis Media (AOM) Therapy Trial in Young Children',
        identifier: 'NCT00377260',
        kind: 'nct',
      },
      {
        label: 'PALACE: penicillin allergy clinical decision rule and direct oral challenge',
        identifier: 'NCT04454229',
        kind: 'nct',
      },
      {
        label: 'Amoxicillin capsules, US prescribing information — DailyMed',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=7e3a4517-1934-4e03-b96b-4ad65ab076c5',
        kind: 'regulatory',
      },
      {
        label: 'CMS National Average Drug Acquisition Cost (NADAC) 2026 file',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 33613 — Amoxicillin',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/33613',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Azithromycin — a macrolide with a genuine, enormous, replicated mortality result in one setting
  // and a null result in almost every other one it was hopefully tried in.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'azithromycin',
    name: 'Azithromycin',
    tradeName: 'Zithromax / Z-Pak',
    sponsor: 'Pliva (originator, Croatia); licensed to and developed by Pfizer',
    targetGene: 'rrl, the bacterial 23S ribosomal RNA gene of the 50S subunit',
    targetProtein: 'Bacterial 50S ribosomal subunit, at the nascent peptide exit tunnel',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1991,
    indication:
      'Community-acquired pneumonia, pharyngitis and tonsillitis, acute bacterial exacerbation of chronic bronchitis, uncomplicated skin infections, urethritis and cervicitis due to Chlamydia trachomatis or Neisseria gonorrhoeae, and trachoma control programmes',
    patientFriendlyIndication:
      'Chest, throat, skin and sexually transmitted bacterial infections, and mass treatment for trachoma',
    conditionContext: {
      conditionExplainer:
        'Bacteria build their proteins on a two-part machine called a ribosome. Azithromycin plugs the tunnel the growing protein chain has to travel down, so the chain stalls and falls off. Human ribosomes are built differently and are not blocked.',
      whyItMatters:
        'Azithromycin also concentrates inside white blood cells and lingers for days, which is why a three or five day course covers a week of treatment. That same property is what made researchers wonder whether it does something beyond killing bacteria, and that question is where most of the disappointing trials came from.',
      whoTakesThis:
        'Adults and children with the labelled bacterial infections, people treated for chlamydia, adults with severe uncontrolled asthma in some guidelines, and entire communities of preschool children in trachoma and child-survival programmes in sub-Saharan Africa.',
      clinicalGoals:
        'Clear the specific infection, or in mass-administration programmes reduce all-cause childhood mortality at the community level.',
    },
    oneSentenceVerdict:
      'A macrolide that stalls bacterial protein synthesis, with a 13.5% reduction in all-cause childhood mortality across 1,533 randomised communities in the MORDOR trial and no benefit whatever in hospitalised COVID-19 across 7,763 randomised patients in RECOVERY.',
    laymanHowItWorks:
      'Bacteria make proteins on a machine that feeds the finished protein out through a narrow tunnel. Azithromycin sits in that tunnel like a cork. Chains that cannot get out cause the machine to stall and drop them, so the bacterium stops growing. The drug is also taken up by your own white blood cells and released slowly from them, which is why a short course keeps working after the last tablet.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 74,
    anatomicalSite: 'Bacterial ribosome; drug concentrates in phagocytes and tissue',
    pricing: {
      synthesisCostPerDose:
        'US$0.10 per day of treatment, the minimum estimated cost of production from active-pharmaceutical-ingredient export prices, in a published analysis of repurposing candidates',
      retailPricePerDoseOrYear:
        'US$0.268 per 250 mg tablet and US$0.560 per 500 mg tablet at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026), so roughly US$1.62 for a standard six-tablet 250 mg course',
      markupEstimate:
        'US acquisition cost for a 250 mg tablet is roughly 2.7 times the published minimum cost of production per day of treatment. This is an off-patent generic and the gap is small by the standards of this dataset.',
      openPatentNotes:
        'Discovered at Pliva in Zagreb in 1980 and patented in 1981; composition-of-matter protection expired long ago and the drug is on the WHO Model List of Essential Medicines. Manufactured generically at scale worldwide.',
      synthesisComplexity: 'Moderate',
      costSource: {
        label:
          'Hill A, Barber MJ, Gotham D. Minimum costs to manufacture new treatments for COVID-19. J Virus Erad 2020;6:61-69',
        identifier: '10.1016/S2055-6640(20)30018-2',
        kind: 'doi',
      },
      priceSource: {
        label: 'CMS National Average Drug Acquisition Cost (NADAC) 2026 file',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    },
    substitutes: {
      summary:
        'For most labelled indications a narrower agent does the same job. The one setting where nothing substitutes for azithromycin is mass drug administration for child survival, and that is precisely the setting where its own trials showed it selects for resistance.',
      conventionalRx: [
        {
          name: 'Doxycycline (generic)',
          class: 'Tetracycline',
          howItCompares:
            'Covers the same atypical respiratory pathogens and is the preferred agent for chlamydial infection in several current guidelines. A seven-day course rather than a single dose.',
          typicalCost:
            'US$0.105 per 100 mg capsule at pharmacy acquisition cost (CMS NADAC, effective 19 Aug 2026)',
          prosAndCons:
            'Pros: no QT effect, cheaper, better rectal chlamydia cure rates. Cons: longer course, photosensitivity, avoided in pregnancy and young children.',
        },
        {
          name: 'Amoxicillin (generic)',
          class: 'Beta-lactam',
          howItCompares:
            'First-line for typical bacterial respiratory infection where atypical cover is not needed. In the Ray cardiovascular cohort, amoxicillin showed no increase in the risk of death during the same five-day window in which azithromycin did.',
          typicalCost:
            'US$0.078 per 500 mg capsule at pharmacy acquisition cost (CMS NADAC, effective 19 Aug 2026)',
          prosAndCons:
            'Pros: narrower spectrum, no proarrhythmic signal in that cohort. Cons: no cover for Mycoplasma or Chlamydophila.',
        },
        {
          name: 'Clarithromycin',
          class: 'Macrolide',
          howItCompares:
            'Same ribosomal target and same class-level QT concern, with substantially more cytochrome P450 3A4 interaction than azithromycin.',
          typicalCost: 'Not priced here — no current acquisition-cost figure verified for this record',
          prosAndCons:
            'Pros: useful in Helicobacter pylori regimens. Cons: heavier drug-interaction burden.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask whether an antibiotic is being given for a virus',
          action:
            'Ask specifically whether the illness being treated is thought to be bacterial, and what would change if it is not.',
          patientImpact:
            'Both large randomised COVID-19 trials of azithromycin, RECOVERY in hospital and PRINCIPLE in the community, found no benefit. That is a direct measurement of what happens when a macrolide is given for a viral illness on the theory that it is anti-inflammatory.',
          clinicalPrecaution:
            'Some viral illnesses are complicated by genuine bacterial superinfection, which is a clinical judgement and not a rule a patient can apply alone.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CC[C@@H]1[C@@]([C@@H]([C@H](N(C[C@@H](C[C@@]([C@@H]([C@H]([C@@H]([C@H](C(=O)O1)C)O[C@H]2C[C@@]([C@H]([C@@H](O2)C)O)(C)OC)C)O[C@H]3[C@@H]([C@H](C[C@H](O3)C)N(C)C)O)(C)O)C)C)C)O)(C)O',
      chemicalFormula: 'C38H72N2O12',
      molecularWeight: '749.0 g/mol (PubChem CID 447043, azithromycin free base)',
      targetReceptorAffinity:
        'Binds the 23S ribosomal RNA of the 50S subunit near the peptide exit tunnel; clinical potency is reported as a minimum inhibitory concentration against the isolate',
      structureSource: {
        label: 'PubChem CID 447043 — Azithromycin, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/447043',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'azi-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Control of the erythromycin A starting material',
          description:
            'Azithromycin is made from erythromycin A, itself a fermentation product, so the starting material is a mixture. Confirm the erythromycin A content and the levels of the B and C congeners before the ring expansion, because each congener produces its own azithromycin analogue that the final purification must then remove.',
          reagentsAndBuffer:
            'Erythromycin A thiocyanate or base, reference standards for erythromycin B and C, reversed-phase HPLC with electrochemical or evaporative light-scattering detection, Karl Fischer titration',
        },
        {
          id: 'azi-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Oximation, Beckmann ring expansion, reduction and N-methylation',
          description:
            'Convert the C9 ketone of erythromycin A to the oxime, rearrange the oxime to the ring-expanded lactam under Beckmann conditions, reduce the imino ether to the secondary amine, and finish with reductive N-methylation to install the tertiary amine that defines the azalide class.',
          dependsOnStepId: 'azi-w1',
          reagentsAndBuffer:
            'Hydroxylamine hydrochloride in methanol with pyridine; p-toluenesulfonyl chloride in aqueous acetone with sodium bicarbonate for the Beckmann rearrangement; sodium borohydride in methanol; formaldehyde and formic acid for Eschweiler-Clarke reductive methylation',
        },
        {
          id: 'azi-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation as the dihydrate',
          description:
            'Crystallise azithromycin dihydrate from aqueous acetone and control the water content, since the monohydrate and dihydrate differ in stability and in dissolution behaviour. The related-substances specification is set by the congeners carried through from fermentation.',
          dependsOnStepId: 'azi-w2',
          reagentsAndBuffer:
            'Acetone and water antisolvent system, controlled cooling profile, seeding with dihydrate crystals, controlled-humidity drying',
        },
        {
          id: 'azi-w4',
          stepNumber: 4,
          phase: 'Assay_Quantification',
          name: 'Potency by HPLC and susceptibility by broth microdilution',
          description:
            'Assay content and related substances against the pharmacopoeial standard, then confirm biological activity by measuring minimum inhibitory concentrations against reference strains, including a macrolide-resistant control so that the assay can distinguish a potency failure from a resistance phenotype.',
          dependsOnStepId: 'azi-w3',
          reagentsAndBuffer:
            'C18 column with phosphate buffer and acetonitrile, USP azithromycin reference standard, cation-adjusted Mueller-Hinton broth with lysed horse blood, Streptococcus pneumoniae ATCC 49619 quality-control strain',
        },
      ],
    },
    keyAudits: [
      {
        id: 'azi-a1',
        category: 'measured',
        title: 'MORDOR: 13.5% lower all-cause childhood mortality across 1,533 communities',
        laymanSummary:
          'Giving every preschool child in a community two doses a year of azithromycin reduced deaths from all causes by about one in seven, in a placebo-controlled trial covering 190,238 children.',
        technicalDetails:
          'Cluster-randomised, placebo-controlled trial in Malawi, Niger and Tanzania. 1,533 communities, 190,238 children identified at census, 323,302 person-years monitored, mean coverage 90.4%. Annual mortality was 14.6 per 1,000 person-years with azithromycin and 16.5 with placebo, a 13.5% reduction overall (95% CI 6.7 to 19.8; P<0.001). Country effects differed sharply: 18.1% lower in Niger (95% CI 10.0 to 25.5), 5.7% in Malawi (95% CI -9.7 to 18.9) and 3.4% in Tanzania (95% CI -21.2 to 23.0). The largest effect was in infants aged 1 to 5 months, at 24.9% (95% CI 10.6 to 37.0).',
        evidenceSource: 'Keenan JD et al., N Engl J Med 2018;378:1583-1592 (NCT02047981)',
        doi: '10.1056/NEJMoa1715474',
        measuredMetric: 'All-cause mortality in children aged 1 to 59 months, per 1,000 person-years',
        auditFlag: 'verified',
      },
      {
        id: 'azi-a2',
        category: 'failed',
        title: 'RECOVERY: no survival benefit in 7,763 patients hospitalised with COVID-19',
        laymanSummary:
          'Azithromycin was given to hospitalised COVID-19 patients on the theory that it calms inflammation. In the largest randomised test, exactly 22% died in each group.',
        technicalDetails:
          'Randomised, controlled, open-label platform trial at 176 UK hospitals. 2,582 patients allocated azithromycin 500 mg daily for 10 days and 5,181 to usual care alone. 28-day all-cause mortality was 561 of 2,582 (22%) versus 1,162 of 5,181 (22%), rate ratio 0.97 (95% CI 0.87 to 1.07; P=0.50). No difference in duration of hospital stay, in discharge alive by 28 days, or in the composite of invasive ventilation or death. The conclusion was explicit: azithromycin use in this setting should be restricted to patients with a clear antimicrobial indication.',
        evidenceSource:
          'RECOVERY Collaborative Group, Lancet 2021;397:605-612 (ISRCTN50189673, NCT04381936)',
        doi: '10.1016/S0140-6736(21)00149-5',
        measuredMetric: '28-day all-cause mortality',
        auditFlag: 'verified',
      },
      {
        id: 'azi-a3',
        category: 'failed',
        title: 'PRINCIPLE: no benefit in community treatment of suspected COVID-19 either',
        laymanSummary:
          'The same question was asked in people at home rather than in hospital, and the answer was the same.',
        technicalDetails:
          'A UK primary-care adaptive platform trial in people aged 65 and over, or 50 and over with at least one comorbidity, unwell for 14 days or less with suspected COVID-19. 2,265 participants were randomised, 540 to azithromycin plus usual care and 875 to usual care alone. The hazard ratio for time to first self-reported recovery was 1.08 (95% Bayesian credible interval 0.95 to 1.23), an estimated 0.94 days of benefit, and the probability of a clinically meaningful benefit of at least 1.5 days was 0.23. Hospitalisation occurred in 3% of each group and there were no deaths in either. Taken with RECOVERY, this closes the question in both settings for which the drug was proposed.',
        evidenceSource: 'PRINCIPLE Trial Collaborative Group, Lancet 2021;397:1063-1074',
        doi: '10.1016/S0140-6736(21)00461-X',
        auditFlag: 'verified',
      },
      {
        id: 'azi-a4',
        category: 'inferred',
        title: 'The mortality benefit was bought at the price of measurable macrolide resistance',
        laymanSummary:
          'In the same trial that showed fewer child deaths, resistance to macrolides in the treated communities rose about fourfold.',
        technicalDetails:
          'A prespecified resistance substudy within MORDOR I in Niger sampled 3,371 children across 30 communities. Macrolide resistance in nasopharyngeal Streptococcus pneumoniae was 12.3% in azithromycin communities versus 2.9% in placebo communities, and macrolide resistance determinants in the intestinal flora were present in 68.0% versus 46.7%. The mortality benefit and the resistance cost were measured in the same trial and are not separable by choosing to report only one.',
        evidenceSource: 'Doan T et al., N Engl J Med 2019;380:2271-2273',
        doi: '10.1056/NEJMc1901535',
        inferredClaim:
          'That the community mortality benefit can be scaled up indefinitely without the resistance cost scaling with it',
        auditFlag: 'caution',
      },
      {
        id: 'azi-a5',
        category: 'measured',
        title: 'A small absolute excess of cardiovascular death during a five-day course',
        laymanSummary:
          'In a large observational cohort, five days of azithromycin was associated with about 47 extra cardiovascular deaths per million courses compared with amoxicillin.',
        technicalDetails:
          'A Tennessee Medicaid cohort covering 347,795 azithromycin prescriptions, 1,391,180 propensity-matched no-antibiotic control periods, and 1,348,672 amoxicillin, 264,626 ciprofloxacin and 193,906 levofloxacin prescriptions. During the 5 days of therapy, azithromycin versus no antibiotics gave a hazard ratio for cardiovascular death of 2.88 (95% CI 1.79 to 4.63) and versus amoxicillin 2.49 (95% CI 1.38 to 4.50), an estimated 47 additional cardiovascular deaths per million courses, rising to 245 per million in the highest decile of baseline cardiovascular risk. Amoxicillin showed no such increase. This is an observational cohort, so it establishes association with careful confounding control rather than randomised causation.',
        evidenceSource: 'Ray WA et al., N Engl J Med 2012;366:1881-1890',
        doi: '10.1056/NEJMoa1003833',
        measuredMetric: 'Hazard ratio for cardiovascular death during 5 days of therapy',
        auditFlag: 'caution',
      },
      {
        id: 'azi-a6',
        category: 'conclusion_shift',
        title: 'AVENIR then narrowed the child-survival result to infants',
        laymanSummary:
          'A second, much larger trial in Niger repeated the child-survival question and found the benefit concentrated in the youngest children.',
        technicalDetails:
          'AVENIR was a double-blind, response-adaptive, cluster-randomised, placebo-controlled trial in Niger with 864,493 participants registered, comparing twice-yearly azithromycin to children aged 1 to 59 months, twice-yearly azithromycin to infants aged 1 to 11 months with placebo for older children, and twice-yearly placebo to all. It is the largest randomised test of the MORDOR hypothesis and was designed to separate the age groups that MORDOR had pooled.',
        evidenceSource: 'AVENIR Study Group, N Engl J Med 2024 (NCT04224987)',
        doi: '10.1056/NEJMoa2312093',
        auditFlag: 'verified',
      },
      {
        id: 'azi-a7',
        category: 'measured',
        title: 'AMAZES: fewer asthma exacerbations on long-term azithromycin',
        laymanSummary:
          'In adults with persistent uncontrolled asthma, taking azithromycin three times a week for a year roughly halved the rate of flare-ups.',
        technicalDetails:
          'A randomised, double-blind, placebo-controlled trial of azithromycin 500 mg three times weekly for 48 weeks in 420 adults with symptomatic asthma despite inhaled corticosteroid and long-acting bronchodilator. Exacerbations fell from 1.86 per patient-year on placebo to 1.07 on azithromycin, incidence rate ratio 0.59 (95% CI 0.47 to 0.74; P<0.0001), and asthma-related quality of life improved by an adjusted mean 0.36 (95% CI 0.21 to 0.52; P=0.001). Diarrhoea was more common on azithromycin (34% versus 19%; P=0.001). This is the strongest evidence for a use that depends on effects other than killing a specific pathogen, and it carries the same resistance-selection question as mass administration.',
        evidenceSource: 'Gibson PG et al., Lancet 2017;390:659-668',
        doi: '10.1016/S0140-6736(17)31281-3',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Taken up by white blood cells and carried to the infection',
        laymanDesc:
          'Rather than staying in the blood, azithromycin is swallowed up by your own immune cells, which then travel to wherever the infection is.',
        molecularDetail:
          'The dibasic azalide structure traps the drug in acidic intracellular compartments of phagocytes, producing tissue concentrations far above plasma and a terminal half-life of roughly 68 hours. This is why a three-day or five-day course provides about a week of tissue exposure.',
        iconName: 'Droplet',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Released into the bacterial environment and taken inside',
        laymanDesc:
          'The immune cell releases the drug where bacteria are, and the drug crosses into the bacterium.',
        molecularDetail:
          'Release from phagocytes at the infection site delivers the drug to the bacterial surface. Entry across the Gram-positive cell wall is straightforward; the extra amine relative to erythromycin improves penetration of the Gram-negative outer membrane, which is why azithromycin has activity erythromycin lacks against Haemophilus influenzae.',
        iconName: 'ArrowDown',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It binds the exit tunnel of the bacterial ribosome',
        laymanDesc:
          'The drug lodges in the tunnel that a newly made protein has to pass through on its way out of the machine.',
        molecularDetail:
          'Azithromycin binds the 23S ribosomal RNA of the 50S subunit at the nascent peptide exit tunnel, close to the peptidyl transferase centre. Human 80S ribosomes have a different tunnel architecture and are not bound at therapeutic concentrations.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Growing protein chains stall and drop off',
        laymanDesc:
          'Chains that cannot get out of the tunnel jam the machine, and the half-finished protein is released.',
        molecularDetail:
          'Obstruction of the exit tunnel causes context-dependent translational arrest and premature peptidyl-tRNA dissociation. The effect is bacteriostatic against most organisms at achievable concentrations, which matters clinically: it slows growth rather than lysing the cell.',
        iconName: 'Lock',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Bacterial growth stops, and resistance is selected for',
        laymanDesc:
          'The infection is controlled. At the same time, any bacterium already carrying a resistance gene now has a survival advantage.',
        molecularDetail:
          'Resistance arises through erm-mediated methylation of the 23S rRNA binding site and through mef-encoded efflux. The MORDOR resistance substudy measured exactly this consequence at community scale: nasopharyngeal pneumococcal macrolide resistance of 12.3% in treated communities versus 2.9% in placebo communities.',
        iconName: 'ShieldOff',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'MORDOR (NCT02047981)',
        phase: 'Phase 4 cluster-randomised placebo-controlled',
        sampleSize: 190238,
        primaryEndpoint: 'Aggregate all-cause mortality in children aged 1 to 59 months',
        endpointMet: true,
        statisticalPValue: 'P < 0.001 (13.5% lower mortality, 95% CI 6.7 to 19.8)',
        unreportedAdverseSignals:
          'Macrolide resistance was not reported in the primary paper; the prespecified substudy published a year later found nasopharyngeal pneumococcal macrolide resistance of 12.3% versus 2.9%.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'AVENIR (NCT04224987)',
        phase: 'Phase 4 adaptive cluster-randomised placebo-controlled',
        sampleSize: 864493,
        primaryEndpoint: 'All-cause mortality over 2 years by age stratum',
        endpointMet: true,
        statisticalPValue: 'Reported in N Engl J Med 2024; see the primary publication for strata',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'RECOVERY azithromycin comparison (NCT04381936, ISRCTN50189673)',
        phase: 'Randomised controlled open-label platform',
        sampleSize: 7763,
        primaryEndpoint: '28-day all-cause mortality in patients hospitalised with COVID-19',
        endpointMet: false,
        statisticalPValue: 'P = 0.50 (rate ratio 0.97, 95% CI 0.87 to 1.07)',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'PRINCIPLE azithromycin comparison (ISRCTN86534580)',
        phase: 'Randomised controlled open-label adaptive platform',
        sampleSize: 2265,
        primaryEndpoint:
          'Time to first self-reported recovery and hospitalisation or death in community COVID-19',
        endpointMet: false,
        statisticalPValue:
          'Hazard ratio 1.08 (95% Bayesian credible interval 0.95 to 1.23); probability of a clinically meaningful benefit 0.23',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'AMAZES',
        phase: 'Randomised double-blind placebo-controlled',
        sampleSize: 420,
        primaryEndpoint:
          'Rate of total asthma exacerbations and asthma-related quality of life over 48 weeks',
        endpointMet: true,
        statisticalPValue: 'P < 0.0001 (incidence rate ratio 0.59, 95% CI 0.47 to 0.74)',
        unreportedAdverseSignals:
          'Long-term thrice-weekly dosing raises the same macrolide-resistance question the MORDOR substudy quantified at community level.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '13.5% lower all-cause childhood mortality across 1,533 communities and 323,302 person-years in MORDOR',
        'Nasopharyngeal pneumococcal macrolide resistance of 12.3% in treated communities versus 2.9% in placebo communities in the MORDOR resistance substudy',
        '28-day mortality of 22% in both arms of the 7,763-patient RECOVERY azithromycin comparison',
        'A hazard ratio of 2.49 for cardiovascular death during 5 days of therapy versus amoxicillin in a propensity-matched cohort of over 2 million treatment episodes',
      ],
      unsupportedInferences: [
        'That the anti-inflammatory properties of macrolides translate into benefit in viral illness — tested directly in RECOVERY and PRINCIPLE, and refuted in both',
        'That the MORDOR mortality benefit generalises across settings, when the country-level estimates ranged from 18.1% in Niger to 3.4% in Tanzania with confidence intervals crossing zero in two of three countries',
      ],
      whatFailedInitially: [
        'RECOVERY: no effect on mortality, hospital stay, discharge alive or progression to ventilation in hospitalised COVID-19',
        'PRINCIPLE: no meaningful benefit in the community either, with a 0.23 probability of a clinically meaningful gain in time to recovery across 2,265 randomised participants',
      ],
      realWorldOutcome: [
        'Mass administration programmes for child survival now run alongside resistance surveillance because the trial that justified them also measured the resistance cost',
        'US pharmacy acquisition cost is US$0.268 per 250 mg tablet, roughly 2.7 times the published minimum cost of production per day of treatment',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, powder for oral suspension, single-dose powder packet, and intravenous infusion',
      description:
        'Once-daily dosing, typically as a three-day or five-day course, or a single dose for some indications. The long tissue half-life is a property of the molecule rather than of the formulation: the dibasic azalide is trapped in acidic intracellular compartments and released slowly, so tissue exposure continues for days after the last dose.',
      safetyProfile:
        'The most common adverse effects are gastrointestinal. The class-level concern is QT-interval prolongation and torsades de pointes, quantified observationally by Ray and colleagues as an estimated 47 additional cardiovascular deaths per million five-day courses relative to amoxicillin, concentrated in patients at high baseline cardiovascular risk. Hepatotoxicity and, rarely, severe cutaneous reactions are also described in the label.',
    },
    commonQuestions: [
      {
        q: 'Does azithromycin help with COVID-19?',
        a: 'No. This was tested twice at scale. RECOVERY randomised 7,763 hospitalised patients and found 28-day mortality of 22% in both arms, rate ratio 0.97. PRINCIPLE randomised 2,265 older and comorbid people in the community and found a hazard ratio for recovery of 1.08 with a 0.23 probability of any clinically meaningful benefit. Both trials were large, randomised and prespecified. The idea came from the drug immunomodulatory reputation and from a small, later retracted, observational report; the randomised answer is unambiguous.',
        auditNote:
          'The retracted report that popularised the azithromycin-plus-hydroxychloroquine combination is covered in full on the hydroxychloroquine page.',
      },
      {
        q: 'How can one antibiotic reduce childhood deaths from all causes?',
        a: 'That is exactly the honest puzzle. MORDOR measured the effect, not the mechanism: 13.5% lower all-cause mortality across 1,533 communities, with the biggest effect in infants aged 1 to 5 months. Plausible explanations include treatment of undiagnosed bacterial infection, malaria co-treatment and effects on the gut microbiome, but the trial did not adjudicate between them, and the country-level results differed enormously.',
      },
      {
        q: 'Is the resistance risk real or theoretical?',
        a: 'Measured, in the same trial. The MORDOR I resistance substudy in Niger found macrolide resistance in nasopharyngeal pneumococci of 12.3% in azithromycin communities against 2.9% in placebo communities, and macrolide resistance determinants in gut flora in 68.0% against 46.7%. That is a fourfold difference in a randomised comparison, published by the same investigators who published the mortality benefit.',
        auditNote:
          'A page that quoted the 13.5% mortality reduction without this number would be a highlight reel, not an audit.',
      },
      {
        q: 'Should I worry about my heart during a Z-Pak?',
        a: 'For most people the absolute risk is very small. Ray and colleagues estimated 47 additional cardiovascular deaths per million five-day courses relative to amoxicillin, rising to 245 per million among patients in the highest decile of baseline cardiovascular risk. It is an observational estimate, not a randomised one. It matters most for people with existing heart disease, low potassium or magnesium, or other QT-prolonging drugs, and that is a conversation for the prescriber.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Keenan JD et al. Azithromycin to Reduce Childhood Mortality in Sub-Saharan Africa (MORDOR). N Engl J Med 2018;378:1583-1592',
        identifier: '10.1056/NEJMoa1715474',
        kind: 'doi',
      },
      {
        label:
          'Keenan JD et al. Longer-Term Assessment of Azithromycin for Reducing Childhood Mortality in Africa. N Engl J Med 2019;380:2207-2214',
        identifier: '10.1056/NEJMoa1817213',
        kind: 'doi',
      },
      {
        label:
          'Doan T et al. Macrolide Resistance in MORDOR I — A Cluster-Randomized Trial in Niger. N Engl J Med 2019;380:2271-2273',
        identifier: '10.1056/NEJMc1901535',
        kind: 'doi',
      },
      {
        label:
          'AVENIR Study Group. Azithromycin to Reduce Mortality — An Adaptive Cluster-Randomized Trial. N Engl J Med 2024',
        identifier: '10.1056/NEJMoa2312093',
        kind: 'doi',
      },
      {
        label:
          'RECOVERY Collaborative Group. Azithromycin in patients admitted to hospital with COVID-19. Lancet 2021;397:605-612',
        identifier: '10.1016/S0140-6736(21)00149-5',
        kind: 'doi',
      },
      {
        label:
          'PRINCIPLE Trial Collaborative Group. Azithromycin for community treatment of suspected COVID-19. Lancet 2021;397:1063-1074',
        identifier: '10.1016/S0140-6736(21)00461-X',
        kind: 'doi',
      },
      {
        label: 'Ray WA et al. Azithromycin and the Risk of Cardiovascular Death. N Engl J Med 2012;366:1881-1890',
        identifier: '10.1056/NEJMoa1003833',
        kind: 'doi',
      },
      {
        label:
          'Gibson PG et al. Effect of azithromycin on asthma exacerbations and quality of life (AMAZES). Lancet 2017;390:659-668',
        identifier: '10.1016/S0140-6736(17)31281-3',
        kind: 'doi',
      },
      {
        label:
          'Hill A, Barber MJ, Gotham D. Minimum costs to manufacture new treatments for COVID-19. J Virus Erad 2020;6:61-69',
        identifier: '10.1016/S2055-6640(20)30018-2',
        kind: 'doi',
      },
      {
        label: 'MORDOR: Mortality Reduction After Oral Azithromycin',
        identifier: 'NCT02047981',
        kind: 'nct',
      },
      {
        label: 'AVENIR: Azithromycin for Child Survival in Niger',
        identifier: 'NCT04224987',
        kind: 'nct',
      },
      {
        label: 'ZITHROMAX (azithromycin) tablets, US prescribing information — DailyMed',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=db52b91e-79f7-4cc1-9564-f2eee8e31c45',
        kind: 'regulatory',
      },
      {
        label: 'CMS National Average Drug Acquisition Cost (NADAC) 2026 file',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 447043 — Azithromycin',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/447043',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Doxycycline — a 1967 tetracycline that acquired a genuinely new indication in 2023, and whose
  // best trial and its direct replication attempt reached opposite conclusions in different people.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'doxycycline',
    name: 'Doxycycline',
    tradeName: 'Vibramycin / Oracea / Doryx',
    sponsor: 'Pfizer (originator, as Vibramycin); now manufactured generically worldwide',
    targetGene: 'rrs, the bacterial 16S ribosomal RNA gene of the 30S subunit',
    targetProtein: 'Bacterial 30S ribosomal subunit, at the aminoacyl-tRNA acceptor site',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1967,
    indication:
      'Rickettsial infections, respiratory and urinary tract infections due to susceptible organisms, chlamydial and other sexually transmitted infections, Lyme disease, malaria prophylaxis, acne and rosacea, and post-exposure prophylaxis for bacterial sexually transmitted infections in selected populations',
    patientFriendlyIndication:
      'Tick-borne and sexually transmitted infections, chest infections, acne, and malaria prevention',
    conditionContext: {
      conditionExplainer:
        'Doxycycline blocks the docking slot on the smaller half of the bacterial ribosome where each new amino acid arrives. Nothing new can be added to the protein chain, so the bacterium stops growing.',
      whyItMatters:
        'Because it works on a completely different part of the ribosome from macrolides and on a completely different structure from beta-lactams, doxycycline covers organisms that hide inside human cells, which most other cheap oral antibiotics cannot reach.',
      whoTakesThis:
        'People with tick-borne infection, chlamydial infection, atypical pneumonia, moderate acne or rosacea, travellers taking malaria prophylaxis, and men who have sex with men and transgender women taking post-exposure prophylaxis against bacterial sexually transmitted infections.',
      clinicalGoals:
        'Clear an intracellular or atypical pathogen that beta-lactams cannot reach, or prevent a specific infection in a defined high-incidence population.',
    },
    oneSentenceVerdict:
      'A tetracycline that blocks the bacterial ribosome docking site, which cut the combined incidence of gonorrhoea, chlamydia and syphilis by about two thirds in 501 men who have sex with men and transgender women, and showed no significant effect in 449 Kenyan cisgender women in the direct replication attempt.',
    laymanHowItWorks:
      'To build a protein, a bacterium has to bring in amino acids one at a time and dock each one into a slot on the ribosome. Doxycycline sits in that slot. Nothing can dock, the chain stops growing, and the bacterium stops multiplying. It gets inside human cells easily, which is why it reaches bacteria that live there and most other cheap antibiotics do not.',
    auditConfidence: 'High Confidence',
    confidenceScore: 80,
    anatomicalSite: 'Bacterial 30S ribosome, including organisms living inside human cells',
    substitutes: {
      summary:
        'Minocycline and the newer tetracyclines share the mechanism. For chlamydia, doxycycline has displaced single-dose azithromycin in several guidelines on cure rates. Nothing on the natural-products side has a controlled trial in these indications, so this record lists none.',
      conventionalRx: [
        {
          name: 'Azithromycin (generic)',
          class: 'Macrolide',
          howItCompares:
            'Single-dose convenience against a seven-day doxycycline course for chlamydial infection. Doxycycline has the better rectal chlamydia cure rate in comparative studies and carries no QT signal.',
          typicalCost:
            'US$0.268 per 250 mg tablet at pharmacy acquisition cost (CMS NADAC, effective 19 Aug 2026)',
          prosAndCons:
            'Pros: single observed dose, so adherence is not a variable. Cons: QT prolongation signal, and rising macrolide resistance.',
        },
        {
          name: 'Doxycycline monohydrate',
          class: 'Tetracycline, alternative salt',
          howItCompares:
            'The same molecule in a salt with less gastric irritation than the hyclate. Clinically interchangeable at equivalent doses.',
          typicalCost:
            'US$0.232 per 100 mg capsule at pharmacy acquisition cost (CMS NADAC, effective 19 Aug 2026), against US$0.105 for hyclate',
          prosAndCons:
            'Pros: better tolerated by some patients. Cons: roughly twice the acquisition cost of the hyclate for the same active moiety.',
        },
        {
          name: 'Atovaquone-proguanil',
          class: 'Antimalarial combination',
          howItCompares:
            'An alternative for malaria chemoprophylaxis with a shorter post-travel course, without the photosensitivity of a tetracycline.',
          typicalCost: 'Not priced here — no current acquisition-cost figure verified for this record',
          prosAndCons:
            'Pros: stops one week after leaving the malaria area rather than four. Cons: considerably more expensive.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Take it upright, with water, away from calcium and iron',
          action:
            'Swallow the capsule with a full glass of water while sitting or standing, and separate it from dairy, antacids and iron supplements.',
          patientImpact:
            'Tetracyclines chelate divalent and trivalent cations, so calcium, magnesium, aluminium and iron taken at the same time bind the drug in the gut and reduce how much is absorbed. Lying down soon after a dose is associated with pill-induced oesophagitis.',
          clinicalPrecaution:
            'This is about absorption and local irritation, not about whether the drug is needed. It does not replace the prescriber instructions.',
        },
        {
          name: 'Expect sunburn to happen faster',
          action:
            'Plan sun protection for the whole course, including on overcast days and in the two weeks after finishing.',
          patientImpact:
            'Phototoxicity is one of the most common reasons courses are abandoned, and it is entirely predictable rather than idiosyncratic.',
          clinicalPrecaution:
            'A severe or blistering reaction is a reason to contact the prescriber, not to simply endure it.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'C[C@@H]1[C@H]2[C@@H]([C@H]3[C@@H](C(=O)C(=C([C@]3(C(=O)C2=C(C4=C1C=CC=C4O)O)O)O)C(=O)N)N(C)C)O',
      chemicalFormula: 'C22H24N2O8',
      molecularWeight: '444.4 g/mol (PubChem CID 54671203, doxycycline free base)',
      targetReceptorAffinity:
        'Binds the 16S ribosomal RNA of the 30S subunit at the aminoacyl-tRNA acceptor site; potency is reported clinically as a minimum inhibitory concentration',
      structureSource: {
        label: 'PubChem CID 54671203 — Doxycycline, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/54671203',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'dox-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Control of the oxytetracycline or metacycline feedstock',
          description:
            'Doxycycline is semi-synthetic, made from a fermentation-derived tetracycline. Confirm the identity and epimeric purity of the starting material, because 4-epi impurities carry through the whole route and are the limiting related substance in the final specification.',
          reagentsAndBuffer:
            'Oxytetracycline or metacycline reference standard, reversed-phase HPLC with a styrene-divinylbenzene column and EDTA-containing mobile phase, Karl Fischer titration, specific optical rotation',
        },
        {
          id: 'dox-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Stereoselective hydrogenation of the exocyclic methylene',
          description:
            'Reduce the 6-methylene double bond of metacycline to the 6-alpha-methyl configuration under homogeneous rhodium catalysis. The stereochemistry set here is the whole point of the molecule: the 6-alpha-deoxy configuration is what gives doxycycline its long half-life and its resistance to acid-catalysed epimerisation.',
          dependsOnStepId: 'dox-w1',
          reagentsAndBuffer:
            'Metacycline sulfosalicylate, rhodium catalyst with a chiral phosphine ligand, hydrogen at controlled pressure, dimethylformamide or methanol, para-toluenesulfonic acid',
        },
        {
          id: 'dox-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Salt formation and crystallisation as the hyclate',
          description:
            'Convert to the hydrochloride hemiethanolate hemihydrate, the salt marketed as doxycycline hyclate, and crystallise. The hyclate and the monohydrate are different marketed forms of the same active moiety with different dissolution and tolerability profiles.',
          dependsOnStepId: 'dox-w2',
          reagentsAndBuffer:
            'Hydrogen chloride in ethanol, water, controlled cooling crystallisation, vacuum drying at controlled water activity',
        },
        {
          id: 'dox-w4',
          stepNumber: 4,
          phase: 'Assay_Quantification',
          name: 'Assay, epimer control and susceptibility testing',
          description:
            'Quantify content and the 4-epidoxycycline and 6-epidoxycycline impurities against pharmacopoeial standards, then confirm activity by broth microdilution against reference strains including a tetracycline-resistant control.',
          dependsOnStepId: 'dox-w3',
          reagentsAndBuffer:
            'Styrene-divinylbenzene HPLC column with EDTA and tert-butanol mobile phase, USP doxycycline hyclate reference standard, cation-adjusted Mueller-Hinton broth, Escherichia coli ATCC 25922 and Staphylococcus aureus ATCC 29213 quality-control strains',
        },
      ],
    },
    keyAudits: [
      {
        id: 'dox-a1',
        category: 'measured',
        title: 'DoxyPEP: two-thirds fewer bacterial sexually transmitted infections',
        laymanSummary:
          'Taking a single 200 mg dose within 72 hours of condomless sex cut the combined rate of gonorrhoea, chlamydia and syphilis by about two thirds in two cohorts.',
        technicalDetails:
          'Open-label randomised trial, 501 participants in two cohorts: men who have sex with men and transgender women taking HIV pre-exposure prophylaxis, and people living with HIV, all with a bacterial sexually transmitted infection in the past year. In the PrEP cohort an infection was diagnosed at 10.7% of quarterly visits on doxycycline versus 31.9% on standard care, relative risk 0.34 (95% CI 0.24 to 0.46; P<0.001). In the cohort living with HIV, 11.8% versus 30.5%, relative risk 0.38 (95% CI 0.24 to 0.60; P<0.001). Chlamydia showed the largest effect, relative risk 0.12 in the PrEP cohort.',
        evidenceSource: 'Luetkemeyer AF et al., N Engl J Med 2023;388:1296-1306 (NCT03980223)',
        doi: '10.1056/NEJMoa2211934',
        measuredMetric:
          'Incidence of at least one bacterial sexually transmitted infection per follow-up quarter',
        auditFlag: 'verified',
      },
      {
        id: 'dox-a2',
        category: 'failed',
        title: 'dPEP Kenya: the same intervention showed no significant effect in cisgender women',
        laymanSummary:
          'When the same strategy was tested in 449 Kenyan women, the infection rate did not fall significantly, and hair testing showed most participants were not actually taking the drug.',
        technicalDetails:
          'Randomised open-label trial in Kenyan women aged 18 to 30 receiving HIV pre-exposure prophylaxis, followed quarterly for 12 months. 109 incident infections occurred, 50 in the doxycycline arm (25.1 per 100 person-years) and 59 in standard care (29.0 per 100 person-years), relative risk 0.88 (95% CI 0.60 to 1.29; P=0.51). Chlamydia accounted for 78% of infections. Objective adherence measurement mattered: doxycycline was detected in only 58 of 200 hair samples (29.0%) from 50 randomly selected participants in the intervention arm. Every gonococcal isolate recovered was doxycycline-resistant.',
        evidenceSource: 'Stewart J et al., N Engl J Med 2023;389:2331-2340 (NCT04050540)',
        doi: '10.1056/NEJMoa2304007',
        measuredMetric:
          'Incident Chlamydia trachomatis, Neisseria gonorrhoeae or Treponema pallidum infection',
        inferredClaim:
          'That an efficacy result in one population transfers to another population with different anatomy, different pathogen prevalence and different adherence',
        auditFlag: 'caution',
      },
      {
        id: 'dox-a3',
        category: 'inferred',
        title: 'The prophylaxis benefit was measured alongside tetracycline-resistant gonorrhoea',
        laymanSummary:
          'In the trial that showed the benefit, resistant gonorrhoea was found in more of the treated participants than the untreated ones.',
        technicalDetails:
          'Among DoxyPEP participants with a gonococcal culture available, tetracycline-resistant Neisseria gonorrhoeae was recovered from 5 of 13 in the doxycycline groups and 2 of 16 in the standard-care groups. In the Kenyan dPEP trial, all gonococcal isolates recovered were doxycycline-resistant. These are small numbers from culture subsets, not powered resistance endpoints, which is exactly why the population-level consequence of the strategy remains an open question rather than a settled one.',
        evidenceSource:
          'Luetkemeyer AF et al., N Engl J Med 2023;388:1296-1306; Stewart J et al., N Engl J Med 2023;389:2331-2340',
        doi: '10.1056/NEJMoa2211934',
        inferredClaim:
          'That the individual-level reduction in infections can be scaled to a population without a corresponding rise in tetracycline resistance',
        auditFlag: 'caution',
      },
      {
        id: 'dox-a4',
        category: 'failed',
        title: 'N-TA3CT: no effect on abdominal aortic aneurysm growth',
        laymanSummary:
          'Doxycycline inhibits the enzymes that break down connective tissue, so it was tested to slow aneurysm growth. Two years of treatment changed nothing.',
        technicalDetails:
          'Randomised, placebo-controlled trial at 22 US centres in 261 patients aged 50 and over with small infrarenal aneurysms. Doxycycline 100 mg twice daily for 2 years versus placebo. The change in measured maximum transverse diameter at 2 years was 0.36 cm (95% CI 0.31 to 0.40) with doxycycline and 0.36 cm (95% CI 0.30 to 0.41) with placebo, difference 0.0 cm (95% CI -0.07 to 0.07; P=0.93). The primary normal-scores analysis gave a one-sided P of 0.71. Joint pain occurred in 65% and 63%.',
        evidenceSource: 'Baxter BT et al., JAMA 2020;323:2029-2038 (NCT01756833)',
        doi: '10.1001/jama.2020.5230',
        measuredMetric: 'Change in maximum transverse aneurysm diameter on CT at 2 years',
        inferredClaim:
          'That inhibiting matrix metalloproteinases in the laboratory would slow aneurysm expansion in patients',
        auditFlag: 'verified',
      },
      {
        id: 'dox-a5',
        category: 'failed',
        title: 'PRINCIPLE: no benefit in community COVID-19, and the arm was stopped for futility',
        laymanSummary:
          'Doxycycline was widely prescribed for COVID-19 in the community. When it was finally tested, the trial arm was stopped because it was clearly not working.',
        technicalDetails:
          'UK primary-care adaptive platform trial in people aged 65 and over, or 50 and over with comorbidities. 2,689 participants were randomised to the doxycycline comparison between July and December 2020, when the prespecified futility criterion was met. Median time to first self-reported recovery was 9.6 days with doxycycline and 10.1 days with usual care, hazard ratio 1.04 (95% Bayesian credible interval 0.93 to 1.17), with a 0.10 probability of a clinically meaningful benefit. Hospitalisation or death occurred in 5.3% and 4.5%.',
        evidenceSource: 'Butler CC et al., Lancet Respir Med 2021;9:1010-1020 (ISRCTN86534580)',
        doi: '10.1016/S2213-2600(21)00310-6',
        measuredMetric: 'Time to first self-reported recovery, and hospitalisation or death by day 28',
        auditFlag: 'verified',
      },
      {
        id: 'dox-a6',
        category: 'conclusion_shift',
        title: 'A 1967 antibiotic acquired a genuinely new indication in 2023',
        laymanSummary:
          'Doxycycline has been in use since the Johnson administration. Post-exposure prophylaxis for sexually transmitted infections is a new use, established by a randomised trial fifty-six years later.',
        technicalDetails:
          'Vibramycin was approved in the United States in December 1967. The DoxyPEP randomised trial reported in 2023 and changed clinical guidance for a defined population within months, on a relative risk of 0.34 in the PrEP cohort. That the dPEP trial in Kenyan women published later the same year found no significant effect is the reason the guidance is written for specific populations rather than for everyone.',
        evidenceSource:
          'Drugs@FDA record for VIBRAMYCIN NDA 050007, original approval 5 December 1967; Luetkemeyer AF et al., N Engl J Med 2023',
        doi: '10.1056/NEJMoa2211934',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed almost completely and distributed into tissue',
        laymanDesc:
          'Doxycycline is absorbed better than older tetracyclines and reaches most tissues, including places bacteria hide.',
        molecularDetail:
          'Oral bioavailability is high and largely unaffected by food, unlike tetracycline itself. The 6-alpha-methyl, 6-deoxy configuration gives a long elimination half-life, so twice-daily and then once-daily dosing is possible. Elimination is substantially non-renal, which is why it is usable in renal impairment.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Carried into the bacterium, and into human cells too',
        laymanDesc:
          'The drug is lipid-soluble enough to cross into human cells, which is how it reaches bacteria that live inside them.',
        molecularDetail:
          'Entry into Gram-negative bacteria is through OmpF and OmpC porins as a magnesium chelate, followed by energy-dependent transport across the inner membrane. High lipophilicity also allows passive entry into mammalian cells, which is the basis of activity against Rickettsia, Chlamydia and Coxiella.',
        iconName: 'ArrowDown',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It occupies the docking slot on the small ribosomal subunit',
        laymanDesc:
          'The drug sits in the slot where the next amino acid has to arrive.',
        molecularDetail:
          'Doxycycline binds the h34 region of 16S ribosomal RNA in the 30S subunit, overlapping the aminoacyl-tRNA acceptor site. A single high-affinity primary site accounts for the antibacterial effect; the interaction is reversible.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Amino acids cannot dock, so translation stops',
        laymanDesc: 'With the slot occupied, the protein chain cannot be extended.',
        molecularDetail:
          'Aminoacyl-tRNA delivery to the A site is sterically blocked, halting elongation. The effect is bacteriostatic and reversible on drug removal, which is why treatment duration and adherence matter more here than with a bactericidal beta-lactam.',
        iconName: 'Lock',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Growth stops, and resistance genes are selected',
        laymanDesc:
          'The infection is controlled, while bacteria carrying pump or protection genes gain an advantage.',
        molecularDetail:
          'Resistance is mediated by tet efflux pumps and by ribosomal protection proteins such as TetM. Both DoxyPEP and the Kenyan dPEP trial recovered tetracycline-resistant gonococci from treated participants, which is the measured version of this step rather than a theoretical one.',
        iconName: 'ShieldOff',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'DoxyPEP (NCT03980223)',
        phase: 'Phase 4 randomised open-label',
        sampleSize: 501,
        primaryEndpoint:
          'Incidence of at least one bacterial sexually transmitted infection per follow-up quarter',
        endpointMet: true,
        statisticalPValue: 'P < 0.001 in both cohorts (relative risk 0.34 and 0.38)',
        unreportedAdverseSignals:
          'Tetracycline-resistant gonorrhoea was recovered from 5 of 13 cultured participants in the doxycycline groups versus 2 of 16 in standard care.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'dPEP Kenya (NCT04050540)',
        phase: 'Phase 4 randomised open-label',
        sampleSize: 449,
        primaryEndpoint:
          'Incident chlamydia, gonorrhoea or syphilis in cisgender women over 12 months',
        endpointMet: false,
        statisticalPValue: 'P = 0.51 (relative risk 0.88, 95% CI 0.60 to 1.29)',
        unreportedAdverseSignals:
          'Hair testing detected doxycycline in only 29.0% of samples from the intervention arm, so the trial measures the strategy as delivered rather than the drug as taken.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'N-TA3CT (NCT01756833)',
        phase: 'Phase 2 randomised placebo-controlled',
        sampleSize: 261,
        primaryEndpoint: 'Change in maximum transverse aneurysm diameter on CT at 2 years',
        endpointMet: false,
        statisticalPValue: 'P = 0.93 for measured diameter change; one-sided P = 0.71 for the primary normal-scores analysis',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'PRINCIPLE doxycycline comparison (ISRCTN86534580)',
        phase: 'Randomised controlled open-label adaptive platform',
        sampleSize: 2689,
        primaryEndpoint:
          'Time to first self-reported recovery and hospitalisation or death by day 28 in community COVID-19',
        endpointMet: false,
        statisticalPValue:
          'Hazard ratio 1.04 (95% Bayesian credible interval 0.93 to 1.17); stopped when the prespecified futility criterion was met',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Relative risk 0.34 for any bacterial sexually transmitted infection per quarter in the DoxyPEP pre-exposure-prophylaxis cohort, and 0.38 in the cohort living with HIV',
        'Relative risk 0.88 (95% CI 0.60 to 1.29) for the same intervention in 449 Kenyan cisgender women, with the drug detected in 29% of hair samples',
        'No difference in abdominal aortic aneurysm growth at 2 years: 0.36 cm in both arms of a 261-patient randomised trial',
      ],
      unsupportedInferences: [
        'That an efficacy result in one population transfers unchanged to a different population, different anatomical sites of infection and different adherence',
        'That inhibiting matrix metalloproteinases in the laboratory would slow aneurysm growth in patients — tested directly and refuted',
        'That prophylaxis can be scaled without a corresponding rise in tetracycline resistance, when both trials recovered resistant gonococci from treated participants',
      ],
      whatFailedInitially: [
        'N-TA3CT: no effect on aneurysm growth despite a plausible and well-characterised mechanism',
        'PRINCIPLE: the doxycycline arm was stopped for futility in community COVID-19',
        'dPEP Kenya: no significant reduction in sexually transmitted infections in cisgender women',
      ],
      realWorldOutcome: [
        'Post-exposure prophylaxis guidance is now written for specific populations rather than universally, precisely because the two randomised trials disagreed',
        'Doxycycline hyclate costs US$0.105 per 100 mg capsule at US pharmacy acquisition cost, and the monohydrate salt costs roughly twice that for the same active moiety',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule, tablet, delayed-release tablet, oral suspension and intravenous infusion',
      description:
        'Usually 100 mg once or twice daily by mouth. Absorption is high and only modestly food-affected, but divalent and trivalent cations in dairy, antacids and iron supplements chelate the drug in the gut and reduce absorption. Delayed-release and subantimicrobial-dose formulations exist for dermatological use.',
      safetyProfile:
        'Photosensitivity is common and predictable. Pill-induced oesophagitis occurs when a dose is taken without enough water or lying down. Tetracyclines are avoided in children under eight and in pregnancy because of effects on developing teeth and bone. Clostridioides difficile infection is a recognised complication of any broad-spectrum antibacterial course. Intracranial hypertension is a rare but documented class effect.',
    },
    commonQuestions: [
      {
        q: 'Doxy-PEP worked in one trial and not the other. Which is right?',
        a: 'Both, for the populations they enrolled. DoxyPEP randomised 501 men who have sex with men and transgender women with a recent bacterial sexually transmitted infection and found a relative risk of 0.34. The Kenyan dPEP trial randomised 449 cisgender women and found 0.88, not statistically distinguishable from no effect. Two explanations are on the table and neither is settled: adherence, since doxycycline was detected in only 29% of hair samples in the intervention arm, and biology, since the dominant infection was cervical chlamydia rather than rectal or pharyngeal infection. The honest reading is that the intervention has been shown to work in one setting and not shown to work in the other.',
        auditNote:
          'This is the clearest example on this site of why "a randomised trial showed" is an incomplete sentence without "in whom".',
      },
      {
        q: 'Does taking it for prevention breed resistant bacteria?',
        a: 'The trials measured this, in small culture subsets. In DoxyPEP, tetracycline-resistant gonorrhoea was recovered from 5 of 13 cultured participants in the doxycycline groups and 2 of 16 in standard care. In the Kenyan trial every gonococcal isolate recovered was doxycycline-resistant. These are not powered resistance endpoints and should not be read as precise rates, but they are measurements rather than speculation, and they are why surveillance accompanies the strategy wherever it is adopted.',
      },
      {
        q: 'Why does this page have no manufacturing cost?',
        a: 'Because no published per-unit cost-of-production estimate for doxycycline was verified for this record. The US pharmacy acquisition cost is published by the government and is quoted instead: US$0.105 per 100 mg hyclate capsule in the CMS NADAC file effective 19 August 2026.',
      },
      {
        q: 'Why was it tried for aneurysms and COVID at all?',
        a: 'Because tetracyclines inhibit matrix metalloproteinases and have anti-inflammatory effects independent of killing bacteria. Both hypotheses were mechanistically respectable and both were tested properly. The aneurysm trial found a diameter change of 0.36 cm in both arms. The COVID-19 arm of PRINCIPLE was stopped for futility. A mechanism that exists in the laboratory is a reason to run a trial, not a substitute for one.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Luetkemeyer AF et al. Postexposure Doxycycline to Prevent Bacterial Sexually Transmitted Infections. N Engl J Med 2023;388:1296-1306',
        identifier: '10.1056/NEJMoa2211934',
        kind: 'doi',
      },
      {
        label:
          'Stewart J et al. Doxycycline Prophylaxis to Prevent Sexually Transmitted Infections in Women. N Engl J Med 2023;389:2331-2340',
        identifier: '10.1056/NEJMoa2304007',
        kind: 'doi',
      },
      {
        label:
          'Baxter BT et al. Effect of Doxycycline on Aneurysm Growth Among Patients With Small Infrarenal Abdominal Aortic Aneurysms (N-TA3CT). JAMA 2020;323:2029-2038',
        identifier: '10.1001/jama.2020.5230',
        kind: 'doi',
      },
      {
        label:
          'Butler CC et al. Doxycycline for community treatment of suspected COVID-19 (PRINCIPLE). Lancet Respir Med 2021;9:1010-1020',
        identifier: '10.1016/S2213-2600(21)00310-6',
        kind: 'doi',
      },
      { label: 'DoxyPEP randomised trial', identifier: 'NCT03980223', kind: 'nct' },
      { label: 'dPEP Kenya randomised trial', identifier: 'NCT04050540', kind: 'nct' },
      {
        label: 'N-TA3CT: Non-Invasive Treatment of Abdominal Aortic Aneurysm Clinical Trial',
        identifier: 'NCT01756833',
        kind: 'nct',
      },
      {
        label: 'Doxycycline hyclate delayed-release tablets, US prescribing information — DailyMed',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=c2b08332-3256-4658-965a-ede3d973a388',
        kind: 'regulatory',
      },
      {
        label: 'CMS National Average Drug Acquisition Cost (NADAC) 2026 file',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 54671203 — Doxycycline',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/54671203',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Ciprofloxacin — a drug whose efficacy was never in doubt and whose place in therapy was moved
  // anyway, because the harms turned out to be larger than the benefit for the infections it was
  // most often prescribed for.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'ciprofloxacin',
    name: 'Ciprofloxacin',
    tradeName: 'Cipro / Cipro XR',
    sponsor: 'Bayer HealthCare Pharmaceuticals',
    targetGene: 'gyrA and gyrB (DNA gyrase), parC and parE (topoisomerase IV)',
    targetProtein: 'Bacterial DNA gyrase and topoisomerase IV',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1987,
    indication:
      'Urinary tract infection and pyelonephritis, intra-abdominal and bone and joint infection, infectious diarrhoea, typhoid fever, inhalational anthrax post-exposure, and plague, in patients for whom the benefit outweighs the risk of serious adverse reactions',
    patientFriendlyIndication:
      'Serious bacterial infections of the kidney, gut, bone and abdomen, and anthrax after exposure',
    conditionContext: {
      conditionExplainer:
        'Bacterial DNA is a closed loop that becomes over-wound as it is copied. Two enzymes, DNA gyrase and topoisomerase IV, cut the strands, let the tension out, and reseal them. Ciprofloxacin lets them cut but stops them resealing.',
      whyItMatters:
        'Fluoroquinolones are among the most effective oral antibiotics ever made for Gram-negative infection, and they are also the class with the most extensive list of disabling adverse effects. Both of those things are true at once, which is why the label now says to reserve the drug rather than to prefer it.',
      whoTakesThis:
        'Adults with pyelonephritis, complicated intra-abdominal or bone infection, typhoid fever, or anthrax exposure. The label directs that it be reserved in acute sinusitis, acute exacerbation of chronic bronchitis and uncomplicated cystitis for patients with no alternative.',
      clinicalGoals:
        'Cure a serious Gram-negative infection orally, in a patient for whom the documented risk of tendon, nerve and central nervous system injury is outweighed by the infection being treated.',
    },
    oneSentenceVerdict:
      'A fluoroquinolone that traps bacterial topoisomerases mid-cut, with a 99% bacteriological cure rate against 89% for co-trimoxazole in acute pyelonephritis, and a boxed warning restricting it in three of the conditions it was most often prescribed for.',
    laymanHowItWorks:
      'A bacterium copies its DNA as a closed loop, which twists tighter and tighter as the copying machinery moves along it. Two enzymes relieve that tension by cutting the DNA, letting it unwind, and stitching it back together. Ciprofloxacin lets the cut happen and then blocks the stitching. The bacterium is left with its own genome cut into pieces by its own enzymes, and it dies.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 72,
    anatomicalSite: 'Bacterial cytoplasm, at the DNA-topoisomerase cleavage complex',
    substitutes: {
      summary:
        'For uncomplicated cystitis, nitrofurantoin and co-trimoxazole are the guideline-preferred agents precisely because ciprofloxacin is more effective and more dangerous. The comparison here is unusual: the substitutes are recommended over the drug despite lower measured cure rates, because of harms measured outside the efficacy trials.',
      conventionalRx: [
        {
          name: 'Nitrofurantoin (generic)',
          class: 'Nitrofuran, urinary-specific antibacterial',
          howItCompares:
            'Concentrates in urine and barely reaches the rest of the body, so it treats cystitis without the systemic collateral damage. It does not treat pyelonephritis.',
          typicalCost:
            'US$0.298 per 100 mg monohydrate-macrocrystals capsule at pharmacy acquisition cost (CMS NADAC, effective 19 Aug 2026)',
          prosAndCons:
            'Pros: minimal resistance selection elsewhere in the body, no fluoroquinolone class warnings. Cons: ineffective above the bladder, avoided in significant renal impairment.',
        },
        {
          name: 'Trimethoprim-sulfamethoxazole (generic)',
          class: 'Folate-pathway inhibitor combination',
          howItCompares:
            'In the Talan pyelonephritis trial, 14 days of co-trimoxazole gave an 89% bacteriological cure against 99% for 7 days of ciprofloxacin, with the gap driven almost entirely by resistant Escherichia coli, which caused 18% of infections in that arm.',
          typicalCost:
            'US$0.045 per double-strength tablet at pharmacy acquisition cost (CMS NADAC, effective 19 Aug 2026)',
          prosAndCons:
            'Pros: very cheap, no fluoroquinolone class harms. Cons: local resistance rates decide whether it works, and it cannot be used empirically everywhere.',
        },
        {
          name: 'Levofloxacin (generic)',
          class: 'Fluoroquinolone',
          howItCompares:
            'Same class, same mechanism, same boxed warning. Substituting one fluoroquinolone for another does not avoid the class risk.',
          typicalCost:
            'US$0.134 per 500 mg tablet at pharmacy acquisition cost (CMS NADAC, effective 19 Aug 2026)',
          prosAndCons:
            'Pros: better pneumococcal cover for respiratory infection. Cons: carries the identical boxed warning, and in the Ray cardiovascular cohort its death risk did not differ significantly from azithromycin.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Report tendon pain immediately and stop activity',
          action:
            'Any new pain, swelling or inflammation in a tendon, most often the Achilles, during or after a course is a reason to contact the prescriber the same day.',
          patientImpact:
            'Tendinitis and tendon rupture are named in the first line of the boxed warning. Rupture can occur during treatment and has been reported months afterwards.',
          clinicalPrecaution:
            'This is a stop-and-call instruction, not a wait-and-see one. Do not resume exercise on a painful tendon while taking a fluoroquinolone.',
        },
        {
          name: 'Separate it from calcium, magnesium, iron and zinc',
          action:
            'Take the dose at least two hours before, or six hours after, antacids, dairy, multivitamins and mineral supplements.',
          patientImpact:
            'Fluoroquinolones chelate polyvalent cations, and co-administration can reduce absorption enough to matter clinically.',
          clinicalPrecaution:
            'Spacing the doses is a way to make the prescribed course work, not a way to reduce a side-effect risk.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1CC1N2C=C(C(=O)C3=CC(=C(C=C32)N4CCNCC4)F)C(=O)O',
      chemicalFormula: 'C17H18FN3O3',
      molecularWeight: '331.34 g/mol (PubChem CID 2764, ciprofloxacin free base)',
      targetReceptorAffinity:
        'Stabilises the covalent DNA-gyrase and DNA-topoisomerase IV cleavage complexes; potency is reported clinically as a minimum inhibitory concentration',
      structureSource: {
        label: 'PubChem CID 2764 — Ciprofloxacin, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2764',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'cip-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Control of the fluorinated benzoyl intermediate and cyclopropylamine',
          description:
            'Confirm identity and purity of the 2,4-dichloro-5-fluorobenzoyl building block and of cyclopropylamine before cyclisation. The regiochemistry of the fluorine and chlorine substitution decides which quinolone comes out of the route, so an isomeric impurity here becomes a different drug later.',
          reagentsAndBuffer:
            '2,4-dichloro-5-fluorobenzoyl chloride, cyclopropylamine, gas chromatography with flame ionisation detection, 19F NMR, Karl Fischer titration',
        },
        {
          id: 'cip-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Quinolone core assembly and piperazine displacement',
          description:
            'Build the 4-quinolone-3-carboxylic acid core by condensation and thermal cyclisation, then displace the remaining aryl chloride with piperazine under nucleophilic aromatic substitution, and hydrolyse the ester to the free acid.',
          dependsOnStepId: 'cip-w1',
          reagentsAndBuffer:
            'Ethyl 3-(dimethylamino)acrylate and the benzoyl chloride with magnesium ethoxide; cyclopropylamine in ethanol; potassium carbonate in dimethylformamide for cyclisation; anhydrous piperazine in dimethyl sulfoxide at elevated temperature; aqueous sodium hydroxide then acid for ester hydrolysis',
        },
        {
          id: 'cip-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Hydrochloride salt formation and recrystallisation',
          description:
            'Form the monohydrochloride monohydrate and recrystallise from aqueous ethanol. The zwitterionic free acid is poorly soluble, so the marketed oral form is the hydrochloride, and the salt stoichiometry has to be confirmed rather than assumed.',
          dependsOnStepId: 'cip-w2',
          reagentsAndBuffer:
            'Hydrochloric acid in ethanol and water, activated carbon treatment, controlled cooling crystallisation, ion chromatography for chloride content',
        },
        {
          id: 'cip-w4',
          stepNumber: 4,
          phase: 'Assay_Quantification',
          name: 'Assay by HPLC and susceptibility by broth microdilution',
          description:
            'Quantify content and related substances against the pharmacopoeial reference standard, then determine minimum inhibitory concentrations against reference strains including a quinolone-resistant control carrying a gyrA mutation.',
          dependsOnStepId: 'cip-w3',
          reagentsAndBuffer:
            'C18 column with phosphoric acid and acetonitrile mobile phase, USP ciprofloxacin reference standard, cation-adjusted Mueller-Hinton broth, Escherichia coli ATCC 25922 and Pseudomonas aeruginosa ATCC 27853 quality-control strains',
        },
      ],
    },
    keyAudits: [
      {
        id: 'cip-a1',
        category: 'measured',
        title: 'Acute pyelonephritis: 99% bacteriological cure against 89% for co-trimoxazole',
        laymanSummary:
          'In a randomised double-blind trial in women with kidney infection, seven days of ciprofloxacin cured more infections than fourteen days of the older combination.',
        technicalDetails:
          'Randomised, double-blind trial at 25 US outpatient centres, 378 premenopausal women enrolled and 255 evaluable. Ciprofloxacin 500 mg twice daily for 7 days versus trimethoprim-sulfamethoxazole 160/800 mg twice daily for 14 days. Bacteriological cure at 4 to 11 days post-therapy was 99% (112 of 113) versus 89% (90 of 101), difference 95% CI 0.04 to 0.16, P=0.004; clinical cure 96% versus 83%, P=0.002. Escherichia coli caused more than 90% of infections and was resistant to co-trimoxazole in 18% of cases and to ciprofloxacin in none. Drug-related adverse events occurred in 24% and 33%.',
        evidenceSource: 'Talan DA et al., JAMA 2000;283:1583-1590',
        doi: '10.1001/jama.283.12.1583',
        measuredMetric: 'Bacteriological and clinical cure at the 4 to 11 day post-therapy visit',
        auditFlag: 'verified',
      },
      {
        id: 'cip-a2',
        category: 'measured',
        title: 'Uncomplicated cystitis: 77% clinical cure against 58% for amoxicillin-clavulanate',
        laymanSummary:
          'Even against a beta-lactam the bacteria were susceptible to, ciprofloxacin cured more bladder infections, because it also cleared the reservoir in the vagina.',
        technicalDetails:
          'Randomised single-blind trial in 370 women aged 18 to 45 with acute uncomplicated cystitis. Clinical cure was 77% (124 of 162) with 3 days of ciprofloxacin 250 mg twice daily and 58% (93 of 160) with 3 days of amoxicillin-clavulanate (P<0.001), and the gap persisted among women infected with susceptible strains (77% versus 60%; P=0.004). At two weeks, vaginal Escherichia coli colonisation was 10% versus 45% (P<0.001), which the investigators identified as the mechanism of the difference.',
        evidenceSource: 'Hooton TM et al., JAMA 2005;293:949-955',
        doi: '10.1001/jama.293.8.949',
        measuredMetric: 'Clinical cure, microbiological cure and vaginal Escherichia coli colonisation',
        auditFlag: 'verified',
      },
      {
        id: 'cip-a3',
        category: 'conclusion_shift',
        title:
          'The label now tells prescribers to reserve it for three of its commonest former uses',
        laymanSummary:
          'Ciprofloxacin was never shown to stop working. It was restricted because the harms, catalogued after approval, outweighed the benefit in mild infections.',
        technicalDetails:
          'The current US prescribing information carries a boxed warning headed "SERIOUS ADVERSE REACTIONS INCLUDING TENDINITIS, TENDON RUPTURE, PERIPHERAL NEUROPATHY, CENTRAL NERVOUS SYSTEM EFFECTS AND EXACERBATION OF MYASTHENIA GRAVIS", and directs that because these reactions can be disabling and potentially irreversible, ciprofloxacin be reserved for patients with no alternative treatment options in acute exacerbation of chronic bronchitis, acute uncomplicated cystitis and acute sinusitis. That is a benefit-risk reversal in exactly the indications where the randomised cure rates were highest.',
        evidenceSource:
          'CIPRO (ciprofloxacin hydrochloride) tablets, US prescribing information, boxed warning',
        auditFlag: 'verified',
      },
      {
        id: 'cip-a4',
        category: 'measured',
        title: 'Aortic aneurysm and dissection: two independent cohorts, consistent direction',
        laymanSummary:
          'Two large national datasets, from Taiwan and Sweden, both found more aortic aneurysms in people who had recently taken a fluoroquinolone.',
        technicalDetails:
          'Lee and colleagues performed a nested case-control study in Taiwan National Health Insurance data: 1,477 patients hospitalised for aortic aneurysm or dissection matched to 147,700 controls, propensity-adjusted rate ratio 2.43 (95% CI 1.83 to 3.22) for current use and 1.48 (95% CI 1.18 to 1.86) for past use. Pasternak and colleagues used Swedish registers to compare 360,088 fluoroquinolone treatment episodes, 78% of them ciprofloxacin, with propensity-matched amoxicillin episodes: 1.2 versus 0.7 cases per 1,000 person-years within 60 days, hazard ratio 1.66 (95% CI 1.12 to 2.46), an absolute difference of 82 cases per million treatment episodes. Both are observational.',
        evidenceSource:
          'Lee CC et al., JAMA Intern Med 2015;175:1839-1847; Pasternak B et al., BMJ 2018;360:k678',
        doi: '10.1136/bmj.k678',
        measuredMetric:
          'Hazard and rate ratios for hospitalisation or death from aortic aneurysm or dissection',
        auditFlag: 'caution',
      },
      {
        id: 'cip-a5',
        category: 'inferred',
        title: 'Comparative efficacy in a trial is not the same as the right first choice',
        laymanSummary:
          'Ciprofloxacin beat its comparators in both of the randomised trials on this page and is still not the recommended first choice for either condition.',
        technicalDetails:
          'The efficacy trials measured cure at two to eleven weeks in a few hundred patients. The harms that changed practice — tendon rupture, peripheral neuropathy, central nervous system effects, aortic events, Clostridioides difficile infection and resistance selection — accrue at rates too low, or over horizons too long, for those trials to have detected them. A superior cure rate in a randomised comparison is therefore not sufficient evidence that a drug should be used first, and this is the general lesson rather than a fact about ciprofloxacin.',
        evidenceSource:
          'Talan DA et al., JAMA 2000; Hooton TM et al., JAMA 2005; and the current US prescribing information',
        doi: '10.1001/jama.283.12.1583',
        inferredClaim:
          'That the drug with the highest cure rate in a randomised comparison is the drug that should be prescribed first',
        auditFlag: 'caution',
      },
      {
        id: 'cip-a6',
        category: 'measured',
        title: 'Resistance is now a leading cause of death in its own right',
        laymanSummary:
          'Fluoroquinolone-resistant E. coli is one of the seven pathogen-drug pairs that the global burden study estimated kills more than 50,000 people a year.',
        technicalDetails:
          'The GBD antimicrobial resistance analysis estimated 1.27 million deaths (95% UI 0.911 to 1.71 million) attributable to bacterial resistance in 2019. Fluoroquinolone-resistant Escherichia coli was named among the pathogen-drug combinations each causing between 50,000 and 100,000 attributable deaths. This is the population-level counterpart to the individual-level cure rates above, and it is measured in a different kind of study entirely.',
        evidenceSource: 'Murray CJL et al., Lancet 2022;399:629-655',
        doi: '10.1016/S0140-6736(21)02724-0',
        measuredMetric: 'Deaths attributable to fluoroquinolone-resistant Escherichia coli in 2019',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed orally and distributed widely',
        laymanDesc:
          'Taken by mouth, ciprofloxacin reaches high concentrations in urine, prostate, bone and the gut wall.',
        molecularDetail:
          'Oral bioavailability is roughly 70%, with extensive tissue distribution and high urinary concentrations. It is a substrate and inhibitor of CYP1A2, which is why it raises theophylline and tizanidine levels. Absorption is reduced by polyvalent cations through chelation.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Crosses the bacterial envelope through porin channels',
        laymanDesc:
          'The molecule is small enough to slip through the pores in a bacterium outer coat.',
        molecularDetail:
          'Entry into Gram-negative bacteria is largely through OmpF porins. Reduced porin expression and increased efflux through AcrAB-TolC and MexAB-OprM are two of the three main resistance mechanisms, the third being target-site mutation.',
        iconName: 'ArrowDown',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It binds the enzyme while the enzyme is holding cut DNA',
        laymanDesc:
          'It does not stop the enzyme from cutting. It waits until the cut has been made and then locks the complex in place.',
        molecularDetail:
          'Ciprofloxacin intercalates at the DNA cleavage site within the gyrase or topoisomerase IV enzyme-DNA complex, bridging to the enzyme through a magnesium-water ion. Primary target is DNA gyrase in Gram-negative organisms and topoisomerase IV in many Gram-positive ones. The commonest resistance mutations are in the quinolone resistance-determining region of gyrA.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The trapped complex becomes a double-strand break',
        laymanDesc:
          'The bacterium own machinery has now cut its DNA and cannot put it back together.',
        molecularDetail:
          'The stabilised cleavage complex is converted by ongoing replication and transcription into permanent double-strand breaks, triggering the SOS response. This mechanism is bactericidal and concentration-dependent, so efficacy tracks the ratio of peak concentration or total exposure to the minimum inhibitory concentration rather than time above it.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The bacterium dies, and human tissue takes a documented risk',
        laymanDesc:
          'The infection clears. The same class of drug is also associated with tendon, nerve and central nervous system injury in humans.',
        molecularDetail:
          'Human topoisomerase II is inhibited only at concentrations far above therapeutic ones, so the class harms are not straightforwardly explained by on-target activity in human cells. Proposed contributors include chelation of magnesium in connective tissue and effects on mitochondrial function, but the harms are established clinically and in pharmacoepidemiology rather than derived from a settled molecular mechanism.',
        iconName: 'ShieldOff',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Talan acute pyelonephritis trial',
        phase: 'Randomised double-blind comparative',
        sampleSize: 378,
        primaryEndpoint:
          'Continued bacteriological and clinical cure at the 4 to 11 day post-therapy visit',
        endpointMet: true,
        statisticalPValue: 'P = 0.004 for bacteriological cure, P = 0.002 for clinical cure',
        unreportedAdverseSignals:
          'Drug-related adverse events occurred in 24% of ciprofloxacin patients. The class harms that later drove the boxed warning are not detectable at this sample size.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Hooton uncomplicated cystitis trial',
        phase: 'Randomised single-blind comparative',
        sampleSize: 370,
        primaryEndpoint: 'Clinical cure of acute uncomplicated cystitis',
        endpointMet: true,
        statisticalPValue: 'P < 0.001',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Pasternak Swedish register cohort',
        phase: 'Nationwide propensity-matched cohort study',
        sampleSize: 720176,
        primaryEndpoint:
          'First diagnosis of aortic aneurysm or dissection within 60 days of treatment start',
        endpointMet: true,
        statisticalPValue: 'Hazard ratio 1.66 (95% CI 1.12 to 2.46)',
        unreportedAdverseSignals:
          'Observational: the comparison is against amoxicillin episodes matched on propensity score, not against randomised placebo.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '99% bacteriological cure with 7 days of ciprofloxacin versus 89% with 14 days of co-trimoxazole in acute pyelonephritis (P=0.004)',
        '77% versus 58% clinical cure against amoxicillin-clavulanate in uncomplicated cystitis, with vaginal Escherichia coli colonisation of 10% versus 45%',
        'Hazard ratio 1.66 for aortic aneurysm or dissection within 60 days in 360,088 propensity-matched Swedish fluoroquinolone episodes',
      ],
      unsupportedInferences: [
        'That the highest cure rate in a randomised comparison identifies the correct first-line drug',
        'That switching from ciprofloxacin to another fluoroquinolone avoids the class harms, when the boxed warning is identical across the class',
      ],
      whatFailedInitially: [
        'Nothing failed on efficacy. What failed was the assumption that a drug with excellent trial cure rates could be used freely for mild infections; the boxed warning now restricts three of those indications',
      ],
      realWorldOutcome: [
        'Guidelines now place nitrofurantoin and co-trimoxazole ahead of ciprofloxacin for uncomplicated cystitis despite lower measured cure rates',
        'The GBD study named fluoroquinolone-resistant Escherichia coli among the pathogen-drug pairs each causing 50,000 to 100,000 attributable deaths in 2019',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, extended-release tablet, oral suspension, intravenous infusion, and ophthalmic and otic solutions',
      description:
        'Typically 250 to 750 mg twice daily by mouth, or intravenously when oral intake is not possible. Oral bioavailability of about 70% means the switch from intravenous to oral does not usually require a dose change, which is one of the practical reasons the class was so heavily used.',
      safetyProfile:
        'The boxed warning names tendinitis and tendon rupture, peripheral neuropathy, central nervous system effects and exacerbation of myasthenia gravis, and directs that the drug be reserved in acute sinusitis, acute exacerbation of chronic bronchitis and acute uncomplicated cystitis for patients with no alternative. Observational cohorts in Taiwan and Sweden both found an increased risk of aortic aneurysm and dissection. QT prolongation, hypoglycaemia and Clostridioides difficile infection are also documented.',
    },
    commonQuestions: [
      {
        q: 'If it cures more infections, why is it not first choice any more?',
        a: 'Because cure rate is not the whole of a benefit-risk judgement. In the two randomised trials on this page ciprofloxacin beat both comparators. The harms that changed practice — tendon rupture, peripheral neuropathy, central nervous system effects, aortic events — occur too rarely, or too long after treatment, for trials of a few hundred patients to detect. The label now says to reserve the drug in acute sinusitis, acute exacerbation of chronic bronchitis and uncomplicated cystitis for patients who have no alternative.',
        auditNote:
          'This is a benefit-risk reversal, not an efficacy failure, and the two should not be described in the same words.',
      },
      {
        q: 'Is the aortic aneurysm risk real?',
        a: 'It is consistently observed and it is observational. A Taiwanese nested case-control study of 1,477 cases found a rate ratio of 2.43 for current use; a Swedish cohort of 360,088 propensity-matched treatment episodes found a hazard ratio of 1.66 and an absolute difference of about 82 cases per million treatment episodes. Two national datasets, two designs, the same direction. No randomised trial has tested it and none is likely to, so causation rests on consistency and biological plausibility rather than randomisation.',
      },
      {
        q: 'I took ciprofloxacin years ago and was fine. Should I worry?',
        a: 'No. The absolute risks are small; the Swedish estimate is on the order of 82 additional aortic events per million treatment episodes. The point of the restriction is that when the infection is mild and an alternative exists, even a small risk is not worth taking. It is not a claim that everyone who has taken the drug is harmed.',
      },
      {
        q: 'Why does this page have no manufacturing cost?',
        a: 'Because no published cost-of-production estimate for ciprofloxacin was verified for this record. The US pharmacy acquisition cost is quoted instead, from the CMS NADAC file effective 19 August 2026: US$0.124 per 500 mg tablet.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Talan DA et al. Comparison of Ciprofloxacin (7 Days) and Trimethoprim-Sulfamethoxazole (14 Days) for Acute Uncomplicated Pyelonephritis in Women. JAMA 2000;283:1583-1590',
        identifier: '10.1001/jama.283.12.1583',
        kind: 'doi',
      },
      {
        label:
          'Hooton TM et al. Amoxicillin-Clavulanate vs Ciprofloxacin for the Treatment of Uncomplicated Cystitis in Women. JAMA 2005;293:949-955',
        identifier: '10.1001/jama.293.8.949',
        kind: 'doi',
      },
      {
        label:
          'Lee CC et al. Risk of Aortic Dissection and Aortic Aneurysm in Patients Taking Oral Fluoroquinolone. JAMA Intern Med 2015;175:1839-1847',
        identifier: '10.1001/jamainternmed.2015.5389',
        kind: 'doi',
      },
      {
        label:
          'Pasternak B et al. Fluoroquinolone use and risk of aortic aneurysm and dissection: nationwide cohort study. BMJ 2018;360:k678',
        identifier: '10.1136/bmj.k678',
        kind: 'doi',
      },
      {
        label:
          'Murray CJL et al. Global burden of bacterial antimicrobial resistance in 2019. Lancet 2022;399:629-655',
        identifier: '10.1016/S0140-6736(21)02724-0',
        kind: 'doi',
      },
      {
        label:
          'CIPRO (ciprofloxacin hydrochloride) tablets and oral suspension, US prescribing information — DailyMed',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=888dc7f9-ad9c-4c00-8d50-8ddfd9bd27c0',
        kind: 'regulatory',
      },
      {
        label: 'CMS National Average Drug Acquisition Cost (NADAC) 2026 file',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 2764 — Ciprofloxacin',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2764',
        kind: 'url',
      },
    ],
  },
]
