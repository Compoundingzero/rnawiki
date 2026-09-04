import 'dotenv/config'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { Pool } from 'pg'

import { databaseSslConfig } from '@/db/ssl'
import { CONTROLLED_PSYCHOACTIVE_DOSSIERS } from '@/scripts/seed-data/controlled-psychoactive'
import { PEPTIDE_DOSSIERS } from '@/scripts/seed-data/peptide'
import { PERFORMANCE_AND_GREY_MARKET_DOSSIERS } from '@/scripts/seed-data/performance-and-grey-market'

/**
 * PHASE 1 — classify every canonical record against the biohacker-audience signals.
 *
 * This is a screen, not a judgement. Every boolean below is a deterministic rule over values that
 * are already stored, and every record carries the exact evidence that set each boolean so a person
 * can disagree with the rule rather than with an opaque score. Nothing here reads a conclusion into
 * a record: a keyword in a label indication means the label says that word, and nothing more.
 *
 * What is NOT derivable is stated rather than approximated. There is no preclinical evidence store
 * in this corpus (ClinicalTrials.gov registers human studies only and the PubMed query is filtered
 * to `clinical trial[pt]`), no non-US regulatory record, and no stored trial-dose value. Records
 * with nothing recorded are counted as unrecorded, never inferred — in particular a supplement with
 * no listed route is route-unrecorded, not "probably oral".
 *
 *   npx tsx scripts/biohacker-pivot/phase1-classify.ts [--force]
 */

const OUT_DIR = join(process.cwd(), 'data', 'biohacker-pivot')
const RECORDS_PATH = join(OUT_DIR, 'phase1-records.ndjson')
const SUMMARY_PATH = join(OUT_DIR, 'phase1-summary.json')
const STATE_PATH = join(OUT_DIR, 'state.json')

// --- rules, as explicit constants ----------------------------------------------------------------

/**
 * Category lexicon. One list per audience category; a record joins a category when any term appears
 * as a whole word, case-insensitively, in any of the classified text fields.
 *
 * MATCHING RULE. A term matches only when the character on each side is neither a letter nor a
 * digit. So `sleep` matches "sleep quality" and "poor sleep." but NOT "asleep" or "sleeping", and
 * `cox-2` matches "COX-2 inhibitor" because the hyphen is not a letter or digit. Substring matching
 * was rejected outright: it turned `sleep` into "asleep", `aging` into "packaging" and `focus` into
 * ordinary trial prose ("focus of study").
 *
 * TERMS DELIBERATELY LEFT OUT, each because a probe over the real corpus text showed it misfires:
 *   focus            — matched "focus of study: pharmacokinetics" in registry conditions
 *   memory           — matched "memory functions" as an unrelated trial condition on 123 records
 *   lipid            — matched liposomal formulations (amphotericin B, doxorubicin)
 *   aging            — matched sunscreen labels ("premature aging of the skin") on 52 records
 *   premature aging  — removed for the same measured reason as `aging`: it matched the cosmetic
 *                      copy on Butyloctyl, Copper Tripeptide-1 and Chrysanthellum Indicum
 *   age-related      — matched age-related macular degeneration, an ophthalmology indication
 *   fatigue          — matched adverse-event and condition prose on 502 records
 *   peptide          — matched "organic anion transporting polypeptide" (a transporter, not a drug)
 *   hormone (bare)   — matched the FDA class string "Corticosteroid Hormone Receptor Agonists
 *                      [MoA]" on topical steroids and "hormone receptor-positive" breast-cancer
 *                      indications; replaced by the specific phrases below
 *   caloric restriction — matched appetite suppressants, which is metabolic, not longevity
 *   exercise capacity   — matched pulmonary-hypertension endpoints, not performance use
 *
 * FIELD-RESTRICTED TERMS. A few terms are real audience vocabulary in a label indication and pure
 * artefact in mechanism prose, because mechanism text explains a pharmacology rather than naming a
 * use. Those terms carry an explicit allowed-field list in TERM_ALLOWED_FIELDS below; everywhere
 * else a term is matched in every classified field.
 */
const CATEGORY_LEXICON = {
  'nootropics-cognition': [
    'nootropic',
    'cognition',
    'cognitive function',
    'cognitive performance',
    'cognitive impairment',
    'cognitive decline',
    'memory loss',
    'loss of memory',
    'memory impairment',
    'working memory',
    'alzheimer',
    'dementia',
    'adhd',
    'attention deficit',
    'acetylcholinesterase',
    'mental clarity',
    'mental fatigue',
    'alertness',
    'wakefulness',
    'brain fog',
  ],
  'metabolic-glucose': [
    'insulin resistance',
    'insulin sensitivity',
    'insulin secretion',
    'blood glucose',
    'blood sugar',
    'glycemic control',
    'glycaemic control',
    'glucose tolerance',
    'hyperglycemia',
    'hba1c',
    'prediabetes',
    'type 2 diabetes',
    'type ii diabetes',
    'diabetes mellitus',
    'metabolic syndrome',
    'obesity',
    'weight loss',
    'body weight',
    'hyperlipidemia',
    'dyslipidemia',
    'hypercholesterolemia',
    'fatty liver',
    'nonalcoholic steatohepatitis',
    'glp-1',
    'sglt2',
    'dpp-4',
  ],
  'sleep-circadian': [
    'sleep',
    'sleeplessness',
    'insomnia',
    'sleep quality',
    'sleep aid',
    'sleep apnea',
    'circadian',
    'melatonin',
    'jet lag',
    'narcolepsy',
    'restless legs',
    'hypnotic',
    'orexin',
  ],
  'hormones-endocrine': [
    'hormone replacement',
    'hormone therapy',
    'endocrine',
    'testosterone',
    'estrogen',
    'oestrogen',
    'androgen',
    'progesterone',
    'thyroid',
    'cortisol',
    'adrenal',
    'menopause',
    'hypogonadism',
    'growth hormone',
    'dhea',
    'prolactin',
    'luteinizing hormone',
    'follicle stimulating hormone',
  ],
  peptides: [
    'peptide hormone',
    'glucagon-like peptide',
    'growth hormone secretagogue',
    'melanocortin',
  ],
  'senolytics-longevity': [
    'senolytic',
    'senescence',
    'senescent',
    'longevity',
    'anti-aging',
    'telomere',
    'healthspan',
    'lifespan',
    'geroprotector',
    'rapamycin',
    'sirolimus',
    'mtor',
    'resveratrol',
    'spermidine',
    'nicotinamide riboside',
    'nicotinamide mononucleotide',
  ],
  mitochondrial: [
    'mitochondria',
    'mitochondrial',
    'oxidative phosphorylation',
    'electron transport chain',
    'coenzyme q10',
    'ubiquinone',
    'ubiquinol',
    'carnitine',
    'alpha-lipoic acid',
    'pyrroloquinoline quinone',
  ],
  'anti-inflammatory': [
    'anti-inflammatory',
    'antiinflammatory',
    'inflammation',
    'nsaid',
    'cox-2',
    'cyclooxygenase',
    'rheumatoid arthritis',
    'osteoarthritis',
    'inflammatory bowel disease',
    'ulcerative colitis',
    'crohn',
    'cytokine',
    'interleukin',
    'tumor necrosis factor',
    'tnf-alpha',
    'c-reactive protein',
    'oxidative stress',
    'antioxidant',
  ],
  'performance-recovery': [
    'exercise performance',
    'athletic performance',
    'physical performance',
    'ergogenic',
    'endurance',
    'stamina',
    'muscle mass',
    'lean body mass',
    'muscle strength',
    'muscle wasting',
    'muscle soreness',
    'muscle recovery',
    'sarcopenia',
    'anabolic',
    'resistance training',
    'creatine',
    'beta-alanine',
  ],
  /**
   * IN SCOPE, AND DELIBERATELY WITHOUT A KEYWORD LEXICON. The controlled psychoactives this
   * audience discusses — psilocybin, LSD, MDMA, ketamine, ibogaine, kratom — carry no shared
   * vocabulary in stored label or registry text, and the obvious keywords ("depression", "anxiety",
   * "psychedelic", "hallucinogen") match every antidepressant and antipsychotic indication in the
   * corpus, which is a different population. The category is therefore populated only by the
   * hand-curated controlled-psychoactive seed file, and the emptiness of this list is the honest
   * statement that no text screen for it was found that does not misfire.
   */
  'psychoactive-mood': [],
} as const satisfies Record<string, readonly string[]>

type CategoryId = keyof typeof CATEGORY_LEXICON
const CATEGORY_IDS = Object.keys(CATEGORY_LEXICON) as CategoryId[]

/** The classified text fields, named once so the field restrictions below can refer to them. */
const ALL_TEXT_FIELDS = [
  'name',
  'indication',
  'patientFriendlyIndication',
  'recordedUses',
  'mechanism',
  'pharmacologicClasses',
  'supplementMarketCategories',
  'supplementIngredientCategories',
  'trialConditions',
] as const
type TextFieldName = (typeof ALL_TEXT_FIELDS)[number]

/** Fields that state a use rather than a pharmacology. */
const USE_TEXT_FIELDS: readonly TextFieldName[] = [
  'indication',
  'patientFriendlyIndication',
  'recordedUses',
  'trialConditions',
]
const FIELDS_EXCEPT_MECHANISM: readonly TextFieldName[] = ALL_TEXT_FIELDS.filter(
  (field) => field !== 'mechanism',
)

/**
 * Terms restricted to a subset of the classified fields, keyed `<category>::<term>`. Each entry
 * records a measured artefact, not a preference:
 *
 *  - `mitochondria` / `mitochondrial` in mechanism prose describe an unrelated pharmacology. They
 *    admitted the shared cyanide-antidote sentence ("cytochrome a3 ... in mitochondria") on Sodium
 *    Nitrite, Potassium Nitrite, Calcium Nitrite, Sodium Thiosulfate and Hydroxocobalamin, plus
 *    Primaquine, Leflunomide, Teriflunomide, Rasagiline and Entecavir — 23 of the category's 34
 *    members came from these two bare words.
 *  - `senescence`, `senescent` and `longevity` in mechanism prose matched Eflornithine and
 *    Abemaciclib for *inducing* senescence and matched Mitapivat's "RBC longevity" (red-cell
 *    survival), so they are read outside mechanism only.
 *  - `mtor` and `rapamycin` are pathway words wherever they appear in prose, including a recorded
 *    use statement that opens "Everolimus is a mTOR inhibitor immunosuppressant indicated for the
 *    prophylaxis of organ rejection". They are read in the name field only: the record that IS
 *    rapamycin is named for it, and Sirolimus joins the category through the `sirolimus` term.
 *
 * RESIDUAL, NAMED RATHER THAN PATCHED: Valproic Acid still joins `mitochondrial` because its
 * stored indication carries the safety sentence "patients with mitochondrial disorders are at
 * higher risk". That is a contraindication read as a use. Separating the two needs sentence-level
 * meaning, which is a person's judgement, so the record is named here instead.
 */
