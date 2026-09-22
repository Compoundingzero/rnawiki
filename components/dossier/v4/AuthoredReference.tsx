import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ReactNode } from 'react'

/*
 * RNAWiki's own writing about a substance.
 *
 * This is the replacement for the empty pages. The corpus holds no source-linked content for most
 * substances, and the useful sources are mostly not ours to copy: NCCIH is public domain but its
 * ingestion is deferred in `docs/research/competitive-dataset-reader-audit-2026.md`, MedlinePlus
 * drug monographs are American Society of Health-System Pharmacists copyright, and Examine.com,
 * Labdoor, MSKCC About Herbs and ConsumerLab all forbid reproduction. Facts however are not
 * copyrightable, only expression is.
 *
 * So each record is written from scratch by RNAWiki, from facts taken out of public-domain sources,
 * with a verbatim quote behind every claim and a named gap wherever the sources were silent.
 * `data/editorial/authored/<slug>.json` is that dataset.
 *
 * ## Why this reads so defensively
 *
 * Ten records produced by the first authoring run came back with eight keys in common and then
 * sixteen different extras: `whatItIs` in one file, `identity.whatItIs` in four, `safetyNotes` in
 * six, `safety` in none. The schema constrained what the children returned, not the file they wrote,
 * so a component that assumed one shape threw on metformin and would have served a 500 from every
 * page that had a record.
 *
 * So the contract enforced here is narrow and honest: the eight universal keys are read, known
 * variants are resolved, anything unrecognised is ignored, and a missing section renders as absent
 * rather than breaking the page. Pinning the file to the returned object is the pipeline fix for the
 * next tranche, not something this component should paper over.
 */

interface EvidencedClaim {
  claim: string
  quote: string
  publisher: string | null
  url: string | null
}

type Unknown = Record<string, unknown>

const TEXT_KEYS = [
  'text',
  'sentence',
  'summary',
  'value',
  'body',
  'whatItIs',
  'finding',
  'note',
  'statement',
]

/** Coerce a string, or an object that wraps one, into display text. Returns null when unusable. */
function asText(value: unknown): string | null {
  if (typeof value === 'string') return value.trim() || null
  if (Array.isArray(value)) {
    const parts = value.map(asText).filter((part): part is string => Boolean(part))
    return parts.length > 0 ? parts.join(' ') : null
  }
  if (value && typeof value === 'object') {
    const record = value as Unknown
    for (const key of TEXT_KEYS) {
      const inner = asText(record[key])
      if (inner) return inner
    }
  }
  return null
}

/** Coerce an array of strings or wrapped strings into a clean list. */
function asList(value: unknown): string[] {
  if (value === null || value === undefined) return []
  if (Array.isArray(value)) {
    return value.map(asText).filter((item): item is string => Boolean(item))
  }
  const single = asText(value)
  return single ? [single] : []
}

function asClaims(value: unknown): EvidencedClaim[] {
  if (!Array.isArray(value)) return []
  const out: EvidencedClaim[] = []
  for (const item of value) {
    if (!item || typeof item !== 'object') continue
    const entry = item as Unknown
    const claim = asText(entry.claim) ?? asText(entry.point)
    const quote = asText(entry.quote)
    if (!claim || !quote) continue
    out.push({
      claim,
      quote,
      publisher: asText(entry.publisher) ?? asText(entry.source),
      url: typeof entry.url === 'string' ? entry.url : null,
    })
  }
  return out
}

/** Read once per process per slug: the records are small and immutable for a deploy. */
const cache = new Map<string, Unknown | null>()

function record(slug: string): Unknown | null {
  const cached = cache.get(slug)
  if (cached !== undefined) return cached
  let loaded: Unknown | null = null
  try {
    const parsed: unknown = JSON.parse(
      readFileSync(join(process.cwd(), 'data/editorial/authored', `${slug}.json`), 'utf8'),
    )
    loaded =
      parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Unknown) : null
  } catch {
    loaded = null
  }
  cache.set(slug, loaded)
  return loaded
}

const CONFIDENCE_SENTENCE: Record<string, string> = {
  high: 'More than one source backs the main points.',
  medium: 'One source backs the main points, or the sources partly disagree.',
  low: 'Little was found, so treat this as a starting point only.',
}

function Bullets({ items }: { items: string[] }): ReactNode {
  if (items.length === 0) return null
  return (
    <ul>
      {items.map((item, index) => (
        <li key={`${index}-${item.slice(0, 24)}`}>{item}</li>
      ))}
    </ul>
  )
}

