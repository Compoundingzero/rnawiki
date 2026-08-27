'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

/** Only recorded source fields; the panel never adds authors, journals or dates it does not have. */
export interface CitationExportSource {
  id: string
  label: string
  href?: string
  identifier?: string
  retrievedAt?: string
  verifiedAt?: string
}

export interface CitationExportPanelProps {
  medicineName: string
  programmeLabel: string
  pagePath: string
  sources: readonly CitationExportSource[]
}

function bibtexKey(medicineName: string, index: number): string {
  const slug = medicineName
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '_')
    .replace(/^_+|_+$/gu, '')
  return `rnawiki_${slug || 'source'}_${index + 1}`
}

function plainLines(props: CitationExportPanelProps): string {
  const lines = props.sources.map((source, index) => {
    const parts = [
      `${index + 1}. ${source.label}.`,
      source.identifier ? `${source.identifier}.` : undefined,
      source.href ? `Available from: ${source.href}.` : undefined,
      source.retrievedAt ? `Saved copy from ${source.retrievedAt}.` : undefined,
      source.verifiedAt ? `Last checked ${source.verifiedAt}.` : undefined,
    ]
    return parts.filter(Boolean).join(' ')
  })
  return [
    `Sources recorded for ${props.medicineName} — ${props.programmeLabel} (RNAWiki, ${props.pagePath}):`,
    '',
    ...lines,
  ].join('\n')
}

function bibtexEntries(props: CitationExportPanelProps): string {
  return props.sources
    .map((source, index) => {
      const fields = [
        `  title = {${source.label}}`,
        source.href ? `  url = {${source.href}}` : undefined,
        source.identifier ? `  note = {${source.identifier}}` : undefined,
        `  howpublished = {Recorded source on RNAWiki, ${props.pagePath}}`,
      ]
      return `@misc{${bibtexKey(props.medicineName, index)},\n${fields.filter(Boolean).join(',\n')}\n}`
    })
    .join('\n\n')
}

/**
 * Exports the exact recorded source list for the selected answer. Formats are limited to what the
 * record actually stores — there is no reconstruction of author lists or journal names.
 */
export function CitationExportPanel(props: CitationExportPanelProps) {
  const [copied, setCopied] = useState<'plain' | 'bibtex' | null>(null)

  if (props.sources.length === 0) return null

  const copy = async (format: 'plain' | 'bibtex') => {
    const text = format === 'plain' ? plainLines(props) : bibtexEntries(props)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(format)
      window.setTimeout(() => setCopied(null), 2000)
    } catch {
      // Clipboard access can be denied; the visible text below stays selectable either way.
    }
  }

  return (
    <details className="group/export rounded-2xl border border-black/[0.08] bg-white shadow-[0_1px_6px_rgba(0,0,0,0.025)]">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A66D8] [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block text-sm font-semibold leading-5 text-[#1D1D1F]">
            Export the recorded source list
          </span>
          <span className="mt-0.5 block text-xs leading-5 text-[#6E6E73]">
            Copy the exact source list recorded on this page
          </span>
        </span>
        <span
          aria-hidden="true"
          className="shrink-0 text-xl font-normal text-[#0A66D8] transition-transform group-open/export:rotate-45 motion-reduce:transition-none"
        >
          +
        </span>
      </summary>

      <div className="space-y-4 border-t border-black/[0.06] px-5 py-4">
        {(
          [
            ['plain', 'Reference list', plainLines(props)],
            ['bibtex', 'BibTeX', bibtexEntries(props)],
          ] as const
        ).map(([format, label, text]) => (
          <div key={format} className="min-w-0">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6E6E73]">{label}</h4>
              <button
                type="button"
                onClick={() => void copy(format)}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-black/[0.12] bg-white px-3 text-xs font-semibold text-[#1D1D1F] hover:bg-[#F5F5F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A66D8]"
              >
                {copied === format ? (
                  <Check className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
                ) : (
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {copied === format ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-[#F5F5F7] p-3 text-[11px] leading-5 text-[#424245]">
              {text}
            </pre>
          </div>
        ))}
      </div>
    </details>
  )
}