const TERM_ALLOWED_FIELDS = new Map<string, readonly TextFieldName[]>([
  ['mitochondrial::mitochondria', USE_TEXT_FIELDS],
  ['mitochondrial::mitochondrial', USE_TEXT_FIELDS],
  ['senolytics-longevity::mtor', ['name']],
  ['senolytics-longevity::rapamycin', ['name']],
  ['senolytics-longevity::senescence', FIELDS_EXCEPT_MECHANISM],
  ['senolytics-longevity::senescent', FIELDS_EXCEPT_MECHANISM],
  ['senolytics-longevity::longevity', FIELDS_EXCEPT_MECHANISM],
])

/**
 * `peptides` also carries two non-lexicon rules, because the corpus classifies peptides by modality
 * and by International Nonproprietary Name stem rather than by prose.
 *  - modality is exactly the peptide modality, or
 *  - the recorded name ends in a peptide INN stem (-tide, -relin, -tropin).
 *
 * A name ending in `-nucleotide` overrides BOTH rules. The legacy modality column carries known
 * mislabels — Nicotinamide Mononucleotide, Nicotinamide Adenine Dinucleotide, Flavin Mononucleotide
 * and Flavin Adenine Dinucleotide are all recorded as the peptide modality and none is a peptide —
 * and the INN stem alone would take "Flavin Adenine Dinucleotide" for a peptide too. Four further
 * legacy mislabels survive this guard and are reported rather than patched away: Crocin (a
 * carotenoid), Novobiocin (an aminocoumarin), Streptozocin (a nitrosourea) and Defibrotide (a
 * single-stranded polydeoxyribonucleotide mixture, which the `-nucleotide` guard does not catch
 * because the name ends in `-otide`).
 *
 * A THIRD RULE, NEGATIVE. A lexicon term alone does not make a record a peptide when the recorded
 * modality is `Small Molecule`. `glucagon-like peptide` appears in the mechanism and FDA class
 * prose of every DPP-4 inhibitor because that prose explains what the endogenous hormone is:
 * Sitagliptin, Linagliptin, Saxagliptin and Alogliptin are small molecules, and Orforglipron is a
 * small-molecule GLP-1 agonist whose non-peptide nature is its defining property.
 */
const PEPTIDE_MODALITY = 'Peptide / GLP-1 Agonist'
const PEPTIDE_NAME_STEM = /(?:tide|relin|tropin)$/i
const PEPTIDE_NAME_STEM_EXCEPTION = /nucleotide$/i
const SMALL_MOLECULE_MODALITY = 'Small Molecule'

/** Routes that a person can use without a clinician administering them. */
const SELF_USE_ROUTES = ['ORAL', 'SUBCUTANEOUS'] as const
/**
 * `pharmacokinetics.routeAsRecorded` is free text, unlike the two uppercase NDC/SPL route lists, so
 * it is matched on its leading word: "Oral (film-coated tablets), with or without food" is oral.
 */
const PK_SELF_USE_ROUTE = /^(ORAL|SUBCUTANEOUS)\b/

/** Entity classes obtainable without a prescription. CONTROLLED_NO_APPROVED_USE is NOT one of them:
 *  those records are obtainable but illegal, which is a different fact and is not merged in here. */
const SELF_OBTAINABLE_ENTITY_CLASSES = [
  'SUPPLEMENT_INGREDIENT',
  'BOTANICAL_OR_ORGANISM_PREPARATION',
  'OFF_LABEL_OR_COMPOUNDED',
] as const

/** Exclusion rules, each stated as a constant so a reviewer can argue with the rule, not the count. */
const IMAGING_PHARM_CLASS = /diagnostic|contrast|radiograph|imaging/i
const IMAGING_INDICATION =
  /imaging|contrast agent|diagnostic agent|radiolabel|scintigraph|\bPET\b|\bSPECT\b/
/**
 * Radiopharmaceutical and contrast-medium naming, matched over the recorded name. This is a
 * name-pattern rule over stored strings, not a judgement about a medicine: an isotope tag such as
 * `Tc-99m`, `I-123` or `Ga-68`, or an iodinated/gadolinium contrast stem, is how the record is
 * written down. It exists because the pharmacologic-class and indication branches cannot fire on a
 * record with an empty indication and no recorded class — Iobenguane Sulfate I-123 reached the
 * broad slice with an empty exclusion list, and Technetium Tc-99m Mebrofenin Kit, Indium In-111,
 * Thallous and eight others escaped every exclusion. Over the corpus it matches 110 names, all of
 * them radiopharmaceuticals or contrast media. Elemental Gadolinium and Gadoleic Acid are NOT
 * matched: the gadolinium branch lists the chelate stems, not the element.
 */
const IMAGING_NAME_PATTERNS: readonly RegExp[] = [
  /^technetium\b/i,
  /\btc-?99m\b/i,
  /^indium\s+in-\d/i,
  /\bin-111\b/i,
  /\bga-?67\b/i,
  /\bga-?68\b/i,
  /^thallous\b/i,
  /\btl-?201\b/i,
  /^iobenguane\b/i,
  /\bi-1(?:23|25|31)\b/i,
  /\bf-?18\b/i,
  /\bc-?11\b/i,
  /\bn-?13\b/i,
  /\bo-?15\b/i,
  /\brb-?82\b/i,
  /\bkr-?81m\b/i,
  /\bxe-?133\b/i,
  /\bcr-?51\b/i,
  /^(?:iohexol|iopamidol|ioversol|iodixanol|iopromide|ioxilan|iothalamate|iodipamide|iopanoic|diatrizoate|ioxaglate|iotrolan|iodamide|metrizamide|ethiodized|perflutren)\b/i,
  /^gado(?:pentetate|teridol|butrol|xetate|benate|terate|diamide|versetamide|fosveset|piclenol|quatrane)/i,
]
/** A record whose registered studies are majority-diagnostic is being studied as a probe, not a use. */
const IMAGING_DIAGNOSTIC_STUDY_SHARE = 0.5
/**
 * The share test needs a denominator worth dividing. Without a floor, one registered study whose
 * primaryPurpose happens to be DIAGNOSTIC excluded Poppy Seed, Wheat Gluten, Mugwort, Rubidium,
 * Gallium, Thallium, Xylose and Hemoglobin as "imaging agents" on a 1/1 share. Below the floor the
 * pharmacologic-class, indication and name branches are the only imaging evidence.
 */
const IMAGING_DIAGNOSTIC_MIN_STUDIES = 5
/**
 * FDA four-letter suffix on a biologic name: `-atto`, `-avwa`, `-rwlc`. The pattern is matched
 * case-insensitively — the recorded names are Title Case, and a case-sensitive test had left the
 * rule firing on exactly one record in the whole corpus (Aducanumab-avwa, the only name whose
 * suffix happens to be lowercase), which was a casing artefact and not evidence about how FDA
 * suffixes are distributed.
 *
 * The suffix alone does not separate a biosimilar from an originator: FDA gives both a suffix, so
 * Cemiplimab-rwlc (Libtayo, an originator) carries one exactly as Adalimumab-atto (Amjevita, a
 * biosimilar) does. The deliberate decision is therefore to exclude a suffixed record only when the
 * corpus ALSO holds the unsuffixed stem as its own canonical record — that record is a duplicate of
 * a molecule already in the population, which is what the exclusion was for. Over the corpus that is
 * 194 of 217 suffixed biologics; the 23 whose stem has no separate record stay in and are counted.
 */
const BIOSIMILAR_NAME = /-[a-z]{4}$/i
const BIOSIMILAR_MODALITIES = [
  'Monoclonal Antibody (mAb)',
  'Recombinant Protein / Biologic',
  'Peptide / GLP-1 Agonist',
] as const
const CHEMOTHERAPY_PHARM_CLASS =
  /Alkylating|Antimetabolite|Topoisomerase|Microtubule|Anthracycline|Platinum-based|Nitrogen Mustard|Vinca|Antineoplastic/i
/**
 * Oncology vocabulary in an indication. This is NOT an exclusion: indication prose names a
 * condition a medicine is used in, and cannot establish a drug class. Reading it as one removed
 * Levothyroxine, Estradiol, Hydrocortisone, Dexamethasone, Cortisone, Diethylstilbestrol,
 * Aldesleukin and Canakinumab — all of which otherwise satisfy every strict condition — along with
 * Bromocriptine (the type-2-diabetes medicine Cycloset, matched on "tumor" via its pituitary
 * indication) and Dronabinol (THC, matched on "cancer chemotherapy" in an antiemetic indication).
 * The match is recorded per record and counted, and the chemotherapy exclusion now fires only on
 * FDA pharmacologic-class vocabulary.
 */
const ONCOLOGY_INDICATION = /cancer|carcinoma|leukemia|lymphoma|myeloma|sarcoma|tumor|neoplas/i
const ANAESTHETIC_PHARM_CLASS = /anesthetic/i
const ANAESTHETIC_INDICATION = /anesthe|anaesthe/i
/**
 * Phrasings in which an indication names anaesthesia as a setting, a risk or the thing being
 * reversed rather than as the medicine's own use. They are removed from the indication before the
 * stem test runs, each one matched against the stored text it was written for:
 *   preanesthetic / postanesthesia   Atropine, Pentobarbital, Doxapram
 *   in the setting of anesthesia     Ephedrine, Phenylephrine
 *   reversal of ... anesthesia       Phentolamine
 *   recovery from anesthesia         Scopolamine
 *   occurring during anesthesia      Isoproterenol
 *   anesthesia has been induced      Flumazenil
 *   following general anaesthesia    Hydroxyzine
 *   reaction to general anesthesia   Ursodiol, Ursadiol
 *   in anesthetic doses              Pentobarbital — a dose descriptor, not a use
 *   reactions to ... anesthetics     Pentobarbital — it treats a reaction to another agent
 *   i.e., anesthesia ...             Phentolamine — an appositive restating a phrase already removed
 *   of a ... anesthetic              Phentolamine — names another agent, "injection of a local
 *                                    anesthetic containing a vasoconstrictor"
 * Genuine anaesthetics keep their match: Articaine, Benoxinate, Dyclonine, Methohexital, Midazolam,
 * Remifentanil, Sufentanil, Nalbuphine, Meperidine, Glycopyrrolate and the neuromuscular blockers
 * all state anaesthesia as the use itself. "with a topical ophthalmic anesthetic agent" is not
 * removed, which is why Benoxinate stays.
 */
