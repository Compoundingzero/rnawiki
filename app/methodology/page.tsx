// How RNA Intelligence works — written for a reader who is not a bioinformatician.
//
// THIS PAGE IS THE PRODUCT'S HONESTY STATEMENT. A claim here that the code does not implement is
// the worst defect this site could ship: every other page asks readers to trust that we separate
// what was measured from what was inferred, and this is the page where that promise is checkable.
//
// So it is written against the source, not from memory, and every threshold below is IMPORTED from
// the module that enforces it rather than typed out. `lib/rna-intelligence/index.ts` asks callers
// to import from one entry point; that rule exists so there is a single way to *sweep* an input,
// and it is not violated by reading a published constant for display. If a limit changes in the
// engine, this page changes with it — it cannot drift into describing rules the site no longer has.

import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Dna, FlaskConical, ShieldCheck, Thermometer } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { getCurrentUser } from '@/lib/session'
import { CANONICAL_PHASE_ORDER, ENGINE_VERSION } from '@/lib/rna-intelligence'
import {
  CODING_FRAME_MIN_LENGTH,
  MIN_DESCRIPTOR_LENGTH,
  MIN_NUCLEOTIDE_LENGTH,
  MIN_PEPTIDE_LENGTH,
} from '@/lib/rna-intelligence/layer1-sequence'
import { MAX_FOLD_LENGTH } from '@/lib/rna-intelligence/layer2-structure'
import { TIER_DESCRIPTION, TIER_LABEL } from '@/lib/trust'
import { TRUST_TIERS, TRUST_TIER_THRESHOLDS, AUTO_PUBLISH_TIERS } from '@/lib/types'

// This page reads the signed-in user, so it touches the database and has no dynamic segment.
// Railway's build container cannot resolve `postgres.railway.internal`, so it must not be a
// prerender candidate.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'How the checks work',
  description:
    'The three deterministic layers every edit to RNAwiki passes through: sequence, thermodynamics and laboratory protocol. What each one proves, what it cannot prove, and how the verification badge is computed.',
  alternates: { canonical: '/methodology' },
}

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children: ReactNode
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1 px-1">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#86868B] block">
          {eyebrow}
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#1D1D1F] tracking-tight">
          {title}
        </h2>
      </div>
      {children}
    </section>
  )
}

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.08] shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-4">
      {children}
    </div>
  )
}

