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
]