const ANAESTHETIC_SETTING_PHRASES: readonly RegExp[] = [
  /\b(?:pre|post)-?an(?:a)?esthe\w*/gi,
  /\b(?:in|during)\s+the\s+settings?\s+of\s+an(?:a)?esthesia/gi,
  /\breversal\s+of\s+(?:[a-z-]+\s+){0,3}an(?:a)?esthesia/gi,
  /\brecovery\s+from\s+an(?:a)?esthesia/gi,
  /\boccurring\s+during\s+an(?:a)?esthesia/gi,
  /\ban(?:a)?esthesia\s+has\s+been\s+induced/gi,
  /\b(?:following|after)\s+general\s+an(?:a)?esthesia/gi,
  /\b(?:reaction|risk)\s+(?:to|of|from)\s+(?:general\s+)?an(?:a)?esthesia/gi,
  /\bin\s+an(?:a)?esthetic\s+doses/gi,
  /\breactions?\s+to\s+(?:[a-z]+\s+){0,4}an(?:a)?esthetics?/gi,
  /\bi\.e\.,?\s*an(?:a)?esthesia\b[^.;]*/gi,
  /\bof\s+an?\s+(?:[a-z]+\s+){0,3}an(?:a)?esthetic\b/gi,
]
/**
 * Both indication-text branches — oncology vocabulary and the anaesthesia stem — are suppressed for
 * a self-obtainable record (a supplement, a botanical, an off-label/compounded record) and for the
 * 74 hand-curated grey-market, psychoactive and peptide seed slugs. For those the legacy indication
 * text names the condition a compound has been studied in, not the compound's drug class: the
 * oncology branch had excluded Ostarine (a SARM studied in cancer cachexia), Milk Thistle,
 * Licorice, Selenium and Shiitake Mushroom, and the anaesthesia branch had excluded Cocaine,
 * Fentanyl and Nitrous Oxide, all three of them curated audience slugs.
 *
 * The FDA pharmacologic-class branches still fire for them, because that is class vocabulary rather
 * than prose. Ketamine is therefore still excluded, by its recorded class "General Anesthetic
 * [EPC]" and not by a regex over its indication. That is a stated decision, and the seed slugs
 * removed by a class branch are counted in diagnostics.seedSlugsExcludedByPharmacologicClass.
 */
const INDICATION_TEXT_BRANCH_EXEMPT_ENTITY_CLASSES = SELF_OBTAINABLE_ENTITY_CLASSES
const VACCINE_MODALITY = 'mRNA Vaccine / Therapeutic'
const VACCINE_NAME = /vaccin/i
const VACCINE_PHARM_CLASS = /vaccine/i
/**
 * A recorded display name that a keyword search cannot be run on as written. The stored PubMed and
 * ClinicalTrials.gov queries use the full display string, so "LSD (Lysergic Acid Diethylamide)" and
 * "Kratom (Mitragyna speciosa) and Mitragynine" return a guaranteed zero. Counted, never used to
 * set or clear a signal.
 */
const QUERY_HOSTILE_NAME = /[()]/

/**
 * Registry conditions are sponsor-written and accumulate: a record with 250 registered studies
 * collects every condition any one of them was run in, so acetaminophen picks up "cognitive
 * impairment" from a single trial. A condition counts toward a category only when it recurs — it
 * appears in at least two of that record's stored studies AND in at least 5% of them.
 * The bar cuts 152,943 record/condition pairs to 10,997 and leaves acetaminophen with "pain" and
 * "fever". Applied to the stored studies only, which are capped at 250 per record.
 *
 * THE BAR NOW APPLIES TO EVERY RECORD. It previously kept every condition for a record with two or
 * fewer stored studies, on the reasoning that there was nothing to recur against. That switched the
 * guard off exactly where one sponsor's enrolment list was decisive: Wheat Bran (an allergy-relief
 * label) joined metabolic-glucose from one study's "Diabetes Mellitus Type 2 | Healthy", Egg Yolk
 * joined nootropics-cognition from one study's "Cognitive Function", and 162 records in all took
 * their whole category from one or two studies. A single registered condition is a sponsor-written
 * enrolment population, not a statement about the compound, so a record with fewer than two stored
 * studies now contributes no condition text at all.
 */
const CONDITION_MIN_STUDIES = 2
const CONDITION_MIN_SHARE = 0.05

const SEED_SLUGS = new Map<string, string>()
for (const dossier of PERFORMANCE_AND_GREY_MARKET_DOSSIERS) {
  SEED_SLUGS.set(dossier.slug, 'performance-and-grey-market')
}
for (const dossier of CONTROLLED_PSYCHOACTIVE_DOSSIERS) {
  SEED_SLUGS.set(dossier.slug, 'controlled-psychoactive')
}
for (const dossier of PEPTIDE_DOSSIERS) {
  SEED_SLUGS.set(dossier.slug, 'peptide')
}

/**
 * The three seed files are hand-curated lists of exactly this audience's compounds, so membership
 * of one is itself a category assignment — a recorded, checkable fact about a file in this
 * repository, and the only reason it is here.
 *
 * Without this rule the keyword screen rejected 37 of the 74 curated slugs outright: Stanozolol's
 * stored indication is "prophylaxis of hereditary angioedema" and Piracetam's is "adjunctive
 * treatment of cortical myoclonus", neither of which uses a lexicon word, so every SARM except
 * Ostarine, both anabolic steroids, Clenbuterol, Follistatin-344, Bromantane, Piracetam and the
 * whole psychoactive set could not reach any threshold at all.
 */
const SEED_SET_CATEGORY: Record<string, CategoryId> = {
  'performance-and-grey-market': 'performance-recovery',
  'controlled-psychoactive': 'psychoactive-mood',
  peptide: 'peptides',
}

// --- database ------------------------------------------------------------------------------------

interface DrugRow {
  slug: string
  name: string
  entity_class: string
  modality: string
  approval_status: string
  indication: string
  patient_friendly_indication: string
  product_listing_routes: string[] | null
  label_presence_routes: string[] | null
  pharmacokinetics_route: string | null
  product_types: string[] | null
  pharmacologic_classes: string[] | null
  supplement_market_categories: string[] | null
  supplement_ingredient_categories: string[] | null
  has_supplement_ingredient: boolean
  has_supplement_market: boolean
  has_label_presence: boolean
  has_product_listing: boolean
  has_homeopathic_marketing_category: boolean
  sole_homeopathic_marketing_category: boolean
  recorded_uses: string[] | null
  mechanism_statements: string[] | null
  ctg_result_count: number
  pubmed_result_count: number
  stored_studies: number
  diagnostic_studies: number
  trial_conditions: string[] | null
}

const QUERY = `
with ctg as (
  select drug_id, coalesce(result_count, 0) as result_count
  from source_search_records
  where search_kind = 'CLINICALTRIALS_SNAPSHOT_EXACT_INTERVENTION'
), pubmed as (
  select drug_id, coalesce(result_count, 0) as result_count
  from source_search_records
  where search_kind = 'PUBMED_ESEARCH_CLINICAL_TRIAL'
), study as (
  select r.drug_id,
         s.value ->> 'nctId' as nct_id,
         s.value -> 'design' ->> 'primaryPurpose' as primary_purpose,
         s.value -> 'conditions' as conditions
  from source_search_records r
  cross join lateral jsonb_array_elements(r.matched -> 0 -> 'studies') s(value)
  where r.search_kind = 'CLINICALTRIALS_SNAPSHOT_EXACT_INTERVENTION'
), study_total as (
  select drug_id,
         count(distinct nct_id)::int as stored_studies,
         count(distinct nct_id) filter (where primary_purpose = 'DIAGNOSTIC')::int as diagnostic_studies
  from study
  group by drug_id
), condition_frequency as (
  select study.drug_id, c.condition, count(distinct study.nct_id)::int as studies
  from study
  cross join lateral jsonb_array_elements_text(study.conditions) c(condition)
  group by 1, 2
), recurring_condition as (
  select f.drug_id, array_agg(f.condition order by f.studies desc, f.condition) as conditions
  from condition_frequency f
  join study_total t on t.drug_id = f.drug_id
  where f.studies >= greatest($1::int, ceil($2::numeric * t.stored_studies))
  group by f.drug_id
)
select d.id as slug,
       d.name,
       ir.entity_class,
       d.modality::text as modality,
       d.approval_status::text as approval_status,
       d.indication,
       d.patient_friendly_indication,
       (select array_agg(x) from jsonb_array_elements_text(
          coalesce(d.recorded_background -> 'productListing' -> 'routesAsRecorded', '[]'::jsonb)) x)
         as product_listing_routes,
       (select array_agg(x) from jsonb_array_elements_text(
          coalesce(d.recorded_background -> 'labelPresence' -> 'routesAsRecorded', '[]'::jsonb)) x)
         as label_presence_routes,
       d.recorded_background -> 'pharmacokinetics' ->> 'routeAsRecorded' as pharmacokinetics_route,
       (select array_agg(x) from jsonb_array_elements_text(
          coalesce(d.recorded_background -> 'labelPresence' -> 'productTypesAsRecorded', '[]'::jsonb)) x)
         as product_types,
       (select array_agg(x) from jsonb_array_elements_text(
          coalesce(d.recorded_background -> 'productListing' -> 'pharmacologicClassesAsRecorded', '[]'::jsonb)) x)
         as pharmacologic_classes,
       (select array_agg(x) from jsonb_array_elements_text(
          coalesce(d.recorded_background -> 'supplementMarket' -> 'categoriesAsRecorded', '[]'::jsonb)) x)
         as supplement_market_categories,
       (select array_agg(x) from jsonb_array_elements_text(
          coalesce(d.recorded_background -> 'supplementIngredient' -> 'categoriesAsRecorded', '[]'::jsonb)) x)
         as supplement_ingredient_categories,
       (d.recorded_background -> 'supplementIngredient') is not null as has_supplement_ingredient,
       (d.recorded_background -> 'supplementMarket') is not null as has_supplement_market,
       (d.recorded_background -> 'labelPresence') is not null as has_label_presence,
       (d.recorded_background -> 'productListing') is not null as has_product_listing,
       coalesce(
         d.recorded_background -> 'productListing' -> 'marketingCategoriesAsRecorded'
           ? 'UNAPPROVED HOMEOPATHIC', false) as has_homeopathic_marketing_category,
       coalesce(
         d.recorded_background -> 'productListing' -> 'marketingCategoriesAsRecorded'
           = '["UNAPPROVED HOMEOPATHIC"]'::jsonb, false) as sole_homeopathic_marketing_category,
       (select array_agg(x ->> 'textAsRecorded') from jsonb_array_elements(
          coalesce(d.recorded_background -> 'recordedUses' -> 'statements', '[]'::jsonb)) x)
         as recorded_uses,
       (select array_agg(x ->> 'textAsRecorded') from jsonb_array_elements(
          coalesce(d.recorded_background -> 'mechanism' -> 'statements', '[]'::jsonb)) x)
         as mechanism_statements,
       coalesce(ctg.result_count, 0) as ctg_result_count,
       coalesce(pubmed.result_count, 0) as pubmed_result_count,
       coalesce(study_total.stored_studies, 0) as stored_studies,
       coalesce(study_total.diagnostic_studies, 0) as diagnostic_studies,
       recurring_condition.conditions as trial_conditions
from drugs d
join inventory_resolutions ir on ir.drug_id = d.id and ir.resolution_status = 'CANONICAL_ENTITY'
left join ctg on ctg.drug_id = d.id
left join pubmed on pubmed.drug_id = d.id
left join study_total on study_total.drug_id = d.id
left join recurring_condition on recurring_condition.drug_id = d.id
order by d.id
`

