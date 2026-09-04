// The one page that holds the explanatory sentences every record links to.
//
// Anything a dossier would otherwise repeat on thousands of pages lives here once: what each badge
// means, what a tier is, what "spontaneous reports" means, the identifier vocabulary, how a
// statement is bound to its source, and the reuse terms of every source the corpus reads. Records
// carry a link to this page as markup and repeat none of the prose.

import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { AppShell } from '@/components/AppShell'
import { OrganismLadderLegend } from '@/components/corpus/OrganismLadderLegend'
import { facetIndexHref } from '@/app/browse/facet-view'
import { CORPUS_FACETS } from '@/lib/corpus/facets'
import { EVIDENCE_KINDS, ORGANISM_RUNGS } from '@/lib/corpus/organism-ladder'
import { pageRobotsMetadata } from '@/lib/seo/deployment'
import { getCurrentUser } from '@/lib/session'
import '@/lib/corpus/tokens.css'

// Reads the signed-in user, so it touches the database and has no dynamic path segment. Railway's
// build container cannot reach the database, so this route must not be a prerender candidate.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Definitions',
  description:
    'What the badges, tiers, record states, identifiers and source terms on an RNAWiki record mean, written once.',
  alternates: { canonical: '/definitions' },
  robots: pageRobotsMetadata({ index: true, follow: true }),
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="mt-12 space-y-4 scroll-mt-20">
      <h2
        className="text-lg font-semibold tracking-tight"
        style={{ fontFamily: 'var(--corpus-serif)', color: 'var(--corpus-ink-0)' }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

function Terms({ children }: { children: ReactNode }) {
  return <dl className="space-y-4">{children}</dl>
}

function Term({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-sm font-semibold" style={{ color: 'var(--corpus-ink-0)' }}>
        {term}
      </dt>
      <dd className="text-[15px] leading-relaxed" style={{ color: 'var(--corpus-ink-1)' }}>
        {children}
      </dd>
    </div>
  )
}

interface SourceTerms {
  source: string
  supplies: string
  reuse: string
}

/** Recorded in data/corpus-20k/sources.json; only sources the corpus actually reads appear here. */
const SOURCE_TERMS: SourceTerms[] = [
  {
    source: 'ChEMBL 37',
    supplies: 'Molecule identity, highest development phase, recorded warnings',
    reuse: 'CC BY-SA 3.0 Unported, with attribution naming the release',
  },
  {
    source: 'PubChem',
    supplies: 'Compound identifiers and structures',
    reuse: 'Free to use; individual depositor records may carry their own terms',
  },
  {
    source: 'ClinicalTrials.gov',
    supplies: 'Registered study records, enrolment, status and stated stop reasons',
    reuse: 'United States Government work',
  },
  {
    source: 'openFDA, DailyMed, Orange Book, Drugs@FDA',
    supplies: 'United States label text, marketing status and listing status',
    reuse: 'United States Government work, released as CC0 1.0',
  },
  {
    source: 'Open Targets Platform 26.06',
    supplies: 'Mechanism targets and adverse-report counts',
    reuse: 'CC0 1.0',
  },
  {
    source: 'European Medicines Agency',
    supplies: 'European authorisation status',
    reuse: 'Reproduction permitted where the agency is acknowledged as the source',
  },
  {
    source: 'Health Canada Drug Product Database',
    supplies: 'Canadian product status',
    reuse: 'Open Government Licence – Canada 2.0',
  },
  {
    source: 'RxNav',
    supplies: 'RxNorm names and codes',
    reuse: 'RxNorm content only',
  },
  {
    source: 'Jackson Laboratory Mouse Phenome Database (NIA Interventions Testing Program)',
    supplies: 'Mouse cohort rows',
    reuse: 'Contributors waive copyright in the deposited data',
  },
  {
    source: 'Europe PMC and PubMed',
    supplies: 'Publication records and the sentences quoted from them',
    reuse: 'Metadata is free to reuse; the article itself stays with its publisher',
  },
]

export default async function DefinitionsPage() {
  const user = await getCurrentUser()

  return (
    <AppShell initialUser={user}>
      <div className="mx-auto w-full max-w-[44rem] px-4 py-10 sm:px-6 sm:py-16">
        <header className="space-y-4">
          <h1
            className="text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ fontFamily: 'var(--corpus-serif)', color: 'var(--corpus-ink-0)' }}
          >
            Definitions
          </h1>
          <p className="text-[15px] leading-relaxed" style={{ color: 'var(--corpus-ink-1)' }}>
            Every medicine record links here rather than repeating these sentences. Each entry says
            what a label on a record means and, where it matters, what it does not mean.
          </p>
        </header>

        <Section id="badges" title="The badges on a record">
          <Terms>
            <Term term="Record tier">
              A number from 1 to 3 that says which group a record was built and published in. Tier 1
              holds the longevity records and every medicine a register states was withdrawn, Tier 2
              the remaining approved medicines, Tier 3 compounds recorded only as development
              candidates. The tier follows the kind of record, not its quality: a Tier 1 record with
              one recorded field stays Tier 1, and a Tier 3 record with several stays Tier 3.
            </Term>
            <Term term="Highest organism tested">
              The top rung of the organism ladder for which the record holds a cited study. It says
              where the evidence stops, not how strong it is.
            </Term>
            <Term term="Human data">
              Whether the record holds at least one registered human study or human publication. A
              record can hold human data and still hold no result: a registration is a study that
              was started, not a study that reported.
            </Term>
            <Term term="Supervision statement">
              Some records open with the classification a regulator gives the substance —
              prescription-only, controlled, or carrying a boxed warning. That classification is
              printed as the register states it. RNAWiki draws nothing further from it.
            </Term>
          </Terms>
        </Section>

        <Section id="organism-ladder" title="The organism ladder">
          <p className="text-[15px] leading-relaxed" style={{ color: 'var(--corpus-ink-1)' }}>
            The ladder has eight rungs. A rung is filled only where the record holds a study in that
            organism with a citation, and left open otherwise. An open rung is not a claim that the
            organism was tested and nothing found — it is the absence of a recorded study.
          </p>

          <OrganismLadderLegend
            id="definitions-organism-ladder"
            className="block h-auto w-full max-w-[22rem]"
          />

          <h3 className="text-sm font-semibold" style={{ color: 'var(--corpus-ink-0)' }}>
            The rungs, lowest first
          </h3>
          <ul
            className="flex flex-wrap gap-x-3 gap-y-1 text-sm"
            style={{ color: 'var(--corpus-ink-1)' }}
          >
            {ORGANISM_RUNGS.map((rung) => (
              <li key={rung.rung}>{rung.label}</li>
            ))}
          </ul>

          <h3 className="text-sm font-semibold" style={{ color: 'var(--corpus-ink-0)' }}>
            What a filled rung was measuring
          </h3>
          <Terms>
            {EVIDENCE_KINDS.map((kind) => (
              <Term key={kind.kind} term={kind.label}>
                {kind.meaning}
              </Term>
            ))}
          </Terms>

          <p className="text-[15px] leading-relaxed" style={{ color: 'var(--corpus-ink-1)' }}>
            The mouse rung is often filled from one programme, so its cohorts are listed together on{' '}
            <Link href="/itp" className="underline underline-offset-2">
              the Interventions Testing Program page
            </Link>
            .
          </p>
        </Section>

        <Section id="record-states" title="How a record shows what is missing">
          <Terms>
            <Term term="Recorded">
              A source states the value and the record carries it with that source, the date the
              source gives and the date it was last read.
            </Term>
            <Term term="Not recorded">
              No source RNAWiki reads states the value. Nothing is rendered for it: there is no
              empty heading and no placeholder line, so a short record is a short page.
            </Term>
            <Term term="Does not apply">
              The field cannot exist for this kind of substance — a patent status for a food
              ingredient, for example. It is stored apart from a missing value so that coverage
              figures do not count it as a gap.
            </Term>
            <Term term="Basic record">
              A record holding fewer than three recorded fields. It shows its identifiers and its
              relations, states how many fields it holds, and carries no derived questions. Search
              engines are asked not to index it.
            </Term>
          </Terms>
          <p className="text-[15px] leading-relaxed" style={{ color: 'var(--corpus-ink-1)' }}>
            Where a reviewed conclusion exists, five outcomes are kept apart and never merged:
            confirmed, mixed, contradicted, not measured, and unknown. Not measured means no study
            looked; unknown means studies exist and do not settle the question.
          </p>
        </Section>

        <Section id="spontaneous-reports" title="Spontaneous reports">
          <p className="text-[15px] leading-relaxed" style={{ color: 'var(--corpus-ink-1)' }}>
            A spontaneous report is a reaction someone — a patient, a doctor, a pharmacist, a
            manufacturer — sent to a regulator after taking or prescribing a medicine. Nobody was
            assigned to a treatment, no comparison group exists, and no one counts how many people
            took the medicine without reporting anything.
          </p>
          <p className="text-[15px] leading-relaxed" style={{ color: 'var(--corpus-ink-1)' }}>
            A count of spontaneous reports is therefore not a rate and not a risk. It cannot say how
            often a reaction happens, and it cannot show that the medicine caused it. Where a record
            shows these counts it labels them as spontaneous reports for that reason.
          </p>
        </Section>

        <Section id="registers" title="Which registers a record was checked against">
          <p className="text-[15px] leading-relaxed" style={{ color: 'var(--corpus-ink-1)' }}>
            A record&rsquo;s regulator status is read from three registers: Drugs@FDA and the FDA
            Orange Book for the United States, the European Medicines Agency medicine list for the
            European Union, and the Health Canada Drug Product Database for Canada. A record names
            the ones that stated a status for it, and shows the register&rsquo;s own record number
            and date beside each.
          </p>
          <p className="text-[15px] leading-relaxed" style={{ color: 'var(--corpus-ink-1)' }}>
            Four registers were never cleared for this corpus and are recorded as unknown on every
            record: the United Kingdom, Australia, Japan and Singapore. The Australian Therapeutic
            Goods Administration register could not be read under its own robots file, the Japanese
            Pharmaceuticals and Medical Devices Agency publishes no licence statement for reuse, and
            no United Kingdom or Singapore register was cleared. This is a limit of what RNAWiki was
            permitted to read, not a finding about any medicine, so it is stated here once instead
            of on every record.
          </p>
        </Section>

        <Section id="identifiers" title="Identifiers and registry names">
          <Terms>
            <Term term="NCT number">
              The identifier a study receives on ClinicalTrials.gov, the United States registry of
              clinical studies. It identifies a study that was registered.
            </Term>
            <Term term="PMID">
              A PubMed identifier: the number a published article carries in the United States
              National Library of Medicine index.
            </Term>
            <Term term="UNII">
              Unique Ingredient Identifier, the code the United States Food and Drug Administration
              gives a substance. RNAWiki uses it as the first key when deciding that two names are
              the same substance.
            </Term>
            <Term term="ChEMBL ID, PubChem CID, CAS number, RxCUI">
              Substance codes from the ChEMBL database, the PubChem database, the Chemical Abstracts
              Service, and the RxNorm drug vocabulary. A record shows the ones it holds.
            </Term>
            <Term term="ATC class">
              The Anatomical Therapeutic Chemical classification, a grouping of medicines by the
              organ or system they act on and their chemical family.
            </Term>
          </Terms>
        </Section>

        <Section id="provenance" title="How a statement is tied to its source">
          <p className="text-[15px] leading-relaxed" style={{ color: 'var(--corpus-ink-1)' }}>
            Each recorded value names one source: what kind of source it is, its identifier there,
            the date the source itself carries, and the date RNAWiki last read it. A quoted sentence
            is stored exactly as read.
          </p>
          <p className="text-[15px] leading-relaxed" style={{ color: 'var(--corpus-ink-1)' }}>
            A source link says which statement that source supports. It does not say the source
            proves the conclusion, and a source that changes later creates review work rather than
            silently rewriting a published record.
          </p>
        </Section>

        <Section id="browse" title="The five ways to browse">
          <Terms>
            {CORPUS_FACETS.map((facet) => (
              <Term key={facet.id} term={facet.label}>
                {facet.description}{' '}
                <Link href={facetIndexHref(facet.id)} className="underline underline-offset-2">
                  Open the {facet.label.toLowerCase()} index
                </Link>
              </Term>
            ))}
          </Terms>
        </Section>

        <Section id="licence" title="Sources and reuse">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-sm">
              <caption className="sr-only">
                Each source the corpus reads and its reuse terms
              </caption>
              <thead>
                <tr
                  className="border-b text-left text-xs"
                  style={{ borderColor: 'var(--corpus-hairline)', color: 'var(--corpus-ink-2)' }}
                >
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Source
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    What it supplies
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Reuse terms
                  </th>
                </tr>
              </thead>
              <tbody>
                {SOURCE_TERMS.map((row) => (
                  <tr
                    key={row.source}
                    className="border-b align-top"
                    style={{ borderColor: 'var(--corpus-hairline)' }}
                  >
                    <th scope="row" className="py-2 pr-3 text-left font-normal">
                      {row.source}
                    </th>
                    <td className="py-2 pr-3" style={{ color: 'var(--corpus-ink-1)' }}>
                      {row.supplies}
                    </td>
                    <td className="py-2 pr-3" style={{ color: 'var(--corpus-ink-1)' }}>
                      {row.reuse}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[15px] leading-relaxed" style={{ color: 'var(--corpus-ink-1)' }}>
            RNAWiki licenses its own selection, structure and wording under{' '}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              rel="noreferrer"
              className="underline underline-offset-2"
            >
              CC BY 4.0
            </a>
            . Quoted passages and third-party records keep the terms in the table above.
          </p>
          <p className="text-[15px] leading-relaxed" style={{ color: 'var(--corpus-ink-1)' }}>
            Four things are recorded as unknown because their terms did not permit reading them:
            Australian register status, Japanese register status, the World Health Organization
            lists of international non-proprietary names, and patent status.
          </p>
          <p className="text-sm">
            <Link href="/editorial-policy" className="underline underline-offset-2">
              Editorial policy and corrections
            </Link>
          </p>
        </Section>
      </div>
    </AppShell>
  )
}
