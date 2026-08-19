import type { ClaimEvidenceView, EvidenceSourceView } from '@/lib/types'
import type { EvidenceRelationship } from '@/lib/evidence'
import { EVIDENCE_RELATIONSHIP_LABELS } from '@/lib/evidence'

/**
 * The study detail behind one claim, as real ordered rows of real links in the server-rendered
 * HTML.
 *
 * This carries forward the rule that replaced the original client-only drawer, whose contents
 * mounted on click: every DOI and PMID on the site was invisible to a reader without JavaScript
 * and to anything crawling the page — on a site whose entire argument is "here is the source". A
 * native <details> keeps the list out of the default reading path without taking it out of the
 * document.
 *
 * Only fields that exist are rendered. A source with no sample size shows no sample-size row;
 * nothing ever prints "N/A", no value is inferred from another, and no value is guessed from a
 * DOI or PMID (lib/metadata-import.ts is metadata-only for the same reason).
 *
 * Sources are grouped by how they bear on the answer. The grouping is carried by the heading text
 * alone — never by colour — because a colour-only group is invisible to a reader who cannot see
 * it and meaningless in print.
 */

/** One resolvable link per source, in the order of preference the corpus actually stores. */
export function sourceUrl(s: EvidenceSourceView): string | null {
  if (s.doi) return `https://doi.org/${s.doi}`
  if (s.pmid) return `https://pubmed.ncbi.nlm.nih.gov/${s.pmid}/`
  if (s.clinicalTrialId) return `https://clinicaltrials.gov/study/${s.clinicalTrialId}`
  if (s.regulatoryUrl) return s.regulatoryUrl
  return null
}

/** "Authors (2025). Journal." — each part dropped when the record does not have it. */
function publicationLine(s: EvidenceSourceView): string | null {
  const parts = [s.authors, s.publicationYear ? `(${s.publicationYear})` : null, s.journalOrIssuer].filter(Boolean)
  return parts.length > 0 ? parts.join('. ') : null
}

/**
 * Whether the recorded species is people.
 *
 * Deliberately strict. `human cells (in vitro) and rat (in vivo)` and
 * `mixed (35 preclinical studies, 1 human clinical study)` both contain the word "human" and
 * neither is a study of people — reading them as human would print "44 people" over cell work,
 * which is the exact overstatement this site exists to prevent.
 */
function isHumanSpecies(species: string | null): boolean {
  if (!species) return false
  const s = species.trim().toLowerCase()
  if (s.includes('cell')) return false
  return s.startsWith('human')
}

/**
 * Words that say part of the work happened inside a living animal or person.
 *
 * Word-boundary matched, deliberately: "rat" is a substring of "administration" and "generated",
 * and a gloss that fires on a coincidence is exactly the failure this guards.
 */
const LIVING_SUBJECT = /\bin vivo\b|\banimals?\b|\brats?\b|\bmouse\b|\bmice\b|\bmurine\b|\bpatients?\b|\bvolunteers?\b/

/**
 * A plain-language gloss for a technical study description, derived only from words the record
 * already contains. Nothing is inferred about a study that does not say it.
 *
 * Returns null when the stored description is already plain, so a readable string is never
 * decorated with a restatement of itself.
 */
function designGloss(design: string, species: string | null): string | null {
  const d = design.toLowerCase()
  const subject = isHumanSpecies(species) ? 'people' : 'subjects'

  if (d.includes('systematic review') || d.includes('meta-analysis')) {
    return 'a search and summary of studies that already existed, not a new experiment'
  }
  if (d.includes('single-arm') || d.includes('single arm') || d.includes('single-group') || d.includes('uncontrolled')) {
    return 'there was no comparison group'
  }
  if (d.includes('randomized') || d.includes('randomised')) {
    return `${subject} were assigned to different groups`
  }
  if (d.includes('retrospective') || d.includes('case series')) {
    return 'existing records were reviewed afterwards'
  }
  if (d.includes('observational') || d.includes('cohort') || d.includes('registry')) {
    return 'nobody decided who received it'
  }
  // ONLY when the design is purely outside a living body. Hsieh 2017 is stored as "mechanistic
  // study (in vitro human vascular endothelial cells + in vivo rat hind-limb ischemia model)",
  // and this branch printed "the work was done in cells or tissue outside a living body" onto a
  // row that names a live rat model in the same line. The gloss layer exists to help a
  // non-scientist, so a half-wrong gloss is worse than none: a mixed design returns nothing and
  // the reader is left with the stored description, which is accurate.
  if (d.includes('in vitro') || d.includes('explant') || d.includes('cell assay')) {
    return LIVING_SUBJECT.test(d) ? null : 'the work was done in cells or tissue outside a living body'
  }
  return null
}