export function AuthoredReference({ slug }: { slug: string }): ReactNode {
  const entry = record(slug)
  if (!entry) return null

  const oneLine = asText(entry.oneLineAnswer)
  if (!oneLine) return null

  const identity = (entry.identity ?? {}) as Unknown
  const whatItIs = asText(entry.whatItIs) ?? asText(identity.whatItIs)
  const whatItDoes = asList(entry.whatItDoes)
  const howPeopleUseIt = asList(entry.howPeopleUseIt)
  const whatWeDoNotKnow = asList(entry.whatWeDoNotKnow)
  const gaps = asList(entry.gaps)
  const claims = asClaims(entry.evidence)

  // Safety arrives either as `safetyNotes` (a list) or as a `safety` object with three lists.
  const safetyObject = (entry.safety ?? {}) as Unknown
  const commonSideEffects = asList(safetyObject.commonSideEffects)
  const seriousSigns = asList(safetyObject.seriousSigns)
  const whoShouldAvoid = asList(safetyObject.whoShouldAvoid)
  const safetyNotes = asList(entry.safetyNotes)
  const hasSafety =
    commonSideEffects.length > 0 ||
    seriousSigns.length > 0 ||
    whoShouldAvoid.length > 0 ||
    safetyNotes.length > 0

  const interactions = asList(entry.interactions)
  const pregnancyAndChildren = asText(entry.pregnancyAndChildren)
  const confidence = typeof entry.confidence === 'string' ? entry.confidence : null
  const confidenceSentence = confidence ? (CONFIDENCE_SENTENCE[confidence] ?? null) : null

  return (
    <section
      aria-labelledby="authored-reference-heading"
      className="dv4-simple-section"
      id="authored-reference"
    >
      <h2 id="authored-reference-heading">What RNAWiki says about this</h2>
      <p className="dv4-simple-note">
        Written by RNAWiki from public-domain sources. Not yet reviewed by a clinician. The sources
        are listed below.
      </p>
      <p>
        <strong>{oneLine}</strong>
      </p>

      {whatItIs ? (
        <>
          <h3>What it is</h3>
          <p>{whatItIs}</p>
        </>
      ) : null}

      {whatItDoes.length > 0 ? (
        <>
          <h3>What it does in the body</h3>
          <Bullets items={whatItDoes} />
        </>
      ) : null}

      {howPeopleUseIt.length > 0 ? (
        <>
          <h3>Why people use it</h3>
          <Bullets items={howPeopleUseIt} />
        </>
      ) : null}

      {hasSafety ? (
        <>
          <h3>What can go wrong</h3>
          {commonSideEffects.length > 0 ? (
            <>
              <h4>Common side effects</h4>
              <Bullets items={commonSideEffects} />
            </>
          ) : null}
          {seriousSigns.length > 0 ? (
            <>
              <h4>Signs to take seriously</h4>
              <Bullets items={seriousSigns} />
            </>
          ) : null}
          {whoShouldAvoid.length > 0 ? (
            <>
              <h4>Who should not take it</h4>
              <Bullets items={whoShouldAvoid} />
            </>
          ) : null}
          {safetyNotes.length > 0 ? (
            <>
              <h4>What the sources say about safety</h4>
              <Bullets items={safetyNotes} />
            </>
          ) : null}
        </>
      ) : null}

      {interactions.length > 0 ? (
        <>
          <h3>What it mixes badly with</h3>
          <Bullets items={interactions} />
        </>
      ) : null}

      {pregnancyAndChildren ? (
        <>
          <h3>Pregnancy and children</h3>
          <p>{pregnancyAndChildren}</p>
        </>
      ) : null}

      {whatWeDoNotKnow.length > 0 ? (
        <>
          <h3>What nobody has settled yet</h3>
          <Bullets items={whatWeDoNotKnow} />
        </>
      ) : null}

      {confidence && confidenceSentence ? (
        <p className="dv4-simple-note">
          How sure we are: {confidence}. {confidenceSentence}
        </p>
      ) : null}

      {gaps.length > 0 ? (
        <details>
          <summary>What we looked for and could not find ({gaps.length})</summary>
          <Bullets items={gaps} />
        </details>
      ) : null}

      {claims.length > 0 ? (
        <details>
          <summary>Every claim above, with the source it came from ({claims.length})</summary>
          <ul>
            {claims.map((claim, index) => (
              <li key={`${index}-${claim.claim.slice(0, 24)}`}>
                <p>{claim.claim}</p>
                <p className="dv4-simple-note">
                  &ldquo;{claim.quote}&rdquo;
                  {claim.publisher ? <> &middot; {claim.publisher}</> : null}
                  {claim.url ? (
                    <>
                      {' '}
                      &middot; <a href={claim.url}>the source</a>
                    </>
                  ) : null}
                </p>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  )
}
