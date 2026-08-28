import { steadyStateNoteFromHalfLifeHours } from '@/lib/background/derivations'

import type { RecordedBackgroundBySlug } from './index'

/**
 * Authored from fetched artifacts; see the authoring rules in ./index.ts.
 *
 * Slugs: acetaminophen, adalimumab, albuterol, amlodipine, amoxicillin, apixaban, aspirin,
 * atorvastatin, azithromycin, bupropion. Ashwagandha is deliberately absent: its fetched label
 * artifact is a multi-ingredient homeopathic product whose generic names do not match the
 * medicine, and the PubChem name search resolves to a single withanolide constituent rather than
 * the botanical medicine, so no module could be honestly supported.
 */
export const BACKGROUND_BATCH_1: RecordedBackgroundBySlug = {
  acetaminophen: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    registryIdentifiers: {
      pubchemCid: '1983',
      casNumber: '103-90-2',
      unii: '362O9ITL9D',
      rxcui: '161',
      source: {
        kind: 'PUBCHEM',
        identifier: '1983',
        label: 'PubChem compound record for acetaminophen (CID 1983)',
        retrievedAt: '2026-08-27',
      },
    },
  },

  adalimumab: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    pharmacokinetics: {
      routeAsRecorded: 'subcutaneous injection',
      bioavailability: {
        display: '64%',
        numeric: 64,
        unit: '%',
        populationContext: 'single 40 mg subcutaneous dose (label pharmacokinetics section)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '08dbaffe-9d05-43cf-b24b-b44ade8685fc',
          label: 'FDA prescribing information: IDACIO (adalimumab-aacf)',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt:
            'The average absolute bioavailability of adalimumab following a single 40 mg subcutaneous dose was 64%.',
        },
        concordance: 'label_only',
      },
      tMax: {
        display: '5.5 days (131 ± 56 hours)',
        numeric: 131,
        unit: 'hours',
        populationContext: 'healthy subjects, single 40 mg subcutaneous administration',
        source: {
          kind: 'FDA_LABEL',
          identifier: '08dbaffe-9d05-43cf-b24b-b44ade8685fc',
          label: 'FDA prescribing information: IDACIO (adalimumab-aacf)',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt:
            'The mean time to reach the maximum concentration was 5.5 days (131 ± 56 hours) and the maximum serum concentration was 4.7 ± 1.6 mcg/mL in healthy subjects following a single 40 mg subcutaneous administration of adalimumab.',
        },
        concordance: 'label_only',
      },
      halfLife: {
        display: 'approximately 2 weeks, ranging from 10 to 20 days across studies',
        populationContext:
          'patients with rheumatoid arthritis and healthy subjects (as recorded across studies)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '08dbaffe-9d05-43cf-b24b-b44ade8685fc',
          label: 'FDA prescribing information: IDACIO (adalimumab-aacf)',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt:
            'The mean terminal half-life was approximately 2 weeks, ranging from 10 to 20 days across studies. Healthy subjects and patients with RA displayed similar adalimumab pharmacokinetics.',
        },
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: '4.7 to 6.0 L',
        populationContext:
          'patients with rheumatoid arthritis, intravenous doses ranging from 0.25 to 10 mg/kg',
        source: {
          kind: 'FDA_LABEL',
          identifier: '08dbaffe-9d05-43cf-b24b-b44ade8685fc',
          label: 'FDA prescribing information: IDACIO (adalimumab-aacf)',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt:
            'The distribution volume (V ss ) ranged from 4.7 to 6.0 L following intravenous administration of doses ranging from 0.25 to 10 mg/kg in RA patients.',
        },
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display: 'The systemic clearance of adalimumab is approximately 12 mL/hr',
        populationContext:
          'patients with rheumatoid arthritis, single-dose intravenous studies (0.25 to 10 mg/kg)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '08dbaffe-9d05-43cf-b24b-b44ade8685fc',
          label: 'FDA prescribing information: IDACIO (adalimumab-aacf)',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt:
            'The single dose pharmacokinetics of adalimumab in RA patients were determined in several studies with intravenous doses ranging from 0.25 to 10 mg/kg. The systemic clearance of adalimumab is approximately 12 mL/hr.',
        },
        concordance: 'label_only',
      },
    },
    productVariants: [
      {
        brandName: 'IDACIO',
        formAsRecorded:
          'Injection: single-dose prefilled pen, single-dose prefilled glass syringe, or single-dose glass vial kit for institutional use',
        strengthsAsRecorded: '40 mg/0.8 mL',
        approvedUseAsRecorded:
          'Tumor necrosis factor (TNF) blocker indicated for rheumatoid arthritis, juvenile idiopathic arthritis, psoriatic arthritis, ankylosing spondylitis, Crohn’s disease, ulcerative colitis, plaque psoriasis, hidradenitis suppurativa, and uveitis (as listed in the label indications)',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription biologic; FDA label in effect 2024-10-15',
        source: {
          kind: 'FDA_LABEL',
          identifier: '08dbaffe-9d05-43cf-b24b-b44ade8685fc',
          label: 'FDA prescribing information: IDACIO (adalimumab-aacf)',
          locator: 'Section 3 Dosage Forms and Strengths',
          retrievedAt: '2026-08-27',
          excerpt:
            'IDACIO is a clear and colorless to pale yellow solution available as: • Pen (IDACIO Pen) Injection: 40 mg/0.8 mL in a single-dose pen. • Prefilled Syringe Injection: 40 mg/0.8 mL in a single-dose prefilled glass syringe. • Single-Dose Institutional Use Vial Kit Injection: 40 mg/0.8 mL in a single-dose, glass vial kit for institutional use only.',
        },
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'joints',
        actionAsRecorded:
          'Reducing signs and symptoms, inhibiting the progression of structural damage, and improving physical function in moderately to severely active rheumatoid arthritis',
        source: {
          kind: 'FDA_LABEL',
          identifier: '08dbaffe-9d05-43cf-b24b-b44ade8685fc',
          label: 'FDA prescribing information: IDACIO (adalimumab-aacf)',
          locator: 'Section 1.1 Rheumatoid Arthritis',
          retrievedAt: '2026-08-27',
          excerpt:
            'IDACIO is indicated for reducing signs and symptoms, inducing major clinical response, inhibiting the progression of structural damage, and improving physical function in adult patients with moderately to severely active rheumatoid arthritis.',
        },
      },
      {
        regionCode: 'intestines',
        actionAsRecorded:
          'Treatment of moderately to severely active Crohn’s disease and ulcerative colitis',
        source: {
          kind: 'FDA_LABEL',
          identifier: '08dbaffe-9d05-43cf-b24b-b44ade8685fc',
          label: 'FDA prescribing information: IDACIO (adalimumab-aacf)',
          locator: 'Section 1.5 Crohn’s Disease',
          retrievedAt: '2026-08-27',
          excerpt:
            'IDACIO is indicated for the treatment of moderately to severely active Crohn’s disease in adults and pediatric patients 6 years of age and older. 1.6 Ulcerative Colitis IDACIO is indicated for the treatment of moderately to severely active ulcerative colitis in adult patients.',
        },
      },
      {
        regionCode: 'skin',
        actionAsRecorded:
          'Treatment of moderate to severe chronic plaque psoriasis in candidates for systemic therapy or phototherapy',
        source: {
          kind: 'FDA_LABEL',
          identifier: '08dbaffe-9d05-43cf-b24b-b44ade8685fc',
          label: 'FDA prescribing information: IDACIO (adalimumab-aacf)',
          locator: 'Section 1.7 Plaque Psoriasis',
          retrievedAt: '2026-08-27',
          excerpt:
            'IDACIO is indicated for the treatment of adult patients with moderate to severe chronic plaque psoriasis who are candidates for systemic therapy or phototherapy, and when other systemic therapies are medically less appropriate.',
        },
      },
      {
        regionCode: 'eye',
        actionAsRecorded:
          'Treatment of non-infectious intermediate, posterior, and panuveitis in adult patients',
        source: {
          kind: 'FDA_LABEL',
          identifier: '08dbaffe-9d05-43cf-b24b-b44ade8685fc',
          label: 'FDA prescribing information: IDACIO (adalimumab-aacf)',
          locator: 'Section 1.9 Uveitis',
          retrievedAt: '2026-08-27',
          excerpt:
            'IDACIO is indicated for the treatment of non-infectious intermediate, posterior, and panuveitis in adult patients.',
        },
      },
    ],
    registryIdentifiers: {
      rxcui: '327361',
      source: {
        kind: 'RXNORM',
        identifier: '327361',
        label: 'RxNorm concept for adalimumab (RxCUI 327361)',
        retrievedAt: '2026-08-27',
      },
    },
  },

  albuterol: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    pharmacokinetics: {
      routeAsRecorded: 'oral inhalation',
      tMax: {
        display: '0.42 hours',
        numeric: 0.42,
        unit: 'hours',
        populationContext:
          '12 healthy male and female subjects, 1,080 mcg inhaled dose of albuterol base delivered with propellant HFA-134a',
        source: {
          kind: 'FDA_LABEL',
          identifier: '04c8a345-0a0d-5a01-e063-6294a90a40d2',
          label: 'FDA prescribing information: Albuterol Sulfate HFA inhalation aerosol',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt:
            'The mean time to peak concentrations (T max ) was delayed after administration of Albuterol Sulfate HFA (T max = 0.42 hours) as compared with CFC-propelled albuterol inhaler (T max = 0.17 hours).',
        },
        concordance: 'label_only',
      },
      halfLife: {
        display: 'approximately 4.6 hours',
        numeric: 4.6,
        unit: 'hours',
        populationContext:
          'healthy male and female subjects in the label’s inhalation pharmacokinetic trial',
        source: {
          kind: 'FDA_LABEL',
          identifier: '04c8a345-0a0d-5a01-e063-6294a90a40d2',
          label: 'FDA prescribing information: Albuterol Sulfate HFA inhalation aerosol',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt: 'Apparent terminal plasma half-life of albuterol is approximately 4.6 hours.',
        },
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(4.6),
    },
    productVariants: [
      {
        brandName: 'Albuterol Sulfate HFA',
        formAsRecorded: 'Inhalation aerosol (pressurized metered-dose aerosol canister)',
        strengthsAsRecorded:
          '108 mcg of albuterol sulfate (90 mcg of albuterol base) from the mouthpiece per actuation; 200 metered inhalations per canister',
        approvedUseAsRecorded:
          'Treatment or prevention of bronchospasm in adult and pediatric patients aged 4 years and older with reversible obstructive airway disease, and prevention of exercise-induced bronchospasm',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2024-12-31',
        source: {
          kind: 'FDA_LABEL',
          identifier: '04c8a345-0a0d-5a01-e063-6294a90a40d2',
          label: 'FDA prescribing information: Albuterol Sulfate HFA inhalation aerosol',
          locator: 'Section 3 Dosage Forms and Strengths',
          retrievedAt: '2026-08-27',
          excerpt:
            'Inhalation aerosol: 108 mcg of albuterol sulfate (90 mcg of albuterol base) from the mouthpiece per actuation. Blue plastic inhaler with a blue cap containing a pressurized metered-dose aerosol canister containing 200 metered inhalations and fitted with a counter.',
        },
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'lungs',
        actionAsRecorded:
          'Relaxes the smooth muscles of all airways, from the trachea to the terminal bronchioles',
        source: {
          kind: 'FDA_LABEL',
          identifier: '04c8a345-0a0d-5a01-e063-6294a90a40d2',
          label: 'FDA prescribing information: Albuterol Sulfate HFA inhalation aerosol',
          locator: 'Section 12.1 Mechanism of Action',
          retrievedAt: '2026-08-27',
          excerpt:
            'Albuterol relaxes the smooth muscles of all airways, from the trachea to the terminal bronchioles.',
        },
      },
    ],
    registryIdentifiers: {
      pubchemCid: '2083',
      casNumber: '18559-94-9',
      unii: '021SEF3731',
      rxcui: '142153',
      source: {
        kind: 'PUBCHEM',
        identifier: '2083',
        label: 'PubChem compound record for albuterol (CID 2083)',
        retrievedAt: '2026-08-27',
      },
    },
  },

  amlodipine: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    pharmacokinetics: {
      routeAsRecorded: 'oral',
      bioavailability: {
        display: 'between 64 and 90%',
        populationContext: 'after oral administration of therapeutic doses',
        source: {
          kind: 'FDA_LABEL',
          identifier: '003dd1ec-16f8-4f96-b6a8-c4689d35892a',
          label: 'FDA prescribing information: Amlodipine Besylate tablets',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt:
            'Absolute bioavailability has been estimated to be between 64 and 90%. The bioavailability of amlodipine is not altered by the presence of food.',
        },
        concordance: 'label_only',
      },
      tMax: {
        display: 'between 6 and 12 hours',
        populationContext: 'after oral administration of therapeutic doses',
        source: {
          kind: 'FDA_LABEL',
          identifier: '003dd1ec-16f8-4f96-b6a8-c4689d35892a',
          label: 'FDA prescribing information: Amlodipine Besylate tablets',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt:
            'After oral administration of therapeutic doses of amlodipine, absorption produces peak plasma concentrations between 6 and 12 hours.',
        },
        concordance: 'label_only',
      },
      halfLife: {
        display: 'about 30 to 50 hours',
        populationContext: 'adults, plasma elimination as recorded in the label',
        source: {
          kind: 'FDA_LABEL',
          identifier: '003dd1ec-16f8-4f96-b6a8-c4689d35892a',
          label: 'FDA prescribing information: Amlodipine Besylate tablets',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt:
            'Elimination from the plasma is biphasic with a terminal elimination half-life of about 30 to 50 hours. Steady-state plasma levels of amlodipine are reached after 7 to 8 days of consecutive daily dosing.',
        },
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'approximately 93%',
        numeric: 93,
        unit: '%',
        populationContext: 'hypertensive patients, ex vivo studies',
        source: {
          kind: 'FDA_LABEL',
          identifier: '003dd1ec-16f8-4f96-b6a8-c4689d35892a',
          label: 'FDA prescribing information: Amlodipine Besylate tablets',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt:
            'Ex vivo studies have shown that approximately 93% of the circulating drug is bound to plasma proteins in hypertensive patients.',
        },
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Extensively (about 90%) converted to inactive metabolites via hepatic metabolism, with 10% of the parent compound and 60% of the metabolites excreted in the urine',
        populationContext: 'as recorded in the label pharmacokinetics section',
        source: {
          kind: 'FDA_LABEL',
          identifier: '003dd1ec-16f8-4f96-b6a8-c4689d35892a',
          label: 'FDA prescribing information: Amlodipine Besylate tablets',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt:
            'Amlodipine is extensively (about 90%) converted to inactive metabolites via hepatic metabolism with 10% of the parent compound and 60% of the metabolites excreted in the urine.',
        },
        concordance: 'label_only',
      },
    },
    productVariants: [
      {
        brandName: 'Amlodipine Besylate',
        formAsRecorded: 'Tablets',
        strengthsAsRecorded: '2.5 mg, 5 mg, and 10 mg',
        approvedUseAsRecorded:
          'For the treatment of hypertension, to lower blood pressure, and for coronary artery disease (chronic stable angina, vasospastic angina, and angiographically documented coronary artery disease), alone or in combination with other antihypertensive and antianginal agents',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-04-20',
        source: {
          kind: 'FDA_LABEL',
          identifier: '003dd1ec-16f8-4f96-b6a8-c4689d35892a',
          label: 'FDA prescribing information: Amlodipine Besylate tablets',
          locator: 'Section 3 Dosage Forms and Strengths',
          retrievedAt: '2026-08-27',
          excerpt: 'Tablets: 2.5 mg, 5 mg, and 10 mg',
        },
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'blood-vessels',
        actionAsRecorded:
          'Peripheral arterial vasodilator that acts directly on vascular smooth muscle to reduce peripheral vascular resistance and blood pressure',
        source: {
          kind: 'FDA_LABEL',
          identifier: '003dd1ec-16f8-4f96-b6a8-c4689d35892a',
          label: 'FDA prescribing information: Amlodipine Besylate tablets',
          locator: 'Section 12.1 Mechanism of Action',
          retrievedAt: '2026-08-27',
          excerpt:
            'Amlodipine is a peripheral arterial vasodilator that acts directly on vascular smooth muscle to cause a reduction in peripheral vascular resistance and reduction in blood pressure.',
        },
      },
      {
        regionCode: 'heart',
        actionAsRecorded:
          'In exertional angina, reduces the total peripheral resistance (afterload) against which the heart works and thus myocardial oxygen demand',
        source: {
          kind: 'FDA_LABEL',
          identifier: '003dd1ec-16f8-4f96-b6a8-c4689d35892a',
          label: 'FDA prescribing information: Amlodipine Besylate tablets',
          locator: 'Section 12.1 Mechanism of Action',
          retrievedAt: '2026-08-27',
          excerpt:
            'In patients with exertional angina, amlodipine reduces the total peripheral resistance (afterload) against which the heart works and reduces the rate pressure product, and thus myocardial oxygen demand, at any given level of exercise.',
        },
      },
    ],
    registryIdentifiers: {
      pubchemCid: '2162',
      casNumber: '88150-42-9',
      unii: '864V2Q084H',
      rxcui: '104416',
      source: {
        kind: 'PUBCHEM',
        identifier: '2162',
        label: 'PubChem compound record for amlodipine (CID 2162)',
        retrievedAt: '2026-08-27',
      },
    },
  },

  amoxicillin: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    pharmacokinetics: {
      routeAsRecorded: 'oral (oral suspension)',
      tMax: {
        display: '2.0 (1.0 to 4.0) hours',
        numeric: 2,
        unit: 'hours',
        populationContext:
          'amoxicillin component in pediatric patients 8 months to 11 years given amoxicillin and clavulanate potassium oral suspension, 45 mg/kg every 12 hours with a snack or meal',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00b86913-50c8-443f-8467-f4f499d358af',
          label:
            'FDA prescribing information: amoxicillin and clavulanate potassium for oral suspension',
          locator: 'Section 12.3 Pharmacokinetics, Table 3',
          retrievedAt: '2026-08-27',
          excerpt:
            'Parameter Amoxicillin Clavulanate C max (mcg/mL) 15.7 ± 7.7 1.7 ± 0.9 T max (hr) 2.0 (1.0 to 4.0) 1.1 (1.0 to 4.0) AUC 0-T (mcg * hr/mL) 59.8 ± 20.0 4.0 ± 1.9 T 1/2 (hr) 1.4 ± 0.3 1.1 ± 0.3',
        },
        concordance: 'label_only',
      },
      halfLife: {
        display: '1.4 ± 0.3 hours',
        numeric: 1.4,
        unit: 'hours',
        populationContext:
          'amoxicillin component in pediatric patients 8 months to 11 years given amoxicillin and clavulanate potassium oral suspension, 45 mg/kg every 12 hours with a snack or meal',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00b86913-50c8-443f-8467-f4f499d358af',
          label:
            'FDA prescribing information: amoxicillin and clavulanate potassium for oral suspension',
          locator: 'Section 12.3 Pharmacokinetics, Table 3',
          retrievedAt: '2026-08-27',
          excerpt:
            'Parameter Amoxicillin Clavulanate C max (mcg/mL) 15.7 ± 7.7 1.7 ± 0.9 T max (hr) 2.0 (1.0 to 4.0) 1.1 (1.0 to 4.0) AUC 0-T (mcg * hr/mL) 59.8 ± 20.0 4.0 ± 1.9 T 1/2 (hr) 1.4 ± 0.3 1.1 ± 0.3',
        },
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'approximately 18% bound',
        numeric: 18,
        unit: '%',
        populationContext: 'amoxicillin component, binding to human serum as recorded',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00b86913-50c8-443f-8467-f4f499d358af',
          label:
            'FDA prescribing information: amoxicillin and clavulanate potassium for oral suspension',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt:
            'clavulanic acid has been found to be approximately 25% bound to human serum and amoxicillin approximately 18% bound.',
        },
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Approximately 50% to 70% of the amoxicillin excreted unchanged in urine during the first 6 hours after administration',
        populationContext:
          'after administration of 10 mL of amoxicillin and clavulanate potassium, 250 mg/62.5 mg per 5 mL suspension',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00b86913-50c8-443f-8467-f4f499d358af',
          label:
            'FDA prescribing information: amoxicillin and clavulanate potassium for oral suspension',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt:
            'Approximately 50% to 70% of the amoxicillin and approximately 25% to 40% of the clavulanic acid are excreted unchanged in urine during the first 6 hours after administration of 10 mL of amoxicillin and clavulanate potassium, 250 mg/62.5 mg per 5 mL suspension.',
        },
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(1.4),
    },
    registryIdentifiers: {
      pubchemCid: '33613',
      casNumber: '26787-78-0',
      unii: '804826J2HU',
      rxcui: '133008',
      source: {
        kind: 'PUBCHEM',
        identifier: '33613',
        label: 'PubChem compound record for amoxicillin (CID 33613)',
        retrievedAt: '2026-08-27',
      },
    },
  },

  apixaban: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    pharmacokinetics: {
      routeAsRecorded: 'oral',
      bioavailability: {
        display: 'approximately 50%',
        numeric: 50,
        unit: '%',
        populationContext: 'doses up to 10 mg of apixaban',
        source: {
          kind: 'FDA_LABEL',
          identifier: '095a08ac-cf0e-497e-a682-ddef38d6b29c',
          label: 'FDA prescribing information: apixaban tablets',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt:
            'The absolute bioavailability of apixaban is approximately 50% for doses up to 10 mg of apixaban.',
        },
        concordance: 'label_only',
      },
      tMax: {
        display: '3 to 4 hours',
        populationContext: 'after oral administration of apixaban',
        source: {
          kind: 'FDA_LABEL',
          identifier: '095a08ac-cf0e-497e-a682-ddef38d6b29c',
          label: 'FDA prescribing information: apixaban tablets',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt:
            'Maximum concentrations (Cmax) of apixaban appear 3 to 4 hours after oral administration of apixaban.',
        },
        concordance: 'label_only',
      },
      halfLife: {
        display: 'approximately 12 hours',
        numeric: 12,
        unit: 'hours',
        populationContext: 'following oral administration',
        source: {
          kind: 'FDA_LABEL',
          identifier: '095a08ac-cf0e-497e-a682-ddef38d6b29c',
          label: 'FDA prescribing information: apixaban tablets',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt:
            'Apixaban has a total clearance of approximately 3.3 L/hour and an apparent half-life of approximately 12 hours following oral administration.',
        },
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'approximately 87%',
        numeric: 87,
        unit: '%',
        populationContext: 'plasma protein binding in humans',
        source: {
          kind: 'FDA_LABEL',
          identifier: '095a08ac-cf0e-497e-a682-ddef38d6b29c',
          label: 'FDA prescribing information: apixaban tablets',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt: 'Plasma protein binding in humans is approximately 87%.',
        },
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: 'approximately 21 liters',
        numeric: 21,
        unit: 'L',
        populationContext: 'humans (label pharmacokinetics section)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '095a08ac-cf0e-497e-a682-ddef38d6b29c',
          label: 'FDA prescribing information: apixaban tablets',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt: 'The volume of distribution (Vss) is approximately 21 liters.',
        },
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Metabolized mainly via CYP3A4 with minor contributions from CYP1A2, 2C8, 2C9, 2C19, and 2J2; unchanged apixaban is the major drug-related component in human plasma',
        populationContext: 'humans (label pharmacokinetics section)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '095a08ac-cf0e-497e-a682-ddef38d6b29c',
          label: 'FDA prescribing information: apixaban tablets',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt:
            'Apixaban is metabolized mainly via CYP3A4 with minor contributions from CYP1A2, 2C8, 2C9, 2C19, and 2J2. O-demethylation and hydroxylation at the 3-oxopiperidinyl moiety are the major sites of biotransformation. Unchanged apixaban is the major drug-related component in human plasma; there are no active circulating metabolites.',
        },
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Eliminated in both urine and feces; renal excretion accounts for about 27% of total clearance',
        populationContext: 'humans (label pharmacokinetics section)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '095a08ac-cf0e-497e-a682-ddef38d6b29c',
          label: 'FDA prescribing information: apixaban tablets',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt:
            'Apixaban is eliminated in both urine and feces. Renal excretion accounts for about 27% of total clearance.',
        },
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(12),
    },
    productVariants: [
      {
        brandName: 'Apixaban',
        formAsRecorded: 'Tablets (film coated)',
        strengthsAsRecorded: '2.5 mg and 5 mg',
        approvedUseAsRecorded:
          'Factor Xa inhibitor indicated to reduce the risk of stroke and systemic embolism in nonvalvular atrial fibrillation; for prophylaxis of deep vein thrombosis (DVT) following hip or knee replacement surgery; and for treatment of DVT and pulmonary embolism (PE) and reduction in the risk of recurrent DVT and PE following initial therapy',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2021-06-15',
        source: {
          kind: 'FDA_LABEL',
          identifier: '095a08ac-cf0e-497e-a682-ddef38d6b29c',
          label: 'FDA prescribing information: apixaban tablets',
          locator: 'Section 3 Dosage Forms and Strengths',
          retrievedAt: '2026-08-27',
          excerpt: 'Tablets: 2.5 mg and 5 mg',
        },
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'blood-vessels',
        actionAsRecorded:
          'Factor Xa inhibitor; reduces the risk of stroke and systemic embolism in nonvalvular atrial fibrillation',
        source: {
          kind: 'FDA_LABEL',
          identifier: '095a08ac-cf0e-497e-a682-ddef38d6b29c',
          label: 'FDA prescribing information: apixaban tablets',
          locator: 'Section 1 Indications and Usage',
          retrievedAt: '2026-08-27',
          excerpt:
            'Apixaban is a factor Xa inhibitor indicated: to reduce the risk of stroke and systemic embolism in patients with nonvalvular atrial fibrillation.',
        },
      },
    ],
    applicability: {
      trialIdentifier: 'NCT00412984',
      includedAsRecorded: [
        'Males and females ≥ 18 yrs with atrial fibrillation (AF) and one or more of the following risk factors for stroke:',
        'Age ≥ 75, previous stroke',
        'transient ischemic attack (TIA) or Systemic Embolism (SE)',
        'Symptomatic congestive heart failure or left ventricular dysfunction with left ventricular ejection fraction (LVEF) ≤ 40%',
        'Diabetes mellitus or hypertension requiring pharmacological treatment',
      ],
      excludedAsRecorded: [],
      source: {
        kind: 'CLINICALTRIALS',
        identifier: 'NCT00412984',
        label:
          'ClinicalTrials.gov record NCT00412984 (ARISTOTLE): Apixaban for the Prevention of Stroke in Subjects With Atrial Fibrillation',
        locator: 'Eligibility criteria',
        retrievedAt: '2026-08-27',
        excerpt:
          'Inclusion Criteria:\n\n* Males and females ≥ 18 yrs with atrial fibrillation (AF) and one or more of the following risk factors for stroke:\n* Age ≥ 75, previous stroke\n* transient ischemic attack (TIA) or Systemic Embolism (SE)\n* Symptomatic congestive heart failure or left ventricular dysfunction with left ventricular ejection fraction (LVEF) ≤ 40%',
      },
    },
    registryIdentifiers: {
      pubchemCid: '10182969',
      casNumber: '503612-47-3',
      unii: '3Z9Y7UWC1J',
      rxcui: '1364430',
      source: {
        kind: 'PUBCHEM',
        identifier: '10182969',
        label: 'PubChem compound record for apixaban (CID 10182969)',
        retrievedAt: '2026-08-27',
      },
    },
  },

  aspirin: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    registryIdentifiers: {
      pubchemCid: '2244',
      casNumber: '50-78-2',
      unii: 'R16CO5Y76E',
      rxcui: '1191',
      source: {
        kind: 'PUBCHEM',
        identifier: '2244',
        label: 'PubChem compound record for aspirin (CID 2244)',
        retrievedAt: '2026-08-27',
      },
    },
  },

  atorvastatin: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    pharmacokinetics: {
      routeAsRecorded: 'oral',
      bioavailability: {
        display: 'approximately 14%',
        numeric: 14,
        unit: '%',
        populationContext: 'parent drug, after oral administration',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00afce9b-48c9-487a-a738-e359c005c707',
          label: 'FDA prescribing information: Atorvastatin calcium tablets',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt:
            'The absolute bioavailability of atorvastatin (parent drug) is approximately 14% and the systemic availability of HMG-CoA reductase inhibitory activity is approximately 30%.',
        },
        concordance: 'label_only',
      },
      tMax: {
        display: 'within 1 to 2 hours',
        populationContext: 'after oral administration',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00afce9b-48c9-487a-a738-e359c005c707',
          label: 'FDA prescribing information: Atorvastatin calcium tablets',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt:
            'Atorvastatin is rapidly absorbed after oral administration; maximum plasma concentrations occur within 1 to 2 hours.',
        },
        concordance: 'label_only',
      },
      halfLife: {
        display: 'approximately 14 hours',
        numeric: 14,
        unit: 'hours',
        populationContext: 'humans, plasma elimination of parent atorvastatin',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00afce9b-48c9-487a-a738-e359c005c707',
          label: 'FDA prescribing information: Atorvastatin calcium tablets',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt:
            'Mean plasma elimination half-life of atorvastatin in humans is approximately 14 hours, but the half-life of inhibitory activity for HMG-CoA reductase is 20 to 30 hours due to the contribution of active metabolites.',
        },
        concordance: 'label_only',
      },
      proteinBinding: {
        display: '≥98%',
        numeric: 98,
        unit: '%',
        populationContext: 'binding to plasma proteins as recorded in the label',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00afce9b-48c9-487a-a738-e359c005c707',
          label: 'FDA prescribing information: Atorvastatin calcium tablets',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt: 'Atorvastatin is ≥98% bound to plasma proteins.',
        },
        concordance: 'label_only',
      },
      volumeOfDistribution: {
        display: 'approximately 381 liters',
        numeric: 381,
        unit: 'L',
        populationContext: 'mean value as recorded in the label pharmacokinetics section',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00afce9b-48c9-487a-a738-e359c005c707',
          label: 'FDA prescribing information: Atorvastatin calcium tablets',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt: 'Mean volume of distribution of atorvastatin is approximately 381 liters.',
        },
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Extensively metabolized to ortho- and parahydroxylated derivatives and various beta-oxidation products',
        populationContext: 'as recorded in the label pharmacokinetics section',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00afce9b-48c9-487a-a738-e359c005c707',
          label: 'FDA prescribing information: Atorvastatin calcium tablets',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt:
            'Atorvastatin is extensively metabolized to ortho- and parahydroxylated derivatives and various beta-oxidation products.',
        },
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Eliminated primarily in bile following hepatic and/or extra-hepatic metabolism, without apparent enterohepatic recirculation',
        populationContext: 'as recorded in the label pharmacokinetics section',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00afce9b-48c9-487a-a738-e359c005c707',
          label: 'FDA prescribing information: Atorvastatin calcium tablets',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt:
            'Atorvastatin and its metabolites are eliminated primarily in bile following hepatic and/or extra-hepatic metabolism; however, the drug does not appear to undergo enterohepatic recirculation.',
        },
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(14),
    },
    productVariants: [
      {
        brandName: 'Atorvastatin calcium',
        formAsRecorded: 'Tablets (film-coated)',
        strengthsAsRecorded: '10 mg; 20 mg; 40 mg; 80 mg of atorvastatin',
        approvedUseAsRecorded:
          'To reduce the risk of cardiovascular events in adults with risk factors for or with established coronary heart disease, and as an adjunct to diet to reduce low-density lipoprotein cholesterol (LDL-C) in primary hyperlipidemia and other lipid disorders (as listed in the label indications)',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2025-08-28',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00afce9b-48c9-487a-a738-e359c005c707',
          label: 'FDA prescribing information: Atorvastatin calcium tablets',
          locator: 'Section 3 Dosage Forms and Strengths',
          retrievedAt: '2026-08-27',
          excerpt: 'Tablets: 10 mg; 20 mg; 40 mg; 80 mg of atorvastatin',
        },
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'liver',
        actionAsRecorded:
          'The liver is the primary site of action and the principal site of cholesterol synthesis and LDL clearance',
        source: {
          kind: 'FDA_LABEL',
          identifier: '00afce9b-48c9-487a-a738-e359c005c707',
          label: 'FDA prescribing information: Atorvastatin calcium tablets',
          locator: 'Section 12.2 Pharmacodynamics',
          retrievedAt: '2026-08-27',
          excerpt:
            'The liver is the primary site of action and the principal site of cholesterol synthesis and LDL clearance.',
        },
      },
    ],
    registryIdentifiers: {
      pubchemCid: '60823',
      casNumber: '134523-00-5',
      unii: '48A5M73Z4Q',
      rxcui: '83367',
      source: {
        kind: 'PUBCHEM',
        identifier: '60823',
        label: 'PubChem compound record for atorvastatin (CID 60823)',
        retrievedAt: '2026-08-27',
      },
    },
  },

  azithromycin: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    pharmacokinetics: {
      routeAsRecorded: 'oral',
      bioavailability: {
        display: '38%',
        numeric: 38,
        unit: '%',
        populationContext: 'azithromycin 250 mg capsules',
        source: {
          kind: 'FDA_LABEL',
          identifier: '003307c5-3f73-4a5d-a704-bfdea3c656e8',
          label: 'FDA prescribing information: Azithromycin tablets',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt: 'The absolute bioavailability of azithromycin 250 mg capsules is 38%.',
        },
        concordance: 'label_only',
      },
      tMax: {
        display: '2.2 (0.9) hours',
        numeric: 2.2,
        unit: 'hours',
        populationContext:
          '36 fasted healthy male volunteers, single 500 mg oral dose (two 250 mg tablets)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '003307c5-3f73-4a5d-a704-bfdea3c656e8',
          label: 'FDA prescribing information: Azithromycin tablets',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt:
            'Following oral administration of a single 500 mg dose (two 250 mg tablets) to 36 fasted healthy male volunteers, the mean (SD) pharmacokinetic parameters were AUC 0-72 =4.3 (1.2) mcg·hr/mL; C max =0.5 (0.2) mcg/mL; T max =2.2 (0.9) hours.',
        },
        concordance: 'label_only',
      },
      halfLife: {
        display: '68 hr',
        numeric: 68,
        unit: 'hours',
        populationContext: 'terminal elimination following single 500 mg oral and IV doses',
        source: {
          kind: 'FDA_LABEL',
          identifier: '003307c5-3f73-4a5d-a704-bfdea3c656e8',
          label: 'FDA prescribing information: Azithromycin tablets',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt:
            'Plasma concentrations of azithromycin following single 500 mg oral and IV doses declined in a polyphasic pattern resulting in a mean apparent plasma clearance of 630 mL/min and terminal elimination half-life of 68 hr.',
        },
        concordance: 'label_only',
      },
      proteinBinding: {
        display: 'from 51% at 0.02 mcg/mL to 7% at 2 mcg/mL',
        populationContext: 'serum, concentration range approximating human exposure',
        source: {
          kind: 'FDA_LABEL',
          identifier: '003307c5-3f73-4a5d-a704-bfdea3c656e8',
          label: 'FDA prescribing information: Azithromycin tablets',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt:
            'The serum protein binding of azithromycin is variable in the concentration range approximating human exposure, decreasing from 51% at 0.02 mcg/mL to 7% at 2 mcg/mL.',
        },
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'In vitro and in vivo studies to assess the metabolism of azithromycin have not been performed',
        populationContext: 'as recorded in the label pharmacokinetics section',
        source: {
          kind: 'FDA_LABEL',
          identifier: '003307c5-3f73-4a5d-a704-bfdea3c656e8',
          label: 'FDA prescribing information: Azithromycin tablets',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt:
            'In vitro and in vivo studies to assess the metabolism of azithromycin have not been performed.',
        },
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          'Biliary excretion, predominantly as unchanged drug, is a major route of elimination; approximately 6% of the administered dose appears as unchanged drug in urine over a week',
        populationContext: 'as recorded in the label pharmacokinetics section',
        source: {
          kind: 'FDA_LABEL',
          identifier: '003307c5-3f73-4a5d-a704-bfdea3c656e8',
          label: 'FDA prescribing information: Azithromycin tablets',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt:
            'Biliary excretion of azithromycin, predominantly as unchanged drug, is a major route of elimination. Over the course of a week, approximately 6% of the administered dose appears as unchanged drug in urine.',
        },
        concordance: 'label_only',
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(68),
    },
    productVariants: [
      {
        brandName: 'Azithromycin',
        formAsRecorded: 'Tablets (film-coated)',
        strengthsAsRecorded: '250 mg and 500 mg',
        approvedUseAsRecorded:
          'Macrolide antibacterial drug indicated for mild to moderate infections caused by designated, susceptible bacteria, including acute bacterial exacerbations of chronic bronchitis, acute bacterial sinusitis, uncomplicated skin and skin structure infections, urethritis and cervicitis, genital ulcer disease, acute otitis media, community-acquired pneumonia, and pharyngitis/tonsillitis',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-03-16',
        source: {
          kind: 'FDA_LABEL',
          identifier: '003307c5-3f73-4a5d-a704-bfdea3c656e8',
          label: 'FDA prescribing information: Azithromycin tablets',
          locator: 'Section 3 Dosage Forms and Strengths',
          retrievedAt: '2026-08-27',
          excerpt: 'Azithromycin tablets USP 250 mg and 500 mg',
        },
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'lungs',
        actionAsRecorded:
          'Indicated for community-acquired pneumonia caused by designated, susceptible bacteria',
        source: {
          kind: 'FDA_LABEL',
          identifier: '003307c5-3f73-4a5d-a704-bfdea3c656e8',
          label: 'FDA prescribing information: Azithromycin tablets',
          locator: 'Section 1 Indications and Usage',
          retrievedAt: '2026-08-27',
          excerpt:
            'Community-acquired pneumonia in adults and pediatric patients (6 months of age and older)',
        },
      },
      {
        regionCode: 'skin',
        actionAsRecorded:
          'Indicated for uncomplicated skin and skin structure infections caused by designated, susceptible bacteria',
        source: {
          kind: 'FDA_LABEL',
          identifier: '003307c5-3f73-4a5d-a704-bfdea3c656e8',
          label: 'FDA prescribing information: Azithromycin tablets',
          locator: 'Section 1 Indications and Usage',
          retrievedAt: '2026-08-27',
          excerpt: 'Uncomplicated skin and skin structure infections in adults',
        },
      },
      {
        regionCode: 'mouth-throat',
        actionAsRecorded:
          'Indicated for pharyngitis/tonsillitis caused by designated, susceptible bacteria',
        source: {
          kind: 'FDA_LABEL',
          identifier: '003307c5-3f73-4a5d-a704-bfdea3c656e8',
          label: 'FDA prescribing information: Azithromycin tablets',
          locator: 'Section 1 Indications and Usage',
          retrievedAt: '2026-08-27',
          excerpt:
            'Pharyngitis/tonsillitis in adults and pediatric patients (2 years of age and older)',
        },
      },
    ],
    registryIdentifiers: {
      pubchemCid: '447043',
      casNumber: '83905-01-5',
      unii: '5FD1131I7S',
      rxcui: '1298839',
      source: {
        kind: 'PUBCHEM',
        identifier: '447043',
        label: 'PubChem compound record for azithromycin (CID 447043)',
        retrievedAt: '2026-08-27',
      },
    },
  },

  bupropion: {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    pharmacokinetics: {
      routeAsRecorded: 'oral',
      tMax: {
        display: 'approximately 5 hours',
        numeric: 5,
        unit: 'hours',
        populationContext:
          'healthy volunteers, single oral dose of bupropion hydrochloride extended-release tablets (XL)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '004d8121-59d4-46c4-acb8-b2dd097bf556',
          label: 'FDA prescribing information: Bupropion Hydrochloride XL extended-release tablets',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt:
            'Following single oral administration of bupropion hydrochloride extended-release tablets (XL) to healthy volunteers, the median time to peak plasma concentrations for bupropion was approximately 5 hours.',
        },
        concordance: 'label_only',
      },
      halfLife: {
        display: '21 (±9) hours',
        numeric: 21,
        unit: 'hours',
        populationContext: 'chronic dosing, mean elimination half-life as recorded',
        source: {
          kind: 'FDA_LABEL',
          identifier: '004d8121-59d4-46c4-acb8-b2dd097bf556',
          label: 'FDA prescribing information: Bupropion Hydrochloride XL extended-release tablets',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt:
            'Following chronic dosing, the mean steady-state plasma concentration of bupropion was reached within 8 days. The mean elimination half-life (±SD) of bupropion is 21 (±9) hours.',
        },
        concordance: 'label_only',
      },
      proteinBinding: {
        display: '84%',
        numeric: 84,
        unit: '%',
        populationContext: 'in vitro, human plasma proteins at concentrations up to 200 mcg/mL',
        source: {
          kind: 'FDA_LABEL',
          identifier: '004d8121-59d4-46c4-acb8-b2dd097bf556',
          label: 'FDA prescribing information: Bupropion Hydrochloride XL extended-release tablets',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt:
            'In vitro tests show that bupropion is 84% bound to human plasma proteins at concentrations up to 200 mcg/mL.',
        },
        concordance: 'label_only',
      },
      metabolismAsRecorded: {
        display:
          'Extensively metabolized in humans; three metabolites are active: hydroxybupropion and the amino-alcohol isomers threohydrobupropion and erythrohydrobupropion',
        populationContext: 'humans (label pharmacokinetics section)',
        source: {
          kind: 'FDA_LABEL',
          identifier: '004d8121-59d4-46c4-acb8-b2dd097bf556',
          label: 'FDA prescribing information: Bupropion Hydrochloride XL extended-release tablets',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt:
            'Bupropion is extensively metabolized in humans. Three metabolites are active: hydroxybupropion, which is formed via hydroxylation of the tert -butyl group of bupropion, and the amino-alcohol isomers threohydrobupropion and erythrohydrobupropion, which are formed via reduction of the carbonyl group.',
        },
        concordance: 'label_only',
      },
      eliminationAsRecorded: {
        display:
          '87% and 10% of the radioactive dose recovered in the urine and feces, respectively; only 0.5% of the oral dose excreted as unchanged bupropion',
        populationContext: 'humans, oral administration of 200 mg of 14C-bupropion',
        source: {
          kind: 'FDA_LABEL',
          identifier: '004d8121-59d4-46c4-acb8-b2dd097bf556',
          label: 'FDA prescribing information: Bupropion Hydrochloride XL extended-release tablets',
          locator: 'Section 12.3 Pharmacokinetics',
          retrievedAt: '2026-08-27',
          excerpt:
            'Following oral administration of 200 mg of 14 C-bupropion in humans, 87% and 10% of the radioactive dose were recovered in the urine and feces, respectively. Only 0.5% of the oral dose was excreted as unchanged bupropion.',
        },
        concordance: 'label_only',
      },
    },
    titration: {
      basis: 'LABEL_SCHEDULE',
      steps: [
        {
          order: 1,
          periodAsRecorded: 'Starting dose (major depressive disorder)',
          amountAsRecorded: '150 mg once daily in the morning',
        },
        {
          order: 2,
          periodAsRecorded: 'After 4 days of dosing',
          amountAsRecorded: '300 mg once daily in the morning',
          purposeAsRecorded: 'Target dose as stated in the label schedule',
        },
      ],
      source: {
        kind: 'FDA_LABEL',
        identifier: '004d8121-59d4-46c4-acb8-b2dd097bf556',
        label: 'FDA prescribing information: Bupropion Hydrochloride XL extended-release tablets',
        locator: 'Section 2.2 Dosage for Major Depressive Disorder (MDD)',
        retrievedAt: '2026-08-27',
        excerpt:
          'The recommended starting dose for MDD is 150 mg once daily in the morning. After 4 days of dosing, the dose may be increased to the target dose of 300 mg once daily in the morning.',
      },
    },
    productVariants: [
      {
        brandName: 'buPropion Hydrochloride XL',
        formAsRecorded: 'Extended-release tablets',
        strengthsAsRecorded: '150 mg, 300 mg',
        approvedUseAsRecorded:
          'An aminoketone antidepressant indicated for treatment of major depressive disorder (MDD) and prevention of seasonal affective disorder (SAD)',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Prescription product; FDA label in effect 2025-11-25',
        source: {
          kind: 'FDA_LABEL',
          identifier: '004d8121-59d4-46c4-acb8-b2dd097bf556',
          label: 'FDA prescribing information: Bupropion Hydrochloride XL extended-release tablets',
          locator: 'Section 3 Dosage Forms and Strengths',
          retrievedAt: '2026-08-27',
          excerpt: 'Extended-release tablets: 150 mg, 300 mg',
        },
      },
    ],
    registryIdentifiers: {
      pubchemCid: '444',
      casNumber: '34911-55-2',
      unii: 'ZG7E5POY8O',
      rxcui: '203204',
      source: {
        kind: 'PUBCHEM',
        identifier: '444',
        label: 'PubChem compound record for bupropion (CID 444)',
        retrievedAt: '2026-08-27',
      },
    },
  },
}
