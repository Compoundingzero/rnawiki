/**
 * Public-data safeguards shared by ingestion, database reads, and dataset export.
 *
 * These checks are deliberately conservative: they remove only known placeholder identities,
 * exact legacy editorial wording, and short indications that came from negated or truncated label
 * clauses. Source medical wording is otherwise unchanged.
 */

export const PUBLIC_PLACEHOLDER_MEDICINE_SLUGS = [
  'tbd',
  'tbc',
  'todo',
  'unknown',
  'unnamed',
  'n-a',
  'none',
  'not-available',
  'not-applicable',
] as const

export const PUBLIC_PLACEHOLDER_MEDICINE_NAMES = [
  'tbd',
  'tbc',
  'todo',
  'unknown',
  'unnamed',
  'n/a',
  'na',
  'none',
  'not available',
  'not applicable',
] as const

const PLACEHOLDER_MEDICINE_NAME =
  /^(?:TBD|TBC|TODO|UNKNOWN|UNNAMED|N\/?A|NONE|NOT AVAILABLE|NOT APPLICABLE)$/i

const NON_MEDICAL_EDITORIAL_ASIDES: ReadonlyArray<RegExp> = [
  /\s*\(Notice:\s*no disease treatment claims\s*[—–-]\s*this keeps you clean in Rx dietary supplement lane\.\)\s*/giu,
]

const LEGACY_PUBLIC_NARRATIVE_REPAIRS = new Map<
  string,
  Readonly<{ previous: string; replacement: string }>
