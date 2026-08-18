/**
 * The publishing sequence, as an ordered list styled into a rail rather than a
 * drawn illustration. Because it is real markup, it reads correctly in a screen
 * reader, reflows to a vertical list on narrow screens, prints, and needs no
 * alt text or SVG fallback.
 */
const STEPS: { label: string; note: string }[] = [
  { label: 'Source record', note: 'A study, label or regulatory document, entered with its identifiers.' },
  { label: 'Structured claim', note: 'One consumer-facing question, answered in one or two sentences.' },
  { label: 'Evidence classification', note: 'Measured, inferred or unknown; the stage the evidence reaches.' },
  { label: 'Automated checks', note: 'Prose caps, banned language and citation integrity gate the build.' },
  { label: 'Published page', note: 'Server-rendered, with every source traceable from the sentence.' },
  { label: 'Correction history', note: 'Public reports, resolved by an editor and logged.' },
]

export function ClaimPipeline() {
  return (
    <ol className="pipeline">
      {STEPS.map((s, i) => (
        <li key={s.label} className="pipeline__step">
          <span className="pipeline__num" aria-hidden="true">
            {String(i + 1).padStart(2, '0')}
          </span>
          <span className="pipeline__label">{s.label}</span>
          <span className="pipeline__note">{s.note}</span>
        </li>
      ))}
    </ol>
  )
}