// --- matching ------------------------------------------------------------------------------------

function wholeWordPattern(term: string): RegExp {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, 'iu')
}

const COMPILED_LEXICON = new Map<CategoryId, { term: string; pattern: RegExp }[]>(
  CATEGORY_IDS.map((category) => [
    category,
    CATEGORY_LEXICON[category].map((term) => ({ term, pattern: wholeWordPattern(term) })),
  ]),
)

interface TextField {
  field: TextFieldName
  text: string
}

function textFields(row: DrugRow): TextField[] {
  const joined = (values: string[] | null): string => (values ?? []).join(' | ')
  const fields: TextField[] = [
    { field: 'name', text: row.name },
    { field: 'indication', text: row.indication },
    { field: 'patientFriendlyIndication', text: row.patient_friendly_indication },
    { field: 'recordedUses', text: joined(row.recorded_uses) },
    { field: 'mechanism', text: joined(row.mechanism_statements) },
    { field: 'pharmacologicClasses', text: joined(row.pharmacologic_classes) },
    { field: 'supplementMarketCategories', text: joined(row.supplement_market_categories) },
    { field: 'supplementIngredientCategories', text: joined(row.supplement_ingredient_categories) },
    { field: 'trialConditions', text: joined(row.trial_conditions) },
  ]
  return fields.filter((entry) => entry.text.trim() !== '')
}

interface CategoryMatch {
  category: CategoryId
  term: string
  field: string
}

/** Up to this many recorded matches per category per record; the boolean does not depend on it. */
const MATCHES_KEPT_PER_CATEGORY = 6

/**
 * Fields that carry a product's own label copy about what it is for. On a homeopathic product that
 * copy is written under the disclaimer that the claims are based on traditional homeopathic
 * practice, are not accepted medical evidence and have not been FDA-evaluated. It is the source of
 * terms like "sleeplessness" and "mental fatigue", and it put Water, Acrylic Acid, Alloxan, Barium
 * Carbonate, Adenine, Asparagine and Boscalid (an agricultural fungicide) into audience categories.
 * On such a record those fields do not set a category; every other field still does.
 */
const HOMEOPATHIC_LABEL_TEXT_FIELDS: readonly TextFieldName[] = [
  'indication',
  'patientFriendlyIndication',
  'recordedUses',
]
/**
 * Two ways to recognise that copy, because either alone leaves a hole. The record-level test is the
 * marketing category: UNAPPROVED HOMEOPATHIC and nothing else. The text-level test is the
 * disclaimer printed in the stored text itself, which is what catches Water and Barium Carbonate —
 * both carry "CLAIMS BASED ON TRADITIONAL HOMEOPATHIC PRACTICE, NOT ACCEPTED MEDICAL EVIDENCE, NOT
 * FDA EVALUATED" in the same indication string, while their marketing categories also list
 * OTC MONOGRAPH DRUG and DRUG FOR FURTHER PROCESSING respectively.
 *
 * The text test is evaluated over the three fields together rather than field by field, because
 * they are transcriptions of one label and the disclaimer is printed once on it. Adenine's
 * recorded use ends "...due to sensitivity to phenolic compounds found in foods or other products.*"
 * and the asterisk it points at sits in the indication field.
 */
const HOMEOPATHIC_DISCLAIMER_TEXT = /homeopath/i

interface CategoryMatchResult {
  matches: CategoryMatch[]
  /** Matches dropped because the only evidence was homeopathic-only label prose. */
  droppedHomeopathicText: CategoryMatch[]
  /** Matches dropped because a lexicon term alone cannot make a Small Molecule a peptide. */
  droppedSmallMoleculePeptide: CategoryMatch[]
}

function matchCategories(row: DrugRow, fields: TextField[]): CategoryMatchResult {
  const matches: CategoryMatch[] = []
  const droppedHomeopathicText: CategoryMatch[] = []
  const droppedSmallMoleculePeptide: CategoryMatch[] = []
  const homeopathicLabelCopy =
    row.sole_homeopathic_marketing_category ||
    fields.some(
      (entry) =>
        HOMEOPATHIC_LABEL_TEXT_FIELDS.includes(entry.field) &&
        HOMEOPATHIC_DISCLAIMER_TEXT.test(entry.text),
    )
  for (const category of CATEGORY_IDS) {
    const terms = COMPILED_LEXICON.get(category) ?? []
    const seen = new Set<string>()
    for (const { term, pattern } of terms) {
      const allowed = TERM_ALLOWED_FIELDS.get(`${category}::${term}`)
      for (const field of fields) {
        if (seen.size >= MATCHES_KEPT_PER_CATEGORY) break
        if (seen.has(term)) continue
        if (allowed !== undefined && !allowed.includes(field.field)) continue
        if (!pattern.test(field.text)) continue
        const match: CategoryMatch = { category, term, field: field.field }
        if (homeopathicLabelCopy && HOMEOPATHIC_LABEL_TEXT_FIELDS.includes(field.field)) {
          droppedHomeopathicText.push(match)
          continue
        }
        if (category === 'peptides' && row.modality === SMALL_MOLECULE_MODALITY) {
          droppedSmallMoleculePeptide.push(match)
          continue
        }
        seen.add(term)
        matches.push(match)
      }
    }
  }
  if (!PEPTIDE_NAME_STEM_EXCEPTION.test(row.name)) {
    if (row.modality === PEPTIDE_MODALITY) {
      matches.push({ category: 'peptides', term: PEPTIDE_MODALITY, field: 'modality' })
    } else if (PEPTIDE_NAME_STEM.test(row.name)) {
      matches.push({ category: 'peptides', term: 'INN stem -tide/-relin/-tropin', field: 'name' })
    }
  }
  const seedSet = SEED_SLUGS.get(row.slug)
  const seedCategory = seedSet === undefined ? undefined : SEED_SET_CATEGORY[seedSet]
  if (seedSet !== undefined && seedCategory !== undefined) {
    matches.push({ category: seedCategory, term: `seedSet:${seedSet}`, field: 'seedSet' })
  }
  return { matches, droppedHomeopathicText, droppedSmallMoleculePeptide }
}

function anyRouteMatches(routes: string[] | null, wanted: readonly string[]): string | null {
  for (const route of routes ?? []) {
    if (wanted.includes(route.toUpperCase())) return route
  }
  return null
}

function matchesAny(values: string[] | null, pattern: RegExp): string | null {
  for (const value of values ?? []) {
    if (pattern.test(value)) return value
  }
  return null
}

// --- record shape --------------------------------------------------------------------------------

interface ClassifiedRecord {
  slug: string
  name: string
  entityClass: string
  modality: string
  signals: {
    humanStudy: boolean
    routeSelfUse: boolean
    routeRecorded: boolean
    category: boolean
    availableNoRx: boolean
    publication: boolean
  }
  categories: CategoryId[]
  evidence: {
    humanStudy: { clinicalTrialsGovResultCount: number; pubmedResultCount: number }
    route: {
      selfUseSources: string[]
      recordedSources: string[]
      productListingRoutes: string[]
      labelPresenceRoutes: string[]
      pharmacokineticsRoute: string | null
    }
    category: CategoryMatch[]
    availableNoRx: string[]
    publication: { pubmedResultCount: number }
    observedNotCounted: {
      supplementMarketRegistry: boolean
      prescriptionOnlyLabel: boolean
      prescriptionOnlyLabelVetoedAvailableNoRx: boolean
      homeopathicMarketingCategory: boolean
      soleHomeopathicMarketingCategory: boolean
      /** Category matches that only homeopathic-only label prose supported. */
      categoryFromHomeopathicLabelText: CategoryMatch[]
      /** `peptides` term matches refused because the recorded modality is Small Molecule. */
      categoryFromSmallMoleculePeptideTerm: CategoryMatch[]
      /** Hand-curated seed file this slug is listed in; a curation fact, not an availability one. */
      greyMarketSeedSet: string | null
      /** Oncology words in the indication. Recorded; no longer an exclusion. */
      oncologyIndicationText: boolean
      /** FDA four-letter suffix with no unsuffixed stem record in the corpus. */
      suffixedBiologicWithoutStemRecord: boolean
      /** Recorded display name a keyword search cannot be run on as written. */
      queryHostileName: boolean
      /** Stored studies were too few for the diagnostic-share test to be allowed to fire. */
      imagingShareBelowStudyFloor: boolean
    }
  }
  exclusions: {
    imagingDiagnostic: boolean
    biosimilar: boolean
    chemotherapy: boolean
    anaesthetic: boolean
    vaccine: boolean
    noLabelNoStoredSearchHit: boolean
    any: boolean
    evidence: string[]
  }
  thresholds: { strict: boolean; moderate: boolean; broad: boolean }
}