>([
  [
    'adalimumab',
    {
      previous:
        'Your immune system uses a messenger protein called TNF-alpha to tell white blood cells where to attack. In rheumatoid arthritis that message is being broadcast into healthy joints. Adalimumab is a sponge shaped to fit TNF-alpha and nothing else, so it soaks the messenger out of the blood and joint fluid before any cell reads it. The attack orders never arrive.',
      replacement:
        'Your immune system uses a messenger protein called TNF-alpha to activate inflammation. In rheumatoid arthritis, too much of that signal reaches healthy joints. Adalimumab binds TNF-alpha and reduces its ability to activate TNF receptors. This lowers one source of inflammation; it does not switch off every inflammatory pathway.',
    },
  ],
  [
    'cannabidiol',
    {
      previous:
        'Nobody knows. That is the honest answer and it is unusual for an approved drug. Cannabidiol does not switch on the cannabinoid receptor that THC uses, which is why it is not intoxicating. It touches a long list of other targets in the laboratory — a heat-sensing ion channel, an orphan receptor, a serotonin receptor, sodium channels — and none of them has been shown to be the one that stops seizures. What is established is the clinical result: in three specific childhood epilepsies, added to existing medication, seizure counts fall further than on placebo.',
      replacement:
        'The mechanism is not known, which is unusual for an approved drug. Cannabidiol does not switch on the cannabinoid receptor that THC uses, which is why it is not intoxicating. It affects several other targets in laboratory studies — including a heat-sensing ion channel, an orphan receptor, a serotonin receptor and sodium channels — but none has been shown to be the one that stops seizures. What is established is the clinical result: in three specific childhood epilepsies, adding cannabidiol to existing medication reduces seizure counts more than placebo.',
    },
  ],
  [
    'chlorpromazine',
    {
      previous:
        'Dopamine D2 receptor, blocked alongside a very wide range of other targets. The label describes strong antiadrenergic and weaker peripheral anticholinergic activity, slight ganglionic blocking action, and slight antihistaminic and antiserotonin activity, and states plainly that the precise mechanis…',
      replacement:
        'Dopamine D2 receptor, blocked alongside a very wide range of other targets. The label describes strong antiadrenergic and weaker peripheral anticholinergic activity, slight ganglionic blocking action, and slight antihistaminic and antiserotonin activity, and states that the precise mechanism by which its therapeutic effects are produced is not known.',
    },
  ],
  [
    'linezolid',
    {
      previous:
        'Bacteria build proteins on a two-part machine. Linezolid wedges itself into the larger part at the point where the first amino acid is loaded, so the machine can never start. Nothing else in medicine works at that step, which is why bacteria resistant to everything else are often still susceptible. Human cells have their own version of that machine inside their mitochondria, and it is similar enough that long courses damage nerves, eyes and bone marrow.',
      replacement:
        'Bacteria build proteins on a two-part machine called a ribosome. Linezolid blocks formation of the bacterial 70S initiation complex, stopping protein production at an early step that differs from the targets of most other antibiotics. It can remain active against some resistant Gram-positive bacteria, although linezolid resistance exists. Human mitochondria contain related machinery, which helps explain why long courses can damage nerves, eyes and bone marrow.',
    },
  ],
  [
    'nitrofurantoin',
    {
      previous:
        'The bladder urine. Nitrofurantoin achieves antibacterial concentrations only in urine, and the label states plainly that it lacks the broader tissue distribution of other urinary tract agents.',
      replacement:
        'Bladder urine. Nitrofurantoin reaches antibacterial concentrations in urine but does not spread through tissues as widely as other urinary tract antibiotics.',
    },
  ],
  [
    'pegfilgrastim',
    {
      previous:
        'Pegfilgrastim is the same protein as filgrastim with a long, inert polymer chain attached to one end. The chain makes the molecule too large for the kidney to filter out, so the only thing that removes it from the blood is the neutrophils it creates. While your white count is low, the drug stays. As the count recovers, the new neutrophils mop up the remaining drug. The dose regulates itself.',
      replacement:
        'Pegfilgrastim is the same protein as filgrastim with a long, inert polymer chain attached to one end. The chain reduces removal by the kidneys, so neutrophil-mediated clearance becomes the main route. While the neutrophil count is low, clearance is slower. As the count recovers, clearance increases, allowing one dose to provide support through a chemotherapy cycle.',
    },
  ],
  [
    'tadalafil',
    {
      previous:
        'Tadalafil blocks an enzyme that breaks down a signalling molecule called cyclic GMP. With the enzyme blocked, cyclic GMP accumulates and smooth muscle relaxes — which is a well-understood account of how the drug produces an erection. For the prostate, the honest answer is that nobody knows: the label says in as many words that the mechanism for reducing these symptoms has not been established. The leading guesses are that it relaxes prostate and bladder-neck muscle through the same pathway, improves blood flow to the pelvis, or quietens the sensory nerves in the bladder. The trials are positive; the explanation is not settled.',
      replacement:
        'Tadalafil blocks an enzyme that breaks down a signalling molecule called cyclic GMP. With the enzyme blocked, cyclic GMP accumulates and smooth muscle relaxes — which is a well-understood account of how the drug produces an erection. For prostate symptoms, the mechanism is unknown: the label says it has not been established. The leading explanations are that tadalafil relaxes prostate and bladder-neck muscle through the same pathway, improves blood flow to the pelvis, or quietens sensory nerves in the bladder. The trials are positive; the explanation is not settled.',
    },
  ],
])

// Nitrofurantoin had separate dated strings in three public fields. Keep the additional two exact
// matches here rather than broadening the compatibility cleaner to approximate text replacement.
const ADDITIONAL_LEGACY_PUBLIC_NARRATIVE_REPAIRS = new Map<string, ReadonlyMap<string, string>>([
  [
    'nitrofurantoin',
    new Map([
      [
        'Nitrofurantoin is swallowed, absorbed, and then dumped almost immediately into the urine, where it becomes very concentrated. Bacteria in the bladder take it up and their own enzymes chop it into reactive fragments — and those fragments attack everything at once: the bacterium’s genetic material, its protein factory, its enzymes. There is no single target to mutate away from, which is why seventy years of use has produced so little resistance.',
        'Nitrofurantoin is absorbed after swallowing and then concentrated in the urine. Bacterial nitroreductase enzymes convert it into reactive intermediates that damage DNA, ribosomal proteins and other macromolecules. Because several bacterial systems are affected, resistance has remained relatively uncommon despite decades of use.',
      ],
      [
        'Urinary tract infections when due to susceptible strains of Escherichia coli, enterococci, Staphylococcus aureus and certain susceptible strains of Klebsiella and Enterobacter species. It treats the bladder and nothing else, because it does not distribute into tissue.',
        'Urinary tract infections caused by susceptible strains of Escherichia coli, enterococci, Staphylococcus aureus and certain susceptible strains of Klebsiella and Enterobacter species. It is used for lower urinary tract infections because it concentrates in urine and does not reach therapeutic concentrations in kidney tissue.',
      ],
    ]),
  ],
])

