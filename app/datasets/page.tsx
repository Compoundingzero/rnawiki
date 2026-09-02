import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Braces, Database, Download, ShieldCheck } from 'lucide-react'

import { AppShell } from '@/components/AppShell'
import { listPublicDatasetSummaries } from '@/lib/public-datasets'
import { getCurrentUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Public datasets',
  description:
    'Six bounded, source-aware RNAWiki datasets covering recorded negative statements, source comparison, silence, corpus coverage, record identity and dossier completion states.',
  alternates: { canonical: '/datasets' },
}

const number = new Intl.NumberFormat('en-US')

function generatedDate(value: string): string {
  return value.slice(0, 10)
}

export default async function DatasetsPage() {
  const [user, datasets] = await Promise.all([getCurrentUser(), listPublicDatasetSummaries()])

  return (
    <AppShell initialUser={user}>
      <div className="mx-auto w-full max-w-4xl space-y-12 px-4 py-8 sm:px-6 sm:py-12">
        <header className="max-w-3xl space-y-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#6E6E73]">
            Public datasets
          </p>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-[#1D1D1F] sm:text-5xl">
            Inspect what this corpus records—and what it does not.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-[#424245]">
            These six read-only views publish deterministic measurements of RNAWiki’s recorded
            corpus. Each one states its scope, method, source boundary, and limitations before the
            rows.
          </p>
          <div className="rounded-2xl border border-amber-900/15 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
            <strong>These datasets do not assess a treatment or recommend an action.</strong>{' '}
            Missing text is not evidence of safety or danger, and agreement between recorded sources
            is not proof that a claim is correct.
          </div>
        </header>

        <section aria-labelledby="dataset-list-heading" className="space-y-5">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#6E6E73]">
              Six allowlisted projections
            </p>
            <h2 id="dataset-list-heading" className="text-2xl font-extrabold text-[#1D1D1F]">
              Choose a dataset
            </h2>
          </div>

          <ul className="grid gap-4 md:grid-cols-2">
            {datasets.map((dataset) => (
              <li key={dataset.id} className="min-w-0">
                <Link
                  href={`/datasets/${dataset.id}`}
                  className="group flex h-full min-h-64 flex-col rounded-3xl border border-black/[0.08] bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.025)] transition hover:border-[#0071E3]/30 hover:shadow-[0_8px_28px_rgba(0,74,173,0.08)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0071E3]/10 text-[#0066CC]">
                      <Database className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="rounded-full bg-[#F5F5F7] px-2.5 py-1 text-[11px] font-semibold tabular-nums text-[#424245]">
                      {number.format(dataset.rowCount)} rows
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-extrabold leading-snug text-[#1D1D1F]">
                    {dataset.shortTitle}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#424245]">{dataset.purpose}</p>
                  <p className="mt-3 text-xs leading-5 text-[#6E6E73]">{dataset.doesNotMean}</p>
                  <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                    <p className="min-w-0 text-[11px] leading-5 text-[#6E6E73]">
                      Generated{' '}
                      <time dateTime={dataset.generatedAt}>
                        {generatedDate(dataset.generatedAt)}
                      </time>
                      <br />
                      <code className="break-all">{dataset.version}</code>
                    </p>
                    <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[#0066CC]">
                      Inspect
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-4 sm:grid-cols-3" aria-labelledby="access-heading">
          <h2 id="access-heading" className="sr-only">
            Access and reuse
          </h2>
          {[
            {
              icon: <Braces className="h-5 w-5" aria-hidden="true" />,
              title: 'Bounded API',
              text: 'JSON and CSV responses expose only named public fields, at most 200 rows per request.',
            },
            {
              icon: <Download className="h-5 w-5" aria-hidden="true" />,
              title: 'Server-side projection',
              text: 'Large source artifacts are parsed on the server. The browser receives only the requested page.',
            },
            {
              icon: <ShieldCheck className="h-5 w-5" aria-hidden="true" />,
              title: 'Visible boundaries',
              text: 'No private records, review-work payloads, generic file paths, or automated medical conclusions are served.',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-black/[0.07] bg-white p-5">
              <span className="text-[#0066CC]">{item.icon}</span>
              <h3 className="mt-3 text-sm font-bold text-[#1D1D1F]">{item.title}</h3>
              <p className="mt-1.5 text-xs leading-5 text-[#6E6E73]">{item.text}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-black/[0.08] bg-white p-6 sm:p-8">
          <h2 className="text-lg font-extrabold text-[#1D1D1F]">Licence and source rights</h2>
          <div className="mt-3 space-y-3 text-sm leading-6 text-[#424245]">
            <p>
              RNAWiki’s selection, schema, structure, and derived projections are licensed under{' '}
              <a
                href="https://creativecommons.org/licenses/by/4.0/"
                className="font-bold text-[#0066CC] hover:underline"
              >
                CC BY 4.0
              </a>
              . Credit RNAWiki and the generated snapshot date.
            </p>
            <p>
              Quoted source passages and third-party records retain their original rights. A dataset
              licence does not transfer ownership of an FDA label, paper, registry record, or other
              cited source.
            </p>
          </div>
        </section>
      </div>
    </AppShell>
  )
}