/** Lower-case, punctuation and parentheticals stripped, for comparing two stored descriptions. */
function normalise(v: string): string {
  return v
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * The experimental settings a description names, as concepts rather than words.
 *
 * Two stored descriptions of the same study routinely name the same settings in different
 * vocabulary — "in vitro human vascular endothelial cells" and "in vitro cell assay", "animal
 * study (rat)" and "controlled animal injury study" — so a plain word comparison sees two
 * different strings where a reader sees the same fact twice. Each setting is collapsed to one
 * token before the two are compared, which is what lets the containment test below see that one
 * description already says everything the other does.
 *
 * Kept to the three settings only. Adding design descriptors (randomised, controlled, phase) would
 * start dropping strings that carry genuinely different facts: "animal study (mouse), multi-site
 * randomized lifespan study" and "Multi-site, randomized, controlled lifespan study — NIA
 * Interventions Testing Program" must both print, because neither contains the other's content.
 */
const SETTING_TERMS: [RegExp, string][] = [
  [/\bin vitro\b|\bcell assay\b|\bcell culture\b|\bcultured\b/g, ' \u00a7vitro '],
  [/\bex vivo\b|\bexplants?\b/g, ' \u00a7exvivo '],
  [/\bin vivo\b|\banimals?\b|\brats?\b|\bmouse\b|\bmice\b|\bmurine\b/g, ' \u00a7vivo '],
]

/**
 * Connective words that join two descriptions rather than describe one. Removed before comparing,
 * because "in vitro cell assay COMBINED WITH in vivo animal ischemia model" says nothing about the
 * study that "in vitro … + in vivo …" does not.
 */
const CONNECTIVES = new Set(['a', 'an', 'the', 'and', 'or', 'of', 'in', 'to', 'on', 'with', 'plus', 'combined', 'using', 'via', 'from', 'by'])

/** The content of a stored description as a comparable set: settings collapsed, connectives gone. */
function contentTokens(v: string): Set<string> {
  let text = ` ${v.toLowerCase()} `
  for (const [pattern, token] of SETTING_TERMS) text = text.replace(pattern, token)
  return new Set(
    text
      .replace(/[^a-z0-9\u00a7 ]+/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      // Crude singularisation: "cells"/"cell", "regimens"/"regimen". Enough for two descriptions
      // of one study written by the same editor; it is a de-duplication heuristic, not grammar.
      .map((w) => (w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w))
      .filter((w) => !CONNECTIVES.has(w))
  )
}

function isSubset(a: Set<string>, b: Set<string>): boolean {
  for (const v of a) if (!b.has(v)) return false
  return true
}

/**
 * One statement of the study design per row.
 *
 * `sourceType` and `studyDesign` are two stored descriptions of the same thing and they are usually
 * near-duplicates of each other. The old test was exact string equality, which never fires on the
 * pairs that actually occur — "systematic review" beside "systematic review (PubMed, Cochrane,
 * Embase; PROSPERO-checked; 1993 to June 3, 2024)", or "in vitro / ex vivo mechanistic study
 * (cultured tendon fibroblasts and tendon explants)" beside "in vitro / ex vivo mechanistic
 * experiment" — so the design printed twice in one row, six lines of it on a phone.
 *
 * Containment decides, in both directions, on normalised strings: whichever of the two says
 * everything the other says is the one printed, and the other is dropped. Only when neither
 * contains the other, and they do not even open with the same phrase, do both print — that is the
 * case where they genuinely carry different facts.
 */
function evidenceTypeText(s: EvidenceSourceView): string {
  const type = s.sourceType.trim()
  const design = s.studyDesign?.trim() ?? null
  if (!design) return type

  const a = normalise(type)
  const b = normalise(design)
  const lead = (v: string) => v.split(' ').slice(0, 3).join(' ')

  if (b.includes(a)) return design
  if (a.includes(b)) return type

  // Containment again, on CONTENT rather than characters. normalise() strips parentheticals, and
  // the parenthetical is where one of these two usually says everything the other does: Hsieh 2017
  // stores "mechanistic study (in vitro human vascular endothelial cells + in vivo rat hind-limb
  // ischemia model)" and "in vitro cell assay combined with in vivo animal ischemia model", which
  // are the same design in two vocabularies, and printed joined by a dot they gave the reader a
  // three-register run-on that named the design twice. Whichever description carries every fact
  // the other does is the one printed; a tie prints the longer, which is the one with the detail.
  const typeTokens = contentTokens(type)
  const designTokens = contentTokens(design)
  const designIsRedundant = isSubset(designTokens, typeTokens)
  const typeIsRedundant = isSubset(typeTokens, designTokens)
  if (designIsRedundant && typeIsRedundant) return type.length >= design.length ? type : design
  if (designIsRedundant) return type
  if (typeIsRedundant) return design

  // Compared on the ORIGINAL strings, not the normalised ones: normalise() strips parentheticals,
  // and the parenthetical is usually the reason one of the two is worth printing — "in vitro /
  // ex vivo mechanistic study (cultured tendon fibroblasts and tendon explants)" says what was
  // studied, "in vitro / ex vivo mechanistic experiment" does not.
  if (lead(a) === lead(b)) return type.length >= design.length ? type : design
  return `${type} \u00b7 ${design}`
}

/**
 * "Randomised controlled trial — people were assigned to different groups".
 *
 * Exported for tests/unit/source-type-of-evidence.test.ts: this row is assembled from three
 * stored strings by two heuristics, and both have printed something false in the past. The unit
 * test runs the real corpus values through it.
 */
export function typeOfEvidence(s: EvidenceSourceView): string {
  // The gloss says what the phrase MEANS ("there was no comparison group"), which is a different
  // thing from what it is called, so it is not a restatement even when its trigger word is visible
  // in the text above it.
  const gloss = designGloss(`${s.sourceType} ${s.studyDesign ?? ''}`, s.species)
  const text = evidenceTypeText(s)
  return gloss ? `${text} — ${gloss}` : text
}

/**
 * A registry entry that never posted results records a PLANNED enrolment, not people studied.
 *
 * NCT02637284 is the case: a Phase I record with 42 healthy volunteers and no results ever posted,
 * printed as "Number studied — 42 people (n = 42)" on a page whose own answer states that no
 * controlled human trial with published results exists at any phase. That asserts a human-exposure
 * count no source recorded. Matched on what the record itself says about its results, never
 * inferred from the number.
 */
function isUnreportedRegistryRecord(s: EvidenceSourceView): boolean {
  const text = `${s.sourceType} ${s.studyDesign ?? ''}`.toLowerCase()
  return /no results|not posted|results have never|registered .*record|ongoing|estimated completion/.test(text)
}

/**
 * "44 people (n = 44)" only where the record says the subjects were people. Otherwise the count
 * travels with whatever species was actually recorded, and never with an invented unit.
 */
function numberStudied(s: EvidenceSourceView): string | null {
  if (s.sampleSize === null) return null
  if (isUnreportedRegistryRecord(s)) return `n = ${s.sampleSize} (registered enrolment; no results posted)`
  if (isHumanSpecies(s.species)) return `${s.sampleSize} people (n = ${s.sampleSize})`
  if (s.species) return `n = ${s.sampleSize} (${s.species})`
  return `n = ${s.sampleSize}`
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="source__row">
      <dt className="source__t">{label}</dt>
      <dd className="source__v">{children}</dd>
    </div>
  )
}

/** Group headings, in the fixed reading order: supporting, limiting, conflicting, background. */
const GROUPS: { relationship: EvidenceRelationship; heading: string }[] = [
  { relationship: 'supports', heading: 'Evidence supporting the answer' },
  { relationship: 'limits', heading: 'Evidence limiting the answer' },
  { relationship: 'contradicts', heading: 'Evidence conflicting with the answer' },
  { relationship: 'contextualizes', heading: 'Background and context' },
]

function SourceItem({ link }: { link: ClaimEvidenceView }) {
  const s = link.source
  const url = sourceUrl(s)
  const publication = publicationLine(s)
  const studied = numberStudied(s)
  const hasIdentifier = Boolean(s.doi || s.pmid || s.clinicalTrialId || s.regulatoryUrl)

  return (
    <li>
      <p className="source__h">{url ? <a href={url}>{s.title}</a> : s.title}</p>

      {/* A retraction or correction is a safety notice about the source itself, so it sits above
          the record rather than inside its field rows. */}
      {s.retractionStatus && <p className="notice">{s.retractionStatus}</p>}

      {publication && <p className="source__line">{publication}</p>}

      {/* A bare <dl>: the labelled rows carry their own class hooks, and no name outside the
          CSS contract is invented here. */}
      <dl>
        <Row label="Type of evidence">{typeOfEvidence(s)}</Row>

        {s.species && <Row label="Who or what was studied">{s.species}</Row>}
        {studied && <Row label="Number studied">{studied}</Row>}
        {s.endpoint && <Row label="What researchers measured">{s.endpoint}</Row>}
        <Row label="What they found">{link.directlyMeasuredResult}</Row>
        <Row label="How this source affects the answer">
          {EVIDENCE_RELATIONSHIP_LABELS[link.relationship]} this answer on {link.claimPartAddressed}
        </Row>

        {/* Identifiers stay verbatim and stay monospace. They are the part of a record a reader
            checks somewhere else, so they are never abbreviated or reformatted. */}
        {hasIdentifier && (
          <Row label="Source identifier">
            {[
              s.doi ? (
                <>
                  DOI <span className="id">{s.doi}</span>
                </>
              ) : null,
              s.pmid ? (
                <>
                  PMID <span className="id">{s.pmid}</span>
                </>
              ) : null,
              s.clinicalTrialId ? (
                <>
                  Trial <span className="id">{s.clinicalTrialId}</span>
                </>
              ) : null,
              s.regulatoryUrl ? (
                <a href={s.regulatoryUrl} className="id">
                  {s.regulatoryUrl}
                </a>
              ) : null,
            ]
              .filter((part) => part !== null)
              .map((part, i) => (
                <span key={i}>
                  {i > 0 && ' · '}
                  {part}
                </span>
              ))}
          </Row>
        )}
      </dl>
    </li>
  )
}

export function EvidenceSourceList({ evidence }: { evidence: ClaimEvidenceView[] }) {
  if (evidence.length === 0) return null

  const groups = GROUPS.map((g) => ({
    ...g,
    items: evidence.filter((link) => link.relationship === g.relationship),
  })).filter((g) => g.items.length > 0)

  if (groups.length === 0) return null

  return (
    <details className="disclosure disclosure--inline">
      <summary>Study details and sources</summary>
      <div className="disclosure__body">
        {groups.map((g) => (
          <section key={g.relationship} className="source-group">
            <h6 className="source-group__h">{g.heading}</h6>
            <ol className="sources">
              {g.items.map((link, i) => (
                <SourceItem key={`${link.source.id}-${i}`} link={link} />
              ))}
            </ol>
          </section>
        ))}
      </div>
    </details>
  )
}