const LEGACY_NEGATED_LIMITATIONS = new Map<string, RegExp>([
  ['depemokimab', /^acute bronchospasm or status asthmaticus\b/i],
  ['mepolizumab', /^acute bronchospasm or status asthmaticus\b/i],
  ['reslizumab', /^acute bronchospasm or status asthmaticus\b/i],
  [
    'setmelanotide',
    /^the following conditions as IMCIVREE would not be expected to be effective\b/i,
  ],
  ['tezepelumab', /^acute bronchospasm or status asthmaticus\b/i],
  ['zolmitriptan', /^cluster headache\b.*\bnot recommended\b/i],
])

const CLAUSE_BOUNDARIES = ['.', '?', '!', ';', ':', '•'] as const
const NEGATED_USE_CUES: ReadonlyArray<RegExp> = [
  /\bnot\s+(?:indicated|approved|recommended|intended|used|to\s+be\s+used|for)\b/i,
  /\bnever\s+(?:indicated|approved|recommended|intended|used|to\s+be\s+used|for)\b/i,
  /\b(?:is|are|was|were|be|been|being|has|have|had|do|does|did|should|must|may|can|could|would|will)\s+not\b/i,
  /\bcannot\b/i,
  /\bcontraindicated\b/i,
]
const NEGATED_PHRASE_CUES: ReadonlyArray<RegExp> = [
  /\b(?:has|have|had)\s+not\s+been\s+(?:established|demonstrated|studied|evaluated)\b/i,
  /\b(?:is|are|was|were)\s+not\s+(?:indicated|approved|recommended|intended)\b/i,
  /\bwould\s+not\s+be\s+expected\s+to\s+be\s+effective\b/i,
  /\bcontraindicated\b/i,
]

function normaliseWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

export function isPlaceholderMedicineName(value: string): boolean {
  return PLACEHOLDER_MEDICINE_NAME.test(normaliseWhitespace(value))
}

export function isPlaceholderMedicineIdentity(input: { slug: string; name: string }): boolean {
  return (
    PUBLIC_PLACEHOLDER_MEDICINE_SLUGS.includes(
      input.slug.toLowerCase() as (typeof PUBLIC_PLACEHOLDER_MEDICINE_SLUGS)[number],
    ) || isPlaceholderMedicineName(input.name)
  )
}

/** Remove the exact known editorial instruction without paraphrasing the surrounding label. */
export function cleanSourceLabelText(value: string): string {
  let clean = value
  for (const pattern of NON_MEDICAL_EDITORIAL_ASIDES) clean = clean.replace(pattern, ' ')
  return normaliseWhitespace(clean)
}

/**
 * Replace only exact, dated legacy narrative strings whose source dossiers have already been
 * edited. Exact matching prevents this compatibility repair from overwriting later human work.
 */
export function cleanLegacyPublicNarrative(medicineSlug: string, value: string): string {
  const repair = LEGACY_PUBLIC_NARRATIVE_REPAIRS.get(medicineSlug)
  if (repair && value === repair.previous) return repair.replacement
  return ADDITIONAL_LEGACY_PUBLIC_NARRATIVE_REPAIRS.get(medicineSlug)?.get(value) ?? value
}

function clauseBefore(text: string, index: number): string {
  let boundary = -1
  for (const marker of CLAUSE_BOUNDARIES) {
    boundary = Math.max(boundary, text.lastIndexOf(marker, index - 1))
  }
  return text.slice(boundary + 1, index)
}

