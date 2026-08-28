import { steadyStateNoteFromHalfLifeHours } from '@/lib/background/derivations'

import type { RecordedBackgroundBySlug } from './index'

/** Authored from fetched artifacts; see the authoring rules in ./index.ts. */
export const BACKGROUND_BATCH_2: RecordedBackgroundBySlug = {
  caffeine: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    registryIdentifiers: {
      pubchemCid: '2519',
      casNumber: '58-08-2',
      unii: '3G6A5W338E',
      rxcui: '142218',
      source: {
        kind: 'PUBCHEM',
        identifier: '2519',
        label: 'PubChem CID 2519 (caffeine)',
        retrievedAt: '2026-08-27',
      },
    },
  },

  cephalexin: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    registryIdentifiers: {
      pubchemCid: '27447',
      casNumber: '15686-71-2',
      unii: 'OBN7UDS42Y',
      rxcui: '215948',
      source: {
        kind: 'PUBCHEM',
        identifier: '27447',
        label: 'PubChem CID 27447 (cephalexin)',
        retrievedAt: '2026-08-27',
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'oral',
      tMax: {
        display: '1 hour',
        numeric: 1,
        unit: 'hours',
        populationContext:
          'following oral doses of 250 mg, 500 mg, and 1 g (population not further specified on the label)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '02b5cd6f-3df8-43c1-879d-217fcf55231a',
          label: 'FDA label for cephalexin capsules (openFDA)',
          locator: '12.3 Pharmacokinetics — Absorption',
          retrievedAt: '2026-08-27',
          excerpt:
            'Following doses of 250 mg, 500 mg, and 1 g, average peak serum levels of approximately 9, 18, and 32 mcg/mL, respectively, were obtained at 1 hour.',
        },
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'approximately 10% to 15%',
        numeric: 15,
        unit: '%',
        populationContext:
          'plasma protein binding as recorded on the label (population not specified)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '02b5cd6f-3df8-43c1-879d-217fcf55231a',
          label: 'FDA label for cephalexin capsules (openFDA)',
          locator: '12.3 Pharmacokinetics — Distribution',
          retrievedAt: '2026-08-27',
          excerpt: 'Cephalexin is approximately 10% to 15% bound to plasma proteins.',
        },
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Excreted in the urine by glomerular filtration and tubular secretion; over 90% excreted unchanged in the urine within 8 hours',
        populationContext: 'as recorded on the label (population not specified)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '02b5cd6f-3df8-43c1-879d-217fcf55231a',
          label: 'FDA label for cephalexin capsules (openFDA)',
          locator: '12.3 Pharmacokinetics — Excretion',
          retrievedAt: '2026-08-27',
          excerpt:
            'Cephalexin is excreted in the urine by glomerular filtration and tubular secretion. Studies showed that over 90% of the drug was excreted unchanged in the urine within 8 hours.',
        },
        concordance: 'label_only',
      },
    },
    productVariants: [
      {
        brandName: 'Cephalexin',
        formAsRecorded: 'Capsules',
        strengthsAsRecorded: 'Capsules: 250 mg and 500 mg',
        approvedUseAsRecorded:
          'A cephalosporin antibacterial drug indicated for the treatment of respiratory tract infection, otitis media, skin and skin structure infections, bone infections, and genitourinary tract infections caused by susceptible isolates of designated bacteria',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2025-02-11',
        source: {
          kind: 'FDA_LABEL',
          identifier: '02b5cd6f-3df8-43c1-879d-217fcf55231a',
          label: 'FDA label for cephalexin capsules (openFDA)',
          locator: '1 Indications and Usage; 3 Dosage Forms and Strengths',
          retrievedAt: '2026-08-27',
          excerpt:
            'Cephalexin capsules are a cephalosporin antibacterial drug indicated for the treatment of the following infections caused by susceptible isolates of designated bacteria: Respiratory tract infection ( 1.1 ) Otitis media ( 1.2 ) Skin and skin structure infections ( 1.3 ) Bone infections ( 1.4 ) Genitourinary tract infections ( 1.5 )',
        },
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'lungs',
        actionAsRecorded:
          'Indicated for the treatment of respiratory tract infections caused by susceptible bacteria (as recorded)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '02b5cd6f-3df8-43c1-879d-217fcf55231a',
          label: 'FDA label for cephalexin capsules (openFDA)',
          locator: '1.1 Respiratory Tract Infections',
          retrievedAt: '2026-08-27',
          excerpt:
            'Cephalexin capsules are indicated for the treatment of respiratory tract infections caused by susceptible isolates of Streptococcus pneumoniae and Streptococcus pyogenes.',
        },
      },
      {
        regionCode: 'skin',
        actionAsRecorded:
          'Indicated for the treatment of skin and skin structure infections caused by susceptible bacteria (as recorded)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '02b5cd6f-3df8-43c1-879d-217fcf55231a',
          label: 'FDA label for cephalexin capsules (openFDA)',
          locator: '1.3 Skin and Skin Structure Infections',
          retrievedAt: '2026-08-27',
          excerpt:
            'Cephalexin capsules are indicated for the treatment of skin and skin structure infections caused by susceptible isolates of the following Gram-positive bacteria: Staphylococcus aureus and Streptococcus pyogenes .',
        },
      },
      {
        regionCode: 'bone-marrow',
        actionAsRecorded:
          'Indicated for the treatment of bone infections caused by susceptible bacteria (as recorded)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '02b5cd6f-3df8-43c1-879d-217fcf55231a',
          label: 'FDA label for cephalexin capsules (openFDA)',
          locator: '1.4 Bone Infections',
          retrievedAt: '2026-08-27',
          excerpt:
            'Cephalexin capsules are indicated for the treatment of bone infections caused by susceptible isolates of Staphylococcus aureus and Proteus mirabilis.',
        },
      },
      {
        regionCode: 'bladder',
        actionAsRecorded:
          'Indicated for the treatment of genitourinary tract infections, including acute prostatitis, caused by susceptible bacteria (as recorded)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '02b5cd6f-3df8-43c1-879d-217fcf55231a',
          label: 'FDA label for cephalexin capsules (openFDA)',
          locator: '1.5 Genitourinary Tract Infections',
          retrievedAt: '2026-08-27',
          excerpt:
            'Cephalexin capsules are indicated for the treatment of genitourinary tract infections, including acute prostatitis, caused by susceptible isolates of Escherichia coli , Proteus mirabilis , and Klebsiella pneumoniae .',
        },
      },
    ],
  },

  cetirizine: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    registryIdentifiers: {
      pubchemCid: '2678',
      casNumber: '83881-51-0',
      unii: '64O047KTOA',
      rxcui: '203150',
      source: {
        kind: 'PUBCHEM',
        identifier: '2678',
        label: 'PubChem CID 2678 (cetirizine)',
        retrievedAt: '2026-08-27',
      },
    },
  },

  ciprofloxacin: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    registryIdentifiers: {
      pubchemCid: '2764',
      casNumber: '85721-33-1',
      unii: '4BA73M5E37',
      rxcui: '235851',
      source: {
        kind: 'PUBCHEM',
        identifier: '2764',
        label: 'PubChem CID 2764 (ciprofloxacin)',
        retrievedAt: '2026-08-27',
      },
    },
    productVariants: [
      {
        brandName: 'Ciprofloxacin Ophthalmic Solution',
        formAsRecorded: 'Sterile ophthalmic solution',
        strengthsAsRecorded: 'Ciprofloxacin Ophthalmic Solution USP 0.3% as base',
        approvedUseAsRecorded:
          'Indicated for the treatment of infections caused by susceptible strains of the designated microorganisms in corneal ulcers and conjunctivitis',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Rx Only; FDA label in effect 2022-05-02',
        source: {
          kind: 'FDA_LABEL',
          identifier: '05b2836d-cd3d-4d7f-970c-66ec2d788667',
          label: 'FDA label for ciprofloxacin ophthalmic solution (openFDA)',
          locator: 'Indications and Usage; How Supplied',
          retrievedAt: '2026-08-27',
          excerpt: 'STERILE OPHTHALMIC SOLUTION CIPROFLOXACIN OPHTHALMIC SOLUTION USP 0.3% as base',
        },
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'eye',
        actionAsRecorded:
          'Ophthalmic solution indicated for the treatment of corneal ulcers and conjunctivitis caused by susceptible strains (as recorded)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '05b2836d-cd3d-4d7f-970c-66ec2d788667',
          label: 'FDA label for ciprofloxacin ophthalmic solution (openFDA)',
          locator: 'Indications and Usage',
          retrievedAt: '2026-08-27',
          excerpt:
            'Ciprofloxacin Ophthalmic Solution is indicated for the treatment of infections caused by susceptible strains of the designated microorganisms in the conditions listed below:',
        },
      },
    ],
  },

  clopidogrel: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    registryIdentifiers: {
      pubchemCid: '60606',
      casNumber: '113665-84-2',
      unii: '08I79HTP27',
      rxcui: '236991',
      source: {
        kind: 'PUBCHEM',
        identifier: '60606',
        label: 'PubChem CID 60606 (clopidogrel)',
        retrievedAt: '2026-08-27',
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'oral',
      bioavailability: {
        display: 'at least 50%',
        numeric: 50,
        unit: '%',
        populationContext: 'after single and repeated oral doses of 75 mg per day',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0078fb3d-3595-4ae1-a059-1d5e81c879cf',
          label: 'FDA label for clopidogrel tablets (openFDA)',
          locator: '12.3 Pharmacokinetics — Absorption',
          retrievedAt: '2026-08-27',
          excerpt:
            'After single and repeated oral doses of 75 mg per day, clopidogrel is rapidly absorbed. Absorption is at least 50%, based on urinary excretion of clopidogrel metabolites.',
        },
        concordance: 'label_only',
      },
      tMax: {
        display: 'approximately 30 to 60 minutes after dosing (active metabolite)',
        populationContext: 'active metabolite, in the 75 to 300 mg dose range as recorded',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0078fb3d-3595-4ae1-a059-1d5e81c879cf',
          label: 'FDA label for clopidogrel tablets (openFDA)',
          locator: '12.3 Pharmacokinetics — Metabolism',
          retrievedAt: '2026-08-27',
          excerpt:
            'The C max of the active metabolite is twice as high following a single 300 mg clopidogrel loading dose as it is after four days of 75 mg maintenance dose. C max occurs approximately 30 to 60 minutes after dosing.',
        },
        concordance: 'label_only',
      },
      halfLife: {
        display: 'approximately 6 hours',
        numeric: 6,
        unit: 'hours',
        populationContext: 'parent clopidogrel, after a single oral dose of 75 mg',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0078fb3d-3595-4ae1-a059-1d5e81c879cf',
          label: 'FDA label for clopidogrel tablets (openFDA)',
          locator: '12.3 Pharmacokinetics — Elimination',
          retrievedAt: '2026-08-27',
          excerpt:
            'After a single, oral dose of 75 mg, clopidogrel has a half-life of approximately 6 hours. The half-life of the active metabolite is about 30 minutes.',
        },
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Extensively metabolized by two main metabolic pathways: one mediated by esterases and one mediated by multiple cytochrome P450 enzymes',
        populationContext: 'as recorded on the label (population not specified)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0078fb3d-3595-4ae1-a059-1d5e81c879cf',
          label: 'FDA label for clopidogrel tablets (openFDA)',
          locator: '12.3 Pharmacokinetics — Metabolism',
          retrievedAt: '2026-08-27',
          excerpt:
            'Clopidogrel is extensively metabolized by two main metabolic pathways: one mediated by esterases and leading to hydrolysis into an inactive carboxylic acid derivative (85% of circulating metabolites) and one mediated by multiple cytochrome P450 enzymes.',
        },
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Approximately 50% of total radioactivity excreted in urine and approximately 46% in feces over the 5 days post dosing',
        populationContext: 'humans, after an oral dose of 14C-labeled clopidogrel',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0078fb3d-3595-4ae1-a059-1d5e81c879cf',
          label: 'FDA label for clopidogrel tablets (openFDA)',
          locator: '12.3 Pharmacokinetics — Elimination',
          retrievedAt: '2026-08-27',
          excerpt:
            'Following an oral dose of 14 C-labeled clopidogrel in humans, approximately 50% of total radioactivity was excreted in urine and approximately 46% in feces over the 5 days post dosing.',
        },
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(6),
    },
    productVariants: [
      {
        brandName: 'Clopidogrel',
        formAsRecorded: 'Film-coated tablets',
        strengthsAsRecorded: 'Film-coated tablets: 75 mg',
        approvedUseAsRecorded:
          'A P2Y12 platelet inhibitor indicated for acute coronary syndrome and for recent MI, recent stroke, or established peripheral arterial disease',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2024-05-17',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0078fb3d-3595-4ae1-a059-1d5e81c879cf',
          label: 'FDA label for clopidogrel tablets (openFDA)',
          locator: '1 Indications and Usage; 3 Dosage Forms and Strengths',
          retrievedAt: '2026-08-27',
          excerpt:
            'Clopidogrel tablets are a P2Y 12 platelet inhibitor indicated for: Acute coronary syndrome – For patients with non–ST-segment elevation ACS (unstable angina [UA]/non–ST-elevation myocardial infarction [NSTEMI]), clopidogrel tablets have been shown to reduce the rate of myocardial infarction (MI) and stroke. (1.1)',
        },
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'blood-vessels',
        actionAsRecorded:
          'The active metabolite binds irreversibly to platelet receptors, inhibiting platelet aggregation (as recorded)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0078fb3d-3595-4ae1-a059-1d5e81c879cf',
          label: 'FDA label for clopidogrel tablets (openFDA)',
          locator: '12.3 Pharmacokinetics — Metabolism',
          retrievedAt: '2026-08-27',
          excerpt:
            'The active thiol metabolite binds rapidly and irreversibly to platelet receptors, thus inhibiting platelet aggregation for the lifespan of the platelet.',
        },
      },
    ],
  },

  colchicine: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    registryIdentifiers: {
      pubchemCid: '6167',
      casNumber: '64-86-8',
      unii: 'SML2Y3J35T',
      rxcui: '2683',
      source: {
        kind: 'PUBCHEM',
        identifier: '6167',
        label: 'PubChem CID 6167 (colchicine)',
        retrievedAt: '2026-08-27',
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'oral',
      bioavailability: {
        display: 'approximately 45%',
        numeric: 45,
        unit: '%',
        populationContext: 'absolute bioavailability as reported on the label',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0f69b9c6-8c00-45e2-b950-34dc5ae62352',
          label: 'FDA label for colchicine tablets (openFDA)',
          locator: '12.3 Pharmacokinetics — Absorption',
          retrievedAt: '2026-08-27',
          excerpt: 'Absolute bioavailability is reported to be approximately 45%.',
        },
        concordance: 'label_only',
      },
      tMax: {
        display: 'one to two hours (range 0.5 to 3 hours)',
        numeric: 1.5,
        unit: 'hours',
        populationContext: 'healthy adults, single oral dose under fasting conditions',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0f69b9c6-8c00-45e2-b950-34dc5ae62352',
          label: 'FDA label for colchicine tablets (openFDA)',
          locator: '12.3 Pharmacokinetics — Absorption',
          retrievedAt: '2026-08-27',
          excerpt:
            'In healthy adults, colchicine tablets are absorbed when given orally, reaching a mean C max of 2.5 ng/mL (range 1.1 to 4.4 ng/mL) in one to two hours (range 0.5 to 3 hours) after a single dose administered under fasting conditions.',
        },
        concordance: 'label_only',
      },
      halfLife: {
        display: '26.6 to 31.2 hours',
        numeric: 28.9,
        unit: 'hours',
        populationContext: 'young healthy volunteers, multiple oral doses (0.6 mg twice daily)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0f69b9c6-8c00-45e2-b950-34dc5ae62352',
          label: 'FDA label for colchicine tablets (openFDA)',
          locator: '12.3 Pharmacokinetics — Elimination/Excretion',
          retrievedAt: '2026-08-27',
          excerpt:
            'Following multiple oral doses (0.6 mg twice daily), the mean elimination half-lives in young healthy volunteers (mean age 25 to 28 years of age) is 26.6 to 31.2 hours.',
        },
        concordance: 'label_only',
      },
      proteinBinding: {
        display: '39 ± 5%',
        numeric: 39,
        unit: '%',
        populationContext: 'serum protein binding, primarily to albumin, as recorded on the label',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0f69b9c6-8c00-45e2-b950-34dc5ae62352',
          label: 'FDA label for colchicine tablets (openFDA)',
          locator: '12.3 Pharmacokinetics — Distribution',
          retrievedAt: '2026-08-27',
          excerpt:
            'Colchicine binding to serum protein is low, 39 ± 5%, primarily to albumin regardless of concentration.',
        },
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: 'approximately 5 to 8 L/kg',
        numeric: 6.5,
        unit: 'L/kg',
        populationContext: 'healthy young volunteers, mean apparent volume of distribution',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0f69b9c6-8c00-45e2-b950-34dc5ae62352',
          label: 'FDA label for colchicine tablets (openFDA)',
          locator: '12.3 Pharmacokinetics — Distribution',
          retrievedAt: '2026-08-27',
          excerpt:
            'The mean apparent volume of distribution in healthy young volunteers is approximately 5 to 8 L/kg.',
        },
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Demethylated to two primary metabolites and one minor metabolite; CYP3A4 is involved in the metabolism of colchicine',
        populationContext: 'in vitro studies using human liver microsomes, as recorded',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0f69b9c6-8c00-45e2-b950-34dc5ae62352',
          label: 'FDA label for colchicine tablets (openFDA)',
          locator: '12.3 Pharmacokinetics — Metabolism',
          retrievedAt: '2026-08-27',
          excerpt:
            'Colchicine is demethylated to two primary metabolites, 2-O-demethylcolchicine and 3-O-demethylcolchicine (2- and 3-DMC, respectively) and one minor metabolite, 10-O-demethylcolchicine (also known as colchicine). In vitro studies using human liver microsomes have shown that CYP3A4 is involved in the metabolism of colchicine to 2- and 3-DMC.',
        },
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display: '40 to 65% of 1 mg orally administered colchicine recovered unchanged in urine',
        populationContext: 'healthy volunteers (n = 12)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0f69b9c6-8c00-45e2-b950-34dc5ae62352',
          label: 'FDA label for colchicine tablets (openFDA)',
          locator: '12.3 Pharmacokinetics — Elimination/Excretion',
          retrievedAt: '2026-08-27',
          excerpt:
            'In healthy volunteers (n = 12), 40 to 65% of 1 mg orally administered colchicine was recovered unchanged in urine.',
        },
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(28.9),
    },
    productVariants: [
      {
        brandName: 'Colchicine Tablets USP',
        formAsRecorded: 'Film-coated tablets',
        strengthsAsRecorded: 'Tablets: 0.6 mg colchicine',
        approvedUseAsRecorded:
          'An alkaloid indicated for prophylaxis and treatment of gout flares in adults and for familial Mediterranean fever (FMF) in adults and children 4 years or older',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2025-07-01',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0f69b9c6-8c00-45e2-b950-34dc5ae62352',
          label: 'FDA label for colchicine tablets (openFDA)',
          locator: '1 Indications and Usage; 3 Dosage Forms and Strengths',
          retrievedAt: '2026-08-27',
          excerpt:
            'Colchicine tablets are an alkaloid indicated for: • Prophylaxis and treatment of gout flares in adults ( 1.1 ). • Familial Mediterranean fever (FMF) in adults and children 4 years or older',
        },
      },
    ],
  },

  'creatine-monohydrate': {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    registryIdentifiers: {
      pubchemCid: '586',
      casNumber: '57-00-1',
      rxcui: '1310467',
      source: {
        kind: 'PUBCHEM',
        identifier: '586',
        label: 'PubChem CID 586 (creatine)',
        retrievedAt: '2026-08-27',
      },
    },
  },

  dapagliflozin: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    registryIdentifiers: {
      pubchemCid: '9887712',
      casNumber: '461432-26-8',
      unii: '887K2391VH',
      rxcui: '1488564',
      source: {
        kind: 'PUBCHEM',
        identifier: '9887712',
        label: 'PubChem CID 9887712 (dapagliflozin)',
        retrievedAt: '2026-08-27',
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'oral',
      bioavailability: {
        display: '78%',
        numeric: 78,
        unit: '%',
        populationContext: 'absolute oral bioavailability following administration of a 10 mg dose',
        source: {
          kind: 'FDA_LABEL',
          identifier: '01f90c94-71cb-4a1f-81ff-8004b850529b',
          label: 'FDA label for FARXIGA (dapagliflozin) tablets (openFDA)',
          locator: '12.3 Pharmacokinetics — Absorption',
          retrievedAt: '2026-08-27',
          excerpt:
            'The absolute oral bioavailability of dapagliflozin following the administration of a 10 mg dose is 78%.',
        },
        concordance: 'label_only',
      },
      tMax: {
        display: 'within 2 hours',
        numeric: 2,
        unit: 'hours',
        populationContext: 'following oral administration under fasting state',
        source: {
          kind: 'FDA_LABEL',
          identifier: '01f90c94-71cb-4a1f-81ff-8004b850529b',
          label: 'FDA label for FARXIGA (dapagliflozin) tablets (openFDA)',
          locator: '12.3 Pharmacokinetics — Absorption',
          retrievedAt: '2026-08-27',
          excerpt:
            'Following oral administration of dapagliflozin, the maximum plasma concentration (C max ) is usually attained within 2 hours under fasting state.',
        },
        concordance: 'label_only',
      },
      halfLife: {
        display: 'approximately 12.9 hours',
        numeric: 12.9,
        unit: 'hours',
        populationContext: 'following a single oral dose of FARXIGA 10 mg',
        source: {
          kind: 'FDA_LABEL',
          identifier: '01f90c94-71cb-4a1f-81ff-8004b850529b',
          label: 'FDA label for FARXIGA (dapagliflozin) tablets (openFDA)',
          locator: '12.3 Pharmacokinetics — Elimination',
          retrievedAt: '2026-08-27',
          excerpt:
            'The mean plasma terminal half-life (t ½ ) for dapagliflozin is approximately 12.9 hours following a single oral dose of FARXIGA 10 mg.',
        },
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'approximately 91%',
        numeric: 91,
        unit: '%',
        populationContext: 'protein binding as recorded on the label (population not specified)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '01f90c94-71cb-4a1f-81ff-8004b850529b',
          label: 'FDA label for FARXIGA (dapagliflozin) tablets (openFDA)',
          locator: '12.3 Pharmacokinetics — Distribution',
          retrievedAt: '2026-08-27',
          excerpt: 'Dapagliflozin is approximately 91% protein bound.',
        },
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Metabolism primarily mediated by UGT1A9; CYP-mediated metabolism is a minor clearance pathway; extensively metabolized primarily to dapagliflozin 3-O-glucuronide, an inactive metabolite',
        populationContext: 'humans, as recorded on the label',
        source: {
          kind: 'FDA_LABEL',
          identifier: '01f90c94-71cb-4a1f-81ff-8004b850529b',
          label: 'FDA label for FARXIGA (dapagliflozin) tablets (openFDA)',
          locator: '12.3 Pharmacokinetics — Metabolism',
          retrievedAt: '2026-08-27',
          excerpt:
            'The metabolism of dapagliflozin is primarily mediated by UGT1A9; CYP-mediated metabolism is a minor clearance pathway in humans. Dapagliflozin is extensively metabolized, primarily to yield dapagliflozin 3-O-glucuronide, which is an inactive metabolite.',
        },
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Primarily eliminated via the renal pathway; 75% and 21% of total radioactivity excreted in urine and feces, respectively',
        populationContext: 'following a single 50 mg dose of 14C-dapagliflozin',
        source: {
          kind: 'FDA_LABEL',
          identifier: '01f90c94-71cb-4a1f-81ff-8004b850529b',
          label: 'FDA label for FARXIGA (dapagliflozin) tablets (openFDA)',
          locator: '12.3 Pharmacokinetics — Elimination',
          retrievedAt: '2026-08-27',
          excerpt:
            'Dapagliflozin and related metabolites are primarily eliminated via the renal pathway. Following a single 50 mg dose of [ 14 C]-dapagliflozin, 75% and 21% total radioactivity is excreted in urine and feces, respectively.',
        },
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(12.9),
    },
    productVariants: [
      {
        brandName: 'FARXIGA',
        formAsRecorded: 'Film-coated tablets',
        strengthsAsRecorded: 'Tablets: 5 mg and 10 mg',
        approvedUseAsRecorded:
          'A sodium-glucose cotransporter 2 (SGLT2) inhibitor indicated for chronic kidney disease at risk of progression, heart failure, type 2 diabetes mellitus with cardiovascular disease or risk factors, and glycemic control in type 2 diabetes mellitus, as recorded on the label',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-07-10',
        source: {
          kind: 'FDA_LABEL',
          identifier: '01f90c94-71cb-4a1f-81ff-8004b850529b',
          label: 'FDA label for FARXIGA (dapagliflozin) tablets (openFDA)',
          locator: '1 Indications and Usage; 3 Dosage Forms and Strengths',
          retrievedAt: '2026-08-27',
          excerpt:
            'FARXIGA is a sodium-glucose cotransporter 2 (SGLT2) inhibitor indicated: • To reduce the risk of sustained eGFR decline, end-stage kidney disease, cardiovascular (CV) death, and hospitalization for heart failure in adults with chronic kidney disease at risk of progression. (1)',
        },
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'kidneys',
        actionAsRecorded:
          'Inhibits SGLT2 in the proximal renal tubules, reducing reabsorption of filtered glucose (as recorded)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '01f90c94-71cb-4a1f-81ff-8004b850529b',
          label: 'FDA label for FARXIGA (dapagliflozin) tablets (openFDA)',
          locator: '12.1 Mechanism of Action',
          retrievedAt: '2026-08-27',
          excerpt:
            'Sodium-glucose cotransporter 2 (SGLT2), expressed in the proximal renal tubules, is responsible for the majority of the reabsorption of filtered glucose from the tubular lumen. Dapagliflozin is an inhibitor of SGLT2. By inhibiting SGLT2, dapagliflozin reduces reabsorption of filtered glucose and thereby promotes urinary glucose excretion.',
        },
      },
    ],
    applicability: {
      trialIdentifier: 'NCT03036124',
      includedAsRecorded: [
        'Male or female, aged ≥18 years',
        'Established documented diagnosis of symptomatic HFrEF (NYHA functional class II-IV), which has been present for at least 2 months',
        'LVEF≤40%',
        'Elevated NT-proBNP levels',
        'eGFR ≥30 mL/min/1.73 m^2 (CKD-EPI formula) at enrolment (visit 1)',
      ],
      excludedAsRecorded: [
        'Receiving therapy with an SGLT2 inhibitor within 8 weeks prior to enrolment or previous intolerance of an SGLT2 inhibitor',
        'Type 1 diabetes mellitus',
        'Symptomatic hypotension or systolic BP <95 mmHg at 2 out of 3 measurements either at visit 1 or visit 2',
        'Current acute decompensated HF or hospitalization due to decompensated HF <4 weeks prior to enrolment',
        'MI, unstable angina, stroke or transient ischemic attack within 12 weeks prior to enrolment',
        'Severe (eGFR <30 mL/min/1.73 m^2 by CKD-EPI), unstable or rapidly progressing renal disease at the time of randomization',
      ],
      source: {
        kind: 'CLINICALTRIALS',
        identifier: 'NCT03036124',
        label: 'ClinicalTrials.gov record NCT03036124 (DAPA-HF), eligibility criteria',
        locator: 'protocolSection.eligibilityModule.eligibilityCriteria',
        retrievedAt: '2026-08-27',
        excerpt:
          '* Established documented diagnosis of symptomatic HFrEF (NYHA functional class II-IV), which has been present for at least 2 months\n* LVEF≤40%\n* Elevated NT-proBNP levels',
      },
    },
    pivotalResults: [
      {
        trialIdentifier: 'NCT03036124',
        endpointAsRecorded:
          'Subjects included in the composite endpoint of CV death, hospitalization due to heart failure or urgent visit due to heart failure (primary efficacy)',
        activeResultAsRecorded: '386 participants (dapagliflozin 10 mg arm)',
        comparatorResultAsRecorded: '502 participants (placebo arm)',
        differenceAsRecorded: 'Hazard Ratio (HR) 0.74',
        uncertaintyAsRecorded: '95% CI 0.65 to 0.85; p<0.0001',
        timepointAsRecorded: 'Up to 27.8 months',
        source: {
          kind: 'CLINICALTRIALS',
          identifier: 'NCT03036124',
          label: 'ClinicalTrials.gov posted results for NCT03036124 (DAPA-HF), primary outcome',
          locator: 'resultsSection.outcomeMeasuresModule, primary outcome measure',
          retrievedAt: '2026-08-27',
          excerpt:
            '"timeFrame":"Up to 27.8 months.","groups":[{"id":"OG000","title":"Dapa 10 mg" … "measurements":[{"groupId":"OG000","value":"386"},{"groupId":"OG001","value":"502"}] … "pValue":"<0.0001" … "paramType":"Hazard Ratio (HR)","paramValue":"0.74","ciPctValue":"95","ciLowerLimit":"0.65","ciUpperLimit":"0.85"',
        },
      },
    ],
  },

  doxycycline: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    registryIdentifiers: {
      pubchemCid: '54671203',
      casNumber: '7164-70-7',
      unii: '19XTS3T51U',
      rxcui: '203122',
      source: {
        kind: 'PUBCHEM',
        identifier: '54671203',
        label: 'PubChem CID 54671203 (doxycycline)',
        retrievedAt: '2026-08-27',
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'oral',
      bioavailability: {
        display: 'virtually completely absorbed after oral administration',
        populationContext: 'as recorded on the label (population not specified)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00b2aa98-dea2-90c3-e063-6294a90a35d6',
          label: 'FDA label for doxycycline hyclate capsules (openFDA)',
          locator: 'Clinical Pharmacology',
          retrievedAt: '2026-08-27',
          excerpt: 'Doxycycline is virtually completely absorbed after oral administration.',
        },
        concordance: 'label_only',
      },
      tMax: {
        display: '2 hours',
        numeric: 2,
        unit: 'hours',
        populationContext: 'normal adult volunteers, following a 200 mg dose',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00b2aa98-dea2-90c3-e063-6294a90a35d6',
          label: 'FDA label for doxycycline hyclate capsules (openFDA)',
          locator: 'Clinical Pharmacology',
          retrievedAt: '2026-08-27',
          excerpt:
            'Following a 200 mg dose, normal adult volunteers averaged peak serum levels of 2.6 mcg/mL of doxycycline at 2 hours, decreasing to 1.45 mcg/mL at 24 hours.',
        },
        concordance: 'label_only',
      },
      halfLife: {
        display: '18 to 22 hours',
        numeric: 20,
        unit: 'hours',
        populationContext: 'individuals with normal and severely impaired renal function',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00b2aa98-dea2-90c3-e063-6294a90a35d6',
          label: 'FDA label for doxycycline hyclate capsules (openFDA)',
          locator: 'Clinical Pharmacology',
          retrievedAt: '2026-08-27',
          excerpt:
            'Studies have shown no significant difference in serum half-life of doxycycline (range 18 to 22 hours) in individuals with normal and severely impaired renal function.',
        },
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Excretion by the kidney is about 40%/72 hours in individuals with normal function',
        populationContext:
          'individuals with normal renal function (creatinine clearance about 75 mL/min)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00b2aa98-dea2-90c3-e063-6294a90a35d6',
          label: 'FDA label for doxycycline hyclate capsules (openFDA)',
          locator: 'Clinical Pharmacology',
          retrievedAt: '2026-08-27',
          excerpt:
            'Excretion of doxycycline by the kidney is about 40%/72 hours in individuals with normal function (creatinine clearance about 75 mL/min.).',
        },
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(20),
    },
    productVariants: [
      {
        brandName: 'Doxycycline Hyclate Capsules, USP',
        formAsRecorded: 'Capsules',
        strengthsAsRecorded:
          'Each capsule contains doxycycline hyclate equivalent to 100 mg doxycycline',
        approvedUseAsRecorded:
          'Indicated for the treatment of a range of infections caused by susceptible bacteria, including Rocky Mountain spotted fever, typhus fever and the typhus group, Q fever, rickettsialpox, and tick fevers caused by Rickettsiae, as recorded on the label',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-05-01',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00b2aa98-dea2-90c3-e063-6294a90a35d6',
          label: 'FDA label for doxycycline hyclate capsules (openFDA)',
          locator: 'Indications and Usage; How Supplied',
          retrievedAt: '2026-08-27',
          excerpt:
            'Doxycycline Hyclate Capsules, USP are light blue, and imprinted with "186" on the body and "CY" on the cap. Each capsule contains doxycycline hyclate equivalent to: 100 mg doxycycline',
        },
      },
    ],
  },

  duloxetine: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    registryIdentifiers: {
      pubchemCid: '60835',
      casNumber: '116539-59-4',
      unii: '9044SC542W',
      rxcui: '476250',
      source: {
        kind: 'PUBCHEM',
        identifier: '60835',
        label: 'PubChem CID 60835 (duloxetine)',
        retrievedAt: '2026-08-27',
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'oral',
      tMax: {
        display: '6 hours post dose',
        numeric: 6,
        unit: 'hours',
        populationContext: 'after oral duloxetine delayed-release capsule administration',
        source: {
          kind: 'FDA_LABEL',
          identifier: '05a744a5-64ef-42d7-a19c-568be5a272d4',
          label: 'FDA label for duloxetine delayed-release capsules (openFDA)',
          locator: '12.3 Pharmacokinetics — Absorption',
          retrievedAt: '2026-08-27',
          excerpt:
            'There is a median 2 hour lag until absorption begins (T lag ), with maximal plasma concentrations (C max ) of duloxetine occurring 6 hours post dose.',
        },
        concordance: 'label_only',
      },
      halfLife: {
        display: 'about 12 hours (range 8 to 17 hours)',
        numeric: 12,
        unit: 'hours',
        populationContext:
          'elimination half-life as recorded on the label (population not specified)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '05a744a5-64ef-42d7-a19c-568be5a272d4',
          label: 'FDA label for duloxetine delayed-release capsules (openFDA)',
          locator: '12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt:
            'Duloxetine has an elimination half-life of about 12 hours (range 8 to 17 hours) and its pharmacokinetics are dose proportional over the therapeutic range.',
        },
        concordance: 'label_only',
      },
      proteinBinding: {
        display: '>90%',
        numeric: 90,
        unit: '%',
        populationContext:
          'human plasma, binding primarily to albumin and alpha-1-acid glycoprotein',
        source: {
          kind: 'FDA_LABEL',
          identifier: '05a744a5-64ef-42d7-a19c-568be5a272d4',
          label: 'FDA label for duloxetine delayed-release capsules (openFDA)',
          locator: '12.3 Pharmacokinetics — Distribution',
          retrievedAt: '2026-08-27',
          excerpt:
            'Duloxetine is highly bound (>90%) to proteins in human plasma, binding primarily to albumin and α 1 -acid glycoprotein.',
        },
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: 'about 1640 L',
        numeric: 1640,
        unit: 'L',
        populationContext: 'apparent volume of distribution as recorded on the label',
        source: {
          kind: 'FDA_LABEL',
          identifier: '05a744a5-64ef-42d7-a19c-568be5a272d4',
          label: 'FDA label for duloxetine delayed-release capsules (openFDA)',
          locator: '12.3 Pharmacokinetics — Distribution',
          retrievedAt: '2026-08-27',
          excerpt: 'The apparent volume of distribution averages about 1640 L.',
        },
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display: 'Mainly hepatic metabolism involving two P450 isozymes, CYP1A2 and CYP2D6',
        populationContext: 'as recorded on the label (population not specified)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '05a744a5-64ef-42d7-a19c-568be5a272d4',
          label: 'FDA label for duloxetine delayed-release capsules (openFDA)',
          locator: '12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt:
            'Elimination of duloxetine is mainly through hepatic metabolism involving two P450 isozymes, CYP1A2 and CYP2D6.',
        },
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Most (about 70%) of the dose appears in the urine as metabolites; about 20% is excreted in the feces',
        populationContext: 'humans, following oral administration of 14C-labeled duloxetine',
        source: {
          kind: 'FDA_LABEL',
          identifier: '05a744a5-64ef-42d7-a19c-568be5a272d4',
          label: 'FDA label for duloxetine delayed-release capsules (openFDA)',
          locator: '12.3 Pharmacokinetics — Excretion',
          retrievedAt: '2026-08-27',
          excerpt:
            'Most (about 70%) of the duloxetine dose appears in the urine as metabolites of duloxetine; about 20% is excreted in the feces.',
        },
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(12),
    },
    productVariants: [
      {
        brandName: 'Duloxetine delayed-release capsules',
        formAsRecorded: 'Delayed-release capsules',
        strengthsAsRecorded: 'Delayed-release capsules: 20 mg, 30 mg, and 60 mg',
        approvedUseAsRecorded:
          'A serotonin and norepinephrine reuptake inhibitor (SNRI) indicated for major depressive disorder, generalized anxiety disorder, diabetic peripheral neuropathic pain, fibromyalgia, and chronic musculoskeletal pain, as recorded on the label',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-04-22',
        source: {
          kind: 'FDA_LABEL',
          identifier: '05a744a5-64ef-42d7-a19c-568be5a272d4',
          label: 'FDA label for duloxetine delayed-release capsules (openFDA)',
          locator: '1 Indications and Usage; 3 Dosage Forms and Strengths',
          retrievedAt: '2026-08-27',
          excerpt:
            'Duloxetine delayed-release capsules are a serotonin and norepinephrine reuptake inhibitor (SNRI) indicated for the treatment of the following conditions: Major depressive disorder (MDD) in adults (1) Generalized anxiety disorder (GAD) in adults and pediatric patients 7 years of age and older (1) Diabetic peripheral neuropathic pain (DPNP) in adults (1)',
        },
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'brain',
        actionAsRecorded:
          'Actions believed to be related to potentiation of serotonergic and noradrenergic activity in the CNS (as recorded)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '05a744a5-64ef-42d7-a19c-568be5a272d4',
          label: 'FDA label for duloxetine delayed-release capsules (openFDA)',
          locator: '12.1 Mechanism of Action',
          retrievedAt: '2026-08-27',
          excerpt:
            'Although the exact mechanisms of the antidepressant, central pain inhibitory and anxiolytic actions of duloxetine in humans are unknown, these actions are believed to be related to its potentiation of serotonergic and noradrenergic activity in the CNS.',
        },
      },
    ],
  },

  empagliflozin: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    registryIdentifiers: {
      pubchemCid: '11949646',
      casNumber: '864070-44-0',
      unii: 'HDC1R2M35U',
      rxcui: '1545653',
      source: {
        kind: 'PUBCHEM',
        identifier: '11949646',
        label: 'PubChem CID 11949646 (empagliflozin)',
        retrievedAt: '2026-08-27',
      },
    },
    pharmacokinetics: {
      routeAsRecorded: 'oral',
      tMax: {
        display: '1.5 hours post-dose',
        numeric: 1.5,
        unit: 'hours',
        populationContext:
          'empagliflozin component, after oral administration (recorded on the SYNJARDY combination label)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0fdd0255-0055-65f3-b2c0-db8fbb87beae',
          label: 'FDA label for SYNJARDY (empagliflozin and metformin) (openFDA)',
          locator: '12.3 Pharmacokinetics — Empagliflozin, Absorption',
          retrievedAt: '2026-08-27',
          excerpt:
            'After oral administration, peak plasma concentrations of empagliflozin were reached at 1.5 hours post-dose.',
        },
        concordance: 'label_only',
      },
      halfLife: {
        display: '12.4 h',
        numeric: 12.4,
        unit: 'hours',
        populationContext:
          'empagliflozin component, population pharmacokinetic analysis (recorded on the SYNJARDY combination label)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0fdd0255-0055-65f3-b2c0-db8fbb87beae',
          label: 'FDA label for SYNJARDY (empagliflozin and metformin) (openFDA)',
          locator: '12.3 Pharmacokinetics — Empagliflozin, Elimination',
          retrievedAt: '2026-08-27',
          excerpt:
            'The apparent terminal elimination half-life of empagliflozin was estimated to be 12.4 h and apparent oral clearance was 10.6 L/h based on the population pharmacokinetic analysis.',
        },
        concordance: 'label_only',
      },
      proteinBinding: {
        display: '86.2%',
        numeric: 86.2,
        unit: '%',
        populationContext:
          'healthy subjects, oral 14C-empagliflozin solution (recorded on the SYNJARDY combination label)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0fdd0255-0055-65f3-b2c0-db8fbb87beae',
          label: 'FDA label for SYNJARDY (empagliflozin and metformin) (openFDA)',
          locator: '12.3 Pharmacokinetics — Empagliflozin, Distribution',
          retrievedAt: '2026-08-27',
          excerpt:
            'Following administration of an oral [ 14 C]-empagliflozin solution to healthy subjects, the red blood cell partitioning was approximately 36.8% and plasma protein binding was 86.2%.',
        },
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: '73.8 L',
        numeric: 73.8,
        unit: 'L',
        populationContext:
          'empagliflozin component, apparent steady-state volume, population pharmacokinetic analysis',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0fdd0255-0055-65f3-b2c0-db8fbb87beae',
          label: 'FDA label for SYNJARDY (empagliflozin and metformin) (openFDA)',
          locator: '12.3 Pharmacokinetics — Empagliflozin, Distribution',
          retrievedAt: '2026-08-27',
          excerpt:
            'The apparent steady-state volume of distribution was estimated to be 73.8 L based on a population pharmacokinetic analysis.',
        },
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          "Primary route of metabolism in humans is glucuronidation by the uridine 5'-diphospho-glucuronosyltransferases UGT2B7, UGT1A3, UGT1A8, and UGT1A9",
        populationContext: 'in vitro studies, as recorded on the SYNJARDY combination label',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0fdd0255-0055-65f3-b2c0-db8fbb87beae',
          label: 'FDA label for SYNJARDY (empagliflozin and metformin) (openFDA)',
          locator: '12.3 Pharmacokinetics — Empagliflozin, Metabolism',
          retrievedAt: '2026-08-27',
          excerpt:
            "In vitro studies suggested that the primary route of metabolism of empagliflozin in humans is glucuronidation by the uridine 5'-diphospho-glucuronosyltransferases UGT2B7, UGT1A3, UGT1A8, and UGT1A9.",
        },
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Approximately 95.6% of drug-related radioactivity eliminated in feces (41.2%) or urine (54.4%)',
        populationContext: 'healthy subjects, oral 14C-empagliflozin solution',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0fdd0255-0055-65f3-b2c0-db8fbb87beae',
          label: 'FDA label for SYNJARDY (empagliflozin and metformin) (openFDA)',
          locator: '12.3 Pharmacokinetics — Empagliflozin, Excretion',
          retrievedAt: '2026-08-27',
          excerpt:
            'Following administration of an oral [ 14 C]-empagliflozin solution to healthy subjects, approximately 95.6% of the drug-related radioactivity was eliminated in feces (41.2%) or urine (54.4%).',
        },
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(12.4),
    },
    productVariants: [
      {
        brandName: 'SYNJARDY',
        formAsRecorded: 'Film-coated tablets',
        strengthsAsRecorded:
          '5 mg empagliflozin/500 mg metformin HCl; 5 mg empagliflozin/1,000 mg metformin HCl; 12.5 mg empagliflozin/500 mg metformin HCl; 12.5 mg empagliflozin/1,000 mg metformin HCl',
        approvedUseAsRecorded:
          'A combination of empagliflozin, a sodium-glucose co-transporter 2 (SGLT2) inhibitor, and metformin hydrochloride immediate-release, a biguanide, indicated as an adjunct to diet and exercise to improve glycemic control in adults and pediatric patients aged 10 years and older with type 2 diabetes mellitus',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-01-30',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0fdd0255-0055-65f3-b2c0-db8fbb87beae',
          label: 'FDA label for SYNJARDY (empagliflozin and metformin) (openFDA)',
          locator: '1 Indications and Usage; 3 Dosage Forms and Strengths',
          retrievedAt: '2026-08-27',
          excerpt:
            'SYNJARDY Tablets: 5 mg empagliflozin/500 mg metformin HCl ( 3 ) 5 mg empagliflozin/1,000 mg metformin HCl ( 3 ) 12.5 mg empagliflozin/500 mg metformin HCl ( 3 ) 12.5 mg empagliflozin/1,000 mg metformin HCl ( 3 )',
        },
      },
      {
        brandName: 'SYNJARDY XR',
        formAsRecorded: 'Film-coated tablets (extended-release metformin component)',
        strengthsAsRecorded:
          '5 mg empagliflozin/1,000 mg metformin HCl extended-release; 10 mg empagliflozin/1,000 mg metformin HCl extended-release; 12.5 mg empagliflozin/1,000 mg metformin HCl extended-release; 25 mg empagliflozin/1,000 mg metformin HCl extended-release',
        approvedUseAsRecorded:
          'A combination of empagliflozin, a SGLT2 inhibitor, and metformin HCl extended-release, a biguanide, indicated as an adjunct to diet and exercise to improve glycemic control in adults with type 2 diabetes mellitus',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-01-30',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0fdd0255-0055-65f3-b2c0-db8fbb87beae',
          label: 'FDA label for SYNJARDY (empagliflozin and metformin) (openFDA)',
          locator: '1 Indications and Usage; 3 Dosage Forms and Strengths',
          retrievedAt: '2026-08-27',
          excerpt:
            'SYNJARDY XR is a combination of empagliflozin, a SGLT2 inhibitor and metformin HCl extended-release, a biguanide, indicated as an adjunct to diet and exercise to improve glycemic control in adults with type 2 diabetes mellitus .',
        },
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'kidneys',
        actionAsRecorded:
          'Inhibits SGLT2, reducing renal reabsorption of filtered glucose and lowering the renal threshold for glucose (as recorded)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '0fdd0255-0055-65f3-b2c0-db8fbb87beae',
          label: 'FDA label for SYNJARDY (empagliflozin and metformin) (openFDA)',
          locator: '12.1 Mechanism of Action — Empagliflozin',
          retrievedAt: '2026-08-27',
          excerpt:
            'Empagliflozin is an inhibitor of SGLT2, the predominant transporter responsible for reabsorption of glucose from the glomerular filtrate back into the circulation. By inhibiting SGLT2, empagliflozin reduces renal reabsorption of filtered glucose and lowers the renal threshold for glucose, and thereby increases urinary glucose excretion.',
        },
      },
    ],
    applicability: {
      trialIdentifier: 'NCT01131676',
      includedAsRecorded: [
        'Diagnosis of type 2 diabetes mellitus prior to informed consent',
        'Glycosylated haemoglobin (HbA1c) of >= 7.0% and <=10% for patients on background therapy or HbA1c >= 7.0% and <= 9.0% for drug naive patients',
        'Age >= 18 years',
        'Body Mass index <= 45 at Visit 1',
        'High cardiovascular risk',
      ],
      excludedAsRecorded: [
        'Uncontrolled hyperglycaemia with a glucose level >240 mg/dl (>13.3 mmol/L) after an overnight fast during placebo run-in and confirmed by a second measurement (not on the same day)',
        'Planned cardiac surgery or angioplasty within 3 months',
        'Impaired renal function, defined as Glomerular Filtration Rate <30 ml/min (severe renal impairment, Modification of Diet in Renal Disease formula) during screening or run in.',
        'Bariatric surgery within the past two years and other gastrointestinal surgeries that induce chronic malabsorption',
        'Medical history of cancer (except for basal cell carcinoma) and/or treatment for cancer within the last 5 years',
      ],
      source: {
        kind: 'CLINICALTRIALS',
        identifier: 'NCT01131676',
        label: 'ClinicalTrials.gov record NCT01131676 (EMPA-REG OUTCOME), eligibility criteria',
        locator: 'protocolSection.eligibilityModule.eligibilityCriteria',
        retrievedAt: '2026-08-27',
        excerpt:
          '3. Glycosylated haemoglobin (HbA1c) of \\>= 7.0% and \\<=10% for patients on background therapy or HbA1c \\>= 7.0% and \\<= 9.0% for drug naive patients\n4. Age \\>= 18 years\n5. Body Mass index \\<= 45 at Visit 1\n6. Signed and dated informed consent\n7. High cardiovascular risk',
      },
    },
    pivotalResults: [
      {
        trialIdentifier: 'NCT01131676',
        endpointAsRecorded:
          'Time to first occurrence of an adjudicated component of the primary composite endpoint (3-point MACE): CV death, non-fatal MI (excluding silent MI), and non-fatal stroke; percentage of participants with the event',
        activeResultAsRecorded: '10.5 percent of participants (all empagliflozin, pooled)',
        comparatorResultAsRecorded: '12.1 percent of participants (placebo)',
        differenceAsRecorded: 'Hazard Ratio (HR) 0.86',
        uncertaintyAsRecorded: '95.02% CI 0.74 to 0.99; p=0.0382 (superiority)',
        timepointAsRecorded: 'From randomisation to individual end of observation, up to 4.6 years',
        source: {
          kind: 'CLINICALTRIALS',
          identifier: 'NCT01131676',
          label:
            'ClinicalTrials.gov posted results for NCT01131676 (EMPA-REG OUTCOME), primary outcome',
          locator: 'resultsSection.outcomeMeasuresModule, primary outcome measure',
          retrievedAt: '2026-08-27',
          excerpt:
            '"measurements":[{"groupId":"OG000","value":"12.1"},{"groupId":"OG001","value":"10.4"},{"groupId":"OG002","value":"10.5"},{"groupId":"OG003","value":"10.5"}] … "paramType":"Hazard Ratio (HR)","paramValue":"0.86","ciPctValue":"95.02","ciLowerLimit":"0.74","ciUpperLimit":"0.99" … "pValue":"0.0382" … "timeFrame":"From randomisation to individual end of observation, up to 4.6 years"',
        },
      },
    ],
  },
}
