/**
 * The dossier header (dossier template, "Header"): the name, the other names, the register line and
 * the identity triplet — and nothing else. No lede, no summary card, no key-facts panel and no
 * promotional strip (B10, V4). The supervision statement, when the record carries one, is the first
 * question block below, not a banner here.
 *
 * Dates are ISO (`2026-09-04`) here and everywhere else on the site (B7, V6). The triplet is
 * markup: three short facts a reader can scan, not sentences.
 */
import { EVIDENCE_KINDS } from '@/lib/corpus/organism-ladder'
import type { CorpusDossier } from '@/lib/corpus/dossier-page'

const MODEL_LABELS: Record<string, string> = {
  LONGEVITY: 'Ageing evidence record',
  CLINICAL: 'Clinical record',
  DEVELOPMENT: 'Development record',
}

/**
 * The evidence tier badge. The stored value is the ladder's own evidence kind
 * (`lifespan`, `biomarker`, …) or the registry's own phrase (`human trial`); the ladder kinds get
 * the words the ladder itself prints, and every value is prefixed so the badge names what it is
 * measuring rather than standing on the page as a bare word.
 */
const EVIDENCE_KIND_LABELS = new Map(EVIDENCE_KINDS.map((kind) => [kind.kind, kind.label]))

function evidenceBadge(dossier: CorpusDossier): string {
  const recorded = dossier.evidenceTier
  if (recorded === undefined) return MODEL_LABELS[dossier.model] ?? 'Record'
  return `Evidence recorded: ${EVIDENCE_KIND_LABELS.get(recorded)?.toLowerCase() ?? recorded}`
}

export function CorpusHeader({ dossier }: { dossier: CorpusDossier }) {
  // "Collapsed after three" counts names, not kinds: a compound with forty trade names would
  // otherwise put forty of them above the first question.
  const visible: CorpusDossier['synonyms'] = []
  const hidden: CorpusDossier['synonyms'] = []
  let shown = 0
  for (const group of dossier.synonyms) {
    const room = Math.max(0, 3 - shown)
    const head = group.names.slice(0, room)
    const tail = group.names.slice(room)
    if (head.length > 0) visible.push({ ...group, names: head })
    if (tail.length > 0) hidden.push({ ...group, names: tail })
    shown += head.length
  }
  return (
    <header className="cd-header">
      <div className="cd-layout">
        <div className="cd-column">
          <h1 className="cd-title">{dossier.displayName}</h1>

          {visible.length > 0 ? (
            <dl className="cd-synonyms">
              {visible.map((group) => (
                <div key={group.kind}>
                  <dt>{group.label}</dt>
                  {group.names.map((synonym) => (
                    <dd key={synonym}>{synonym}</dd>
                  ))}
                </div>
              ))}
            </dl>
          ) : null}

          {hidden.length > 0 ? (
            <details className="cd-more-names">
              <summary>Other recorded names</summary>
              <dl className="cd-synonyms">
                {hidden.map((group) => (
                  <div key={group.kind}>
                    <dt>{group.label}</dt>
                    {group.names.map((synonym) => (
                      <dd key={synonym}>{synonym}</dd>
                    ))}
                  </div>
                ))}
              </dl>
            </details>
          ) : null}

          {dossier.register || dossier.lastVerified ? (
            <p className="cd-source-line">
              <span aria-hidden="true">◇</span>
              {dossier.register ? <span>{dossier.register}</span> : null}
              {dossier.lastVerified ? (
                <span>
                  last checked <time dateTime={dossier.lastVerified}>{dossier.lastVerified}</time>
                </span>
              ) : null}
            </p>
          ) : null}

          {/*
            The triplet is a fact each time: what kind of evidence the record reached, the highest
            organism anything recorded used, and whether human data is on file. All three come from
            the loader's own columns, so a clinical record carries the same triplet as a longevity
            one. Where nothing recorded an organism the badge is omitted rather than saying "none".
          */}
          <ul className="cd-badges">
            <li>{evidenceBadge(dossier)}</li>
            {dossier.topRung ? <li>Highest organism tested: {dossier.topRung}</li> : null}
            <li>{dossier.humanData ? 'Human data recorded' : 'No human study recorded'}</li>
            {dossier.withdrawn ? <li>Withdrawn by a register</li> : null}
          </ul>
        </div>
      </div>
    </header>
  )
}