export function isNegatedLabelUseAt(text: string, index: number): boolean {
  const context = clauseBefore(text, index).slice(-180)
  return NEGATED_USE_CUES.some((pattern) => pattern.test(context))
}

/**
 * True only when the exact short phrase is present in the source label and every occurrence is in
 * a negated use or limitation. If the label also states the phrase positively, it remains public.
 */
export function isOnlyNegatedLabelPhrase(labelText: string, phrase: string): boolean {
  const label = normaliseWhitespace(labelText).toLocaleLowerCase('en')
  const needle = normaliseWhitespace(phrase).toLocaleLowerCase('en')
  if (!label || !needle) return false
  const phraseIsNegated = NEGATED_PHRASE_CUES.some((pattern) => pattern.test(needle))

  let found = false
  let from = 0
  while (from <= label.length - needle.length) {
    const index = label.indexOf(needle, from)
    if (index < 0) break
    found = true
    if (!phraseIsNegated && !isNegatedLabelUseAt(label, index)) return false
    from = index + Math.max(needle.length, 1)
  }
  return found
}

/**
 * Detect the old extractor's 140-character mid-word cut without guessing from length alone. The
 * phrase must occur verbatim in the source label and every occurrence must continue immediately
 * with a Unicode letter or number. A complete source phrase ending at punctuation or whitespace
 * is never classified as truncated.
 */
export function isTruncatedLabelPhrase(labelText: string, phrase: string): boolean {
  const label = normaliseWhitespace(labelText).toLocaleLowerCase('en')
  const needle = normaliseWhitespace(phrase).toLocaleLowerCase('en')
  if (!label || !needle) return false

  let found = false
  let from = 0
  while (from <= label.length - needle.length) {
    const index = label.indexOf(needle, from)
    if (index < 0) break
    found = true
    const next = label[index + needle.length]
    if (!next || !/[\p{L}\p{N}]/u.test(next)) return false
    from = index + Math.max(needle.length, 1)
  }
  return found
}

function isEmptyObject(value: unknown): value is Record<string, never> {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null) &&
    Object.keys(value).length === 0
  )
}

/**
 * Remove placeholder empty objects from a public payload without fabricating the properties that
 * should have occupied them. Object-valued fields that become empty are omitted; empty objects in
 * arrays are removed. Empty arrays remain arrays because they carry an honest "no exported rows"
 * meaning.
 */
export function removeEmptyObjectShells(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(removeEmptyObjectShells).filter((entry) => !isEmptyObject(entry))
  }
  if (value === null || typeof value !== 'object') return value
  if (value instanceof Date) return value

  const entries = Object.entries(value as Record<string, unknown>).flatMap(([key, entry]) => {
    const cleaned = removeEmptyObjectShells(entry)
    return cleaned === undefined || isEmptyObject(cleaned) ? [] : [[key, cleaned] as const]
  })
  return Object.fromEntries(entries)
}

export interface PublicLabelFields {
  medicineSlug?: string
  indication: string
  patientFriendlyIndication: string
}

/** Public read boundary for legacy label fields already stored in the database. */
export function cleanPublicLabelFields(input: PublicLabelFields): PublicLabelFields {
  const indication = input.medicineSlug
    ? cleanLegacyPublicNarrative(input.medicineSlug, cleanSourceLabelText(input.indication))
    : cleanSourceLabelText(input.indication)
  const patientFriendlyIndication = cleanSourceLabelText(input.patientFriendlyIndication)
  const legacyMatcher = input.medicineSlug
    ? LEGACY_NEGATED_LIMITATIONS.get(input.medicineSlug)
    : undefined
  const knownLegacyFalsePositive =
    legacyMatcher !== undefined && legacyMatcher.test(patientFriendlyIndication)
  const unsafeExtract =
    patientFriendlyIndication &&
    (isOnlyNegatedLabelPhrase(indication, patientFriendlyIndication) ||
      isTruncatedLabelPhrase(indication, patientFriendlyIndication))
  return {
    indication,
    patientFriendlyIndication:
      knownLegacyFalsePositive || unsafeExtract ? '' : patientFriendlyIndication,
  }
}
