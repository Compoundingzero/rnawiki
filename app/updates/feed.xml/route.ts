import { NextResponse } from 'next/server'
import { PROOF_BOUNDARY_LABELS } from '@/lib/evidence'
import { entityUrl } from '@/lib/canonical'
import {
  EVIDENCE_CHANGE_TYPE_LABELS,
  getRecentEvidenceChanges,
  type EvidenceChangeItem,
} from '@/app/(public)/updates/evidence-changes'

export const runtime = 'nodejs' // needs the pg pool via Drizzle, not edge-compatible

const SITE_URL = process.env.SITE_URL ?? 'https://rnawiki.com'
const FEED_URL = `${SITE_URL}/updates/feed.xml`
const UPDATES_PAGE_URL = `${SITE_URL}/updates`
const MAX_ITEMS = 100

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// CDATA lets item text carry punctuation (quotes, ampersands) without hand-escaping it, as long
// as the text itself never contains a literal "]]>" — guarded against below.
function cdata(value: string): string {
  return `<![CDATA[${value.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`
}

function itemLink(change: EvidenceChangeItem): string {
  if (change.entitySlug && change.claimSlug) return `${entityUrl(change.entitySlug)}#claim-${change.claimSlug}`
  if (change.entitySlug) return entityUrl(change.entitySlug)
  return UPDATES_PAGE_URL
}

function itemTitle(change: EvidenceChangeItem): string {
  const subject = change.claimQuestion ?? change.entityName ?? 'RNAwiki'
  return `${EVIDENCE_CHANGE_TYPE_LABELS[change.changeType]}: ${subject}`
}

function itemDescription(change: EvidenceChangeItem): string {
  const parts = [change.explanation]
  if (change.previousBoundary && change.newBoundary) {
    parts.push(
      `Evidence stage: ${PROOF_BOUNDARY_LABELS[change.previousBoundary]} -> ${PROOF_BOUNDARY_LABELS[change.newBoundary]}.`
    )
  }
  parts.push(`Source: ${change.source}`)
  return parts.join(' ')
}

export async function GET() {
  const changes = await getRecentEvidenceChanges(MAX_ITEMS)

  const items = changes
    .map((change) => {
      return `    <item>
      <title>${cdata(itemTitle(change))}</title>
      <link>${escapeXml(itemLink(change))}</link>
      <guid isPermaLink="false">rnawiki-evidence-change-${change.id}</guid>
      <pubDate>${change.publicationDate.toUTCString()}</pubDate>
      <description>${cdata(itemDescription(change))}</description>
    </item>`
    })
    .join('\n')

  const lastBuildDate = changes[0]?.publicationDate.toUTCString() ?? new Date().toUTCString()

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>RNAwiki — Evidence updates</title>
    <link>${escapeXml(UPDATES_PAGE_URL)}</link>
    <atom:link href="${escapeXml(FEED_URL)}" rel="self" type="application/rss+xml" />
    <description>What changed on RNAwiki and why — new controlled trials, regulatory decisions, safety warnings, retractions, and every time the evidence behind a claim moved.</description>
    <language>en-sg</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items}
  </channel>
</rss>
`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}
