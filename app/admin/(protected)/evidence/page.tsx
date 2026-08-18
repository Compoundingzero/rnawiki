import type { Metadata } from 'next'
import Link from 'next/link'
import { searchEvidenceSources } from '@/lib/admin/evidence-search'
import { importFromDoi, importFromPmid } from './actions'
import * as ui from '@/lib/admin/ui'

export const metadata: Metadata = { title: 'Evidence sources', robots: { index: false, follow: false } }

interface Props {
  searchParams: Promise<{ q?: string; error?: string; success?: string }>
}

export default async function AdminEvidencePage({ searchParams }: Props) {
  const { q, error, success } = await searchParams
  const results = await searchEvidenceSources(q ?? '', 50)

  return (
    <div style={ui.page}>
      <div style={{ ...ui.flexRow, justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ ...ui.h1, margin: 0 }}>Evidence sources</h1>
        <Link href="/admin/evidence/new" style={ui.buttonPrimary}>
          New source (manual)
        </Link>
      </div>

      {error && <p style={ui.errorBanner}>{error}</p>}
      {success && <p style={ui.successBanner}>{success}</p>}

      <section style={ui.sectionCard}>
        <h2 style={ui.h2}>Import bibliographic metadata</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginTop: 0 }}>
          Pulls title/authors/year/journal/DOI/PMID only, from Crossref or NCBI E-utilities. You still fill in
          source type, study design, species, sample size, and endpoint by hand on the next screen — those are
          never auto-filled or guessed.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
          <form action={importFromDoi}>
            <div style={ui.fieldWrap}>
              <label htmlFor="doi" style={ui.label}>
                Import from DOI
              </label>
              <input id="doi" name="doi" placeholder="10.1000/xyz123" style={ui.input} />
            </div>
            <button type="submit" style={ui.buttonSecondary}>
              Fetch from Crossref
            </button>
          </form>
          <form action={importFromPmid}>
            <div style={ui.fieldWrap}>
              <label htmlFor="pmid" style={ui.label}>
                Import from PMID
              </label>
              <input id="pmid" name="pmid" placeholder="12345678" style={ui.input} />
            </div>
            <button type="submit" style={ui.buttonSecondary}>
              Fetch from PubMed
            </button>
          </form>
        </div>
      </section>

      <section style={ui.sectionCard}>
        <h2 style={ui.h2}>Search existing sources</h2>
        <form method="GET" style={ui.flexRow}>
          <input name="q" defaultValue={q ?? ''} placeholder="Title, DOI, or PMID" style={{ ...ui.input, maxWidth: '24rem' }} />
          <button type="submit" style={ui.buttonSecondary}>
            Search
          </button>
        </form>
      </section>

      {results.length === 0 ? (
        <p style={{ color: 'var(--color-text-faint)' }}>No evidence sources found.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={ui.table}>
            <thead>
              <tr>
                <th style={ui.th}>Title</th>
                <th style={ui.th}>Type</th>
                <th style={ui.th}>Year</th>
                <th style={ui.th}>DOI / PMID</th>
              </tr>
            </thead>
            <tbody>
              {results.map((s) => (
                <tr key={s.id}>
                  <td style={ui.td}>
                    <Link href={`/admin/evidence/${s.id}`}>{s.title}</Link>
                    {s.retractionStatus && (
                      <span style={{ color: 'var(--color-unknown)', fontWeight: 600 }}> ({s.retractionStatus})</span>
                    )}
                  </td>
                  <td style={ui.td}>{s.sourceType}</td>
                  <td style={ui.td}>{s.publicationYear ?? '—'}</td>
                  <td style={ui.td}>{[s.doi, s.pmid].filter(Boolean).join(' / ') || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
