/**
 * The hub synthesis (docs/specs/hubs.md §2 item 3) and the page's glossary (§5).
 *
 * Four to eight sentences, each one produced by a template bound to the comparison table's columns
 * and the members' derived sections, in template order H1–H7. A template whose inputs are absent
 * wrote no row, so a hub simply carries fewer sentences and no sentence stands in for a missing
 * one. Each sentence carries the provenance map its template recorded — which columns and which
 * stored field paths it was assembled from — in a labelled technical disclosure.
 *
 * The three terms the sentences and the table use are explained here, once per page: pChEMBL, the
 * Singapore forensic classification, and what "results posted" counts. Repeating those definitions
 * inside the sentences would put the same forty words on every hub.
 */
import type { HubSynthesisRecord, HubType } from '@/lib/hubs/types'

const TEMPLATE_SUBJECT: Record<string, string> = {
  H1: 'What is approved',
  H2: 'What stopped',
  H3: 'What is listed in Singapore',
  H4: 'What the interaction engine predicts',
  H5: 'Registered trials and posted results',
  H6: 'Recorded potency',
  H7: 'Recorded lifespan and ageing evidence',
}

function provenanceLine(provenance: Record<string, unknown>): string {
  const columns = Array.isArray(provenance.columns) ? provenance.columns : []
  const fields = Array.isArray(provenance.fields) ? provenance.fields : []
  const parts: string[] = []
  if (columns.length > 0) parts.push(`columns: ${columns.join(', ')}`)
  if (fields.length > 0) parts.push(`fields: ${fields.join('; ')}`)
  return parts.join(' · ')
}

export function HubSynthesis({
  syntheses,
  hubType,
}: {
  syntheses: HubSynthesisRecord[]
  hubType: HubType
}) {
  return (
    <section aria-labelledby="hub-synthesis-heading" className="space-y-4">
      <h2 className="text-xl font-bold text-[#1D1D1F]" id="hub-synthesis-heading">
        What the records add up to
      </h2>
      {syntheses.length === 0 ? (
        <p className="text-sm text-[#1D1D1F] leading-relaxed">
          None of the seven summary templates had its inputs on this hub&apos;s members, so this hub
          carries its comparison table and its member list and no summary.
        </p>
      ) : (
        <div className="space-y-3">
          {syntheses.map((sentence) => (
            <p
              className="text-sm text-[#1D1D1F] leading-relaxed"
              data-template={sentence.templateId}
              key={sentence.ordinal}
            >
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#6E6E73] block">
                {TEMPLATE_SUBJECT[sentence.templateId] ?? sentence.templateId}
              </span>
              {sentence.sentence}
            </p>
          ))}
        </div>
      )}

      <dl className="text-xs text-[#6E6E73] leading-relaxed space-y-2">
        <div>
          <dt className="font-semibold text-[#1D1D1F] inline">pChEMBL. </dt>
          <dd className="inline">
            ChEMBL&apos;s comparable potency number: the negative base-10 logarithm of a reported
            IC50, EC50, Ki or Kd in molar units, so 9.0 is one nanomolar and a larger number is a
            lower concentration in that assay. It is a measurement in a named assay, not a statement
            about a person.
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-[#1D1D1F] inline">Forensic classification. </dt>
          <dd className="inline">
            The supply class the Singapore Health Sciences Authority records for a registered
            product: POM, prescription-only; P, pharmacy-only; GSL, general sale. It says who may
            hand the product over, and it is separate from the Misuse of Drugs Act schedules.
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-[#1D1D1F] inline">Results posted. </dt>
          <dd className="inline">
            The share of a member&apos;s completed ClinicalTrials.gov registrations that carry
            results in the registry itself. A trial published in a journal but not posted to the
            registry counts as not posted here.
          </dd>
        </div>
      </dl>

      {syntheses.length > 0 ? (
        <details className="text-xs text-[#6E6E73]">
          <summary className="cursor-pointer font-semibold text-[#1D1D1F]">
            Technical disclosure: where each sentence came from
          </summary>
          <ul className="mt-2 space-y-2">
            {syntheses.map((sentence) => (
              <li key={sentence.ordinal}>
                <span className="font-mono">{sentence.templateId}</span> —{' '}
                {provenanceLine(sentence.provenance) ||
                  'the stored values named in the sentence itself'}
              </li>
            ))}
          </ul>
          <p className="mt-2">
            Template order and inputs: <span className="font-mono">docs/specs/hubs.md</span> section
            2. This hub is a {hubType} hub, so templates that apply only to another kind of hub were
            not run.
          </p>
        </details>
      ) : null}
    </section>
  )
}
