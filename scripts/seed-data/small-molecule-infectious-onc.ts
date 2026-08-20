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
  // ---------------------------------------------------------------------------------------------
  // Metronidazole — a 1963 drug carrying a famous warning that has never been demonstrated in a
  // controlled human experiment, and a first-line status it lost to a randomised comparison.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'metronidazole',
    name: 'Metronidazole',
    tradeName: 'Flagyl / MetroGel',
    sponsor: 'Rhone-Poulenc (originator); marketed in the US by Pfizer and manufactured generically',
    targetGene:
      'No host or microbial gene is bound directly; activation depends on microbial pyruvate:ferredoxin oxidoreductase and ferredoxin (nifJ, fdx)',
    targetProtein:
      'Microbial DNA, damaged by nitroradical anions generated after reduction by anaerobic electron-transport proteins',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1963,
    indication:
      'Trichomoniasis, amoebiasis, giardiasis, bacterial vaginosis, and serious infections caused by susceptible anaerobic bacteria, including intra-abdominal, gynaecological, skin, bone and joint, central nervous system and bloodstream infection',
    patientFriendlyIndication:
      'Infections caused by parasites and by bacteria that grow without oxygen, including bacterial vaginosis and trichomoniasis',
    conditionContext: {
      conditionExplainer:
        'Metronidazole is inert as swallowed. It only becomes a drug inside organisms that run their metabolism without oxygen, because only those have the low-potential electron carriers able to donate an electron to its nitro group. That single electron turns it into a reactive radical that shreds nearby DNA.',
      whyItMatters:
        'That activation requirement is the whole safety margin. Human cells and aerobic bacteria cannot reduce the nitro group efficiently, so the drug passes through them without effect. It is one of the cleanest examples in pharmacology of selectivity by activation rather than by binding.',
      whoTakesThis:
        'People with trichomoniasis, bacterial vaginosis, amoebic or giardial infection, and patients with serious anaerobic bacterial infection, usually in combination with an agent covering aerobes.',
      clinicalGoals:
        'Eradicate an anaerobic or protozoal infection, confirmed where possible by test of cure rather than by symptom resolution alone.',
    },
    oneSentenceVerdict:
      'A nitroimidazole prodrug activated only inside anaerobes and protozoa, where a seven-day course cured trichomoniasis in 89% of 312 women against 81% for the single dose, and which lost its first-line place in Clostridioides difficile infection to a head-to-head randomised comparison.',
    laymanHowItWorks:
      'The tablet you swallow is not yet a drug. It only becomes one inside microbes that live without oxygen, because only they have the machinery to hand it a spare electron. That electron turns the molecule into something violently reactive that tears the microbe DNA apart within its own cell. Your own cells, and bacteria that use oxygen, cannot perform that first step, so the drug drifts through them unchanged.',
    auditConfidence: 'High Confidence',
    confidenceScore: 78,
    anatomicalSite:
      'Cytoplasm of anaerobic bacteria and protozoa; vaginal, intestinal and abscess environments',
    substitutes: {
      summary:
        'Tinidazole and secnidazole are the same chemistry with longer half-lives. For Clostridioides difficile infection the substitute is not another nitroimidazole but oral vancomycin or fidaxomicin, and that substitution was made on the strength of a randomised comparison rather than on preference.',
      conventionalRx: [
        {
          name: 'Tinidazole',
          class: 'Nitroimidazole',
          howItCompares:
            'Identical activation chemistry with a longer half-life, allowing shorter courses for trichomoniasis and giardiasis. It carries the same rodent carcinogenicity labelling.',
          typicalCost:
            'US$2.199 per 500 mg tablet at pharmacy acquisition cost (CMS NADAC, effective 19 Aug 2026), roughly twenty times metronidazole per tablet',
          prosAndCons:
            'Pros: shorter course, often better tolerated. Cons: substantially more expensive for the same mechanism.',
        },
        {
          name: 'Oral vancomycin',
          class: 'Glycopeptide, not absorbed from the gut',
          howItCompares:
            'For Clostridioides difficile infection, vancomycin achieved clinical success in 81.1% of 259 patients against 72.7% of 278 on metronidazole in a pooled analysis of two randomised trials (P=0.02). Guidelines moved accordingly.',
          typicalCost:
            'US$1.412 per 125 mg capsule at pharmacy acquisition cost (CMS NADAC, effective 19 Aug 2026)',
          prosAndCons:
            'Pros: better cure rate and, in a large propensity-matched cohort, lower 30-day mortality in severe disease. Cons: far more expensive, and it does not treat any infection outside the gut lumen.',
        },
        {
          name: 'Clindamycin',
          class: 'Lincosamide',
          howItCompares:
            'An alternative anaerobic agent for bacterial vaginosis and for some soft-tissue infections. It does not cover protozoa.',
          typicalCost:
            'US$0.168 per 300 mg capsule at pharmacy acquisition cost (CMS NADAC, effective 19 Aug 2026)',
          prosAndCons:
            'Pros: topical and oral options, useful in nitroimidazole intolerance. Cons: among the antibiotics most strongly associated with Clostridioides difficile infection.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask for a test of cure rather than relying on symptoms',
          action:
            'For trichomoniasis, ask whether a repeat nucleic acid test is planned about four weeks after treatment.',
          patientImpact:
            'In the Kissinger trial the difference between the single dose and the seven-day course was invisible symptomatically and showed up only on test of cure: 19% versus 11% still infected at four weeks.',
          clinicalPrecaution:
            'Testing decisions belong to the clinician. Partner treatment is part of the same conversation.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1=NC=C(N1CCO)[N+](=O)[O-]',
      chemicalFormula: 'C6H9N3O3',
      molecularWeight: '171.15 g/mol (PubChem CID 4173)',
      targetReceptorAffinity:
        'No binding constant applies: metronidazole is a prodrug whose activity depends on single-electron reduction of the 5-nitro group by low-redox-potential microbial electron carriers',
      structureSource: {
        label: 'PubChem CID 4173 — Metronidazole, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4173',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'met-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Control of 2-methylimidazole and the nitration feed',
          description:
            'Confirm identity and purity of 2-methyl-5-nitroimidazole, and in particular the 4-nitro versus 5-nitro regiochemistry, because the two isomers are separated by a single ring position and only one of them is a drug.',
          reagentsAndBuffer:
            '2-methylimidazole reference standard, 1H NMR in deuterated dimethyl sulfoxide, reversed-phase HPLC with ultraviolet detection at 320 nm, melting point determination',
        },
        {
          id: 'met-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Nitration and N-hydroxyethylation',
          description:
            'Nitrate 2-methylimidazole under mixed-acid conditions to install the 5-nitro group, then alkylate the ring nitrogen with ethylene oxide or 2-chloroethanol to give the hydroxyethyl side chain that defines metronidazole.',
          dependsOnStepId: 'met-w1',
          reagentsAndBuffer:
            'Concentrated nitric acid and sulfuric acid at controlled temperature; ethylene oxide in acetic acid, or 2-chloroethanol with sodium carbonate in an aprotic solvent; sodium hydroxide for neutralisation',
        },
        {
          id: 'met-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Recrystallisation and control of the nitro-regioisomer',
          description:
            'Recrystallise from water or aqueous ethanol and set the specification for the 4-nitro regioisomer and for residual alkylating agents. Ethylene oxide and 2-chloroethanol are both genotoxic, so residual-solvent and reagent limits are the critical quality attribute of this step.',
          dependsOnStepId: 'met-w2',
          reagentsAndBuffer:
            'Water or aqueous ethanol, activated carbon, headspace gas chromatography with mass-selective detection for residual ethylene oxide and 2-chloroethanol',
        },
        {
          id: 'met-w4',
          stepNumber: 4,
          phase: 'Assay_Quantification',
          name: 'Assay and anaerobic susceptibility testing',
          description:
            'Quantify content and related substances against the pharmacopoeial standard, then confirm activity by agar dilution under strict anaerobic conditions, because the drug shows no activity at all in an aerobic assay and an aerobic plate would read as complete failure.',
          dependsOnStepId: 'met-w3',
          reagentsAndBuffer:
            'C18 column with aqueous buffer and methanol, USP metronidazole reference standard, Brucella agar supplemented with haemin, vitamin K1 and laked sheep blood, anaerobic chamber, Bacteroides fragilis ATCC 25285 quality-control strain',
        },
      ],
    },
    keyAudits: [
      {
        id: 'met-a1',
        category: 'measured',
        title: 'Trichomoniasis: seven days beat the single dose, 89% versus 81% cured',
        laymanSummary:
          'A randomised trial found that a week of twice-daily tablets left fewer women still infected than the traditional single large dose.',
        technicalDetails:
          'Multicentre open-label randomised trial at three US sexual health clinics, 623 HIV-uninfected non-pregnant women with Trichomonas vaginalis. At test of cure four weeks after treatment, 34 of 312 (11%) in the seven-day arm and 58 of 311 (19%) in the single-dose arm remained positive, relative risk 0.55 (95% CI 0.34 to 0.70; P<0.0001). Bacterial vaginosis status did not significantly modify the effect (P=0.17). Self-reported adherence was 96% and 99%. The trial stopped early for funding reasons at 623 of a planned 1,664.',
        evidenceSource: 'Kissinger P et al., Lancet Infect Dis 2018;18:1251-1259',
        doi: '10.1016/S1473-3099(18)30423-7',
        measuredMetric:
          'Trichomonas vaginalis positivity by nucleic acid amplification or culture at four-week test of cure',
        auditFlag: 'verified',
      },
      {
        id: 'met-a2',
        category: 'conclusion_shift',
        title:
          'Metronidazole lost first-line status in Clostridioides difficile infection to a randomised comparison',
        laymanSummary:
          'For decades metronidazole was the standard first treatment for C. difficile. A head-to-head trial found vancomycin cured more patients, and guidelines changed.',
        technicalDetails:
          'Two multinational randomised controlled trials, pooled, allocated patients 2:1:1 to tolevamer, vancomycin 125 mg every 6 hours for 10 days, or metronidazole 375 mg every 6 hours for 10 days. Clinical success was 44.2% for tolevamer (n=534), 72.7% for metronidazole (n=278) and 81.1% for vancomycin (n=259); metronidazole was inferior to vancomycin (P=0.02). In severe disease the gap was 66.3% versus 78.5% (P=0.059). A separate propensity-matched cohort of 10,137 US veterans found no difference in recurrence but lower 30-day all-cause mortality with vancomycin overall (adjusted relative risk 0.86, 95% CI 0.74 to 0.98) and in severe disease (0.79, 95% CI 0.65 to 0.97).',
        evidenceSource:
          'Johnson S et al., Clin Infect Dis 2014;59:345-354 (NCT00106509, NCT00196794); Stevens VW et al., JAMA Intern Med 2017;177:546-553',
        doi: '10.1093/cid/ciu313',
        measuredMetric:
          'Clinical success at day 10, and 30-day all-cause mortality in the matched cohort',
        auditFlag: 'verified',
      },
      {
        id: 'met-a3',
        category: 'inferred',
        title:
          'The alcohol warning is one of the best-known claims in medicine and has never been demonstrated',
        laymanSummary:
          'Everyone is told not to drink on metronidazole. When a controlled human study looked for the reaction, it did not happen.',
        technicalDetails:
          'A systematic review of reports published between 1969 and 1982 found six case reports involving eight patients and concluded that none provided evidence that could justify the presumed disulfiram-like interaction; four of the eight cases were serious and one involved a death, but in every report the interaction was assumed rather than demonstrated. A subsequent double-blind study gave 12 healthy male volunteers metronidazole or placebo for 5 days followed by ethanol 0.4 g/kg, and sampled blood acetaldehyde and ethanol every 20 minutes for 4 hours alongside blood pressure, heart rate and skin temperature. Metronidazole did not raise blood acetaldehyde and produced no objective or subjective disulfiram-like effect. The authors were explicit that a reaction in some subgroup by another mechanism is not excluded.',
        evidenceSource:
          'Williams CS, Woodcock KR. Ann Pharmacother 2000;34:255-257; Visapaa JP et al., Ann Pharmacother 2002;36:971-974',
        doi: '10.1345/aph.1A066',
        inferredClaim:
          'That metronidazole inhibits aldehyde dehydrogenase and produces a disulfiram-like reaction with alcohol',
        auditFlag: 'contested',
      },
      {
        id: 'met-a4',
        category: 'measured',
        title: 'Carcinogenic in rodents, and labelled as such since the 1970s',
        laymanSummary:
          'Metronidazole causes tumours in mice and rats at doses used lifelong, and the label says so. Human data have not shown the same, but the warning has never been withdrawn.',
        technicalDetails:
          'The US prescribing information carries a warning that metronidazole has been shown to be carcinogenic in mice and rats and that unnecessary use should be avoided, and directs that it be reserved for the conditions described in the indications. The mechanism is consistent with the drug reduction chemistry: the same nitroradical that damages microbial DNA is mutagenic in bacterial assays. Epidemiological studies in humans have not established a corresponding risk, which is why the drug remains in wide use with the warning intact rather than being withdrawn.',
        evidenceSource:
          'FLAGYL (metronidazole) capsules, US prescribing information, warnings section',
        auditFlag: 'caution',
      },
      {
        id: 'met-a5',
        category: 'inferred',
        title: 'Selectivity is by activation, not by binding, which limits what resistance can mean',
        laymanSummary:
          'The drug has no receptor and no binding site. It works by being switched on inside anaerobes, so resistance means failing to switch it on.',
        technicalDetails:
          'Metronidazole is reduced by low-redox-potential electron carriers, principally ferredoxin reduced by pyruvate:ferredoxin oxidoreductase, that exist only in anaerobic and microaerophilic organisms. Resistance in Trichomonas vaginalis, Helicobacter pylori and Bacteroides arises from downregulated or mutated nitroreductases and from efflux, not from an altered drug target, because there is no drug target in the usual sense. Any claim that metronidazole has a specific molecular receptor should be treated as a category error.',
        evidenceSource:
          'FLAGYL (metronidazole) capsules, US prescribing information, clinical pharmacology section',
        inferredClaim:
          'That metronidazole acts on a defined protein target, and that resistance therefore reflects target-site mutation',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed and absorbed almost completely, then distributed everywhere',
        laymanDesc:
          'Metronidazole gets into essentially every body compartment, including abscesses, bone and the fluid around the brain.',
        molecularDetail:
          'Oral bioavailability approaches 100%. The molecule is small and only weakly protein-bound, so it distributes into cerebrospinal fluid, bile, saliva, breast milk and abscess cavities. Elimination is mainly hepatic, with hydroxy and acetic acid metabolites excreted in urine.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Diffuses into every cell it meets, and does nothing in most of them',
        laymanDesc:
          'It passes into human cells and aerobic bacteria alike, and simply leaves again unchanged.',
        molecularDetail:
          'Entry is by passive diffusion, so uptake is not selective. Selectivity appears only at the next step, because human cells and aerobes lack electron carriers with a redox potential low enough to reduce the 5-nitro group.',
        iconName: 'ArrowDown',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Anaerobic electron carriers hand it a single electron',
        laymanDesc:
          'Inside an organism that lives without oxygen, the drug is handed an electron and becomes a highly reactive radical.',
        molecularDetail:
          'Pyruvate:ferredoxin oxidoreductase reduces ferredoxin, which transfers a single electron to the nitro group to give a nitroradical anion. Maintaining the concentration gradient that keeps drug flowing inward is itself a consequence of this reduction, since the activated species no longer diffuses back out.',
        iconName: 'Zap',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The radical fragments and shreds nearby DNA',
        laymanDesc:
          'The reactive species attacks whatever is close by, and what is close by is the microbe own genetic material.',
        molecularDetail:
          'Short-lived nitroso and hydroxylamine intermediates and radical fragments cause strand breakage and helix destabilisation in microbial DNA. Killing is concentration-dependent and rapid, and it happens only where the reduction occurred.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The anaerobe or protozoan dies, aerobic flora is largely spared',
        laymanDesc:
          'The oxygen-avoiding organisms are killed while the ones that use oxygen carry on.',
        molecularDetail:
          'The narrow activation requirement means aerobic gut and skin flora are relatively unaffected, which is why metronidazole is usually combined with a separate agent when aerobic cover is needed. The same chemistry that gives that selectivity is what underlies the rodent carcinogenicity labelling.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Kissinger trichomoniasis trial',
        phase: 'Multicentre randomised open-label',
        sampleSize: 623,
        primaryEndpoint:
          'Trichomonas vaginalis infection at test of cure four weeks after treatment completion',
        endpointMet: true,
        statisticalPValue: 'P < 0.0001 (relative risk 0.55, 95% CI 0.34 to 0.70)',
        unreportedAdverseSignals:
          'The trial stopped early at 623 of a planned 1,664 participants because of funding limitations, not because of a data-driven stopping rule.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Tolevamer comparator trials (NCT00106509 and NCT00196794), pooled',
        phase: 'Two multinational randomised controlled trials',
        sampleSize: 1118,
        primaryEndpoint:
          'Clinical success, defined as resolution of diarrhoea and absence of severe abdominal discomfort for more than 2 consecutive days including day 10',
        endpointMet: false,
        statisticalPValue: 'P = 0.02 for metronidazole inferior to vancomycin (72.7% versus 81.1%)',
        unreportedAdverseSignals:
          'In severe disease the difference was 66.3% versus 78.5% and did not reach significance (P=0.059), so the severe-disease conclusion rests partly on the later observational cohort.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Visapaa metronidazole and ethanol volunteer study',
        phase: 'Double-blind human volunteer study',
        sampleSize: 12,
        primaryEndpoint:
          'Blood acetaldehyde concentration and objective signs of a disulfiram-like reaction after ethanol 0.4 g/kg',
        endpointMet: false,
        statisticalPValue:
          'No rise in blood acetaldehyde and no objective or subjective reaction were observed',
        unreportedAdverseSignals:
          'Twelve healthy young men is a small and narrow sample; the authors explicitly did not exclude a reaction in some subgroup or by another mechanism.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '11% versus 19% persistent Trichomonas vaginalis infection at four-week test of cure for the seven-day course against the single dose, in 623 randomised women',
        'Clinical success of 72.7% with metronidazole against 81.1% with vancomycin for Clostridioides difficile infection in a pooled randomised comparison (P=0.02)',
        'No rise in blood acetaldehyde and no objective or subjective reaction when 12 volunteers took metronidazole for 5 days and then ethanol',
      ],
      unsupportedInferences: [
        'That metronidazole inhibits aldehyde dehydrogenase and produces a disulfiram-like reaction with alcohol — six case reports, none demonstrating the mechanism, and one controlled study that looked for it and did not find it',
        'That metronidazole acts on a molecular target, when its selectivity comes from being reduced inside anaerobes rather than from binding anything',
      ],
      whatFailedInitially: [
        'Metronidazole was inferior to vancomycin in the pooled randomised comparison for Clostridioides difficile infection, and lost its first-line position accordingly',
        'The single 2 g dose for trichomoniasis, standard for decades, left almost twice as many women infected at test of cure as the seven-day course',
      ],
      realWorldOutcome: [
        'Metronidazole remains the least expensive option in this record at US$0.101 per 500 mg tablet in the US acquisition-cost dataset, against US$2.199 for a tinidazole tablet and US$1.412 for a vancomycin capsule',
        'The rodent carcinogenicity warning has been on the label since the 1970s and continues to shape the instruction to avoid unnecessary use',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet and capsule, intravenous infusion, vaginal gel and topical gel, cream and lotion',
      description:
        'Given by mouth two or three times daily, or intravenously in serious infection. Because oral bioavailability approaches 100%, the intravenous route offers no pharmacokinetic advantage in a patient who can swallow. Topical and vaginal formulations deliver the same molecule to a local site with much lower systemic exposure.',
      safetyProfile:
        'The label warns of carcinogenicity in mice and rats and directs that unnecessary use be avoided. Peripheral neuropathy and central nervous system effects, including rare encephalopathy and cerebellar syndromes, are documented with prolonged or high-dose use. A metallic taste and nausea are common. The alcohol interaction is on the label and is discussed on this page as a contested claim rather than a demonstrated one, which is a statement about the evidence and not advice to disregard the label.',
    },
    commonQuestions: [
      {
        q: 'Is the alcohol warning real?',
        a: 'The warning is real; the reaction it describes has never been demonstrated. A 2000 review of the published reports found six case reports involving eight patients, none of which provided evidence for the presumed mechanism. A 2002 double-blind study gave 12 volunteers metronidazole for five days and then a measured dose of ethanol, sampling blood acetaldehyde every 20 minutes for four hours, and found no rise and no reaction. Twelve healthy young men is a small study, and the authors said plainly that a reaction in some subgroup by another mechanism is not excluded. This page reports what has and has not been measured; it does not tell anyone to disregard a label instruction.',
        auditNote:
          'This is the clearest example in this file of a claim that is universally repeated, appears on the official label, and rests on case reports that the one controlled experiment failed to confirm.',
      },
      {
        q: 'Why is metronidazole no longer first choice for C. difficile?',
        a: 'Because it was compared directly with vancomycin and lost. In a pooled analysis of two multinational randomised trials, clinical success was 72.7% on metronidazole and 81.1% on vancomycin (P=0.02). A separate propensity-matched cohort of 10,137 US veterans found the same recurrence rate but lower 30-day mortality with vancomycin, especially in severe disease. Neither result says metronidazole does not work; both say something else works better.',
      },
      {
        q: 'Does it upset the gut like other antibiotics?',
        a: 'Less than most, because of how narrow its activation is. Metronidazole only becomes active inside organisms that live without oxygen, so aerobic gut flora is comparatively spared. That is also why it is usually combined with another agent when aerobic bacteria need covering, and why it has no activity at all against most common respiratory or urinary pathogens.',
      },
      {
        q: 'Should the rodent cancer warning worry me?',
        a: 'It is on the label and it is the reason the label says to avoid unnecessary use. The finding is in mice and rats given the drug over a lifetime, and the chemistry is consistent: the same reactive species that damages microbial DNA is mutagenic in bacterial test systems. Human epidemiology has not established a corresponding risk. The practical consequence is that this is a drug to take for a defined infection and a defined course rather than repeatedly for uncertain indications.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Kissinger P et al. Single-dose versus 7-day-dose metronidazole for the treatment of trichomoniasis in women. Lancet Infect Dis 2018;18:1251-1259',
        identifier: '10.1016/S1473-3099(18)30423-7',
        kind: 'doi',
      },
      {
        label:
          'Johnson S et al. Vancomycin, Metronidazole, or Tolevamer for Clostridium difficile Infection. Clin Infect Dis 2014;59:345-354',
        identifier: '10.1093/cid/ciu313',
        kind: 'doi',
      },
      {
        label:
          'Stevens VW et al. Comparative Effectiveness of Vancomycin and Metronidazole for the Prevention of Recurrence and Death in Patients With Clostridium difficile Infection. JAMA Intern Med 2017;177:546-553',
        identifier: '10.1001/jamainternmed.2016.9045',
        kind: 'doi',
      },
      {
        label:
          'Williams CS, Woodcock KR. Do Ethanol and Metronidazole Interact to Produce a Disulfiram-Like Reaction? Ann Pharmacother 2000;34:255-257',
        identifier: '10.1345/aph.19118',
        kind: 'doi',
      },
      {
        label:
          'Visapaa JP et al. Lack of Disulfiram-Like Reaction with Metronidazole and Ethanol. Ann Pharmacother 2002;36:971-974',
        identifier: '10.1345/aph.1A066',
        kind: 'doi',
      },
      {
        label: 'FLAGYL (metronidazole) capsules, US prescribing information — DailyMed',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=a2883ca1-5a9a-4259-9d80-46ab67274384',
        kind: 'regulatory',
      },
      {
        label: 'CMS National Average Drug Acquisition Cost (NADAC) 2026 file',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 4173 — Metronidazole',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4173',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Fluconazole — a drug whose single-dose convenience is genuine, whose monotherapy in the disease
  // that kills most people who need an antifungal is measurably inferior, and whose pregnancy
  // signal came from registries rather than trials.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'fluconazole',
    name: 'Fluconazole',
    tradeName: 'Diflucan',
    sponsor: 'Pfizer (originally Pfizer Central Research, Sandwich, UK)',
    targetGene: 'ERG11, the fungal gene encoding lanosterol 14-alpha-demethylase (CYP51)',
    targetProtein: 'Fungal lanosterol 14-alpha-demethylase (Erg11p)',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1990,
    indication:
      'Vaginal, oropharyngeal and oesophageal candidiasis, other candidal infections including candidaemia and peritonitis, cryptococcal meningitis, and prophylaxis in patients undergoing bone marrow transplantation',
    patientFriendlyIndication:
      'Thrush and other yeast infections, and fungal meningitis in people with advanced HIV',
    conditionContext: {
      conditionExplainer:
        'A fungal cell membrane needs ergosterol the way an animal cell membrane needs cholesterol. Fluconazole blocks one enzyme in the ergosterol assembly line, so the membrane is built from the wrong sterols and stops working properly.',
      whyItMatters:
        'Cryptococcal meningitis still causes over 100,000 deaths a year in people with HIV, and fluconazole is the drug most widely available where that disease is most common. What the trials show is that fluconazole is essential as part of a regimen and inadequate on its own.',
      whoTakesThis:
        'Women with vulvovaginal candidiasis, people with oral or oesophageal thrush, patients with candidaemia, and adults with cryptococcal meningitis as part of a combination and consolidation regimen.',
      clinicalGoals:
        'Clear a susceptible fungal infection, and in cryptococcal meningitis reduce ten-week mortality as part of a combination rather than alone.',
    },
    oneSentenceVerdict:
      'A triazole that stalls fungal membrane synthesis at one enzyme, effective and convenient in candidiasis, measurably inferior to flucytosine as the partner drug in cryptococcal meningitis (45.0% versus 31.1% ten-week mortality), and associated in Danish registry data with tetralogy of Fallot and with spontaneous abortion in pregnancy.',
    laymanHowItWorks:
      'Fungal cells build their outer membrane out of a fat called ergosterol, which they have to manufacture themselves. Fluconazole jams one specific enzyme on that production line. The half-finished sterols that pile up cannot do the job, so the membrane becomes leaky and disordered and the fungus stops growing. Human cells build cholesterol using a related enzyme, which is why the dose matters and why the drug interacts with so many others.',
    auditConfidence: 'High Confidence',
    confidenceScore: 80,
    anatomicalSite: 'Fungal endoplasmic reticulum, where ergosterol is synthesised',
    substitutes: {
      summary:
        'Topical azoles treat vaginal candidiasis without systemic exposure and are the preferred option in pregnancy. For serious infection the substitutes are not other azoles but amphotericin B and flucytosine, and the randomised evidence says the combination beats fluconazole alone.',
      conventionalRx: [
        {
          name: 'Clotrimazole (topical or vaginal)',
          class: 'Imidazole antifungal',
          howItCompares:
            'Same class of mechanism applied locally, with negligible systemic absorption. Guidelines prefer intravaginal azoles over oral fluconazole in pregnancy for exactly that reason.',
          typicalCost:
            'US$0.089 per gram of 1% vaginal cream at pharmacy acquisition cost (CMS NADAC, effective 19 Aug 2026)',
          prosAndCons:
            'Pros: no systemic exposure, no drug interactions, usable in pregnancy. Cons: several days of application rather than one tablet.',
        },
        {
          name: 'Flucytosine',
          class: 'Fluorinated pyrimidine antimetabolite',
          howItCompares:
            'In ACTA, flucytosine as the partner drug with amphotericin B gave 31.1% ten-week mortality against 45.0% with fluconazole as the partner, hazard ratio 0.62 (95% CI 0.45 to 0.84; P=0.002). This is a direct randomised comparison of fluconazole against the alternative in the setting that matters most.',
          typicalCost: 'Not priced here — no current acquisition-cost figure verified for this record',
          prosAndCons:
            'Pros: substantially lower mortality as a partner drug. Cons: requires haematological monitoring, and access in the countries with the highest burden has historically been the limiting factor.',
        },
        {
          name: 'Itraconazole',
          class: 'Triazole antifungal',
          howItCompares:
            'Broader mould activity than fluconazole but erratic absorption and heavier interaction burden. Not interchangeable for cryptococcal disease.',
          typicalCost:
            'US$0.903 per 100 mg capsule at pharmacy acquisition cost (CMS NADAC, effective 19 Aug 2026)',
          prosAndCons:
            'Pros: covers organisms fluconazole misses. Cons: absorption depends on gastric acidity and formulation, and it has a negative inotropic warning.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask about pregnancy status before an oral dose',
          action:
            'If pregnancy is possible, say so before accepting an oral azole for a vaginal yeast infection.',
          patientImpact:
            'Danish registry data associated first-trimester oral fluconazole with tetralogy of Fallot (adjusted prevalence odds ratio 3.16, 95% CI 1.49 to 6.71) and, in a separate analysis, with spontaneous abortion (hazard ratio 1.48, 95% CI 1.23 to 1.77). Intravaginal azoles avoid systemic exposure entirely.',
          clinicalPrecaution:
            'These are observational associations from national registers, not randomised results, and the decision belongs to the prescriber.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1=CC(=C(C=C1F)F)C(CN2C=NC=N2)(CN3C=NC=N3)O',
      chemicalFormula: 'C13H12F2N6O',
      molecularWeight: '306.27 g/mol (PubChem CID 3365)',
      targetReceptorAffinity:
        'Coordinates the haem iron of fungal lanosterol 14-alpha-demethylase through a triazole nitrogen; potency is reported clinically as a minimum inhibitory concentration against the isolate',
      structureSource: {
        label: 'PubChem CID 3365 — Fluconazole, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3365',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'flu-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Control of 2,4-difluoroacetophenone and 1,2,4-triazole',
          description:
            'Confirm identity and purity of the difluorinated ketone and of 1,2,4-triazole, and in particular that the triazole is the 1,2,4 isomer rather than 1,2,3. Fluconazole carries two triazole rings, so an isomeric impurity in the feed is doubled in the product.',
          reagentsAndBuffer:
            "2,4-difluoroacetophenone, 1,2,4-triazole reference standard, gas chromatography with mass-selective detection, 19F and 1H NMR, Karl Fischer titration",
        },
        {
          id: 'flu-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Double triazole alkylation onto the tertiary carbinol',
          description:
            'Convert the aryl ketone to an epoxide or halomethyl ketone, open it with the sodium salt of 1,2,4-triazole, and repeat so that both triazole rings sit on the carbon bearing the tertiary hydroxyl. The tertiary alcohol is what gives fluconazole its water solubility and its near-complete oral absorption.',
          dependsOnStepId: 'flu-w1',
          reagentsAndBuffer:
            'Trimethylsulfoxonium iodide with sodium hydride in dimethyl sulfoxide for epoxide formation, or bromination followed by displacement; sodium 1,2,4-triazolide in dimethylformamide; potassium carbonate; toluene and water workup',
        },
        {
          id: 'flu-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation and control of the regioisomeric triazole adduct',
          description:
            'Recrystallise and set a specification for the N-2 linked triazole regioisomer, which forms alongside the N-1 product and is the principal related substance in the pharmacopoeial monograph.',
          dependsOnStepId: 'flu-w2',
          reagentsAndBuffer:
            'Ethyl acetate and heptane antisolvent crystallisation, activated carbon treatment, reversed-phase HPLC with ultraviolet detection at 261 nm',
        },
        {
          id: 'flu-w4',
          stepNumber: 4,
          phase: 'Assay_Quantification',
          name: 'Assay by HPLC and antifungal susceptibility by broth microdilution',
          description:
            'Quantify content and related substances against the pharmacopoeial standard, then determine minimum inhibitory concentrations by the reference broth microdilution method, reading the endpoint as the partial inhibition characteristic of azoles rather than as complete clearing.',
          dependsOnStepId: 'flu-w3',
          reagentsAndBuffer:
            'C18 column with aqueous buffer and acetonitrile, USP fluconazole reference standard, RPMI 1640 medium buffered with MOPS to pH 7.0, Candida parapsilosis ATCC 22019 and Candida krusei ATCC 6258 quality-control strains',
        },
      ],
    },
    keyAudits: [
      {
        id: 'flu-a1',
        category: 'measured',
        title:
          'ACTA: an all-oral fluconazole and flucytosine regimen was non-inferior to two weeks of amphotericin B',
        laymanSummary:
          'In 721 African adults with HIV-associated cryptococcal meningitis, two weeks of oral fluconazole plus flucytosine matched two weeks of intravenous amphotericin B on death at two weeks.',
        technicalDetails:
          'Randomised trial in HIV-infected adults with cryptococcal meningitis. Two-week mortality was 18.2% (41 of 225) in the oral regimen group, 21.9% (49 of 224) with one week of amphotericin B and 21.4% (49 of 229) with two weeks; ten-week mortality was 35.1%, 36.2% and 39.7%. The upper limit of the one-sided 97.5% confidence interval for the oral regimen versus two-week amphotericin B was 4.2 percentage points, inside the prespecified 10-point non-inferiority margin. Severe anaemia was more frequent with two weeks of amphotericin B than with the oral regimen.',
        evidenceSource: 'Molloy SF et al., N Engl J Med 2018;378:1004-1017 (ISRCTN45035509)',
        doi: '10.1056/NEJMoa1710922',
        measuredMetric: 'All-cause mortality at 2 weeks, with 10-week mortality as a secondary outcome',
        auditFlag: 'verified',
      },
      {
        id: 'flu-a2',
        category: 'failed',
        title:
          'In the same trial, fluconazole was clearly the inferior partner drug for amphotericin B',
        laymanSummary:
          'Patients given amphotericin B with flucytosine died substantially less often than those given amphotericin B with fluconazole.',
        technicalDetails:
          'Within ACTA, each patient assigned amphotericin B was separately randomised to fluconazole or flucytosine as the partner drug. Ten-week mortality was 71 deaths (31.1%) with flucytosine and 101 deaths (45.0%) with fluconazole, hazard ratio for death 0.62 (95% CI 0.45 to 0.84; P=0.002). One week of amphotericin B plus flucytosine had the lowest ten-week mortality of any arm at 24.2% (95% CI 16.2 to 32.1). Fluconazole monotherapy, which the trial was explicitly designed to improve upon, was not an arm because it was already known to be inadequate.',
        evidenceSource: 'Molloy SF et al., N Engl J Med 2018;378:1004-1017',
        doi: '10.1056/NEJMoa1710922',
        measuredMetric: 'All-cause mortality at 10 weeks by partner-drug randomisation',
        auditFlag: 'verified',
      },
      {
        id: 'flu-a3',
        category: 'measured',
        title: 'First-trimester exposure and tetralogy of Fallot in Danish registry data',
        laymanSummary:
          'A national registry study of nearly a million pregnancies found no overall increase in birth defects, and one specific heart malformation that was more common.',
        technicalDetails:
          'Registry cohort of liveborn infants in Denmark. Birth defects occurred in 210 of 7,352 fluconazole-exposed pregnancies (2.86%) and 25,159 of 968,236 unexposed (2.60%), adjusted prevalence odds ratio 1.06 (95% CI 0.92 to 1.21). Fourteen of fifteen specific defects previously linked to azoles showed no significant increase. Tetralogy of Fallot did: 7 cases (0.10%) versus 287 (0.03%), adjusted prevalence odds ratio 3.16 (95% CI 1.49 to 6.71). Most exposures were at the common 150 mg or 300 mg doses. Seven events is a small numerator and the confidence interval is correspondingly wide.',
        evidenceSource: 'Molgaard-Nielsen D et al., N Engl J Med 2013;369:830-839',
        doi: '10.1056/NEJMoa1301066',
        measuredMetric: 'Adjusted prevalence odds ratio for specific birth defects',
        auditFlag: 'caution',
      },
      {
        id: 'flu-a4',
        category: 'measured',
        title: 'Spontaneous abortion: a 48% relative increase against unexposed pregnancies',
        laymanSummary:
          'A second Danish registry analysis found more miscarriages among women who took oral fluconazole in pregnancy, including when compared with women who used topical antifungals instead.',
        technicalDetails:
          'From a cohort of 1,405,663 pregnancies, 3,315 women exposed to oral fluconazole between 7 and 22 weeks were compared with 13,246 propensity-matched unexposed women: 147 versus 563 spontaneous abortions, hazard ratio 1.48 (95% CI 1.23 to 1.77). Against topical azole exposure as the comparator, 130 of 2,823 versus 118 of 2,823, hazard ratio 1.62 (95% CI 1.26 to 2.07). Stillbirth was not significantly increased (hazard ratio 1.32, 95% CI 0.82 to 2.14). The topical-azole comparison is what makes confounding by indication a weaker explanation than it would otherwise be.',
        evidenceSource: 'Molgaard-Nielsen D et al., JAMA 2016;315:58-67',
        doi: '10.1001/jama.2015.17844',
        measuredMetric: 'Hazard ratio for spontaneous abortion and stillbirth',
        auditFlag: 'caution',
      },
      {
        id: 'flu-a5',
        category: 'conclusion_shift',
        title: 'AMBITION then moved the standard again, to a single dose of liposomal amphotericin',
        laymanSummary:
          'Four years after the oral regimen was shown to be non-inferior, a single high dose of a different drug plus two weeks of fluconazole and flucytosine did better still.',
        technicalDetails:
          'Phase 3 non-inferiority trial in five African countries, 844 randomised and 814 in the intention-to-treat population. A single 10 mg/kg dose of liposomal amphotericin B plus 14 days of flucytosine and fluconazole gave 10-week mortality of 24.8% (95% CI 20.7 to 29.3) against 28.7% (95% CI 24.4 to 33.4) for the then-recommended WHO regimen, difference -3.9 percentage points, upper one-sided 95% bound 1.2 points, P<0.001 for non-inferiority. Grade 3 or 4 adverse events occurred in 50.0% versus 62.3%. Fluconazole is a component of the new standard rather than a competitor to it.',
        evidenceSource: 'Jarvis JN et al., N Engl J Med 2022;386:1109-1120 (ISRCTN72509687)',
        doi: '10.1056/NEJMoa2111904',
        measuredMetric: 'All-cause mortality at 10 weeks',
        auditFlag: 'verified',
      },
      {
        id: 'flu-a6',
        category: 'inferred',
        title: 'Single-dose convenience is an efficacy claim about one infection, not about all of them',
        laymanSummary:
          'One 150 mg tablet clears most simple vaginal yeast infections. Nothing about that generalises to serious fungal disease, which needs weeks of combination therapy.',
        technicalDetails:
          'The dose used in the Danish registry studies for the commonest indication was 150 mg (56% of exposed pregnancies) or 300 mg (31%). The dose used in ACTA and AMBITION for cryptococcal meningitis was 1,200 mg per day for two weeks, as part of a combination, with ten-week mortality still around a quarter of patients. The same molecule spans an eightfold daily dose range and two entirely different evidence bases, and a claim proved at one end says nothing about the other.',
        evidenceSource:
          'Molgaard-Nielsen D et al., N Engl J Med 2013; Molloy SF et al., N Engl J Med 2018; Jarvis JN et al., N Engl J Med 2022',
        doi: '10.1056/NEJMoa2111904',
        inferredClaim:
          'That the convenience and safety of a single 150 mg dose describes fluconazole as a drug rather than one indication',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed almost completely and reaching the brain',
        laymanDesc:
          'Fluconazole is water-soluble enough to be swallowed and still reach the fluid around the brain, which is why it can treat fungal meningitis.',
        molecularDetail:
          'Oral bioavailability exceeds 90% and is unaffected by food or gastric acidity, unlike itraconazole. Protein binding is low, around 11%, and cerebrospinal fluid concentrations approach plasma concentrations. Elimination is largely renal as unchanged drug, so dosing follows creatinine clearance.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Enters the fungal cell and reaches the endoplasmic reticulum',
        laymanDesc: 'The drug crosses into the fungus and travels to where membrane fats are made.',
        molecularDetail:
          'Uptake is by facilitated diffusion. Efflux through the Candida CDR1, CDR2 and MDR1 transporters is one of the main resistance mechanisms and is upregulated by repeated exposure, which is the pharmacological reason repeated single doses select for resistance.',
        iconName: 'ArrowDown',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'A triazole nitrogen coordinates the enzyme haem iron',
        laymanDesc:
          'One of the drug nitrogen atoms grips the iron atom at the heart of the enzyme, blocking the spot where the reaction happens.',
        molecularDetail:
          'The N-4 nitrogen of one triazole ring coordinates the haem iron of lanosterol 14-alpha-demethylase (Erg11p, CYP51), while the difluorophenyl group occupies the substrate channel. ERG11 point mutations and gene overexpression are the second major resistance route.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Ergosterol synthesis stalls and toxic sterols accumulate',
        laymanDesc:
          'The production line stops, and the half-finished parts pile up and cause their own damage.',
        molecularDetail:
          'Depletion of ergosterol and accumulation of 14-alpha-methylated sterols, principally 14-alpha-methyl-3,6-diol, disorders the membrane and inhibits growth. The effect is fungistatic against Candida species, not fungicidal, which is why relapse follows if the immune system cannot finish the job.',
        iconName: 'Layers',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Fungal growth stops, and human CYP enzymes are inhibited too',
        laymanDesc:
          'The infection is controlled. At higher doses the drug also slows some of the enzymes your liver uses to clear other medicines.',
        molecularDetail:
          'Fluconazole inhibits human CYP2C9, CYP2C19 and, at higher doses, CYP3A4, raising concentrations of warfarin, phenytoin, sulfonylureas and many other drugs. It also prolongs the QT interval. The selectivity for fungal CYP51 over human CYP enzymes is real but is a matter of degree rather than of kind.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'ACTA (ISRCTN45035509)',
        phase: 'Phase 3 randomised, open-label, non-inferiority with factorial partner-drug randomisation',
        sampleSize: 721,
        primaryEndpoint: 'All-cause mortality at 2 weeks in HIV-associated cryptococcal meningitis',
        endpointMet: true,
        statisticalPValue:
          'Non-inferiority met (upper one-sided 97.5% bound 4.2 percentage points against a 10-point margin); P = 0.002 for flucytosine over fluconazole as the partner drug',
        unreportedAdverseSignals:
          'The partner-drug comparison showed 45.0% ten-week mortality with fluconazole against 31.1% with flucytosine, a difference not visible in the headline non-inferiority result.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'AMBITION-cm (ISRCTN72509687)',
        phase: 'Phase 3 randomised controlled non-inferiority',
        sampleSize: 844,
        primaryEndpoint: 'Death from any cause at 10 weeks',
        endpointMet: true,
        statisticalPValue: 'P < 0.001 for non-inferiority (difference -3.9 percentage points)',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Danish national birth-defect registry cohort',
        phase: 'Registry-based cohort study',
        sampleSize: 975588,
        primaryEndpoint:
          'Birth defects overall and 15 specific defects previously linked to azole antifungals',
        endpointMet: false,
        statisticalPValue:
          'Overall adjusted prevalence odds ratio 1.06 (95% CI 0.92 to 1.21); tetralogy of Fallot 3.16 (95% CI 1.49 to 6.71)',
        unreportedAdverseSignals:
          'The tetralogy of Fallot signal rests on 7 exposed cases, so the estimate is imprecise and was found among fifteen defects examined.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Danish spontaneous abortion and stillbirth cohort',
        phase: 'Registry-based propensity-matched cohort study',
        sampleSize: 1405663,
        primaryEndpoint: 'Spontaneous abortion and stillbirth after oral fluconazole in pregnancy',
        endpointMet: true,
        statisticalPValue:
          'Hazard ratio 1.48 (95% CI 1.23 to 1.77) versus unexposed and 1.62 (95% CI 1.26 to 2.07) versus topical azole exposure',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Two-week mortality of 18.2% with an all-oral fluconazole and flucytosine regimen against 21.4% with two weeks of amphotericin B, inside a 10-point non-inferiority margin',
        'Ten-week mortality of 45.0% with fluconazole as the amphotericin B partner drug against 31.1% with flucytosine (hazard ratio 0.62; P=0.002)',
        'Adjusted prevalence odds ratio 3.16 for tetralogy of Fallot and 1.06 for birth defects overall after first-trimester exposure in Danish registry data',
        'Hazard ratio 1.48 for spontaneous abortion versus unexposed pregnancies and 1.62 versus topical azole exposure',
      ],
      unsupportedInferences: [
        'That the safety and convenience of a single 150 mg dose for vaginal candidiasis describes fluconazole in general, when the cryptococcal regimen is 1,200 mg daily for two weeks in combination',
        'That non-inferiority of an oral regimen means fluconazole is as good as flucytosine — the same trial randomised that question separately and answered it in the other direction',
      ],
      whatFailedInitially: [
        'Fluconazole as the partner drug for amphotericin B: 45.0% ten-week mortality against 31.1% for flucytosine in the same randomised trial',
        'Fluconazole monotherapy for cryptococcal meningitis was already known to be inadequate and was not given an arm in ACTA',
      ],
      realWorldOutcome: [
        'The all-oral regimen was designed for settings where intravenous amphotericin B is not sustainable, and its value is that it works where the better regimen cannot be given',
        'AMBITION moved the standard again in 2022, with fluconazole retained as a component rather than displaced',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, oral suspension and intravenous infusion',
      description:
        'A single 150 mg tablet for uncomplicated vaginal candidiasis; daily dosing for oropharyngeal, oesophageal and invasive disease; 1,200 mg daily as part of combination induction for cryptococcal meningitis. Because oral bioavailability exceeds 90% and is unaffected by food or gastric acid, the intravenous and oral routes are interchangeable at the same dose.',
      safetyProfile:
        'The dominant practical issue is drug interaction: fluconazole inhibits CYP2C9 and CYP2C19 and, at higher doses, CYP3A4, raising levels of warfarin, phenytoin, sulfonylureas and many others. QT prolongation is documented. Hepatotoxicity and rare severe cutaneous reactions occur. In pregnancy, Danish registry analyses associated oral exposure with tetralogy of Fallot and with spontaneous abortion, and intravaginal azoles are preferred where a local option will do.',
    },
    commonQuestions: [
      {
        q: 'Is one tablet really enough?',
        a: 'For an uncomplicated vaginal yeast infection, usually yes, and that is the dose the Danish registry studies mostly captured: 150 mg in 56% of exposed pregnancies. It is not enough for anything serious. Cryptococcal meningitis is treated with 1,200 mg a day for two weeks alongside another antifungal, and ten-week mortality in the best arm of the ACTA trial was still 24.2%. The same molecule, an eightfold difference in daily dose, and two evidence bases that do not transfer to each other.',
      },
      {
        q: 'Is it safe in pregnancy?',
        a: 'The registry evidence says be careful with the oral form. A Danish cohort of nearly a million pregnancies found no overall increase in birth defects, adjusted odds ratio 1.06, but a specific increase in tetralogy of Fallot on 7 exposed cases, odds ratio 3.16 with a wide interval. A separate analysis found a 48% relative increase in spontaneous abortion against unexposed pregnancies and 62% against women who used topical antifungals instead. These are observational, but the topical-azole comparison makes confounding by indication a weaker explanation. Intravaginal treatment avoids systemic exposure altogether.',
        auditNote:
          'Seven events across fifteen examined outcomes is exactly the situation where a single finding should be treated as a signal rather than a settled fact.',
      },
      {
        q: 'Why is a stronger antifungal not just used everywhere?',
        a: 'Because the stronger regimens require intravenous access, laboratory monitoring and drug supply that many of the places with the highest burden do not have. That is the entire point of ACTA and AMBITION: both trials were designed to find regimens that could actually be delivered in African hospitals, not to find the theoretically best drug. Non-inferiority trials answer the question "can this be done here" rather than "is this the best".',
      },
      {
        q: 'Why does this page have no manufacturing cost?',
        a: 'Because no published per-unit cost-of-production estimate for fluconazole was verified for this record. The US pharmacy acquisition cost is quoted instead: US$0.433 per 150 mg tablet in the CMS NADAC file effective 19 August 2026.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Molloy SF et al. Antifungal Combinations for Treatment of Cryptococcal Meningitis in Africa (ACTA). N Engl J Med 2018;378:1004-1017',
        identifier: '10.1056/NEJMoa1710922',
        kind: 'doi',
      },
      {
        label:
          'Jarvis JN et al. Single-Dose Liposomal Amphotericin B Treatment for Cryptococcal Meningitis (AMBITION). N Engl J Med 2022;386:1109-1120',
        identifier: '10.1056/NEJMoa2111904',
        kind: 'doi',
      },
      {
        label:
          'Molgaard-Nielsen D et al. Use of Oral Fluconazole during Pregnancy and the Risk of Birth Defects. N Engl J Med 2013;369:830-839',
        identifier: '10.1056/NEJMoa1301066',
        kind: 'doi',
      },
      {
        label:
          'Molgaard-Nielsen D et al. Association Between Use of Oral Fluconazole During Pregnancy and Risk of Spontaneous Abortion and Stillbirth. JAMA 2016;315:58-67',
        identifier: '10.1001/jama.2015.17844',
        kind: 'doi',
      },
      {
        label: 'DIFLUCAN (fluconazole) tablets and oral suspension, US prescribing information — DailyMed',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=f694c617-3383-416c-91b6-b94fda371204',
        kind: 'regulatory',
      },
      {
        label: 'CMS National Average Drug Acquisition Cost (NADAC) 2026 file',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 3365 — Fluconazole',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3365',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Valacyclovir — a prodrug with an unusually clean measured result on transmission, and three
  // separate large trials in which suppressing the virus did not deliver the outcome the biology
  // predicted.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'valacyclovir',
    name: 'Valacyclovir',
    tradeName: 'Valtrex',
    sponsor: 'GlaxoSmithKline (originator); now manufactured generically',
    targetGene:
      'Herpesvirus UL23 (viral thymidine kinase, which activates the drug) and UL30 (viral DNA polymerase, which the drug inhibits)',
    targetProtein: 'Herpes simplex and varicella-zoster virus DNA polymerase',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1995,
    indication:
      'Herpes zoster, genital herpes including suppression and reduction of transmission in heterosexual serodiscordant couples, cold sores, and chickenpox in children',
    patientFriendlyIndication:
      'Shingles, cold sores and genital herpes, including reducing the chance of passing genital herpes to a partner',
    conditionContext: {
      conditionExplainer:
        'Herpes viruses hide in nerve cell bodies between outbreaks and cannot be cleared. What antiviral treatment can do is reduce how often the virus wakes up, how much of it is shed, and how long a lesion lasts.',
      whyItMatters:
        'Genital herpes is lifelong and most transmission happens from people who do not know they have it, during shedding without visible lesions. That is why a drug that suppresses subclinical shedding could plausibly change transmission, and why it had to be tested rather than assumed.',
      whoTakesThis:
        'People with recurrent genital herpes taking suppressive therapy, people with shingles or cold sores taking episodic treatment, and members of serodiscordant couples where reducing transmission is the goal.',
      clinicalGoals:
        'Reduce recurrence frequency, shorten and soften episodes, and in serodiscordant couples reduce the probability of transmitting HSV-2 to a partner.',
    },
    oneSentenceVerdict:
      'A valine ester prodrug of acyclovir that raised oral bioavailability enough to make suppression practical, and cut symptomatic HSV-2 transmission from 16 of 741 to 4 of 743 partners over eight months, while failing to reduce HIV-1 transmission, HIV-1 acquisition, Bell palsy recovery or Alzheimer disease progression in four separate randomised trials.',
    laymanHowItWorks:
      'Valacyclovir is a delivery trick. Acyclovir itself is poorly absorbed from the gut, so an amino acid is bolted on, which lets a nutrient transporter carry it across the intestinal wall. Once inside, the body cuts the amino acid off. The freed drug is then activated only inside infected cells, because only a herpes virus makes the enzyme that switches it on. The activated form is then fed to the viral copying machine, which incorporates it and stalls permanently.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 86,
    anatomicalSite:
      'Herpesvirus-infected epithelial and neuronal cells; the drug is activated only where viral thymidine kinase is present',
    substitutes: {
      summary:
        'Acyclovir is the same active molecule for a third of the price, at the cost of more frequent dosing. Famciclovir is a comparable prodrug of a related nucleoside. Nothing on the natural-products side has a controlled transmission trial, so this record lists none.',
      conventionalRx: [
        {
          name: 'Acyclovir (generic)',
          class: 'Guanosine nucleoside analogue',
          howItCompares:
            'The identical active moiety, released from valacyclovir after absorption. Oral acyclovir has bioavailability of roughly 10 to 20% against about 55% for valacyclovir, so it needs three to five doses a day rather than one or two.',
          typicalCost:
            'US$0.099 per 400 mg tablet at pharmacy acquisition cost (CMS NADAC, effective 19 Aug 2026), against US$0.405 per 1 g valacyclovir tablet',
          prosAndCons:
            'Pros: cheapest option, decades of use, same active drug. Cons: dosing frequency is the main reason suppression adherence fails.',
        },
        {
          name: 'Famciclovir (generic)',
          class: 'Prodrug of penciclovir, a guanosine analogue',
          howItCompares:
            'A parallel prodrug strategy applied to a different nucleoside, with a longer intracellular half-life of the triphosphate.',
          typicalCost:
            'US$0.791 per 500 mg tablet at pharmacy acquisition cost (CMS NADAC, effective 19 Aug 2026)',
          prosAndCons:
            'Pros: an alternative when valacyclovir is not tolerated. Cons: more expensive, and it has no transmission-reduction indication.',
        },
        {
          name: 'Consistent condom use and disclosure',
          class: 'Behavioural, non-pharmacological',
          howItCompares:
            'In the Corey transmission trial both partners were counselled on safer sex and offered condoms at every visit, so the 75% relative reduction in symptomatic transmission was measured on top of that, not instead of it.',
          typicalCost: 'Not priced here',
          prosAndCons:
            'Pros: no drug, no cost, and it is the baseline the drug effect was measured against. Cons: does not cover all skin contact, and it depends on both partners.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Start episodic treatment at the first tingle, not at the first blister',
          action:
            'For recurrences, begin the prescribed episodic course at the prodromal sensation rather than waiting for a visible lesion.',
          patientImpact:
            'The drug works by stopping viral DNA replication, which is largely complete by the time a lesion is fully formed. Earlier initiation is the mechanistic reason episodic treatment shortens episodes.',
          clinicalPrecaution:
            'This applies to a course already prescribed for recurrences. It is not a reason to start a leftover course for a new or undiagnosed lesion.',
        },
        {
          name: 'Stay hydrated on high-dose courses',
          action: 'Maintain fluid intake during shingles-dose or other high-dose treatment.',
          patientImpact:
            'Acyclovir is renally cleared and can crystallise in the renal tubules when urine output is low, which is the mechanism of the acute kidney injury reported at high doses.',
          clinicalPrecaution:
            'People with existing kidney impairment need a dose adjustment, which is a prescriber decision.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(C)[C@@H](C(=O)OCCOCN1C=NC2=C1N=C(NC2=O)N)N',
      chemicalFormula: 'C13H20N6O4',
      molecularWeight: '324.34 g/mol (PubChem CID 135398742, valacyclovir free base)',
      targetReceptorAffinity:
        'No direct target: valacyclovir is hydrolysed to acyclovir, phosphorylated by viral thymidine kinase, and the resulting triphosphate is incorporated by viral DNA polymerase, which it then inactivates',
      structureSource: {
        label: 'PubChem CID 135398742 — Valacyclovir, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/135398742',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'val-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Control of acyclovir and the protected L-valine',
          description:
            'Confirm identity, purity and, critically, the enantiomeric purity of the protected L-valine. The D-enantiomer ester is not a substrate for the intestinal peptide transporter that gives valacyclovir its bioavailability advantage, so an enantiomeric impurity is an inactive impurity.',
          reagentsAndBuffer:
            'Acyclovir reference standard, N-carbobenzyloxy-L-valine, chiral HPLC on an amylose stationary phase, 1H NMR in deuterated dimethyl sulfoxide, Karl Fischer titration',
        },
        {
          id: 'val-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Esterification of the acyclovir side-chain hydroxyl and deprotection',
          description:
            'Couple the protected L-valine to the primary hydroxyl of the acyclic side chain of acyclovir, then remove the protecting group by catalytic hydrogenolysis. The guanine ring nitrogens must not be acylated, so the coupling conditions are chosen for chemoselectivity rather than for rate.',
          dependsOnStepId: 'val-w1',
          reagentsAndBuffer:
            'N-carbobenzyloxy-L-valine with dicyclohexylcarbodiimide and 4-dimethylaminopyridine in dimethylformamide; palladium on carbon under hydrogen for deprotection; hydrochloric acid for salt formation',
        },
        {
          id: 'val-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Hydrochloride crystallisation and control of residual acyclovir',
          description:
            'Crystallise valacyclovir hydrochloride from aqueous alcohol and set the specification for unreacted acyclovir and for the diastereomeric D-valyl ester. Residual acyclovir is not a hazard but it is a potency deduction, since it is absorbed far less efficiently.',
          dependsOnStepId: 'val-w2',
          reagentsAndBuffer:
            'Isopropanol and water crystallisation, activated carbon treatment, chiral and achiral reversed-phase HPLC with ultraviolet detection at 254 nm',
        },
        {
          id: 'val-w4',
          stepNumber: 4,
          phase: 'Assay_Quantification',
          name: 'Assay by HPLC and antiviral activity by plaque reduction',
          description:
            'Quantify content and related substances against the pharmacopoeial standard, then confirm antiviral activity as acyclovir in a plaque reduction assay against reference herpes simplex strains, including a thymidine-kinase-deficient strain as the resistance control.',
          dependsOnStepId: 'val-w3',
          reagentsAndBuffer:
            'C18 column with phosphate buffer and methanol, USP valacyclovir hydrochloride reference standard, Vero cell monolayers in Eagle minimum essential medium with fetal bovine serum, HSV-1 strain KOS and a thymidine-kinase-negative control strain',
        },
      ],
    },
    keyAudits: [
      {
        id: 'val-a1',
        category: 'measured',
        title: 'Symptomatic HSV-2 transmission fell from 16 of 741 partners to 4 of 743',
        laymanSummary:
          'In 1,484 couples where one partner had genital herpes and the other did not, daily valacyclovir cut symptomatic transmission by three quarters over eight months.',
        technicalDetails:
          'Randomised, placebo-controlled trial in immunocompetent, heterosexual, monogamous couples. The source partner took valacyclovir 500 mg once daily or placebo for eight months; both partners were counselled on safer sex and offered condoms at every visit. Clinically symptomatic HSV-2 infection developed in 4 of 743 partners on valacyclovir versus 16 of 741 on placebo, hazard ratio 0.25 (95% CI 0.08 to 0.75; P=0.008). Overall acquisition, including asymptomatic seroconversion, was 14 of 743 (1.9%) versus 27 of 741 (3.6%), hazard ratio 0.52 (95% CI 0.27 to 0.99; P=0.04). HSV DNA was detected on 2.9% of days versus 10.8% (P<0.001), and recurrences averaged 0.11 versus 0.40 per month (P<0.001).',
        evidenceSource: 'Corey L et al., N Engl J Med 2004;350:11-20',
        doi: '10.1056/NEJMoa035144',
        measuredMetric:
          'Clinically symptomatic HSV-2 acquisition in the initially susceptible partner over 8 months',
        auditFlag: 'verified',
      },
      {
        id: 'val-a2',
        category: 'failed',
        title:
          'Partners in Prevention: suppressing HSV-2 reduced ulcers and viral load and did not reduce HIV-1 transmission',
        laymanSummary:
          'The drug did exactly what it was supposed to do biologically and did not change the outcome anyone cared about.',
        technicalDetails:
          'Randomised, placebo-controlled trial of acyclovir 400 mg twice daily in 3,408 African couples where the HIV-1-positive partner was also HSV-2-positive and not on antiretroviral therapy. Of 132 seroconversions, 84 were genetically linked within couples: 41 in the acyclovir group and 43 on placebo, hazard ratio 0.92 (95% CI 0.60 to 1.41; P=0.69). In the same trial acyclovir reduced plasma HIV-1 RNA by 0.25 log10 copies per millilitre (P<0.001) and HSV-2-positive genital ulcers by 73% (risk ratio 0.27; P<0.001). Adherence was 96%.',
        evidenceSource: 'Celum C et al., N Engl J Med 2010;362:427-439 (NCT00194519)',
        doi: '10.1056/NEJMoa0904849',
        measuredMetric: 'Genetically linked HIV-1 transmission within serodiscordant couples',
        inferredClaim:
          'That reducing HSV-2 ulceration and plasma HIV-1 RNA would translate into reduced HIV-1 transmission',
        auditFlag: 'verified',
      },
      {
        id: 'val-a3',
        category: 'failed',
        title: 'The mirror-image trial in HIV-negative people also found nothing',
        laymanSummary:
          'Giving the drug to uninfected people with genital herpes did not protect them from acquiring HIV either.',
        technicalDetails:
          'A phase 3 double-blind, randomised, placebo-controlled trial of acyclovir 400 mg twice daily for 12 to 18 months in HSV-2-seropositive, HIV-1-seronegative women in Africa and men who have sex with men in Peru and the United States. 3,172 participants were in the primary dataset. HIV-1 incidence was 3.9 per 100 person-years on acyclovir (75 events) and 3.3 on placebo (64 events), hazard ratio 1.16 (95% CI 0.83 to 1.62). Genital ulcers on examination fell 47% and HSV-2-positive ulcers 63%. Together with Partners in Prevention this closes the hypothesis from both directions: neither suppressing the virus in the person transmitting HIV nor in the person at risk of acquiring it changed HIV incidence.',
        evidenceSource: 'Celum C et al., Lancet 2008;371:2109-2119',
        doi: '10.1016/S0140-6736(08)60920-4',
        inferredClaim:
          'That HSV-2 suppression is a viable HIV prevention strategy because HSV-2 ulceration facilitates HIV transmission',
        auditFlag: 'verified',
      },
      {
        id: 'val-a4',
        category: 'failed',
        title: 'VALAD: valacyclovir for Alzheimer disease worsened the cognitive endpoint',
        laymanSummary:
          'A hypothesis that herpes virus drives Alzheimer disease was tested with 78 weeks of high-dose valacyclovir. The treated group declined more than the placebo group.',
        technicalDetails:
          'Randomised, double-blind, placebo-controlled trial at three US memory clinics. 120 participants with probable Alzheimer disease or biomarker-positive mild cognitive impairment, all HSV-1 or HSV-2 seropositive, received valacyclovir 4 g per day (n=60) or placebo (n=60) for 78 weeks; 93 (77.5%) completed. Least-squares mean change in the 11-item ADAS-Cognitive subscale was 10.86 (95% CI 8.80 to 12.91) with valacyclovir and 6.92 (95% CI 4.88 to 8.97) with placebo, a between-group difference of 3.93 (95% CI 1.03 to 6.83; P=0.01) in the direction of greater worsening on drug. Amyloid and tau PET showed no between-group difference. Elevated serum creatinine occurred in 8.3% versus 3.3%.',
        evidenceSource: 'Devanand DP et al., JAMA 2026;335:511-522 (NCT03282916)',
        doi: '10.1001/jama.2025.21738',
        measuredMetric: 'Least-squares mean change in ADAS-Cognitive subscale score at 78 weeks',
        inferredClaim:
          'That because herpes simplex virus is epidemiologically associated with Alzheimer disease, suppressing it would slow cognitive decline',
        auditFlag: 'verified',
      },
      {
        id: 'val-a5',
        category: 'failed',
        title: 'Bell palsy: the steroid worked and the antiviral did not',
        laymanSummary:
          'A factorial trial gave patients prednisolone, acyclovir, both or neither. Only the steroid made a difference.',
        technicalDetails:
          'Double-blind, placebo-controlled, randomised factorial trial in 551 patients recruited within 72 hours of onset, with final outcomes for 496. Recovery of facial function at 3 months was 83.0% with prednisolone versus 63.6% without (P<0.001), and 71.2% with acyclovir versus 75.7% without (adjusted P=0.50). At 9 months, 94.4% versus 81.6% for prednisolone (P<0.001) and 85.4% versus 90.8% for acyclovir (adjusted P=0.10). There was no additional benefit of acyclovir added to prednisolone.',
        evidenceSource: 'Sullivan FM et al., N Engl J Med 2007;357:1598-1607 (ISRCTN71548196)',
        doi: '10.1056/NEJMoa072006',
        measuredMetric: 'Recovery of facial function on the House-Brackmann scale',
        auditFlag: 'verified',
      },
      {
        id: 'val-a6',
        category: 'inferred',
        title: 'Reducing shedding is a surrogate, and it predicted one outcome out of four',
        laymanSummary:
          'Valacyclovir reliably reduces how much virus is shed. That surrogate predicted the herpes transmission result and failed to predict three others.',
        technicalDetails:
          'In the Corey trial, HSV DNA detection fell from 10.8% to 2.9% of days and symptomatic transmission fell in proportion. In Partners in Prevention, genital ulcers fell 73% and plasma HIV-1 RNA fell 0.25 log10 and linked HIV transmission did not move at all. In VALAD, 78 weeks of suppression at eight times the usual suppressive dose produced worse cognitive scores. A surrogate that tracks the clinical endpoint in one disease is not thereby a surrogate in another, and this drug provides an unusually clean four-trial demonstration of that.',
        evidenceSource:
          'Corey L et al., N Engl J Med 2004; Celum C et al., N Engl J Med 2010; Devanand DP et al., JAMA 2026',
        doi: '10.1056/NEJMoa035144',
        inferredClaim:
          'That suppression of viral shedding is a general surrogate for clinical benefit wherever the virus is implicated',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'An amino acid tag gets it through the gut wall',
        laymanDesc:
          'Acyclovir on its own is barely absorbed. Attaching valine to it lets a nutrient transporter carry it across the intestinal lining.',
        molecularDetail:
          'The L-valyl ester is a substrate for the intestinal peptide transporter PEPT1. Oral bioavailability of acyclovir rises from roughly 10 to 20% for acyclovir itself to about 55% for valacyclovir, which is what makes once or twice daily suppression practical. The stereochemistry matters: the D-valyl ester is not a PEPT1 substrate.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'First-pass hydrolysis releases acyclovir',
        laymanDesc: 'Enzymes in the gut wall and liver snip the valine off, freeing the real drug.',
        molecularDetail:
          'Valacyclovir hydrolase in intestinal and hepatic tissue cleaves the ester almost completely on first pass, so systemic exposure is to acyclovir. Valacyclovir itself has no meaningful antiviral activity; every pharmacological statement below is about acyclovir.',
        iconName: 'Scissors',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Only an infected cell can switch it on',
        laymanDesc:
          'The drug is activated by an enzyme that only the herpes virus makes, so uninfected cells leave it alone.',
        molecularDetail:
          'Herpesvirus thymidine kinase, encoded by UL23, adds the first phosphate. Host kinases add the second and third. Uninfected cells phosphorylate acyclovir hundreds of times less efficiently, which is the source of the selectivity. Thymidine-kinase-deficient viral mutants are resistant and are the commonest resistance mechanism in immunocompromised patients.',
        iconName: 'Zap',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The viral polymerase incorporates it and stops',
        laymanDesc:
          'The virus copying machine picks up the activated drug, adds it to the growing DNA strand, and cannot continue because the drug has no attachment point for the next unit.',
        molecularDetail:
          'Acyclovir triphosphate competes with deoxyguanosine triphosphate for the viral DNA polymerase encoded by UL30 and is incorporated into the elongating strand. Lacking a 3-hydroxyl, it is an obligate chain terminator, and the terminated primer-template then inactivates the polymerase in a suicide fashion.',
        iconName: 'Lock',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Shedding and recurrences fall, and the latent virus remains',
        laymanDesc:
          'Outbreaks become rarer and shorter and shedding drops sharply, but the virus stays in the nerve cells for life.',
        molecularDetail:
          'The drug acts only on replicating virus, so latent genomes in sensory ganglia are untouched. In the Corey trial suppression cut HSV DNA detection from 10.8% to 2.9% of days and recurrences from 0.40 to 0.11 per month, and stopping the drug returns both to baseline.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Corey HSV-2 transmission trial',
        phase: 'Randomised double-blind placebo-controlled',
        sampleSize: 1484,
        primaryEndpoint:
          'Reduction in transmission of symptomatic genital herpes to the initially susceptible partner over 8 months',
        endpointMet: true,
        statisticalPValue: 'P = 0.008 (hazard ratio 0.25, 95% CI 0.08 to 0.75)',
        unreportedAdverseSignals:
          'Overall acquisition including asymptomatic seroconversion fell less steeply, hazard ratio 0.52 (P=0.04), so the headline figure is specific to symptomatic infection.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Partners in Prevention HSV/HIV Transmission Study (NCT00194519)',
        phase: 'Phase 3 randomised placebo-controlled',
        sampleSize: 3408,
        primaryEndpoint: 'Genetically linked HIV-1 transmission within serodiscordant couples',
        endpointMet: false,
        statisticalPValue: 'P = 0.69 (hazard ratio 0.92, 95% CI 0.60 to 1.41)',
        unreportedAdverseSignals:
          'The intervention worked on every intermediate measure: genital ulcers fell 73% and plasma HIV-1 RNA fell 0.25 log10, with no effect on the endpoint.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Celum HIV-1 acquisition trial (NCT00076232)',
        phase: 'Phase 3 randomised double-blind placebo-controlled',
        sampleSize: 3172,
        primaryEndpoint: 'HIV-1 acquisition in HSV-2-seropositive, HIV-1-seronegative participants',
        endpointMet: false,
        statisticalPValue:
          'Hazard ratio 1.16 (95% CI 0.83 to 1.62), numerically favouring placebo',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'VALAD (NCT03282916)',
        phase: 'Phase 2 randomised double-blind placebo-controlled',
        sampleSize: 120,
        primaryEndpoint:
          'Least-squares mean change in the 11-item ADAS-Cognitive subscale at 78 weeks',
        endpointMet: false,
        statisticalPValue:
          'P = 0.01 in the direction of greater worsening on valacyclovir (between-group difference 3.93, 95% CI 1.03 to 6.83)',
        unreportedAdverseSignals:
          'Elevated serum creatinine occurred in 8.3% on valacyclovir against 3.3% on placebo, at a dose of 4 g per day.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Bell palsy factorial trial (ISRCTN71548196)',
        phase: 'Randomised double-blind placebo-controlled factorial',
        sampleSize: 551,
        primaryEndpoint: 'Recovery of facial function on the House-Brackmann scale at 3 and 9 months',
        endpointMet: false,
        statisticalPValue:
          'Adjusted P = 0.50 at 3 months and 0.10 at 9 months for acyclovir; P < 0.001 for prednisolone',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Symptomatic HSV-2 acquisition in 4 of 743 partners on valacyclovir against 16 of 741 on placebo over 8 months',
        'HSV DNA detected on 2.9% of days against 10.8%, and recurrences of 0.11 against 0.40 per month',
        'A 73% reduction in HSV-2 genital ulcers and a 0.25 log10 fall in plasma HIV-1 RNA in Partners in Prevention, with a hazard ratio for linked HIV transmission of 0.92',
        'HIV-1 incidence of 3.9 against 3.3 per 100 person-years in 3,172 HSV-2-seropositive HIV-negative participants given acyclovir or placebo',
        'Greater cognitive worsening on valacyclovir than placebo at 78 weeks in 120 participants with early Alzheimer disease (P=0.01)',
      ],
      unsupportedInferences: [
        'That suppressing HSV-2 reduces HIV-1 transmission or acquisition — tested from both directions and refuted in both',
        'That an epidemiological association between herpes simplex virus and Alzheimer disease implies a treatable causal role',
        'That reduced viral shedding is a general surrogate for clinical benefit rather than one specific to the herpes transmission endpoint',
      ],
      whatFailedInitially: [
        'Partners in Prevention: no reduction in genetically linked HIV-1 transmission despite every intermediate measure moving in the expected direction',
        'VALAD: the primary cognitive endpoint moved against the drug',
        'Bell palsy: no benefit from acyclovir alone or added to prednisolone',
      ],
      realWorldOutcome: [
        'Reduction of transmission in heterosexual serodiscordant couples remains on the US label, and it is the only transmission-reduction claim among the trials on this page that survived testing',
        'Generic acyclovir delivers the identical active molecule at about a quarter of the per-tablet acquisition cost, at the price of more frequent dosing',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet and oral suspension',
      description:
        'Once or twice daily for suppression, higher and more frequent for shingles or an acute episode. The whole design of the molecule is oral delivery: the L-valyl ester is a substrate for the intestinal peptide transporter PEPT1, which raises acyclovir bioavailability from roughly 10 to 20% to about 55% and converts a five-times-daily drug into a once-daily one.',
      safetyProfile:
        'Generally well tolerated, with headache and nausea the commonest complaints. Acyclovir is renally cleared and can crystallise in renal tubules, so dose reduction is required in renal impairment and adequate hydration matters at high doses; the VALAD trial at 4 g per day found elevated creatinine in 8.3% of participants. Thrombotic thrombocytopenic purpura and haemolytic uraemic syndrome have been reported at high doses in advanced HIV and in transplant recipients. Neurotoxicity occurs mainly in renal impairment.',
    },
    commonQuestions: [
      {
        q: 'Does taking it stop me passing herpes on?',
        a: 'It reduces the chance substantially and does not eliminate it. In 1,484 monogamous heterosexual serodiscordant couples, symptomatic HSV-2 infection developed in 4 of 743 partners over eight months on valacyclovir and 16 of 741 on placebo. Counting asymptomatic seroconversion too, it was 1.9% versus 3.6%. Both partners in that trial were counselled on safer sex and offered condoms at every visit, so this is the drug effect on top of those measures, not instead of them.',
        auditNote:
          'Eight months, monogamous heterosexual couples, one partner symptomatic and diagnosed. Populations outside that description were not studied here.',
      },
      {
        q: 'If it suppresses the virus so well, why did it fail for HIV and for Alzheimer disease?',
        a: 'Because suppressing the virus was never the outcome anybody wanted; it was the assumed route to it. Partners in Prevention showed the point most sharply: acyclovir cut genital ulcers by 73% and plasma HIV-1 RNA by a quarter of a log, and linked HIV transmission was unchanged, hazard ratio 0.92. In VALAD, 78 weeks of high-dose valacyclovir in Alzheimer disease produced worse cognitive scores than placebo. A drug can do exactly what its mechanism says and still not deliver the clinical result.',
        auditNote:
          'This is the single clearest surrogate-endpoint lesson in this file, and it is unusual in having four randomised trials on both sides of it.',
      },
      {
        q: 'Should I just take acyclovir instead? It is cheaper.',
        a: 'It is the same active drug. Valacyclovir exists only because acyclovir is poorly absorbed: attaching valine raises bioavailability from roughly 10 to 20% up to about 55%, which is what turns a five-times-daily schedule into a once-daily one. At US acquisition cost, acyclovir is about US$0.099 per 400 mg tablet against US$0.405 for a 1 g valacyclovir tablet. Whether the dosing convenience is worth the difference is a real question and it is one for the prescriber.',
      },
      {
        q: 'Why does this page have no manufacturing cost?',
        a: 'Because no published per-unit cost-of-production estimate for valacyclovir was verified for this record. The US pharmacy acquisition cost is quoted instead, from the CMS NADAC file effective 19 August 2026.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Corey L et al. Once-Daily Valacyclovir to Reduce the Risk of Transmission of Genital Herpes. N Engl J Med 2004;350:11-20',
        identifier: '10.1056/NEJMoa035144',
        kind: 'doi',
      },
      {
        label:
          'Celum C et al. Acyclovir and Transmission of HIV-1 from Persons Infected with HIV-1 and HSV-2. N Engl J Med 2010;362:427-439',
        identifier: '10.1056/NEJMoa0904849',
        kind: 'doi',
      },
      {
        label:
          'Celum C et al. Effect of aciclovir on HIV-1 acquisition in herpes simplex virus 2 seropositive women and men who have sex with men. Lancet 2008;371:2109-2119',
        identifier: '10.1016/S0140-6736(08)60920-4',
        kind: 'doi',
      },
      {
        label:
          'Devanand DP et al. Valacyclovir Treatment of Early Symptomatic Alzheimer Disease: The VALAD Randomized Clinical Trial. JAMA 2026;335:511-522',
        identifier: '10.1001/jama.2025.21738',
        kind: 'doi',
      },
      {
        label:
          "Sullivan FM et al. Early Treatment with Prednisolone or Acyclovir in Bell's Palsy. N Engl J Med 2007;357:1598-1607",
        identifier: '10.1056/NEJMoa072006',
        kind: 'doi',
      },
      {
        label: 'Partners in Prevention HSV/HIV Transmission Study',
        identifier: 'NCT00194519',
        kind: 'nct',
      },
      { label: "VALAD: Anti-viral Therapy in Alzheimer's Disease", identifier: 'NCT03282916', kind: 'nct' },
      {
        label: 'VALTREX (valacyclovir hydrochloride) caplets, US prescribing information — DailyMed',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=f8e0d8f8-cb73-4206-a484-88f5c4fbd719',
        kind: 'regulatory',
      },
      {
        label: 'CMS National Average Drug Acquisition Cost (NADAC) 2026 file',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 135398742 — Valacyclovir',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/135398742',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Oseltamivir — the archetypal conclusion shift. Governments stockpiled it on the strength of a
  // manufacturer-pooled analysis of trials nobody outside the company had read; when the full
  // clinical study reports were finally released, the complication claim did not survive.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'oseltamivir',
    name: 'Oseltamivir',
    tradeName: 'Tamiflu',
    sponsor: 'Gilead Sciences (discovery); developed and marketed by Roche and Genentech',
    targetGene: 'NA, segment 6 of the influenza A and B genome, encoding neuraminidase',
    targetProtein: 'Influenza A and B neuraminidase (sialidase)',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1999,
    indication:
      'Treatment of acute uncomplicated influenza A and B in patients symptomatic for no more than 48 hours, and prophylaxis of influenza in patients aged 1 year and older',
    patientFriendlyIndication: 'Flu, if started within two days of the first symptom',
    conditionContext: {
      conditionExplainer:
        'A new influenza particle assembled at a cell surface stays stuck there, held by the same sugar it used to get in. Neuraminidase is the enzyme that cuts it free. Oseltamivir blocks that enzyme, so new virus particles cannot escape and spread.',
      whyItMatters:
        'Influenza kills, and governments spent billions stockpiling this drug against a pandemic. The question that mattered was never whether it shortens symptoms by a few hours, which it does, but whether it prevents pneumonia, hospitalisation and death. That question turned on data that were not public for more than a decade.',
      whoTakesThis:
        'Otherwise healthy adults and children with influenza within 48 hours of symptom onset, and people at higher risk of complications; the WHO Expert Committee restricted its recommendation to severe illness in hospitalised patients in 2017.',
      clinicalGoals:
        'Shorten symptomatic illness, and in higher-risk patients reduce complications — the second of which is the claim that has moved back and forth for twenty years.',
    },
    oneSentenceVerdict:
      'A neuraminidase inhibitor that shortens influenza symptoms in adults by 16.8 hours, whose claim to prevent pneumonia and hospitalisation rested on a manufacturer-pooled analysis and did not survive the release of the full clinical study reports in 2014.',
    laymanHowItWorks:
      'Influenza gets into a cell by grabbing a sugar on its surface. When the cell has finished building new virus particles, they are still holding on to that same sugar and cannot let go. The virus carries a pair of scissors, an enzyme called neuraminidase, to cut itself free. Oseltamivir is shaped like the sugar those scissors are built to cut, so the scissors close on the drug instead and jam. New particles stay stuck to the cell they came from.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 58,
    anatomicalSite: 'Respiratory epithelial cell surface, at the budding virion',
    substitutes: {
      summary:
        'Baloxavir and zanamivir are the pharmacological alternatives; annual vaccination is the intervention with the outcome evidence oseltamivir has struggled to produce. For most healthy adults with influenza, the honest comparison is between a drug that shortens illness by about a day and doing nothing.',
      conventionalRx: [
        {
          name: 'Zanamivir (Relenza)',
          class: 'Neuraminidase inhibitor, inhaled',
          howItCompares:
            'In the same Cochrane review of clinical study reports, zanamivir shortened symptoms in adults by 0.60 days against 16.8 hours for oseltamivir, and caused fewer systemic adverse effects because so little is absorbed.',
          typicalCost: 'Not priced here — no current acquisition-cost figure verified for this record',
          prosAndCons:
            'Pros: lower systemic exposure and lower toxicity. Cons: inhaled powder, unsuitable in asthma and chronic obstructive pulmonary disease.',
        },
        {
          name: 'Baloxavir marboxil (Xofluza)',
          class: 'Cap-dependent endonuclease inhibitor',
          howItCompares:
            'A single oral dose targeting a different viral enzyme, with faster viral clearance than oseltamivir in head-to-head trials. Resistance-conferring substitutions emerge readily during treatment.',
          typicalCost: 'Not priced here — no current acquisition-cost figure verified for this record',
          prosAndCons:
            'Pros: one dose. Cons: treatment-emergent resistance is common, and the complication evidence is no stronger than for oseltamivir.',
        },
        {
          name: 'Annual influenza vaccination',
          class: 'Prophylactic vaccine',
          howItCompares:
            'Prevention rather than treatment, and the intervention with the largest body of outcome evidence in influenza. Oseltamivir prophylaxis reduced symptomatic influenza with a number needed to treat of 33 in individuals and 7 in households, but only for the duration of dosing.',
          typicalCost: 'Not priced here',
          prosAndCons:
            'Pros: seasonal protection, no daily dosing, established programme evidence. Cons: effectiveness varies with strain match each year.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Note the clock, because the label depends on it',
          action:
            'Record when symptoms actually started, because the indication is restricted to patients symptomatic for no more than 48 hours.',
          patientImpact:
            'Every efficacy estimate on this page comes from trials that enrolled within 48 hours. Outside that window nothing on this page applies.',
          clinicalPrecaution:
            'This is about the evidence base, not a reason to delay seeking care if someone is deteriorating.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCC(CC)O[C@@H]1C=C(C[C@@H]([C@H]1NC(=O)C)N)C(=O)OCC',
      chemicalFormula: 'C16H28N2O4',
      molecularWeight: '312.40 g/mol (PubChem CID 65028, oseltamivir free base ethyl ester prodrug)',
      targetReceptorAffinity:
        'The active carboxylate metabolite is a transition-state analogue of sialic acid at the neuraminidase active site; the marketed molecule is the ethyl ester prodrug and has little activity itself',
      structureSource: {
        label: 'PubChem CID 65028 — Oseltamivir, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/65028',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ose-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Control of the shikimic acid or quinic acid starting material',
          description:
            'The historical Roche route begins from shikimic acid isolated from star anise or produced by engineered Escherichia coli. Confirm identity, optical purity and the absence of the quinic acid regioisomer, because the four contiguous stereocentres of oseltamivir are set from the starting material rather than created later.',
          reagentsAndBuffer:
            'Shikimic acid reference standard, chiral HPLC, specific optical rotation, 1H and 13C NMR in deuterium oxide, Karl Fischer titration',
        },
        {
          id: 'ose-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Epoxide formation, azide opening and acetamide installation',
          description:
            'Esterify and mesylate the shikimate, form the epoxide, open it with the 3-pentyl ether that occupies the hydrophobic pocket of neuraminidase, then introduce nitrogen twice by azide chemistry and acetylate to give the acetamido group. Azide steps at scale are the principal process-safety concern of this route and are the reason alternative routes were developed.',
          dependsOnStepId: 'ose-w1',
          reagentsAndBuffer:
            'Ethanol and thionyl chloride for esterification; methanesulfonyl chloride and triethylamine; 3-pentanone with boron trifluoride etherate and triethylsilane for the ether; sodium azide with ammonium chloride; trimethylphosphine or Staudinger reduction; acetic anhydride',
        },
        {
          id: 'ose-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Phosphate salt crystallisation and stereochemical control',
          description:
            'Crystallise oseltamivir phosphate and set specifications for the diastereomers and for residual azide. Because all the stereochemistry is inherited, the critical release test is chiral rather than merely chromatographic purity.',
          dependsOnStepId: 'ose-w2',
          reagentsAndBuffer:
            'Phosphoric acid in ethanol, controlled cooling crystallisation, chiral HPLC on a polysaccharide stationary phase, ion chromatography for residual azide',
        },
        {
          id: 'ose-w4',
          stepNumber: 4,
          phase: 'Assay_Quantification',
          name: 'Assay and neuraminidase inhibition assay on the active carboxylate',
          description:
            'Quantify content and related substances against the pharmacopoeial standard, then hydrolyse to the active carboxylate and measure neuraminidase inhibition fluorometrically against reference influenza A and B strains, including an H275Y-substituted resistant control.',
          dependsOnStepId: 'ose-w3',
          reagentsAndBuffer:
            'C18 column with phosphate buffer and acetonitrile, USP oseltamivir phosphate reference standard, MUNANA fluorogenic sialidase substrate, influenza A/H1N1 and B reference strains, H275Y-substituted resistant control strain',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ose-a1',
        category: 'measured',
        title: 'Symptoms resolve 16.8 hours sooner in adults',
        laymanSummary:
          'Across all the trial data, including the trials that were never published, oseltamivir shortened flu symptoms in adults from about 7 days to about 6.3 days.',
        technicalDetails:
          'The Cochrane review based on 107 clinical study reports obtained from the European Medicines Agency, GlaxoSmithKline and Roche included 20 oseltamivir trials with 9,623 participants. Time to first alleviation of symptoms in adults was reduced by 16.8 hours (95% CI 8.4 to 25.1; P<0.0001), from 7 days to 6.3 days. In otherwise healthy children the reduction was 29 hours (95% CI 12 to 47; P=0.001). In children with asthma there was no effect.',
        evidenceSource: 'Jefferson T et al., Cochrane Database Syst Rev 2014;(4):CD008965',
        doi: '10.1002/14651858.CD008965.pub4',
        measuredMetric: 'Time to first alleviation of symptoms, intention-to-treat population',
        auditFlag: 'verified',
      },
      {
        id: 'ose-a2',
        category: 'conclusion_shift',
        title:
          'Kaiser 2003 claimed a 55% reduction in complications; the clinical study reports did not support it',
        laymanSummary:
          'The pooled manufacturer analysis that justified national stockpiles said oseltamivir cut lower respiratory complications by more than half and hospitalisations by 59%. When independent reviewers finally obtained the underlying trial reports, those effects did not hold up.',
        technicalDetails:
          'Kaiser and colleagues pooled 3,564 subjects from 10 placebo-controlled oseltamivir trials, eight of which were unpublished, and reported that in influenza-positive adults, lower respiratory tract complications leading to antibiotics fell 55% (4.6% versus 10.3%; P<0.001) and hospitalisation for any cause fell 59% (0.7% versus 1.7%; P=0.02). Ten years later, working from 107 clinical study reports, the Cochrane group found no significant effect on hospitalisations in adults (risk difference 0.15%, 95% CI -0.78 to 0.91) and no significant reduction in complications classified as serious or leading to study withdrawal (risk difference 0.07%, 95% CI -0.78 to 0.44). The reduction in pneumonia was 1.00% (95% CI 0.22 to 1.49, number needed to treat 100) but was self-reported and investigator-mediated, was not significant in the five trials that used a more detailed diagnostic form, and no trial defined pneumonia or confirmed it radiologically.',
        evidenceSource:
          'Kaiser L et al., Arch Intern Med 2003;163:1667-1672; Jefferson T et al., BMJ 2014;348:g2545 and Cochrane Database Syst Rev 2014;(4):CD008965',
        doi: '10.1136/bmj.g2545',
        measuredMetric:
          'Risk difference for hospitalisation and for serious complications, from clinical study reports rather than journal publications',
        inferredClaim:
          'That oseltamivir prevents pneumonia, hospitalisation and death, the claim on which national stockpiles were built',
        auditFlag: 'contested',
      },
      {
        id: 'ose-a3',
        category: 'failed',
        title: 'The trials themselves were not clean, and the review said so in detail',
        laymanSummary:
          'The reviewers found problems with how the trials were run and reported, including placebo capsules that may not have been inert and an effect on antibody tests used to decide who counted as having flu.',
        technicalDetails:
          'Cochrane judged half the oseltamivir studies at high risk of selection bias, found inadequate measures against performance bias in 11 studies because of non-identical placebo presentation, found high attrition bias across the oseltamivir programme and evidence of selective reporting, and noted that the placebo interventions may have contained active substances. Separately, the proportion of participants with a fourfold rise in antibody titre was significantly lower in the treated group (risk ratio 0.92, 95% CI 0.86 to 0.97), a 5% absolute difference, which matters because antibody rise was one of the criteria used to define influenza infection and therefore to define the influenza-infected analysis population.',
        evidenceSource: 'Jefferson T et al., Cochrane Database Syst Rev 2014;(4):CD008965',
        doi: '10.1002/14651858.CD008965.pub4',
        auditFlag: 'contested',
      },
      {
        id: 'ose-a4',
        category: 'measured',
        title: 'Harms are real and quantified: nausea, vomiting, headache, renal and psychiatric events',
        laymanSummary:
          'One in 22 adults treated vomits because of the drug, and there was a dose-response relationship with psychiatric events in the two pivotal treatment trials.',
        technicalDetails:
          'In adult treatment, oseltamivir increased nausea (risk difference 3.66%, 95% CI 0.90 to 7.39; number needed to harm 28) and vomiting (4.56%, 95% CI 2.39 to 7.58; number needed to harm 22). In children, vomiting had a number needed to harm of 19. In prophylaxis, psychiatric adverse events were increased across the combined on- and off-treatment periods (risk difference 1.06%, 95% CI 0.07 to 2.76; number needed to harm 94), headaches on treatment (3.15%; number needed to harm 32) and nausea on treatment (4.15%; number needed to harm 25). There was a dose-response relationship for psychiatric events between the standard and high dose in the two pivotal treatment trials WV15670 and WV15671 (P=0.038).',
        evidenceSource: 'Jefferson T et al., Cochrane Database Syst Rev 2014;(4):CD008965',
        doi: '10.1002/14651858.CD008965.pub4',
        measuredMetric: 'Risk differences and numbers needed to harm for specific adverse events',
        auditFlag: 'verified',
      },
      {
        id: 'ose-a5',
        category: 'conclusion_shift',
        title:
          'A manufacturer-funded individual-patient meta-analysis then reported the complication effect again',
        laymanSummary:
          'A year after the Cochrane review, a different group with different funding pooled the individual patient data and reported that complications and hospitalisations did fall.',
        technicalDetails:
          'The MUGAS individual patient data meta-analysis included nine Roche-sponsored randomised placebo-controlled trials with 4,328 adults. In the intention-to-treat infected population, time to alleviation of all symptoms was 21% shorter (time ratio 0.79, 95% CI 0.74 to 0.85; P<0.0001), lower respiratory tract complications requiring antibiotics more than 48 hours after randomisation fell (risk ratio 0.56, 95% CI 0.42 to 0.75; P=0.0001; 4.9% versus 8.7%) and admissions to hospital for any cause fell (risk ratio 0.37, 95% CI 0.17 to 0.81; P=0.013; 0.6% versus 1.7%). Nausea and vomiting were increased. The analysis was funded by the Multiparty Group for Advice on Science foundation, which was itself funded by Roche, and it used the same underlying trial programme that Cochrane had judged at high risk of bias. Both analyses are on this page because a reader should see that the disagreement is live rather than settled.',
        evidenceSource: 'Dobson J et al., Lancet 2015;385:1729-1737',
        doi: '10.1016/S0140-6736(14)62449-1',
        measuredMetric:
          'Risk ratios for lower respiratory tract complications and for hospitalisation, individual patient data',
        auditFlag: 'contested',
      },
      {
        id: 'ose-a6',
        category: 'measured',
        title: 'ALIC4E: about one day faster recovery in an independent, publicly funded trial',
        laymanSummary:
          'A European trial with no manufacturer funding and no placebo found that adding oseltamivir to usual care shortened recovery by about a day on average, and by two to three days in older, sicker patients.',
        technicalDetails:
          'Open-label, pragmatic, adaptive randomised trial in 15 European countries over three influenza seasons, 3,266 participants aged 1 year and over presenting with influenza-like illness in primary care; 52% had PCR-confirmed influenza. The hazard ratio for time to recovery was 1.29 (95% Bayesian credible interval 1.20 to 1.39), an absolute mean benefit of 1.02 days (95% BCrI 0.74 to 1.31). Benefit ranged from 0.70 days in children under 12 with milder illness to 3.20 days (95% BCrI 1.00 to 5.50) in patients aged 65 and over with comorbidities and longer preceding illness. Nausea and vomiting were increased. The trial was open-label and funded by the European Commission.',
        evidenceSource: 'Butler CC et al., Lancet 2020;395:42-52 (ISRCTN27908921)',
        doi: '10.1016/S0140-6736(19)32982-4',
        measuredMetric: 'Time to recovery, defined as return to usual activities with minor or absent fever, headache and muscle ache',
        auditFlag: 'verified',
      },
      {
        id: 'ose-a7',
        category: 'conclusion_shift',
        title: 'WHO moved oseltamivir off the core Essential Medicines List in 2017',
        laymanSummary:
          'After the reanalysis, the WHO expert committee downgraded oseltamivir and restricted its recommendation to severely ill hospitalised patients.',
        technicalDetails:
          'The 2017 WHO Expert Committee on the Selection and Use of Essential Medicines reviewed the additional evidence and concluded that the effect of oseltamivir on hospital admissions and mortality was lower than previously estimated. Oseltamivir was moved from the core to the complementary list and its recommended use limited to severe illness due to confirmed or suspected influenza in critically ill hospitalised patients. Oseltamivir had been added to the list in 2009, during the H1N1 pandemic, on the earlier reading of the evidence.',
        evidenceSource: 'Torjesen I. WHO downgrades status of oseltamivir. BMJ 2017;358:j3266',
        doi: '10.1136/bmj.j3266',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed as an inactive ester, activated by the liver',
        laymanDesc:
          'The capsule contains a version of the drug that cannot work. Liver enzymes cut it into the active form.',
        molecularDetail:
          'Oseltamivir phosphate is an ethyl ester prodrug, converted by hepatic carboxylesterase 1 to oseltamivir carboxylate. The ester exists because the carboxylate itself is too polar to be absorbed orally; bioavailability of the active moiety after the prodrug is roughly 80%. The active metabolite is cleared renally, so dosing follows creatinine clearance.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Distributed to the respiratory tract where infection is',
        laymanDesc: 'The active drug reaches the airway lining, where influenza replicates.',
        molecularDetail:
          'Oseltamivir carboxylate distributes into the middle ear, sinus and bronchoalveolar lining fluid at concentrations exceeding those needed to inhibit neuraminidase of susceptible strains. Neuraminidase acts on the outside of the cell, so the drug does not need to enter cells at all.',
        iconName: 'Waves',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It mimics the shape of the sugar the enzyme cuts',
        laymanDesc:
          'The drug is built to look like the molecule the viral scissors are made to cut, so the scissors close on it and stick.',
        molecularDetail:
          'Oseltamivir carboxylate is a transition-state analogue of sialic acid. Its 3-pentyl ether occupies a hydrophobic pocket that opens when the neuraminidase 150-loop rearranges, and the amino group replaces the natural glycerol substituent. The H275Y substitution in N1 neuraminidase distorts that pocket and is the classic resistance mechanism.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'New virus particles cannot cut themselves free',
        laymanDesc:
          'Finished virus particles stay tethered to the cell that made them, and clump together instead of spreading.',
        molecularDetail:
          'With neuraminidase inhibited, progeny virions remain bound by haemagglutinin to sialic acid residues on the host cell surface and aggregate, so release and spread to neighbouring cells are reduced. The drug does not prevent infection of a cell that has already been entered, which is why the 48-hour window exists.',
        iconName: 'Lock',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Illness is shortened; whether complications are prevented is the contested part',
        laymanDesc:
          'Symptoms end sooner. Whether the drug stops flu turning into pneumonia or a hospital admission is the question this whole page is about.',
        molecularDetail:
          'The symptom-duration effect is consistent across the clinical study reports, the manufacturer meta-analysis and the independent pragmatic trial, at roughly 16.8 hours, 21% and 1.02 days respectively. The complication effect is reported as substantial by Kaiser 2003 and by MUGAS 2015 and as absent by the Cochrane analysis of the clinical study reports, and that disagreement has never been resolved by a trial designed and powered for the complication endpoint.',
        iconName: 'Gauge',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Cochrane CD008965 review of 107 clinical study reports',
        phase: 'Systematic review of regulatory documents, 20 oseltamivir trials',
        sampleSize: 9623,
        primaryEndpoint:
          'Time to first alleviation of symptoms, complications, hospitalisations and adverse events',
        endpointMet: true,
        statisticalPValue:
          'P < 0.0001 for symptom alleviation; no significant effect on hospitalisation (risk difference 0.15%, 95% CI -0.78 to 0.91)',
        unreportedAdverseSignals:
          'Half the oseltamivir studies were judged at high risk of selection bias, attrition bias was high, placebo interventions may have contained active substances, and treatment reduced the proportion of participants with a fourfold antibody rise, which was itself used to define the infected population.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Kaiser pooled analysis of 10 manufacturer trials',
        phase: 'Pooled analysis of placebo-controlled trials, eight of them unpublished at the time',
        sampleSize: 3564,
        primaryEndpoint:
          'Influenza-related lower respiratory tract complications leading to antibiotics, and hospitalisation',
        endpointMet: true,
        statisticalPValue: 'P < 0.001 for complications, P = 0.02 for hospitalisation',
        unreportedAdverseSignals:
          'Eight of the ten pooled trials were unpublished when this analysis appeared, and the underlying clinical study reports were not available to independent reviewers for another decade.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'MUGAS individual patient data meta-analysis',
        phase: 'Individual patient data meta-analysis of nine Roche-sponsored trials',
        sampleSize: 4328,
        primaryEndpoint: 'Time to alleviation of all symptoms, with complications and admissions as secondary',
        endpointMet: true,
        statisticalPValue:
          'P < 0.0001 for symptom alleviation; P = 0.0001 for lower respiratory complications; P = 0.013 for hospitalisation',
        unreportedAdverseSignals:
          'Funded by a foundation supported by the manufacturer, and drawing on the same trial programme that the Cochrane review judged at high risk of bias.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'ALIC4E (ISRCTN27908921)',
        phase: 'Open-label pragmatic adaptive randomised trial',
        sampleSize: 3266,
        primaryEndpoint:
          'Time to recovery, defined as return to usual activities with fever, headache and muscle ache minor or absent',
        endpointMet: true,
        statisticalPValue: 'Hazard ratio 1.29 (95% Bayesian credible interval 1.20 to 1.39)',
        unreportedAdverseSignals:
          'Open-label and without a placebo, so the symptom-report endpoint is unblinded; an increased burden of nausea and vomiting was observed.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Time to first alleviation of symptoms in adults reduced by 16.8 hours, from 7 days to 6.3 days, across 20 trials and 9,623 participants read from the clinical study reports',
        'A 1.02-day absolute mean benefit in time to recovery in the independent, publicly funded ALIC4E trial, rising to 3.20 days in older comorbid patients',
        'Numbers needed to harm of 28 for nausea and 22 for vomiting in adult treatment, and 19 for vomiting in children',
        'Prophylaxis reduced symptomatic influenza with a number needed to treat of 33 in individuals and 7 in households',
      ],
      unsupportedInferences: [
        'That oseltamivir reduces hospitalisation: the clinical study report analysis found a risk difference of 0.15% with a confidence interval spanning zero',
        'That it reduces pneumonia: the 1.00% risk difference was for self-reported, investigator-mediated, undefined pneumonia and was not significant in the five trials that used a detailed diagnostic form',
        'That reduced viral shedding and a clear molecular mechanism imply reduced complications — Cochrane concluded that the mechanism of action proposed by the producers does not fit the clinical evidence',
      ],
      whatFailedInitially: [
        'The complication and hospitalisation claims of the 2003 manufacturer-pooled analysis did not survive independent analysis of the clinical study reports in 2014',
        'No effect at all on symptom duration in children with asthma',
        'WHO moved oseltamivir from the core to the complementary Essential Medicines List in 2017 and restricted it to critically ill hospitalised patients',
      ],
      realWorldOutcome: [
        'Governments stockpiled the drug at scale on the strength of an analysis of trials that independent reviewers could not read for another decade; the campaign to obtain those reports is the reason clinical study report access became a policy issue',
        'The MUGAS individual patient data meta-analysis in 2015 reported the complication effect again, and the disagreement between it and the Cochrane analysis remains open',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule and powder for oral suspension',
      description:
        'Twice daily for five days for treatment, once daily for prophylaxis, started within 48 hours of symptom onset. The marketed molecule is an ethyl ester prodrug because the active carboxylate is too polar to be absorbed; hepatic carboxylesterase 1 performs the conversion, and the active metabolite is renally cleared so the dose is adjusted for creatinine clearance.',
      safetyProfile:
        'Nausea and vomiting are the commonest adverse effects, with numbers needed to harm of 28 and 22 in adults and 19 for vomiting in children. Cochrane found increased psychiatric adverse events in prophylaxis with a number needed to harm of 94 and a dose-response relationship in the two pivotal treatment trials. Headache and renal events were increased in prophylaxis. Neuropsychiatric events, particularly in adolescents in Japan, prompted label changes and remain the most debated harm.',
    },
    commonQuestions: [
      {
        q: 'Does Tamiflu work?',
        a: 'It shortens symptoms. In the analysis of all the clinical study reports, adults recovered 16.8 hours sooner, from 7 days to 6.3; in an independent pragmatic trial in European primary care, about one day sooner on average and two to three days in older patients with comorbidities. Whether it prevents pneumonia, hospitalisation or death is genuinely disputed: the 2003 manufacturer-pooled analysis said yes, the 2014 analysis of the underlying trial reports said the effect was not there, and a 2015 manufacturer-funded individual patient meta-analysis said yes again. No trial designed and powered for the complication endpoint has ever been run.',
        auditNote:
          'This page presents both sides because both exist. Presenting only one would be advocacy, in either direction.',
      },
      {
        q: 'Why did it take ten years to check the original claim?',
        a: 'Because the underlying trial reports were not public. Eight of the ten trials in the 2003 pooled analysis were unpublished. Independent reviewers obtained 107 clinical study reports from the European Medicines Agency, GlaxoSmithKline and Roche only after a multi-year campaign, and the reanalysis was published in 2014. That episode is a substantial part of why clinical study report access became a regulatory and publishing issue.',
      },
      {
        q: 'Was there anything wrong with the trials themselves?',
        a: 'Cochrane documented several problems: high risk of selection bias in half the oseltamivir studies, high attrition bias, evidence of selective reporting, non-identical placebo presentation in 11 studies, and the observation that the placebo interventions may have contained active substances. It also found that treatment reduced the proportion of participants with a fourfold antibody rise by about 5 percentage points, which matters because antibody rise helped define who counted as influenza-infected in the primary analysis population.',
      },
      {
        q: 'Is it still recommended?',
        a: 'It is still approved and still used. The WHO Expert Committee moved it from the core to the complementary Essential Medicines List in 2017, judging the effect on hospital admissions and mortality to be lower than previously estimated, and limited its recommendation to severe illness in critically ill hospitalised patients. National guidance varies, and generally favours treatment in patients at higher risk of complications.',
      },
      {
        q: 'Why does this page have no manufacturing cost?',
        a: 'Because no published per-unit cost-of-production estimate for oseltamivir was verified for this record. The US pharmacy acquisition cost is quoted instead: US$0.806 per 75 mg capsule in the CMS NADAC file effective 19 August 2026, about US$8.06 for a standard ten-capsule course.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Jefferson T et al. Neuraminidase inhibitors for preventing and treating influenza in adults and children. Cochrane Database Syst Rev 2014;(4):CD008965',
        identifier: '10.1002/14651858.CD008965.pub4',
        kind: 'doi',
      },
      {
        label:
          'Jefferson T et al. Oseltamivir for influenza in adults and children: systematic review of clinical study reports and summary of regulatory comments. BMJ 2014;348:g2545',
        identifier: '10.1136/bmj.g2545',
        kind: 'doi',
      },
      {
        label:
          'Kaiser L et al. Impact of Oseltamivir Treatment on Influenza-Related Lower Respiratory Tract Complications and Hospitalizations. Arch Intern Med 2003;163:1667-1672',
        identifier: '10.1001/archinte.163.14.1667',
        kind: 'doi',
      },
      {
        label:
          'Dobson J et al. Oseltamivir treatment for influenza in adults: a meta-analysis of randomised controlled trials. Lancet 2015;385:1729-1737',
        identifier: '10.1016/S0140-6736(14)62449-1',
        kind: 'doi',
      },
      {
        label:
          'Butler CC et al. Oseltamivir plus usual care versus usual care for influenza-like illness in primary care (ALIC4E). Lancet 2020;395:42-52',
        identifier: '10.1016/S0140-6736(19)32982-4',
        kind: 'doi',
      },
      {
        label: 'Torjesen I. WHO downgrades status of oseltamivir. BMJ 2017;358:j3266',
        identifier: '10.1136/bmj.j3266',
        kind: 'doi',
      },
      {
        label:
          'Treanor JJ et al. Efficacy and Safety of the Oral Neuraminidase Inhibitor Oseltamivir in Treating Acute Influenza. JAMA 2000;283:1016-1024',
        identifier: '10.1001/jama.283.8.1016',
        kind: 'doi',
      },
      {
        label: 'TAMIFLU (oseltamivir phosphate) capsules, US prescribing information — DailyMed',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=ee3c9555-60f2-4f82-a760-11983c86e97b',
        kind: 'regulatory',
      },
      {
        label: 'CMS National Average Drug Acquisition Cost (NADAC) 2026 file',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 65028 — Oseltamivir',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/65028',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Nirmatrelvir-ritonavir — an 89% relative risk reduction in unvaccinated high-risk adults, and a
  // failed symptom endpoint in the vaccinated and standard-risk population most people asking about
  // it now belong to.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'nirmatrelvir-ritonavir',
    name: 'Nirmatrelvir-ritonavir',
    tradeName: 'Paxlovid',
    sponsor: 'Pfizer',
    targetGene:
      'SARS-CoV-2 ORF1ab nsp5, encoding the main protease; human CYP3A4 is the target of the ritonavir component',
    targetProtein:
      'SARS-CoV-2 main protease (Mpro, 3CLpro); ritonavir inhibits human cytochrome P450 3A4',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2023,
    indication:
      'Treatment of mild-to-moderate COVID-19 in adults who are at high risk for progression to severe COVID-19, including hospitalisation or death',
    patientFriendlyIndication:
      'Early COVID-19 in adults at high risk of becoming seriously ill',
    conditionContext: {
      conditionExplainer:
        'SARS-CoV-2 makes its proteins as one long chain that has to be cut into working pieces. The scissors that do the cutting are the main protease. Nirmatrelvir jams those scissors. Ritonavir is not an antiviral here at all: it is added purely to stop the liver destroying nirmatrelvir before it can work.',
      whyItMatters:
        'The trial that established the drug enrolled unvaccinated adults during the Delta wave. Almost nobody now presenting with COVID-19 resembles that population, and the trial that tested the drug in vaccinated and standard-risk people missed its primary endpoint.',
      whoTakesThis:
        'Adults with mild-to-moderate COVID-19 within five days of symptom onset who are at high risk of progression, most importantly people aged 65 and over and those with significant immunosuppression.',
      clinicalGoals:
        'Prevent hospitalisation and death in the people whose baseline risk of both is high enough for an 89% relative reduction to matter in absolute terms.',
    },
    oneSentenceVerdict:
      'A protease inhibitor plus a pharmacokinetic booster that cut COVID-19 hospitalisation or death from 7.01% to 0.77% in unvaccinated high-risk adults, and missed its primary symptom endpoint in vaccinated and standard-risk adults with a hospitalisation difference of 0.8 percentage points that crossed zero.',
    laymanHowItWorks:
      'The virus builds all its proteins as one long ribbon and then cuts the ribbon into working parts using a pair of molecular scissors. Nirmatrelvir slots into those scissors and locks them. Without the cuts, none of the parts work and the virus cannot assemble copies of itself. The second drug in the pack, ritonavir, does nothing to the virus: your liver would otherwise destroy nirmatrelvir within an hour or two, and ritonavir blocks the liver enzyme that does it. That is also why the pack has so many drug interactions.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 76,
    anatomicalSite: 'Cytoplasm of infected respiratory epithelial cells; hepatic CYP3A4 for ritonavir',
    substitutes: {
      summary:
        'Remdesivir is the alternative with an outpatient randomised result; molnupiravir is the alternative that failed in the vaccinated population. For most vaccinated adults under 65 without significant immunosuppression, the honest comparison is against no antiviral, because that is what the EPIC-SR trial tested and did not beat on its primary endpoint.',
      conventionalRx: [
        {
          name: 'Remdesivir (Veklury), three-day outpatient course',
          class: 'Nucleotide analogue RNA polymerase inhibitor',
          howItCompares:
            'In PINETREE, a three-day intravenous course cut COVID-19 hospitalisation or death from 5.3% to 0.7% in 562 high-risk outpatients, hazard ratio 0.13. No ritonavir, so no CYP3A4 interaction problem, but it requires three intravenous infusions.',
          typicalCost: 'Not priced here — no current acquisition-cost figure verified for this record',
          prosAndCons:
            'Pros: no drug-interaction burden, usable where ritonavir is contraindicated. Cons: three infusions on three consecutive days.',
        },
        {
          name: 'Molnupiravir (Lagevrio)',
          class: 'Mutagenic nucleoside analogue',
          howItCompares:
            'Reduced hospitalisation or death from 9.7% to 6.8% in unvaccinated adults in MOVe-OUT, and produced no reduction at all in 25,054 largely vaccinated UK adults in PANORAMIC.',
          typicalCost: 'Not priced here — not listed in the CMS NADAC file at the time of writing',
          prosAndCons:
            'Pros: no drug interactions. Cons: the vaccinated-population trial was null, and a mutational signature attributable to the drug has been identified in global SARS-CoV-2 sequence databases.',
        },
        {
          name: 'No antiviral, with monitoring',
          class: 'Supportive care',
          howItCompares:
            'In EPIC-SR, the placebo group had a 1.6% rate of COVID-19 hospitalisation or death and reached sustained symptom alleviation at a median of 13 days against 12 on nirmatrelvir-ritonavir, a difference that was not statistically significant.',
          typicalCost: 'No drug cost',
          prosAndCons:
            'Pros: no interaction review, no rebound question, no cost. Cons: forgoes a large relative benefit in the specific high-risk groups where the absolute baseline risk is high.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Bring a full medication list, including supplements, before the first dose',
          action:
            'List every prescription, over-the-counter product and supplement for the prescriber or pharmacist to review against the ritonavir interaction list.',
          patientImpact:
            'Ritonavir is a potent CYP3A4 inhibitor. Statins, some anticoagulants, several antiarrhythmics, immunosuppressants such as tacrolimus, and many others require dose changes or temporary suspension, and a few are contraindicated outright.',
          clinicalPrecaution:
            'The interaction review is the single most important safety step with this drug and it cannot be done by the patient alone.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CC1([C@@H]2[C@H]1[C@H](N(C2)C(=O)[C@H](C(C)(C)C)NC(=O)C(F)(F)F)C(=O)N[C@@H](C[C@@H]3CCNC3=O)C#N)C',
      chemicalFormula: 'C23H32F3N5O4',
      molecularWeight:
        '499.5 g/mol (PubChem CID 155903259, nirmatrelvir; the co-packaged ritonavir is C37H48N6O5S2, 720.9 g/mol, PubChem CID 392622)',
      targetReceptorAffinity:
        'Nirmatrelvir forms a reversible covalent thioimidate adduct between its nitrile warhead and the catalytic cysteine 145 of the SARS-CoV-2 main protease',
      structureSource: {
        label: 'PubChem CID 155903259 — Nirmatrelvir, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/155903259',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'nir-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Control of the bicyclic proline and the glutamine lactam building blocks',
          description:
            'Confirm identity and stereochemical purity of the (1R,2S,5S)-6,6-dimethyl-3-azabicyclo[3.1.0]hexane-2-carboxylate core and of the gamma-lactam derived from glutamine. Nirmatrelvir has five stereocentres and the fit into the protease active site is stereospecific, so an epimeric impurity is an inactive impurity.',
          reagentsAndBuffer:
            'Bicyclic proline methyl ester hydrochloride, (S)-3-amino-2-oxopyrrolidine building block, N-Boc-L-tert-leucine, chiral HPLC on a polysaccharide phase, 1H and 19F NMR',
        },
        {
          id: 'nir-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Peptide couplings, trifluoroacetylation and nitrile formation',
          description:
            'Couple tert-leucine to the bicyclic proline, cap the amine with trifluoroacetyl, couple the glutamine-derived lactam amine, then dehydrate the terminal primary amide to the nitrile that forms the reversible covalent bond with the catalytic cysteine.',
          dependsOnStepId: 'nir-w1',
          reagentsAndBuffer:
            'HATU or T3P coupling reagent with N,N-diisopropylethylamine in acetonitrile; ethyl trifluoroacetate; Burgess reagent or the Vilsmeier reagent for amide dehydration; lithium hydroxide for ester hydrolysis; ethyl acetate and heptane for workup',
        },
        {
          id: 'nir-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation and control of the epimeric nitrile',
          description:
            'Crystallise nirmatrelvir and set the specification for the epimer at the nitrile-bearing carbon, which forms under the dehydration conditions and is the principal stereochemical impurity of this route.',
          dependsOnStepId: 'nir-w2',
          reagentsAndBuffer:
            'Ethanol and water antisolvent crystallisation, seeding, chiral and achiral reversed-phase HPLC with ultraviolet detection',
        },
        {
          id: 'nir-w4',
          stepNumber: 4,
          phase: 'Assay_Quantification',
          name: 'Assay, protease inhibition and antiviral potency',
          description:
            'Quantify content and related substances, then measure inhibition of recombinant SARS-CoV-2 main protease in a fluorogenic substrate assay and confirm antiviral potency in infected cell culture, with and without a P-glycoprotein or CYP3A4 inhibitor so that the pharmacokinetic dependence on ritonavir is visible in the assay.',
          dependsOnStepId: 'nir-w3',
          reagentsAndBuffer:
            'C18 column with aqueous buffer and acetonitrile, recombinant SARS-CoV-2 Mpro, FRET peptide substrate, Vero E6 or Calu-3 cells with a clinical SARS-CoV-2 isolate, CP-100356 P-glycoprotein inhibitor control',
        },
      ],
    },
    keyAudits: [
      {
        id: 'nir-a1',
        category: 'measured',
        title: 'EPIC-HR: 0.77% versus 7.01% hospitalisation or death, an 89% relative reduction',
        laymanSummary:
          'In unvaccinated adults with risk factors, treated within three days of symptoms, three of 389 were hospitalised or died against 27 of 385 on placebo, and all the deaths were in the placebo group.',
        technicalDetails:
          'Phase 2-3 double-blind randomised trial in symptomatic, unvaccinated, non-hospitalised adults at high risk of progression. 2,246 randomised. In the planned interim analysis of patients treated within 3 days of symptom onset, COVID-19-related hospitalisation or death from any cause by day 28 was 0.77% (3 of 389) versus 7.01% (27 of 385), a difference of -6.32 percentage points (95% CI -9.04 to -3.59; P<0.001; relative risk reduction 89.1%). In the final modified intention-to-treat analysis of 1,379 patients the difference was -5.81 percentage points (95% CI -7.78 to -3.84; relative risk reduction 88.9%). All 13 deaths occurred in the placebo group. Day-5 viral load was 0.868 log10 copies per millilitre lower.',
        evidenceSource: 'Hammond J et al., N Engl J Med 2022;386:1397-1408 (NCT04960202)',
        doi: '10.1056/NEJMoa2118542',
        measuredMetric: 'COVID-19-related hospitalisation or death from any cause through day 28',
        auditFlag: 'verified',
      },
      {
        id: 'nir-a2',
        category: 'failed',
        title: 'EPIC-SR: the primary endpoint was missed in vaccinated and standard-risk adults',
        laymanSummary:
          'When the same drug was tested in people who were vaccinated or at standard risk, symptoms took 12 days to settle on treatment and 13 on placebo, a difference that was not statistically significant.',
        technicalDetails:
          'Phase 2-3 trial in adults with COVID-19 within 5 days of symptom onset who were either fully vaccinated with at least one risk factor, or without risk factors and unvaccinated or not vaccinated within the previous year. 1,296 randomised, 1,288 treated and analysed. Median time to sustained alleviation of all targeted signs and symptoms was 12 days on nirmatrelvir-ritonavir and 13 on placebo (P=0.60). COVID-19 hospitalisation or death from any cause occurred in 5 of 654 (0.8%) and 10 of 634 (1.6%), difference -0.8 percentage points (95% CI -2.0 to 0.4). The trial was terminated. Dysgeusia occurred in 5.8% of treated participants.',
        evidenceSource: 'Hammond J et al., N Engl J Med 2024;390:1186-1195 (NCT05011513)',
        doi: '10.1056/NEJMoa2309003',
        measuredMetric:
          'Time to sustained alleviation of all targeted COVID-19 signs and symptoms',
        inferredClaim:
          'That the 89% relative risk reduction measured in unvaccinated high-risk adults describes the benefit in vaccinated or standard-risk adults',
        auditFlag: 'verified',
      },
      {
        id: 'nir-a3',
        category: 'measured',
        title: 'Omicron-era effectiveness was confined to people aged 65 and over',
        laymanSummary:
          'In a real-world analysis of 109,254 eligible Israeli patients during Omicron, the drug clearly reduced hospitalisation and death in over-65s and showed no benefit in adults aged 40 to 64.',
        technicalDetails:
          'Retrospective cohort of Clalit Health Services members aged 40 and over assessed as eligible for nirmatrelvir during the Omicron surge; 3,902 of 109,254 received it. In patients aged 65 and over, COVID-19 hospitalisation was 14.7 versus 58.9 cases per 100,000 person-days, adjusted hazard ratio 0.27 (95% CI 0.15 to 0.49), and death 0.21 (95% CI 0.05 to 0.82). In patients aged 40 to 64, hospitalisation was 15.2 versus 15.8 per 100,000 person-days, adjusted hazard ratio 0.74 (95% CI 0.35 to 1.58), and death 1.32 (95% CI 0.16 to 10.75). Observational, with time-dependent covariate adjustment.',
        evidenceSource: 'Arbel R et al., N Engl J Med 2022;387:790-798',
        doi: '10.1056/NEJMoa2204919',
        measuredMetric: 'Adjusted hazard ratios for COVID-19 hospitalisation and death by age stratum',
        auditFlag: 'verified',
      },
      {
        id: 'nir-a4',
        category: 'inferred',
        title: 'Rebound was attributed to the drug before anyone measured it without the drug',
        laymanSummary:
          'Symptoms and viral load coming back after treatment became a widely reported problem. When the placebo arm of another trial was examined, rebound turned out to be common without any treatment at all.',
        technicalDetails:
          'A retrospective analysis of the 563 placebo recipients in the ACTIV-2/A5401 platform trial found symptom rebound in 26% at a median of 11 days after symptom onset, viral rebound in 31% and high-level viral rebound in 13%, with 89% of symptom rebound and 95% of viral rebound events occurring at a single time point before improving. The combination of symptom and high-level viral rebound occurred in 3%. A separate prospective cohort found viral rebound in 14.2% of 127 treated participants and 9.3% of 43 untreated controls, and symptom rebound in 18.9% against 7.0%; the untreated comparison group was small. The honest position is that rebound occurs with and without treatment, and that the drug-attributable excess has not been cleanly quantified.',
        evidenceSource:
          'Deo R et al., Ann Intern Med 2023;176:348-354 (NCT04518410); Pandit JA et al., Clin Infect Dis 2023;77:25-31',
        doi: '10.7326/M22-2381',
        inferredClaim:
          'That symptom or viral rebound after a course of nirmatrelvir-ritonavir is caused by the drug',
        auditFlag: 'caution',
      },
      {
        id: 'nir-a5',
        category: 'measured',
        title: 'Half the product is not an antiviral, and it is the half that causes the problems',
        laymanSummary:
          'Ritonavir contributes nothing against the virus. It is there only to stop the liver clearing nirmatrelvir, and it is the reason the drug interacts with so many medicines.',
        technicalDetails:
          'Nirmatrelvir is cleared by CYP3A4 fast enough that plasma concentrations fall below the antiviral threshold without a booster. Ritonavir 100 mg twice daily is co-packaged as a potent mechanism-based CYP3A4 inhibitor at a dose far below its own antiretroviral dose. The consequence is a large interaction list: statins, several antiarrhythmics, some anticoagulants, calcineurin inhibitors such as tacrolimus, and various sedatives and ergot derivatives require adjustment, suspension or are contraindicated. The interaction burden is a property of the delivery strategy rather than of the antiviral, which is a distinction worth making because remdesivir treats the same disease without it.',
        evidenceSource:
          'PAXLOVID (nirmatrelvir tablets and ritonavir tablets) US prescribing information, drug interactions section',
        auditFlag: 'caution',
      },
      {
        id: 'nir-a6',
        category: 'conclusion_shift',
        title:
          'The drug went from emergency authorisation to full approval while the population it treats changed underneath it',
        laymanSummary:
          'The approval evidence came from unvaccinated people during Delta. By the time full approval arrived, almost everyone eligible had immunity from vaccination or infection.',
        technicalDetails:
          'Nirmatrelvir-ritonavir received emergency use authorisation in December 2021 on EPIC-HR, which enrolled unvaccinated adults during the Delta period. Full FDA approval followed on 25 May 2023 under NDA 217188. Between those dates, EPIC-SR failed its primary endpoint in vaccinated and standard-risk adults and the Clalit cohort found benefit confined to those aged 65 and over. The label indication is restricted to adults at high risk of progression, which is the population in whom the absolute benefit survives the change in background immunity.',
        evidenceSource:
          'Drugs@FDA record for PAXLOVID NDA 217188, original approval 25 May 2023; Hammond J et al., N Engl J Med 2022 and 2024',
        doi: '10.1056/NEJMoa2309003',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Two different tablets, taken together, for two different jobs',
        laymanDesc:
          'The pack contains the antiviral and a booster. The booster is not there to fight the virus.',
        molecularDetail:
          'Each dose is nirmatrelvir 300 mg plus ritonavir 100 mg, twice daily for five days, started within five days of symptom onset. Without ritonavir, nirmatrelvir plasma concentrations fall below the target trough because of rapid CYP3A4 metabolism.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Ritonavir blocks the liver enzyme that would clear the antiviral',
        laymanDesc:
          'The booster shuts down a liver enzyme, so the antiviral survives in the blood long enough to reach the virus.',
        molecularDetail:
          'Ritonavir is a mechanism-based inactivator of CYP3A4, raising nirmatrelvir exposure several-fold. The same inhibition raises exposure to every other CYP3A4 substrate the patient is taking, which is the origin of the interaction list rather than an unrelated side effect.',
        iconName: 'Lock',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Nirmatrelvir docks into the viral protease active site',
        laymanDesc:
          'The antiviral is shaped to fit the pocket where the virus scissors grip what they are about to cut.',
        molecularDetail:
          'Nirmatrelvir occupies the S1, S2 and S4 subsites of the SARS-CoV-2 main protease; the gamma-lactam mimics the glutamine that the enzyme requires at the P1 position, which is the specificity determinant with no close human counterpart.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'A nitrile warhead forms a reversible covalent bond with the catalytic cysteine',
        laymanDesc:
          'A reactive group on the drug bonds to the exact atom the enzyme uses to cut, and holds it.',
        molecularDetail:
          'The terminal nitrile reacts with the thiol of cysteine 145 to form a reversible covalent thioimidate adduct. Because the bond is reversible, potency depends on maintaining plasma concentration, which is again why the ritonavir boost is not optional.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The viral polyprotein is never cut, so no functional virus is assembled',
        laymanDesc:
          'The long protein ribbon stays uncut, none of the parts work, and viral replication stops.',
        molecularDetail:
          'Inhibition of Mpro prevents cleavage of the ORF1ab polyproteins into the non-structural proteins required for replication. In EPIC-HR this produced a 0.868 log10 lower day-5 viral load and an 89% relative reduction in hospitalisation or death in the unvaccinated high-risk population studied.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'EPIC-HR (NCT04960202)',
        phase: 'Phase 2-3 randomised double-blind placebo-controlled',
        sampleSize: 2246,
        primaryEndpoint:
          'COVID-19-related hospitalisation or death from any cause through day 28 in unvaccinated high-risk adults',
        endpointMet: true,
        statisticalPValue: 'P < 0.001 (relative risk reduction 89.1% in the interim analysis)',
        unreportedAdverseSignals:
          'The population was unvaccinated and enrolled during the Delta period, so the absolute risk in the placebo arm, 7.01%, is far higher than in a comparable population today.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'EPIC-SR (NCT05011513)',
        phase: 'Phase 2-3 randomised double-blind placebo-controlled',
        sampleSize: 1296,
        primaryEndpoint:
          'Time to sustained alleviation of all targeted COVID-19 signs and symptoms',
        endpointMet: false,
        statisticalPValue: 'P = 0.60 (median 12 days versus 13 days)',
        unreportedAdverseSignals:
          'The trial was terminated. Hospitalisation or death was 0.8% versus 1.6%, a difference whose confidence interval crossed zero.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Clalit Health Services Omicron cohort',
        phase: 'Retrospective cohort with time-dependent covariates',
        sampleSize: 109254,
        primaryEndpoint: 'COVID-19 hospitalisation and death during the Omicron surge',
        endpointMet: true,
        statisticalPValue:
          'Adjusted hazard ratio 0.27 (95% CI 0.15 to 0.49) for hospitalisation in those aged 65 and over; 0.74 (95% CI 0.35 to 1.58) in those aged 40 to 64',
        unreportedAdverseSignals:
          'Observational. Only 4% of eligible patients received the drug, so treated and untreated groups differed in ways adjustment can reduce but not remove.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'ACTIV-2/A5401 placebo-arm rebound analysis (NCT04518410)',
        phase: 'Retrospective analysis of a randomised placebo-controlled platform trial',
        sampleSize: 563,
        primaryEndpoint: 'Symptom and viral rebound in untreated COVID-19',
        endpointMet: true,
        statisticalPValue:
          'Symptom rebound 26%, viral rebound 31%, high-level viral rebound 13%, all without any antiviral treatment',
        unreportedAdverseSignals:
          'Largely unvaccinated participants infected with pre-Omicron variants, so the natural-history rates may not transfer to the current population.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'COVID-19 hospitalisation or death of 0.77% against 7.01% in unvaccinated high-risk adults treated within three days, with all 13 deaths in the placebo group',
        'Median time to sustained symptom alleviation of 12 days against 13 in vaccinated or standard-risk adults (P=0.60)',
        'Adjusted hazard ratio 0.27 for hospitalisation in Israelis aged 65 and over during Omicron, and 0.74 with a confidence interval crossing 1 in those aged 40 to 64',
        'Symptom rebound in 26% and viral rebound in 31% of 563 untreated placebo recipients in a separate platform trial',
      ],
      unsupportedInferences: [
        'That the 89% relative risk reduction from EPIC-HR describes the benefit for a vaccinated adult under 65 — the trial designed to answer that missed its primary endpoint',
        'That rebound is caused by the drug, when a quarter to a third of untreated patients rebound by the same definitions',
      ],
      whatFailedInitially: [
        'EPIC-SR missed its primary symptom endpoint and was terminated',
        'The Omicron-era observational cohort found no significant benefit in adults aged 40 to 64',
      ],
      realWorldOutcome: [
        'The label indication is confined to adults at high risk of progression, which is where the absolute benefit survives changed background immunity',
        'The ritonavir component, present only as a pharmacokinetic booster, is the source of an interaction burden that determines whether the drug can be given at all in many patients',
      ],
    },
    deliverySystem: {
      type: 'Oral co-packaged dose pack: nirmatrelvir tablets plus ritonavir tablets',
      description:
        'Three tablets twice daily for five days, taken together, started within five days of symptom onset. Separate dose packs exist for moderate renal impairment. The co-packaging is not a convenience: nirmatrelvir alone does not reach antiviral concentrations because CYP3A4 clears it too quickly, so the ritonavir tablet is a pharmacokinetic component of the dose rather than a second treatment.',
      safetyProfile:
        'Dysgeusia, a persistent metallic taste, occurred in 5.6% of treated participants in EPIC-HR against 0.3% on placebo, and diarrhoea in 3.1% against 1.6%. Serious adverse events were less frequent on treatment than on placebo in EPIC-HR, 1.6% against 6.6%, reflecting the illness the drug was preventing. The dominant safety issue is the ritonavir interaction profile, which requires a medication review before the first dose and dose adjustment in renal impairment.',
    },
    commonQuestions: [
      {
        q: 'Is it 89% effective?',
        a: 'It was, in the population EPIC-HR enrolled: unvaccinated adults with risk factors, treated within three days, during the Delta wave, in whom the placebo hospitalisation-or-death rate was 7.01%. That is where the 89% comes from. In vaccinated or standard-risk adults, EPIC-SR found no significant difference in time to symptom resolution and a hospitalisation difference of 0.8 percentage points whose interval crossed zero. A relative risk reduction is only as useful as the absolute risk it is applied to.',
        auditNote:
          'The headline number and the population it was measured in should never be separated, and on this drug they routinely are.',
      },
      {
        q: 'Does it cause rebound?',
        a: 'Rebound after treatment is real; whether the drug causes it is not established. When the placebo arm of a different platform trial was analysed, symptom rebound occurred in 26% of untreated patients and viral rebound in 31%, mostly at a single time point before improving. A prospective cohort found viral rebound in 14.2% of treated and 9.3% of untreated participants, but the untreated group was only 43 people. The phenomenon was named after the drug before anyone measured its background rate.',
      },
      {
        q: 'Why is ritonavir in the pack if it does not fight the virus?',
        a: 'Because nirmatrelvir alone is cleared by liver CYP3A4 too fast to maintain antiviral concentrations. Ritonavir at 100 mg, well below its own antiretroviral dose, shuts that enzyme down. The unavoidable consequence is that it also slows clearance of every other CYP3A4 substrate the patient is taking, which is why the interaction list is long and why a medication review comes before the first tablet.',
      },
      {
        q: 'Why does this page have no manufacturing cost?',
        a: 'Because no published cost-of-production estimate for nirmatrelvir was verified for this record. Estimates exist for older repurposed antivirals, including US$0.28 per day for lopinavir/ritonavir, but nirmatrelvir is a new molecule and applying an unrelated figure to it would be inventing a number. The US pharmacy acquisition cost is quoted instead: US$49.23 per dose pack unit in the CMS NADAC file effective 19 August 2026.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Hammond J et al. Oral Nirmatrelvir for High-Risk, Nonhospitalized Adults with Covid-19 (EPIC-HR). N Engl J Med 2022;386:1397-1408',
        identifier: '10.1056/NEJMoa2118542',
        kind: 'doi',
      },
      {
        label:
          'Hammond J et al. Nirmatrelvir for Vaccinated or Unvaccinated Adult Outpatients with Covid-19 (EPIC-SR). N Engl J Med 2024;390:1186-1195',
        identifier: '10.1056/NEJMoa2309003',
        kind: 'doi',
      },
      {
        label:
          'Arbel R et al. Nirmatrelvir Use and Severe Covid-19 Outcomes during the Omicron Surge. N Engl J Med 2022;387:790-798',
        identifier: '10.1056/NEJMoa2204919',
        kind: 'doi',
      },
      {
        label:
          'Deo R et al. Symptom and Viral Rebound in Untreated SARS-CoV-2 Infection. Ann Intern Med 2023;176:348-354',
        identifier: '10.7326/M22-2381',
        kind: 'doi',
      },
      {
        label:
          'Pandit JA et al. The Coronavirus Disease 2019 Rebound Study. Clin Infect Dis 2023;77:25-31',
        identifier: '10.1093/cid/ciad102',
        kind: 'doi',
      },
      { label: 'EPIC-HR randomised trial', identifier: 'NCT04960202', kind: 'nct' },
      { label: 'EPIC-SR randomised trial', identifier: 'NCT05011513', kind: 'nct' },
      {
        label: 'PAXLOVID (nirmatrelvir and ritonavir) dose pack, US prescribing information — DailyMed',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=8a99d6d6-fd9e-45bb-b1bf-48c7f761232a',
        kind: 'regulatory',
      },
      {
        label: 'CMS National Average Drug Acquisition Cost (NADAC) 2026 file',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 155903259 — Nirmatrelvir',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/155903259',
        kind: 'url',
      },
      {
        label: 'PubChem CID 392622 — Ritonavir',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/392622',
        kind: 'url',
      },
    ],
  },
]