function classify(row: DrugRow, canonicalNames: Set<string>): ClassifiedRecord {
  const fields = textFields(row)
  const matched = matchCategories(row, fields)
  const categoryMatches = matched.matches
  const categories = [...new Set(categoryMatches.map((match) => match.category))]

  const humanStudy = row.ctg_result_count > 0 || row.pubmed_result_count > 0
  const publication = row.pubmed_result_count > 0

  const selfUseSources: string[] = []
  const recordedSources: string[] = []
  const productListingRoutes = row.product_listing_routes ?? []
  const labelPresenceRoutes = row.label_presence_routes ?? []
  const pkRoute = row.pharmacokinetics_route
  if (productListingRoutes.length > 0) recordedSources.push('productListing')
  if (labelPresenceRoutes.length > 0) recordedSources.push('labelPresence')
  if (pkRoute !== null && pkRoute.trim() !== '') recordedSources.push('pharmacokinetics')

  const plSelfUse = anyRouteMatches(productListingRoutes, SELF_USE_ROUTES)
  if (plSelfUse !== null) selfUseSources.push(`productListing:${plSelfUse}`)
  const lpSelfUse = anyRouteMatches(labelPresenceRoutes, SELF_USE_ROUTES)
  if (lpSelfUse !== null) selfUseSources.push(`labelPresence:${lpSelfUse}`)
  if (pkRoute !== null && PK_SELF_USE_ROUTE.test(pkRoute.toUpperCase())) {
    selfUseSources.push(`pharmacokinetics:${pkRoute}`)
  }

  const routeRecorded = recordedSources.length > 0
  const routeSelfUse = selfUseSources.length > 0

  const productTypes = (row.product_types ?? []).map((value) => value.toUpperCase())
  const hasOtcLabel = productTypes.includes('HUMAN OTC DRUG')
  const hasPrescriptionLabel = productTypes.includes('HUMAN PRESCRIPTION DRUG')
  const prescriptionOnlyLabel = hasPrescriptionLabel && !hasOtcLabel
  const seedSet = SEED_SLUGS.get(row.slug)

  /**
   * Availability without a prescription, from three recorded branches. Two earlier problems are
   * fixed here rather than reported around.
   *
   * The seed files are NOT one of the branches any more. Pushing `seedSet:` into this list made
   * every one of the 21 CONTROLLED_NO_APPROVED_USE records — heroin, LSD, MDMA, psilocybin,
   * phencyclidine, isotonitazene — available without a prescription, which is the exact class the
   * rule below says it refuses to count, and it was the sole availability evidence for ten strict
   * records including Semaglutide, Tirzepatide and Testosterone Enanthate. Curation is recorded as
   * observedNotCounted.greyMarketSeedSet instead.
   *
   * A prescription-only label vetoes the entity-class branch. A record whose own stored label says
   * HUMAN PRESCRIPTION DRUG and nothing else is a prescription medicine; the entity-class string is
   * a coarser fact than the label and does not overturn it. The veto does not apply where the OTC
   * label or the supplement-ingredient registry fires, because those are direct availability
   * evidence about the same product.
   */
  const noRxSources: string[] = []
  if (hasOtcLabel) noRxSources.push('labelProductType:HUMAN OTC DRUG')
  if (row.has_supplement_ingredient) noRxSources.push('supplementIngredientRegistry')
  const directNoRxEvidence = noRxSources.length > 0
  const selfObtainableClass = (SELF_OBTAINABLE_ENTITY_CLASSES as readonly string[]).includes(
    row.entity_class,
  )
  const prescriptionOnlyLabelVetoed =
    selfObtainableClass && prescriptionOnlyLabel && !directNoRxEvidence
  if (selfObtainableClass && !prescriptionOnlyLabelVetoed) {
    noRxSources.push(`entityClass:${row.entity_class}`)
  }
  const availableNoRx = noRxSources.length > 0

  const indicationTextExempt =
    (INDICATION_TEXT_BRANCH_EXEMPT_ENTITY_CLASSES as readonly string[]).includes(
      row.entity_class,
    ) || seedSet !== undefined

  const exclusionEvidence: string[] = []
  const imagingPharmClass = matchesAny(row.pharmacologic_classes, IMAGING_PHARM_CLASS)
  if (imagingPharmClass !== null)
    exclusionEvidence.push(`imaging:pharmacologicClass:${imagingPharmClass}`)
  const imagingIndication = IMAGING_INDICATION.test(row.indication)
  if (imagingIndication) exclusionEvidence.push('imaging:indication')
  const imagingName = IMAGING_NAME_PATTERNS.some((pattern) => pattern.test(row.name))
  if (imagingName) exclusionEvidence.push(`imaging:name:${row.name}`)
  const diagnosticShare = row.stored_studies > 0 ? row.diagnostic_studies / row.stored_studies : 0
  const shareOverBar = diagnosticShare > IMAGING_DIAGNOSTIC_STUDY_SHARE
  const enoughStudiesForShare = row.stored_studies >= IMAGING_DIAGNOSTIC_MIN_STUDIES
  const imagingStudies = shareOverBar && enoughStudiesForShare
  if (imagingStudies) {
    exclusionEvidence.push(
      `imaging:diagnosticStudies:${row.diagnostic_studies}/${row.stored_studies}`,
    )
  }
  const imagingDiagnostic =
    imagingPharmClass !== null || imagingIndication || imagingName || imagingStudies

  const suffixedBiologic =
    BIOSIMILAR_NAME.test(row.name) &&
    (BIOSIMILAR_MODALITIES as readonly string[]).includes(row.modality)
  const stemName = row.name.replace(BIOSIMILAR_NAME, '').toLowerCase()
  const stemIsItsOwnRecord = suffixedBiologic && canonicalNames.has(stemName)
  const biosimilar = suffixedBiologic && stemIsItsOwnRecord
  if (biosimilar) exclusionEvidence.push(`biosimilar:name:${row.name}:stemRecord:${stemName}`)

  const chemoPharmClass = matchesAny(row.pharmacologic_classes, CHEMOTHERAPY_PHARM_CLASS)
  if (chemoPharmClass !== null) {
    exclusionEvidence.push(`chemotherapy:pharmacologicClass:${chemoPharmClass}`)
  }
  const oncologyIndicationText = !indicationTextExempt && ONCOLOGY_INDICATION.test(row.indication)
  const chemotherapy = chemoPharmClass !== null

  const anaestheticPharmClass = matchesAny(row.pharmacologic_classes, ANAESTHETIC_PHARM_CLASS)
  if (anaestheticPharmClass !== null) {
    exclusionEvidence.push(`anaesthetic:pharmacologicClass:${anaestheticPharmClass}`)
  }
  let anaestheticText = row.indication
  for (const phrase of ANAESTHETIC_SETTING_PHRASES) {
    phrase.lastIndex = 0
    anaestheticText = anaestheticText.replace(phrase, ' ')
  }
  const anaestheticIndication =
    !indicationTextExempt && ANAESTHETIC_INDICATION.test(anaestheticText)
  if (anaestheticIndication) exclusionEvidence.push('anaesthetic:indication')
  const anaesthetic = anaestheticPharmClass !== null || anaestheticIndication

  const vaccinePharmClass = matchesAny(row.pharmacologic_classes, VACCINE_PHARM_CLASS)
  if (vaccinePharmClass !== null) {
    exclusionEvidence.push(`vaccine:pharmacologicClass:${vaccinePharmClass}`)
  }
  const vaccineName = VACCINE_NAME.test(row.name)
  if (vaccineName) exclusionEvidence.push('vaccine:name')
  const vaccineModality = row.modality === VACCINE_MODALITY
  if (vaccineModality) exclusionEvidence.push('vaccine:modality')
  const vaccine = vaccinePharmClass !== null || vaccineName || vaccineModality

  /**
   * No stored label, no stored product listing, and no hit on either stored search — named for what
   * it measures. It was called noLabelNoHumanStudy, which claimed more than the data supports: the
   * PubMed and ClinicalTrials.gov searches were run on the full recorded display name, so a record
   * named "LSD (Lysergic Acid Diethylamide)" or "Kratom (Mitragyna speciosa) and Mitragynine"
   * returns zero by construction. 24 canonical records have a parenthesised name and zero on both
   * searches; the count is published as diagnostics.queryHostileName.
   */
  const noLabelNoStoredSearchHit =
    !row.has_label_presence && !row.has_product_listing && !humanStudy
  if (noLabelNoStoredSearchHit) exclusionEvidence.push('noLabelNoStoredSearchHit')

  const anyExclusion =
    imagingDiagnostic ||
    biosimilar ||
    chemotherapy ||
    anaesthetic ||
    vaccine ||
    noLabelNoStoredSearchHit

  const category = categories.length > 0
  const supplementaryRoute =
    !routeRecorded &&
    (row.entity_class === 'SUPPLEMENT_INGREDIENT' ||
      row.entity_class === 'BOTANICAL_OR_ORGANISM_PREPARATION')

  const strict =
    !anyExclusion && humanStudy && routeSelfUse && category && availableNoRx && publication
  const moderate = !anyExclusion && humanStudy && category && (routeSelfUse || supplementaryRoute)
  const broad = !anyExclusion && category && (humanStudy || publication)

  return {
    slug: row.slug,
    name: row.name,
    entityClass: row.entity_class,
    modality: row.modality,
    signals: { humanStudy, routeSelfUse, routeRecorded, category, availableNoRx, publication },
    categories,
    evidence: {
      humanStudy: {
        clinicalTrialsGovResultCount: row.ctg_result_count,
        pubmedResultCount: row.pubmed_result_count,
      },
      route: {
        selfUseSources,
        recordedSources,
        productListingRoutes,
        labelPresenceRoutes,
        pharmacokineticsRoute: pkRoute,
      },
      category: categoryMatches,
      availableNoRx: noRxSources,
      publication: { pubmedResultCount: row.pubmed_result_count },
      observedNotCounted: {
        supplementMarketRegistry: row.has_supplement_market,
        prescriptionOnlyLabel,
        prescriptionOnlyLabelVetoedAvailableNoRx: prescriptionOnlyLabelVetoed,
        homeopathicMarketingCategory: row.has_homeopathic_marketing_category,
        soleHomeopathicMarketingCategory: row.sole_homeopathic_marketing_category,
        categoryFromHomeopathicLabelText: matched.droppedHomeopathicText,
        categoryFromSmallMoleculePeptideTerm: matched.droppedSmallMoleculePeptide,
        greyMarketSeedSet: seedSet ?? null,
        oncologyIndicationText,
        suffixedBiologicWithoutStemRecord: suffixedBiologic && !stemIsItsOwnRecord,
        queryHostileName: QUERY_HOSTILE_NAME.test(row.name),
        imagingShareBelowStudyFloor: shareOverBar && !enoughStudiesForShare,
      },
    },
    exclusions: {
      imagingDiagnostic,
      biosimilar,
      chemotherapy,
      anaesthetic,
      vaccine,
      noLabelNoStoredSearchHit,
      any: anyExclusion,
      evidence: exclusionEvidence,
    },
    thresholds: { strict, moderate, broad },
  }
}

