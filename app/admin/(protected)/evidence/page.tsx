import type { Metadata } from 'next'
import Link from 'next/link'
import { searchEvidenceSources } from '@/lib/admin/evidence-search'
import { importFromDoi, importFromPmid } from './actions'

export const metadata: Metadata = { title: 'Evidence sources', robots: { index: false, follow: false } }

interface Props {
  searchParams: Promise<{ q?: string; error?: string; success?: string }>
}

export default async function AdminEvidencePage({ searchParams }: Props) {
  const { q, error, success } = await searchParams
  const results = await searchEvidenceSources(q ?? '', 50)

  return (
    <div className="admin-page">
      <div className="admin-head">
        <div>
          <p className="eyebrow">{results.length} listed</p>
          <h1 className="h1" style={{ marginTop: 'var(--s2)' }}>
            Evidence sources
          </h1>
        </div>
        <Link href="/admin/evidence/new" className="btn btn--primary">
          New source
        </Link>
      </div>

      {error && (
        <div className="callout" data-tone="danger" role="alert" style={{ marginBottom: 'var(--s5)' }}>
          <p className="callout__title">Import failed</p>
          <p style={{ fontSize: 'var(--size-small)' }}>{error}</p>
        </div>
      )}
      {success && (
        <div className="callout" role="status" style={{ marginBottom: 'var(--s5)' }}>
          <p className="callout__title">Done</p>
          <p style={{ fontSize: 'var(--size-small)' }}>{success}</p>
        </div>
      )}

      <section>
        <div className="section-head">
          <h2 className="h2">Import bibliographic metadata</h2>
        </div>
        <p className="prose measure" style={{ fontSize: 'var(--size-small)', marginBottom: 'var(--s5)' }}>
          Crossref and NCBI E-utilities return title, authors, year, journal, DOI and PMID — nothing else. Source
          type, study design, species, sample size and endpoint stay hand-entered on the next screen, because they
          are editorial judgments and must never be guessed.
        </p>

        <div style={{ display: 'grid', gap: 'var(--s6)', gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))' }}>
          <form action={importFromDoi} className="admin-form">
            <div className="admin-field">
              <label htmlFor="doi" className="admin-label">
                Import from DOI
              </label>
              <input id="doi" name="doi" placeholder="10.1000/xyz123" className="field" />
            </div>
            <div className="admin-actions">
              <button type="submit" className="btn">
                Fetch from Crossref
              </button>
            </div>
          </form>

          <form action={importFromPmid} className="admin-form">
            <div className="admin-field">
              <label htmlFor="pmid" className="admin-label">
                Import from PMID
              </label>
              <input id="pmid" name="pmid" placeholder="12345678" className="field" />
            </div>
            <div className="admin-actions">
              <button type="submit" className="btn">
                Fetch from PubMed
              </button>
            </div>
          </form>
        </div>
      </section>

      <hr className="rule" />

      <section>
        <div className="section-head">
          <h2 className="h2">Catalogue</h2>
        </div>

        <form method="GET" className="admin-form admin-form--inline" style={{ marginBottom: 'var(--s5)' }}>
          <div className="admin-field">
            <label htmlFor="q" className="admin-label">
              Search
            </label>
            <input
              id="q"
              name="q"
              defaultValue={q ?? ''}
              placeholder="Title, DOI, or PMID"
              className="field"
              style={{ minWidth: '18rem' }}
            />
          </div>
          <div className="admin-actions">
            <button type="submit" className="btn">
              Search
            </button>
            {q && <Link href="/admin/evidence">Clear</Link>}
          </div>
        </form>

        {results.length === 0 ? (
          <p className="muted" style={{ fontSize: 'var(--size-small)' }}>
            No evidence sources found.
          </p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Title</th>
                <th scope="col">Type</th>
                <th scope="col">Year</th>
                <th scope="col">DOI / PMID</th>
              </tr>
            </thead>
            <tbody>
              {results.map((s) => (
                <tr key={s.id}>
                  <td data-label="Title">
                    <Link href={`/admin/evidence/${s.id}`}>{s.title}</Link>
                    {s.retractionStatus && (
                      <span className="tag" data-flag="retraction" style={{ marginLeft: 'var(--s2)' }}>
                        {s.retractionStatus}
                      </span>
                    )}
                  </td>
                  <td data-label="Type">{s.sourceType}</td>
                  <td data-label="Year" style={{ fontFamily: 'var(--font-mono)' }}>
                    {s.publicationYear ?? 'Not recorded'}
                  </td>
                  <td data-label="Identifier" style={{ fontFamily: 'var(--font-mono)', wordBreak: 'break-word' }}>
                    {[s.doi, s.pmid].filter(Boolean).join(' / ') || 'Not recorded'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
