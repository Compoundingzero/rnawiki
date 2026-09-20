/**
 * The smallest reader-facing evidence unit that can be assembled from this record.
 *
 * A source passage is evidence of what that one document says, not a human treatment result. A
 * contextual trial snapshot is evidence of its reported measurement, not a medicine-wide verdict.
 * Null fields are deliberate: an unavailable study population must not become a generic paragraph
 * about who might have been excluded.
 */
import type { SourceCitation } from '@/lib/dossier-v3/fields'
import type { RecordedFact, RecordedTrialSnapshot } from './recorded-facts'
import type { RecordedLabel } from './recorded-label'

export interface CheckpointLine {
  label: string
  text: string
  sources: SourceCitation[]
}

export interface SourceBoundCheckpoint {
  kind: 'human_result' | 'source_statement' | 'no_source_claim'
  claim: CheckpointLine | null
  tested: CheckpointLine | null
  studied: CheckpointLine | null
  measured: CheckpointLine | null
  boundary: CheckpointLine | null
  product: CheckpointLine | null
}

function linked(source: SourceCitation | undefined): source is SourceCitation & { url: string } {
  if (!source?.url) return false
  try {
    const url = new URL(source.url)
    return url.protocol === 'https:' && Boolean(url.hostname)
  } catch {
    return false
  }
}

function line(label: string, text: string, sources: SourceCitation[]): CheckpointLine | null {
  const linkedSources = sources.filter(linked)
  return text.trim() && linkedSources.length
    ? { label, text: text.trim(), sources: linkedSources }
    : null
}

function contextualResult(snapshot: RecordedTrialSnapshot): boolean {
  const trialId = snapshot.trialIdentifier.trim().toUpperCase()
  let registryPathMatches = false
  if (linked(snapshot.citation)) {
    const url = new URL(snapshot.citation.url)
    registryPathMatches =
      url.hostname === 'clinicaltrials.gov' && url.pathname.toUpperCase() === `/STUDY/${trialId}`
  }
  return Boolean(
    /^NCT\d{8}$/.test(trialId) &&
    snapshot.condition.trim() &&
    snapshot.testedIntervention.trim() &&
    snapshot.formulationAndRoute.trim() &&
    snapshot.endpoint.trim() &&
    snapshot.activeResult.trim() &&
    snapshot.comparatorResult?.trim() &&
    snapshot.timepoint.trim() &&
    linked(snapshot.citation) &&
    linked(snapshot.contextCitation) &&
    snapshot.citation.id?.toUpperCase() === trialId &&
    snapshot.contextCitation.id?.toUpperCase() === trialId &&
    snapshot.citation.url === snapshot.contextCitation.url &&
    registryPathMatches,
  )
}

export function buildSourceBoundCheckpoint(input: {
  label: RecordedLabel
  trialSnapshots: RecordedTrialSnapshot[]
  /** Pre-filtered, single-product facts only; aggregate ingredient listings do not qualify. */
  exactSupply: RecordedFact[]
}): SourceBoundCheckpoint {
  const productFact = input.exactSupply.find((fact) => linked(fact.citation))
  const product = productFact
    ? line('One recorded product form', productFact.text, [productFact.citation])
    : null
  const snapshot = input.trialSnapshots.find(contextualResult)

  if (snapshot) {
    const result = `${snapshot.endpoint}: ${snapshot.activeResult} versus ${snapshot.comparatorResult} in the comparison group at ${snapshot.timepoint}.`
    const studiedText = !snapshot.populationCitation
      ? ''
      : snapshot.population?.trim()
        ? `${snapshot.population.trim()} (${snapshot.condition}).`
        : snapshot.included.length > 0
          ? `${snapshot.condition}; entry criteria included ${snapshot.included.slice(0, 2).join('; ')}.`
          : ''
    const excluded = snapshot.excluded.filter((value) => value.trim()).slice(0, 2)
    return {
      kind: 'human_result',
      claim: line('What the source reports', result, [snapshot.citation]),
      tested: line(
        'What was tested',
        `${snapshot.testedIntervention} (${snapshot.formulationAndRoute}) was studied for ${snapshot.condition}.`,
        [snapshot.contextCitation],
      ),
      studied: studiedText
        ? line('Who was studied', studiedText, [snapshot.populationCitation!])
        : null,
      measured: line('What was measured', `${snapshot.endpoint} at ${snapshot.timepoint}.`, [
        snapshot.citation,
      ]),
      boundary:
        excluded.length > 0 && snapshot.populationCitation
          ? line(
              'Who this does not directly answer for',
              `The study excluded ${excluded.join('; ')}.`,
              [snapshot.populationCitation],
            )
          : null,
      product,
    }
  }

  const linkedUse = input.label.uses.find((use) => linked(use.citation))
  if (linkedUse) {
    return {
      kind: 'source_statement',
      // The corpus does not bind this passage to the exact product identity, form and route.
      // It can be useful as a named source statement, never as that product's labelled indication.
      claim: line('What one source says about use', linkedUse.text, [linkedUse.citation]),
      tested: null,
      studied: null,
      measured: null,
      boundary: null,
      product,
    }
  }

  const linkedMechanism = input.label.mechanism.find((mechanism) => linked(mechanism.citation))
  if (linkedMechanism) {
    return {
      kind: 'source_statement',
      claim: line('Body action described in one source', linkedMechanism.text, [
        linkedMechanism.citation,
      ]),
      tested: null,
      studied: null,
      measured: null,
      boundary: null,
      product,
    }
  }

  return {
    kind: 'no_source_claim',
    claim: null,
    tested: null,
    studied: null,
    measured: null,
    boundary: null,
    product,
  }
}