// --- summary -------------------------------------------------------------------------------------

type Tally = Record<string, number>

function bump(tally: Tally, key: string, by = 1): void {
  tally[key] = (tally[key] ?? 0) + by
}

interface Summary {
  generatedAt: string
  population: number
  signals: Tally
  signalBranches: Tally
  routeCoverage: Tally
  exclusions: Tally
  thresholds: Tally
  perCategoryAtThreshold: Record<string, Tally>
  entityClassAtThreshold: Record<string, Tally>
  routeCoverageAtThreshold: Record<string, Tally>
  categoryTermHits: Tally
  thresholdDefinitions: Record<string, { gates: string; name: string }>
  diagnostics: Record<string, Tally>
  notes: string[]
}

/**
 * The three thresholds are audience-fit filters, not a confidence ladder, and the names strict /
 * moderate / broad invite the opposite reading. Each one is therefore published with the thing it
 * actually gates. Measured against phase 2, the strict slice carries LESS stored evidence than the
 * moderate slice it sits inside — the two gates strict adds (availableNoRx and routeSelfUse) drop
 * evidence-rich prescription medicines such as Zolpidem, Tofacitinib and Ustekinumab while keeping
 * over-the-counter records with one stored data type. See phase2-summary.json slices.bySlice for
 * the per-slice count-of-eight and evidence-tier mix.
 */
const THRESHOLD_DEFINITIONS: Record<string, { gates: string; name: string }> = {
  strict: {
    name: 'audience fit: obtainable without a prescription AND self-administered',
    gates:
      'no exclusion AND a stored human study AND a self-use route on the record AND a category ' +
      'AND availableNoRx AND an indexed clinical-trial publication.',
  },
  moderate: {
    name: 'audience fit: self-administered, or a supplement or botanical with no recorded route',
    gates:
      'no exclusion AND a stored human study AND a category AND (self-use route OR no route ' +
      'recorded on a SUPPLEMENT_INGREDIENT or BOTANICAL_OR_ORGANISM_PREPARATION record).',
  },
  broad: {
    name: 'topic fit: in a category with some stored human-study signal',
    gates: 'no exclusion AND a category AND (a stored human study OR a publication hit).',
  },
}

