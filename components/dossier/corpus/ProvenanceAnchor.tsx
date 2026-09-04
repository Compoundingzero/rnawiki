/**
 * A provenance anchor (B4, V5): the literal source behind the value in the paragraph it ends, never
 * a section of this page. It carries the source date and the last-verified date as attributes (R9,
 * B8) so freshness belongs to the value and not only to the page header.
 */
import type { CorpusAnchor } from '@/lib/corpus/dossier-page'

export function ProvenanceAnchor({ anchor }: { anchor: CorpusAnchor }) {
  const label = (
    <>
      <span className="cd-anchor-glyph" aria-hidden="true">
        ◇
      </span>
      {anchor.text}
    </>
  )
  const attributes = {
    className: 'cd-anchor',
    ...(anchor.sourceDate ? { 'data-source-date': anchor.sourceDate } : {}),
    ...(anchor.lastVerified ? { 'data-verified': anchor.lastVerified } : {}),
  }
  if (!anchor.href) {
    return <span {...attributes}>{label}</span>
  }
  return (
    <a {...attributes} href={anchor.href} rel="nofollow noopener" target="_blank">
      {label}
    </a>
  )
}