function LayerCard({
  index,
  icon,
  title,
  plain,
  children,
}: {
  index: number
  icon: ReactNode
  title: string
  plain: string
  children: ReactNode
}) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.08] shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-4">
      <div className="flex items-start gap-3">
        <span
          className="w-8 h-8 rounded-xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          {icon}
        </span>
        <div className="space-y-1 min-w-0">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0071E3] block">
            Layer {index}
          </span>
          <h3 className="text-lg font-extrabold text-[#1D1D1F] tracking-tight leading-snug">
            {title}
          </h3>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-[#1D1D1F] font-medium leading-relaxed">{plain}</p>

      <div className="pt-3 border-t border-black/[0.05] space-y-3 text-xs text-[#424245] leading-relaxed">
        {children}
      </div>
    </div>
  )
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <span className="text-[#0071E3] shrink-0 mt-0.5" aria-hidden="true">
            &bull;
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default async function MethodologyPage() {
  const user = await getCurrentUser()

  const phaseOrder = CANONICAL_PHASE_ORDER.map((phase) => phase.replace(/_/g, ' ')).join(' → ')
  const autoPublishTiers = AUTO_PUBLISH_TIERS.map((tier) => TIER_LABEL[tier].toLowerCase())

  return (
    <AppShell initialUser={user}>
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12 sm:space-y-16 animate-fade-in">
        {/* Header */}
        <header className="space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#86868B] block">
            Methodology
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1D1D1F] tracking-tight leading-tight">
            How a molecule gets <span className="text-[#0071E3]">checked</span>.
          </h1>
          <p className="text-sm text-[#6E6E73] leading-relaxed">
            Anyone can edit a record here. Before an edit is shown to anyone, a program reads the
            structure it describes and tries to find something wrong with it. That program is
            called RNA Intelligence, it runs in three layers, and this page says exactly what each
            layer does — including what it cannot do.
          </p>
        </header>

        {/* What the engine is */}
        <Section eyebrow="First, the shape of the claim" title="Deterministic, or it means nothing">
          <Card>
            <p className="text-xs sm:text-sm text-[#424245] leading-relaxed">
              Every check below is a pure function of the text submitted. No language model is
              involved anywhere in this pipeline and none may be introduced. There is no
              randomness, no clock reading, and no network call inside a verification path — the
              same sequence produces the same report, character for character, on any machine, this
              year and in ten years.
            </p>
            <p className="text-xs sm:text-sm text-[#424245] leading-relaxed">
              That is not a performance preference. A finding you cannot recompute yourself is not
              a finding, it is an opinion wearing a badge. Everything on this page is designed so
              you can re-run it and get our answer back.
            </p>
            <p className="text-[11px] text-[#86868B] leading-relaxed">
              The parameter set currently in use is named in every report:{' '}
              <code className="font-mono text-[#1D1D1F]">{ENGINE_VERSION}</code>. It is part of the
              hashed input, so a badge computed under one parameter set can never be mistaken for
              one computed under another.
            </p>
          </Card>
        </Section>

        {/* The three layers */}
        <Section eyebrow="The engine" title="Three layers, in this order">
          <div className="space-y-4">
            <LayerCard
              index={1}
              icon={<Dna className="w-4 h-4" />}
              title="Sequence — is this a legal molecule as written?"
              plain="Layer 1 reads the string itself. It does not ask whether the molecule is a good drug; it asks whether the text describes a molecule at all."
            >
              <p>
                Which alphabet applies is decided by the record&rsquo;s modality. RNA, siRNA, ASO,
                mRNA and gene-therapy records are read as nucleotide sequences; small molecules and
                botanicals as SMILES chemistry strings; peptides and GLP-1 agonists as amino-acid
                backbones. An antibody or a recombinant protein is usually recorded as a
                descriptor &mdash; a name, not a sequence &mdash; and this layer can only check that
                one is present and long enough to mean anything. It does not pretend to have read a
                structure it was never given.
              </p>

              <CheckList
                items={[
                  `Nucleotide sequences are checked against the A/U/C/G alphabet. Whitespace and hyphens are dropped; anything else is an error reported at the exact character position you typed it.`,
                  `Thymine is a transcription slip, not a corrupt file: a T is transcribed to U, kept, counted, and reported back to you. In cDNA mode the alphabet flips to A/T/C/G and a stray U becomes the error instead.`,
                  `The reading frame is arithmetic: is the length a multiple of three, does the sequence open on AUG, does it end on UAA, UGA or UAG, and where is the first open reading frame — from the first AUG to the first in-frame stop, translated with NCBI standard table 1.`,
                  `A stop codon inside the reading frame with at least one whole codon after it is reported as a premature stop, with its position. One or two ragged trailing bases are a truncated submission, not an internal stop, and are not reported as one.`,
                  `Reading-frame findings apply only from ${CODING_FRAME_MIN_LENGTH} nucleotides up. Below that the sequence is an oligonucleotide — a ${MIN_NUCLEOTIDE_LENGTH}-to-${CODING_FRAME_MIN_LENGTH} nt guide strand was never meant to carry a start codon, and flagging it for lacking one would be noise.`,
                  `Molecular weight and chemical formula are computed from composition using published residue masses, never estimated from string length.`,
                  `Minimum lengths: ${MIN_NUCLEOTIDE_LENGTH} nucleotides, ${MIN_PEPTIDE_LENGTH} amino-acid residues, ${MIN_DESCRIPTOR_LENGTH} characters for a biologic descriptor.`,
                ]}
              />
            </LayerCard>

            <LayerCard
              index={2}
              icon={<Thermometer className="w-4 h-4" />}
              title="Thermodynamics — could this molecule hold the shape it needs?"
              plain="Layer 1 asked whether the string is legal. Layer 2 asks whether the molecule it describes is physically coherent, and it uses a different published model for each kind of molecule."
            >
              <p>
                For RNA it runs a real minimum-free-energy fold: a Zuker-style dynamic program over
                the Turner 2004 nearest-neighbour parameters — the same algorithm class and the same
                published parameter file that ViennaRNA uses, rewritten in TypeScript because a
                badge that depends on a remote service is a badge nobody can reproduce. The output
                is a free energy in kcal/mol at 37 °C and the dot-bracket notation of the predicted
                structure. Base-pair counts come from that predicted structure, so they describe
                pairs the model says actually form.
              </p>

              <CheckList
                items={[
                  `Folding is O(n³) in time, so sequences longer than ${MAX_FOLD_LENGTH.toLocaleString('en-GB')} nucleotides are refused rather than truncated. The fold of the first ${MAX_FOLD_LENGTH.toLocaleString('en-GB')} bases is the fold of a molecule that does not exist.`,
                  'Small molecules get Lipinski’s rule of five, Ertl topological polar surface area, hydrogen-bond donor and acceptor counts, and rotatable bonds. The counts are exact for the structure as written.',
                  'logP is labelled an estimate everywhere it appears, because it is one: the Wildman–Crippen atomic-contribution model over a documented subset of that paper’s atom types. It places a molecule in the right lipophilicity band. It is not a measurement.',
                  'Peptides get an isoelectric point and net charge from the Bjellqvist pK set — the one ExPASy uses — and hydrophobicity from the Kyte–Doolittle scale.',
                  'For an antibody or a recombinant protein described only by a name, no thermodynamic model in this engine applies, and the report says exactly that instead of returning a reassuring number.',
                ]}
              />

              <p className="text-[11px] text-[#86868B] leading-relaxed">
                One honest limit, stated with its direction: the parameter table carries stacking,
                loop-initiation, multiloop, terminal-AU and Ninio terms, but not Turner
                2004&rsquo;s terminal-mismatch, dangling-end or tabulated small-internal-loop
                tables. Folds computed here are therefore systematically slightly{' '}
                <em>less</em> stable than full ViennaRNA for larger loops, and exact for helices
                closed by a triloop. That is a stated approximation with a known sign, not an
                unquantified guess.
              </p>
            </LayerCard>

            <LayerCard
              index={3}
              icon={<FlaskConical className="w-4 h-4" />}
              title="Protocol — can the laboratory procedure actually be run?"
              plain="A laboratory protocol is a graph: each step is a node, and each dependency is an arrow saying this step cannot start until that one has finished. Layer 3 builds that graph and tries to break it."
            >
              <CheckList
                items={[
                  'Step ids must be unique. Two steps sharing an id makes every dependency ambiguous, so the layer stops there and reports the one thing you can act on rather than a page of noise derived from a guess.',
                  'A dependency pointing at a step that is not in the workflow — usually one that was renamed or deleted — is an error naming both steps.',
                  'The graph is sorted with Kahn’s algorithm. Anything left unscheduled is part of a dependency loop, and the loop’s members are named. A step that depends on itself is caught by the same pass, with no special case.',
                  `Phase progression is checked along every dependency arrow, against the canonical laboratory order: ${phaseOrder}. Several steps of the same phase in a row are ordinary. Depending on a step that runs later in that order is an error — purified material cannot be fed back into synthesis.`,
                  'A step that nothing depends on and that depends on nothing is a warning, not a failure: it is usually a forgotten wire, but it is legitimately a parallel branch often enough that it should not block an edit.',
                  'A protocol that documents no step for some phases is a warning. Most records are partial, and a partial protocol is not a wrong one.',
                  'An empty workflow passes with a warning. Most of the corpus has no documented protocol yet, and failing every edit to every uncurated record would be a way of preventing the wiki from being written.',
                ]}
              />

              <p className="text-[11px] text-[#86868B] leading-relaxed">
                Where no step declares a dependency at all, the workflow is read as a numbered
                pipeline and step <em>n</em> is taken to follow step <em>n</em>−1. The moment any
                step declares one explicitly, that fallback switches off entirely — otherwise a
                protocol whose author deliberately wired step 1 after step 2 would be reported as a
                loop the author never wrote.
              </p>
            </LayerCard>
          </div>
        </Section>

        {/* The badge */}
        <Section eyebrow="The badge" title="What “Machine-Verified Structure” means">
          <Card>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
              <code className="font-mono text-sm font-bold text-emerald-800">MVS-XXXX-XXXX</code>
            </div>

            <p className="text-xs sm:text-sm text-[#424245] leading-relaxed">
              When all three layers pass, the engine prints a short code beside the structure. It
              answers one question and no other: <strong>is the structure on screen still the
              structure the engine swept?</strong> It is not a statement that the drug works, that
              the record is accurate, or that anyone has reviewed it.
            </p>

            <CheckList
              items={[
                'The code is a 64-bit FNV-1a digest of the swept input — the engine version, the structure type, the cleaned sequence, the modality, and the id and phase of every protocol step in submitted order.',
                'It is computed from the input only. Never from the report, so improving the wording of a diagnostic cannot silently invalidate every stored badge; never from the clock, so it stays reproducible.',
                'Each field is length-framed before hashing, so two different inputs cannot be shuffled across a field boundary into the same digest.',
                'It is NOT a cryptographic hash. It detects accidental divergence — an edited sequence, a badge copied onto a different record, a migration that dropped a step. Anyone who wants to forge one can.',
                'The visible badge shows 32 bits of that digest, so two unrelated records collide after roughly 65,000 of them. It is a human-readable identity check, not a uniqueness guarantee.',
              ]}
            />
          </Card>
        </Section>

        {/* Routing */}
        <Section eyebrow="What happens to your edit" title="The machine decides first, people decide second">
          <Card>
            <p className="text-xs sm:text-sm text-[#424245] leading-relaxed">
              Two questions, answered in this order and never merged. First: is the submitted
              structure internally valid? That is the engine, and it is reproducible. Second: has
              this account earned the right to skip the queue? That is standing, and it is social.
            </p>

            <div className="space-y-2">
              <div className="p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/15 space-y-1">
                <span className="font-bold text-rose-800 text-[11px] block">
                  If the engine fails it, it is rejected — immediately, whoever you are
                </span>
                <p className="text-xs text-[#1D1D1F] leading-relaxed">
                  A failed sweep means the submission contradicts itself. No standing makes that
                  publishable, and sending it to a reviewer would spend a person&rsquo;s attention
                  on something a machine already proved wrong. The rejected edit is still recorded,
                  with its full report, so you can see exactly what failed.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 space-y-1">
                <span className="font-bold text-emerald-800 text-[11px] block">
                  If the engine passes it, standing decides the route
                </span>
                <p className="text-xs text-[#1D1D1F] leading-relaxed">
                  Edits from {autoPublishTiers.join(' and ')} accounts, and from administrators,
                  publish straight away. Everyone else&rsquo;s edits go to the{' '}
                  <Link href="/review-queue" className="font-bold text-[#0071E3] hover:underline">
                    public review queue
                  </Link>
                  , where anyone can read them while they wait. Either way the edit is in the
                  record&rsquo;s permanent history.
                </p>
              </div>
            </div>
          </Card>
        </Section>

        {/* Trust tiers */}
        <Section eyebrow="Standing" title="Earned by accepted edits, never granted on request">
          <Card>
            <ul className="space-y-3">
              {TRUST_TIERS.map((tier) => (
                <li
                  key={tier}
                  className="flex items-start gap-3 pb-3 border-b border-black/[0.05] last:border-0 last:pb-0"
                >
                  <span className="text-[11px] font-mono font-bold text-[#0071E3] bg-blue-50 px-2 py-1 rounded-lg shrink-0 tabular-nums">
                    {TRUST_TIER_THRESHOLDS[tier]}+
                  </span>
                  <div className="min-w-0 space-y-0.5">
                    <span className="text-xs font-bold text-[#1D1D1F] block">
                      {TIER_LABEL[tier]}
                    </span>
                    <p className="text-xs text-[#424245] leading-relaxed">
                      {TIER_DESCRIPTION[tier]}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <p className="text-[11px] text-[#86868B] leading-relaxed">
              The number on the left is accepted edits. A rejected edit is counted so reviewers can
              see a pattern, but it never demotes anyone — standing is a function of accepted work
              alone, so a contributor who attempts hard things and is sometimes wrong keeps what
              they earned.
            </p>
          </Card>
        </Section>

        {/* Physician verification */}
        <Section eyebrow="Credentials" title="How the physician badge is actually granted">
          <Card>
            <p className="text-xs sm:text-sm text-[#424245] leading-relaxed">
              Ticking &ldquo;I am a physician&rdquo; and submitting a licence or NPI number sets
              your account to <strong>pending</strong>. That is the only state that submission path
              can write — there is no parameter, and no combination of them, that reaches
              &ldquo;verified&rdquo; through it.
            </p>

            <CheckList
              items={[
                'A steward reads the credential against a registry and approves it by hand. That single function is the only place in the codebase that writes the verified state, and it requires an administrator.',
                'An account must already be pending to be approved. There is no path from “never claimed” straight to verified, even for an administrator.',
                'Re-filing changed credentials drops the account back to pending and clears the verification date. Changed credentials are unreviewed credentials, and the badge should not outlive the claim it was granted for.',
                'Until that happens, the interface says “submitted for review”. It never shows the badge, and no note or edit is signed as a physician’s.',
              ]}
            />
          </Card>
        </Section>

        {/* Limits */}
        <Section eyebrow="Limits" title="What none of this tells you">
          <Card>
            <p className="text-xs sm:text-sm text-[#424245] leading-relaxed">
              The engine checks a structure against chemistry and a protocol against logic. It has
              nothing to say about whether a medicine works, whether a trial was well run, whether a
              price is fair, or whether the person who wrote a record understood it. A
              machine-verified structure sitting under a wrong verdict is a wrong verdict with a
              correct sequence.
            </p>
            <p className="text-xs sm:text-sm text-[#424245] leading-relaxed">
              Those judgements belong to the evidence on the record and to the people reading it.
              Where a record has no verdict, no pricing or no mechanism yet, it says so and invites
              you to write it — it does not fill the space with something plausible.
            </p>
            <p className="text-[11px] text-[#86868B] leading-relaxed">
              RNAwiki is a public reference work, not medical advice. Nothing here is a
              recommendation to start, stop or change a treatment.
            </p>
          </Card>
        </Section>
      </div>
    </AppShell>
  )
}