function summarize(records: ClassifiedRecord[]): Summary {
  const signals: Tally = {}
  const signalBranches: Tally = {}
  const routeCoverage: Tally = {}
  const exclusions: Tally = {}
  const thresholds: Tally = { strict: 0, moderate: 0, broad: 0, excludedForAnyReason: 0 }
  const perCategoryAtThreshold: Record<string, Tally> = {
    any: {},
    strict: {},
    moderate: {},
    broad: {},
  }
  const entityClassAtThreshold: Record<string, Tally> = {
    all: {},
    strict: {},
    moderate: {},
    broad: {},
  }
  const routeCoverageAtThreshold: Record<string, Tally> = {
    all: {},
    strict: {},
    moderate: {},
    broad: {},
  }
  const categoryTermHits: Tally = {}
  const diagnostics: Record<string, Tally> = {
    /** Records that clear every moderate condition except the route fallback, which covers only the
     *  supplement and botanical entity classes. They fail on missing route data, not on evidence. */
    moderateBlockedOnlyByRouteFallback: {},
    /** Records the same fallback lets IN: inside a threshold with no route recorded anywhere, so
     *  the only stored fact behind self-administration is the entity-class string. */
    moderateAdmittedByRouteFallback: {},
    /** The 74 hand-curated grey-market, psychoactive and peptide seed slugs. */
    seedSlugs: {},
    /** Seed slugs an FDA pharmacologic-class branch still excludes, e.g. Ketamine. */
    seedSlugsExcludedByPharmacologicClass: {},
    /** Records marketed under the FDA's UNAPPROVED HOMEOPATHIC category. Their category keywords
     *  come from homeopathic label claims, which are label text and not trial findings. */
    homeopathicMarketingCategory: {},
    /** The tight version: the ONLY recorded marketing category is UNAPPROVED HOMEOPATHIC. */
    soleHomeopathicMarketingCategory: {},
    /** Records that would have joined a category if homeopathic-only label prose still counted, and
     *  the thresholds they would have reached. This is the published before/after for that rule. */
    categoryOnlyFromHomeopathicLabelText: {},
    /** Indication prose with oncology vocabulary. Recorded; no longer an exclusion. */
    oncologyIndicationText: {},
    /** Suffixed biologics kept because the corpus has no separate unsuffixed stem record. */
    suffixedBiologicWithoutStemRecord: {},
    /** Records with a parenthesised display name, which the stored keyword searches cannot hit. */
    queryHostileName: {},
    /** Records the imaging study-share floor spared, i.e. share over 0.5 on fewer than 5 studies. */
    imagingShareBelowStudyFloor: {},
    /** Availability the prescription-only label veto removed, and the conflict it leaves behind. */
    prescriptionOnlyLabelConflict: {},
    categoryPopulation: {},
  }

  for (const key of [
    'humanStudy',
    'routeSelfUse',
    'routeRecorded',
    'category',
    'availableNoRx',
    'publication',
  ]) {
    signals[key] = 0
  }
  for (const key of [
    'imagingDiagnostic',
    'biosimilar',
    'chemotherapy',
    'anaesthetic',
    'vaccine',
    'noLabelNoStoredSearchHit',
    'anyExclusion',
  ]) {
    exclusions[key] = 0
  }
  for (const key of ['recordedSelfUse', 'recordedOtherOnly', 'unrecorded']) {
    routeCoverage[key] = 0
  }
  for (const category of CATEGORY_IDS) {
    for (const bucket of Object.keys(perCategoryAtThreshold)) {
      const tally = perCategoryAtThreshold[bucket]
      if (tally !== undefined) tally[category] = 0
    }
  }

  for (const record of records) {
    for (const [key, value] of Object.entries(record.signals)) {
      if (value) bump(signals, key)
    }
    for (const [key, value] of Object.entries(record.exclusions)) {
      if (key === 'evidence') continue
      if (value === true) bump(exclusions, key === 'any' ? 'anyExclusion' : key)
    }
    if (record.exclusions.any)
      thresholds.excludedForAnyReason = (thresholds.excludedForAnyReason ?? 0) + 1

    const routeBucket = record.signals.routeSelfUse
      ? 'recordedSelfUse'
      : record.signals.routeRecorded
        ? 'recordedOtherOnly'
        : 'unrecorded'
    bump(routeCoverage, routeBucket)
    bump(routeCoverageAtThreshold.all ?? {}, routeBucket)

    const ctg = record.evidence.humanStudy.clinicalTrialsGovResultCount > 0
    const pubmed = record.evidence.humanStudy.pubmedResultCount > 0
    if (ctg && pubmed) bump(signalBranches, 'humanStudy.both')
    else if (ctg) bump(signalBranches, 'humanStudy.clinicalTrialsGovOnly')
    else if (pubmed) bump(signalBranches, 'humanStudy.pubmedOnly')
    else bump(signalBranches, 'humanStudy.neither')
    for (const source of record.evidence.availableNoRx) {
      bump(signalBranches, `availableNoRx.${source.split(':')[0] ?? source}`)
    }
    const observed = record.evidence.observedNotCounted
    if (observed.supplementMarketRegistry) bump(signalBranches, 'observed.supplementMarketRegistry')
    if (observed.prescriptionOnlyLabel) bump(signalBranches, 'observed.prescriptionOnlyLabel')
    if (observed.greyMarketSeedSet !== null) bump(signalBranches, 'observed.greyMarketSeedSet')
    if (observed.prescriptionOnlyLabelVetoedAvailableNoRx) {
      bump(signalBranches, 'conflict.prescriptionOnlyLabelVetoedEntityClassBranch')
      bump(diagnostics.prescriptionOnlyLabelConflict ?? {}, 'vetoed')
    }
    if (observed.prescriptionOnlyLabel && record.signals.availableNoRx) {
      bump(signalBranches, 'conflict.prescriptionOnlyLabelWithAvailableNoRx')
      bump(diagnostics.prescriptionOnlyLabelConflict ?? {}, 'remainingWithAvailableNoRx')
    }

    for (const match of record.evidence.category) {
      bump(categoryTermHits, `${match.category}::${match.term}`)
    }

    bump(entityClassAtThreshold.all ?? {}, record.entityClass)
    for (const category of record.categories) {
      bump(perCategoryAtThreshold.any ?? {}, category)
    }
    const seeded = observed.greyMarketSeedSet !== null
    const homeopathic = observed.homeopathicMarketingCategory
    const soleHomeopathic = observed.soleHomeopathicMarketingCategory
    if (seeded) {
      bump(diagnostics.seedSlugs ?? {}, 'all')
      if (
        record.exclusions.evidence.some((entry) => entry.includes(':pharmacologicClass:')) &&
        record.exclusions.any
      ) {
        bump(diagnostics.seedSlugsExcludedByPharmacologicClass ?? {}, 'all')
        bump(diagnostics.seedSlugsExcludedByPharmacologicClass ?? {}, record.slug)
      }
    }
    if (homeopathic) bump(diagnostics.homeopathicMarketingCategory ?? {}, 'all')
    if (soleHomeopathic) bump(diagnostics.soleHomeopathicMarketingCategory ?? {}, 'all')
    if (observed.oncologyIndicationText) bump(diagnostics.oncologyIndicationText ?? {}, 'all')
    if (observed.suffixedBiologicWithoutStemRecord) {
      bump(diagnostics.suffixedBiologicWithoutStemRecord ?? {}, 'all')
    }
    if (observed.queryHostileName) {
      bump(diagnostics.queryHostileName ?? {}, 'all')
      if (!record.signals.humanStudy) bump(diagnostics.queryHostileName ?? {}, 'withoutSearchHit')
      if (record.exclusions.noLabelNoStoredSearchHit) {
        bump(diagnostics.queryHostileName ?? {}, 'excludedAsNoLabelNoStoredSearchHit')
      }
    }
    if (observed.imagingShareBelowStudyFloor) {
      bump(diagnostics.imagingShareBelowStudyFloor ?? {}, 'all')
      if (!record.exclusions.any) bump(diagnostics.imagingShareBelowStudyFloor ?? {}, 'keptInScope')
    }

    /**
     * The before/after for the homeopathic-only category rule. A record counts here when dropping
     * that prose left it with no category at all, so the tier counts below would have included it.
     */
    if (observed.categoryFromHomeopathicLabelText.length > 0 && record.categories.length === 0) {
      const supplementaryRoute =
        !record.signals.routeRecorded &&
        (record.entityClass === 'SUPPLEMENT_INGREDIENT' ||
          record.entityClass === 'BOTANICAL_OR_ORGANISM_PREPARATION')
      const wouldBeBroad =
        !record.exclusions.any && (record.signals.humanStudy || record.signals.publication)
      const wouldBeModerate =
        !record.exclusions.any &&
        record.signals.humanStudy &&
        (record.signals.routeSelfUse || supplementaryRoute)
      const wouldBeStrict =
        !record.exclusions.any &&
        record.signals.humanStudy &&
        record.signals.routeSelfUse &&
        record.signals.availableNoRx &&
        record.signals.publication
      bump(diagnostics.categoryOnlyFromHomeopathicLabelText ?? {}, 'all')
      if (wouldBeStrict)
        bump(diagnostics.categoryOnlyFromHomeopathicLabelText ?? {}, 'wouldBeStrict')
      if (wouldBeModerate) {
        bump(diagnostics.categoryOnlyFromHomeopathicLabelText ?? {}, 'wouldBeModerate')
      }
      if (wouldBeBroad) bump(diagnostics.categoryOnlyFromHomeopathicLabelText ?? {}, 'wouldBeBroad')
    }
    if (record.signals.category) {
      bump(diagnostics.categoryPopulation ?? {}, 'all')
      if (!record.signals.humanStudy)
        bump(diagnostics.categoryPopulation ?? {}, 'withoutHumanStudy')
      if (record.exclusions.any) bump(diagnostics.categoryPopulation ?? {}, 'excluded')
    }
    if (
      !record.thresholds.moderate &&
      !record.exclusions.any &&
      record.signals.humanStudy &&
      record.signals.category &&
      !record.signals.routeRecorded
    ) {
      bump(diagnostics.moderateBlockedOnlyByRouteFallback ?? {}, 'all')
      bump(diagnostics.moderateBlockedOnlyByRouteFallback ?? {}, record.entityClass)
      if (seeded) bump(diagnostics.moderateBlockedOnlyByRouteFallback ?? {}, 'seedSlugs')
    }
    if (record.thresholds.moderate && !record.signals.routeSelfUse) {
      bump(diagnostics.moderateAdmittedByRouteFallback ?? {}, 'all')
      bump(diagnostics.moderateAdmittedByRouteFallback ?? {}, record.entityClass)
      if (record.thresholds.strict) {
        bump(diagnostics.moderateAdmittedByRouteFallback ?? {}, 'alsoStrict')
      }
    }
    for (const bucket of ['strict', 'moderate', 'broad'] as const) {
      if (!record.thresholds[bucket]) continue
      thresholds[bucket] = (thresholds[bucket] ?? 0) + 1
      for (const category of record.categories) {
        bump(perCategoryAtThreshold[bucket] ?? {}, category)
      }
      bump(entityClassAtThreshold[bucket] ?? {}, record.entityClass)
      bump(routeCoverageAtThreshold[bucket] ?? {}, routeBucket)
      if (seeded) bump(diagnostics.seedSlugs ?? {}, bucket)
      if (homeopathic) bump(diagnostics.homeopathicMarketingCategory ?? {}, bucket)
      if (soleHomeopathic) bump(diagnostics.soleHomeopathicMarketingCategory ?? {}, bucket)
      if (observed.oncologyIndicationText) bump(diagnostics.oncologyIndicationText ?? {}, bucket)
      if (observed.suffixedBiologicWithoutStemRecord) {
        bump(diagnostics.suffixedBiologicWithoutStemRecord ?? {}, bucket)
      }
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    population: records.length,
    signals,
    signalBranches,
    routeCoverage,
    exclusions,
    thresholds,
    perCategoryAtThreshold,
    entityClassAtThreshold,
    routeCoverageAtThreshold,
    categoryTermHits,
    thresholdDefinitions: THRESHOLD_DEFINITIONS,
    diagnostics,
    notes: [
      'Population is inventory_resolutions.resolution_status = CANONICAL_ENTITY.',
      'strict, moderate and broad are audience-fit filters, not a confidence ladder. thresholdDefinitions names what each one gates. Measured against phase 2, the strict slice carries fewer stored data types per record than the moderate slice that contains it, because the two gates strict adds (availableNoRx and a self-use route) drop evidence-rich prescription medicines and keep over-the-counter records with little stored evidence. Read the depth of a slice from phase2-summary.json slices.bySlice, never from the tier name.',
      'humanStudy is a stored human-study signal only. ClinicalTrials.gov registers human studies and the PubMed query is filtered to clinical trial[pt]; no preclinical evidence exists anywhere in this corpus, so "no human study" never means "untested in animals".',
      'publication is a strict subset of humanStudy, so the broad threshold reduces to category AND humanStudy AND not excluded.',
      'Route is never inferred. A record with no route in productListing, labelPresence or pharmacokinetics is counted as unrecorded, including supplements that are in practice taken orally. The moderate threshold nonetheless admits route-unrecorded supplements and botanicals: routeCoverageAtThreshold gives the split per slice and diagnostics.moderateAdmittedByRouteFallback counts the records admitted that way, next to moderateBlockedOnlyByRouteFallback which counts the ones it keeps out.',
      'availableNoRx counts three recorded branches: an OTC product type on the stored label, the supplement-ingredient registry, and a self-obtainable entity class. Membership of a hand-curated seed file is NOT one of them — it is curation, not availability, and counting it had made all 21 CONTROLLED_NO_APPROVED_USE records (heroin, LSD, MDMA, psilocybin) available without a prescription. It is recorded per record as observedNotCounted.greyMarketSeedSet.',
      'A stored label that says HUMAN PRESCRIPTION DRUG and not HUMAN OTC DRUG vetoes the entity-class branch of availableNoRx. It does not veto the OTC or supplement-registry branches, which are direct evidence about the same product; signalBranches.conflict.* publishes both the vetoed count and the records where availableNoRx and a prescription-only label still coexist.',
      'The chemotherapy exclusion fires only on FDA pharmacologic-class vocabulary. Oncology words in an indication are recorded as observedNotCounted.oncologyIndicationText and counted in diagnostics, because indication prose names a condition and cannot establish a drug class; reading it as one had removed Levothyroxine, Estradiol, Hydrocortisone, Dexamethasone, Cortisone, Bromocriptine and Dronabinol.',
      'The peptides category inherits four legacy modality mislabels that the -nucleotide guard does not catch: Crocin, Novobiocin, Streptozocin and Defibrotide are recorded under the peptide modality and none is a peptide. A lexicon term alone does not admit a record whose recorded modality is Small Molecule, which keeps the DPP-4 inhibitors and Orforglipron out.',
      'The anaesthetic exclusion keeps the broad anesthe/anaesthe stem, but the indication branch first removes the phrasings in which anaesthesia is a setting, a risk or the thing being reversed (preanesthetic, in the setting of anesthesia, reversal of anesthesia, recovery from anesthesia, occurring during anesthesia, anesthesia has been induced, following general anaesthesia, reaction to general anaesthesia). The same seed-slug and self-obtainable exemption as the oncology branch applies, so Cocaine, Fentanyl and Nitrous Oxide are no longer removed by prose. Ketamine remains excluded by its recorded FDA class "General Anesthetic [EPC]"; diagnostics.seedSlugsExcludedByPharmacologicClass names every curated slug a class branch still removes.',
      'The biosimilar exclusion was previously reported as inoperative. That was a casing artefact: the four-letter-suffix pattern had no case-insensitive flag while recorded names are Title Case, so it fired on the one name whose suffix happens to be lowercase. Matched case-insensitively the corpus holds 217 suffixed biologics. FDA gives originators and biosimilars the same suffix, so the rule now excludes a suffixed record only when the corpus also holds the unsuffixed stem as its own canonical record — a duplicate of a molecule already counted. The 23 whose stem has no separate record stay in and are counted in diagnostics.suffixedBiologicWithoutStemRecord.',
      'The imaging exclusion has four branches: FDA pharmacologic class, indication text, a radiopharmaceutical or contrast name pattern over the recorded name, and a majority-diagnostic study share. The share branch requires at least 5 stored studies, because on one or two studies it had excluded Poppy Seed, Wheat Gluten, Mugwort, Rubidium and Xylose as imaging agents.',
      'The vaccine exclusion is incomplete by construction: openFDA product_type = VACCINE is not transcribed into this database, so only name, modality and pharmacologic-class evidence is available.',
      'noLabelNoStoredSearchHit means exactly that: no stored label, no stored product listing, and no result on either stored keyword search. It is not a statement that the substance is unstudied. Both searches were run on the full recorded display name, so a parenthesised name such as "LSD (Lysergic Acid Diethylamide)" returns zero by construction; diagnostics.queryHostileName counts those records.',
      "Registry conditions count only where they recur in at least 2 of a record's stored studies and in at least 5% of them, with no exemption for small records. A record with fewer than 2 stored studies therefore contributes no condition text: one sponsor's enrolment list is not a statement about the compound. Stored studies are capped at 250 per record, so the recurrence bar is computed over a truncated set for the most-studied records.",
      'Homeopathic label copy does not set a category. The indication, patient-friendly indication and recorded-use fields are ignored for category matching on a record whose only recorded marketing category is UNAPPROVED HOMEOPATHIC, and on any such field whose own text carries the homeopathic disclaimer. Every other field still sets a category on the same record. diagnostics.categoryOnlyFromHomeopathicLabelText publishes how many records lost their only category to this rule and which thresholds they would otherwise have reached.',
      "Membership of one of the three hand-curated seed files sets that file's category directly (performance-and-grey-market to performance-recovery, controlled-psychoactive to psychoactive-mood, peptide to peptides). Without it the keyword screen reached none of the SARMs except Ostarine, neither anabolic steroid, and no psychoactive at all. The psychoactive-mood category has no keyword lexicon: no text screen for it was found that does not also match every antidepressant and antipsychotic indication in the corpus.",
      'Category matching is a keyword screen over recorded text. A match means the recorded text contains the term; it is not a finding, a use or an effect. Two terms are field-restricted for measured reasons and one residual is named rather than patched: Valproic Acid joins mitochondrial because its stored indication carries the safety sentence about patients with mitochondrial disorders, which is a contraindication read as a use.',
    ],
  }
}

// --- output --------------------------------------------------------------------------------------

function pad(value: string, width: number): string {
  return value.length >= width ? value : value + ' '.repeat(width - value.length)
}

function printSummary(summary: Summary): void {
  const line = (label: string, value: number): void => {
    console.log(`  ${pad(label, 34)}${String(value).padStart(6)}`)
  }
  console.log(`\nPHASE 1 — ${summary.population} canonical records`)
  console.log('\nsignals')
  for (const [key, value] of Object.entries(summary.signals)) line(key, value)
  console.log('\nroute coverage')
  for (const [key, value] of Object.entries(summary.routeCoverage)) line(key, value)
  console.log('\nexclusions')
  for (const [key, value] of Object.entries(summary.exclusions)) line(key, value)
  console.log('\nthresholds')
  for (const [key, value] of Object.entries(summary.thresholds)) line(key, value)
  console.log('\ncategory                        any strict   mod  broad')
  for (const category of CATEGORY_IDS) {
    const cell = (bucket: string): string =>
      String(summary.perCategoryAtThreshold[bucket]?.[category] ?? 0).padStart(6)
    console.log(
      `  ${pad(category, 28)}${cell('any')}${cell('strict')}${cell('moderate')}${cell('broad')}`,
    )
  }
  console.log('\nentity class                    all strict   mod  broad')
  for (const entityClass of Object.keys(summary.entityClassAtThreshold.all ?? {}).sort()) {
    const cell = (bucket: string): string =>
      String(summary.entityClassAtThreshold[bucket]?.[entityClass] ?? 0).padStart(6)
    console.log(
      `  ${pad(entityClass, 28)}${cell('all')}${cell('strict')}${cell('moderate')}${cell('broad')}`,
    )
  }
  console.log('\nroute at threshold              all strict   mod  broad')
  for (const bucketKey of ['recordedSelfUse', 'recordedOtherOnly', 'unrecorded']) {
    const cell = (bucket: string): string =>
      String(summary.routeCoverageAtThreshold[bucket]?.[bucketKey] ?? 0).padStart(6)
    console.log(
      `  ${pad(bucketKey, 28)}${cell('all')}${cell('strict')}${cell('moderate')}${cell('broad')}`,
    )
  }
  console.log('\ndiagnostics')
  for (const [key, tally] of Object.entries(summary.diagnostics)) {
    const all = tally.all
    if (all !== undefined) line(key, all)
  }
}

interface PivotDecision {
  at: string
  phase: string
  decision: string
  detail: string
}

interface PivotState {
  schema_version: number
  phase: string
  cursor: Record<string, unknown>
  counts: Record<string, unknown>
  decisions: PivotDecision[]
  awaiting: string | null
  updated_at: string | null
}

const PHASE_ID = '1'
const PHASE_NAME = '1-classified'

/** Ordering used only to avoid moving `phase` backwards when a later phase has already written. */
function phaseRank(phase: string): number {
  const leading = /^(\d+)/.exec(phase)
  return leading === null ? 0 : Number(leading[1])
}

function readState(): PivotState {
  const empty: PivotState = {
    schema_version: 1,
    phase: 'not-started',
    cursor: {},
    counts: {},
    decisions: [],
    awaiting: null,
    updated_at: null,
  }
  if (!existsSync(STATE_PATH)) return empty
  try {
    const parsed: unknown = JSON.parse(readFileSync(STATE_PATH, 'utf8'))
    if (typeof parsed !== 'object' || parsed === null) return empty
    const state = parsed as Partial<PivotState>
    return {
      schema_version: state.schema_version ?? 1,
      phase: state.phase ?? 'not-started',
      cursor: state.cursor ?? {},
      counts: state.counts ?? {},
      decisions: state.decisions ?? [],
      awaiting: state.awaiting ?? null,
      updated_at: state.updated_at ?? null,
    }
  } catch {
    return empty
  }
}

/**
 * The phases share one state file and may run in either order, so this merges rather than replaces:
 * another phase's counts and decisions survive, this phase's own decisions are rewritten instead of
 * duplicated on a re-run, and `phase` never moves backwards to 1 once a later phase has recorded.
 */
function writeState(summary: Summary): void {
  const previous = readState()
  const at = new Date().toISOString()
  const decisions: PivotDecision[] = [
    {
      at,
      phase: PHASE_ID,
      decision: 'threshold definitions',
      detail:
        'strict = humanStudy AND routeSelfUse AND category AND availableNoRx AND publication; ' +
        'moderate = humanStudy AND category AND (routeSelfUse OR (no route recorded AND entity class ' +
        'SUPPLEMENT_INGREDIENT or BOTANICAL_OR_ORGANISM_PREPARATION)); ' +
        'broad = category AND (humanStudy OR publication). ' +
        'All three additionally require that no exclusion fired (imagingDiagnostic, biosimilar, ' +
        'chemotherapy, anaesthetic, vaccine, noLabelNoStoredSearchHit). ' +
        'The three are audience-fit filters and not a confidence ladder: strict is narrower on ' +
        'availability and route, and measures LOWER on stored evidence depth than moderate.',
    },
    {
      at,
      phase: PHASE_ID,
      decision: 'category matching is a whole-word keyword screen with three narrowing rules',
      detail:
        'Terms match only when neither neighbouring character is a letter or digit, so "sleep" ' +
        'does not match "asleep". Registry conditions count only when they recur in at least 2 of ' +
        "a record's stored studies and in at least 5% of them, with no small-record exemption. " +
        'A handful of terms are restricted to named fields because they are audience vocabulary in ' +
        'an indication and artefact in mechanism prose (mitochondria, mitochondrial, mtor, ' +
        'rapamycin, senescence, senescent, longevity). On a record whose only marketing category is ' +
        'UNAPPROVED HOMEOPATHIC, the indication, patient-friendly indication and recorded-use ' +
        'fields do not set a category. Route is never inferred from entity class; unrecorded stays ' +
        'unrecorded.',
    },
    {
      at,
      phase: PHASE_ID,
      decision: 'seed-file membership sets a category, not availability',
      detail:
        'The three hand-curated seed files are lists of this audience by name, so membership sets ' +
        "that file's category (performance-recovery, psychoactive-mood, peptides). It no longer " +
        'sets availableNoRx: counting it there had made every CONTROLLED_NO_APPROVED_USE record ' +
        'available without a prescription and was the sole availability evidence for ten strict ' +
        'records. psychoactive-mood is in scope and deliberately carries no keyword lexicon.',
    },
    {
      at,
      phase: PHASE_ID,
      decision: 'exclusion rules corrected after measurement',
      detail:
        'chemotherapy fires on FDA pharmacologic class only; oncology words in an indication are ' +
        'recorded and counted instead, because prose cannot establish a drug class. The anaesthetic ' +
        'indication branch first removes setting/risk/reversal phrasings and takes the same ' +
        'seed-slug and self-obtainable exemption. The imaging diagnostic-share branch needs at ' +
        'least 5 stored studies and a radiopharmaceutical/contrast name branch was added. The ' +
        'biosimilar name pattern is case-insensitive and now requires the unsuffixed stem to exist ' +
        'as its own canonical record. noLabelNoHumanStudy was renamed noLabelNoStoredSearchHit.',
    },
  ]
  const state: PivotState = {
    schema_version: previous.schema_version,
    phase: phaseRank(previous.phase) > phaseRank(PHASE_NAME) ? previous.phase : PHASE_NAME,
    cursor: previous.cursor,
    counts: {
      ...previous.counts,
      phase1: {
        population: summary.population,
        signals: summary.signals,
        exclusions: summary.exclusions,
        thresholds: summary.thresholds,
        routeCoverage: summary.routeCoverage,
        diagnostics: summary.diagnostics,
      },
    },
    decisions: [...previous.decisions.filter((entry) => entry.phase !== PHASE_ID), ...decisions],
    awaiting: previous.awaiting,
    updated_at: at,
  }
  writeFileSync(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`)
}

// --- entry point ---------------------------------------------------------------------------------

async function main(): Promise<void> {
  const force = process.argv.includes('--force')
  if (!force && existsSync(RECORDS_PATH) && existsSync(SUMMARY_PATH)) {
    console.log('already done')
    return
  }

  const connectionString = process.env.DATABASE_URL
  if (connectionString === undefined || connectionString === '') {
    throw new Error('DATABASE_URL is not set')
  }
  const pool = new Pool({ connectionString, max: 4, ssl: databaseSslConfig(connectionString) })
  let rows: DrugRow[]
  try {
    const result = await pool.query<DrugRow>(QUERY, [CONDITION_MIN_STUDIES, CONDITION_MIN_SHARE])
    rows = result.rows
  } finally {
    await pool.end()
  }

  // Every canonical name, lowercased, so a suffixed biologic can be tested for a stem record.
  const canonicalNames = new Set(rows.map((row) => row.name.toLowerCase()))
  const records = rows.map((row) => classify(row, canonicalNames))
  const summary = summarize(records)

  mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(RECORDS_PATH, `${records.map((record) => JSON.stringify(record)).join('\n')}\n`)
  writeFileSync(SUMMARY_PATH, `${JSON.stringify(summary, null, 2)}\n`)
  writeState(summary)
  printSummary(summary)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
