// How this works — the one page explaining both editing and the automatic checks.
//
// It replaces /how-editing-works and /methodology, which split the same story in two and answered
// it twice at different reading levels. Both paths redirect here (next.config.mjs).
//
// WRITTEN FOR SOMEONE WITH NO SCIENCE BACKGROUND. That is the whole constraint. Every technical
// word is either cut or explained the first time it appears, in the sentence where it appears, and
// the explanations use things a reader already knows — a photocopy, a strip of Velcro, a recipe.
// If a sentence needs a second sentence to decode it, the first sentence is wrong.
//
// It is also the product's honesty statement, so every threshold is IMPORTED from the module that
// enforces it rather than typed out. A page that claims a check the code does not perform is the
// worst defect this site could ship: every other page asks readers to trust that we separate what
// was measured from what was assumed, and this is the page where that promise is checkable.

import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { CheckCircle2, Eye, PenLine, Ruler, ShieldCheck, Shuffle, Users } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { getCurrentUser } from '@/lib/session'
import { CANONICAL_PHASE_ORDER, ENGINE_VERSION } from '@/lib/rna-intelligence'
import {
  CODING_FRAME_MIN_LENGTH,
  MIN_NUCLEOTIDE_LENGTH,
  MIN_PEPTIDE_LENGTH,
} from '@/lib/rna-intelligence/layer1-sequence'
import { MAX_FOLD_LENGTH } from '@/lib/rna-intelligence/layer2-structure'
import { TIER_DESCRIPTION, TIER_LABEL } from '@/lib/trust'
import { AUTO_PUBLISH_TIERS, TRUST_TIERS, TRUST_TIER_THRESHOLDS } from '@/lib/types'

// Reads the signed-in user, so it touches the database and has no dynamic segment in its path.
// Railway's build container cannot reach the database, so it must not be a prerender candidate.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'How this works',
  description:
    'Anyone can edit a page here. What happens to your edit, what the automatic check actually reads, who looks at it afterwards, and what the marks on a page do and do not mean — in plain words.',
  alternates: { canonical: '/how-it-works' },
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

function Step({
  number,
  icon,
  title,
  children,
}: {
  number: number
  icon: ReactNode
  title: string
  children: ReactNode
}) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-black/[0.08] shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-3">
      <div className="flex items-start gap-3">
        <span
          className="w-8 h-8 rounded-xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          {icon}
        </span>
        <div className="space-y-1 min-w-0">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0071E3] block">
            Step {number}
          </span>
          <h3 className="text-lg font-extrabold text-[#1D1D1F] tracking-tight leading-snug">
            {title}
          </h3>
        </div>
      </div>
      <div className="space-y-3 text-xs sm:text-sm text-[#424245] leading-relaxed">{children}</div>
    </div>
  )
}

function Check({
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
            Check {index}
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

export default async function HowItWorksPage() {
  const user = await getCurrentUser()

  const autoPublishTier = TRUST_TIERS.find((tier) => AUTO_PUBLISH_TIERS.includes(tier)) ?? 'trusted'
  const autoPublishAt = TRUST_TIER_THRESHOLDS[autoPublishTier]
  const phaseCount = CANONICAL_PHASE_ORDER.length

  return (
    <AppShell initialUser={user}>
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12 sm:space-y-16 animate-fade-in">
        <header className="space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#86868B] block">
            How this works
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1D1D1F] tracking-tight leading-tight">
            Anyone can edit this. <br />
            Here is <span className="text-[#0071E3]">what stops it being nonsense</span>.
          </h1>
          <p className="text-sm text-[#6E6E73] leading-relaxed">
            Every page here can be changed by anyone with an account, including you. Nothing goes
            live just because someone wrote it. Two things check an edit first — a program, then a
            person — and this page explains both without assuming you have a science degree.
          </p>
        </header>

        <Section eyebrow="The short version" title="Four things happen to an edit">
          <Card>
            <ol className="space-y-3 text-xs sm:text-sm text-[#424245] leading-relaxed">
              <li>
                <strong className="text-[#1D1D1F]">A program checks the chemistry.</strong> Straight
                away, while you are still typing. If you have described a molecule that could not
                exist, you are told which character is wrong and the save button stays off.
              </li>
              <li>
                <strong className="text-[#1D1D1F]">A person checks the meaning.</strong> No program
                can tell whether a sentence about a drug is true. Someone reads it.
              </li>
              <li>
                <strong className="text-[#1D1D1F]">It goes live with your name on it.</strong> Every
                version is kept and attributed, permanently.
              </li>
              <li>
                <strong className="text-[#1D1D1F]">You earn the right to skip the queue.</strong>{' '}
                After {autoPublishAt} accepted edits your changes publish immediately.
              </li>
            </ol>
          </Card>
        </Section>

        <Section eyebrow="Editing" title="Your edit, from the button to the page">
          <div className="space-y-4">
            <Step number={1} icon={<PenLine className="w-4 h-4" />} title="You write it">
              <p>
                Open any medicine and press <em>Edit Wiki Dossier &amp; Scientific Records</em>. A
                dossier is just this site&rsquo;s word for one medicine&rsquo;s page. You get a form
                with that page split into five parts: the plain-English summary, the alternatives,
                the chemical structure, the pricing, and the laboratory steps. Change whatever you
                know something about and leave the rest alone.
              </p>
              <p>
                You have to write one line saying what you changed. It is the first thing a reviewer
                reads, and an edit that does not explain itself is an edit nobody can check.
              </p>
            </Step>

            <Step
              number={2}
              icon={<ShieldCheck className="w-4 h-4" />}
              title="The program checks it, as you type"
            >
              <p>
                It looks for things that are impossible rather than things it disagrees with. The
                next section explains exactly what it reads. It runs while you are still typing, so
                you see a problem before you submit rather than after.
              </p>
              <p className="text-[#1D1D1F] font-medium">
                Nothing that fails this check reaches a person. It cannot be approved by anyone, at
                any level, including whoever runs the site.
              </p>
            </Step>

            <Step number={3} icon={<Eye className="w-4 h-4" />} title="A person reads it">
              <p>
                Passing the program means your edit is <em>possible</em>, not that it is true. A
                perfectly valid molecule can sit underneath a sentence that gets a trial result
                backwards. So an edit from someone new waits in the{' '}
                <Link href="/review-queue" className="text-[#0071E3] hover:underline">
                  review queue
                </Link>{' '}
                until an experienced editor reads it.
              </p>
              <p>
                That queue is public. You can watch your own edit sitting in it, see its position,
                and see everyone else&rsquo;s. There is no private channel and no way to get
                something approved out of sight.
              </p>
              <p>
                A reviewer either accepts it or sends it back with a reason. Being sent back is not
                a black mark — most first edits get a note. Fix it and resubmit as often as you
                like.
              </p>
            </Step>

            <Step
              number={4}
              icon={<CheckCircle2 className="w-4 h-4" />}
              title="It goes live and stays on the record"
            >
              <p>
                The page updates and your edit joins that medicine&rsquo;s history: what you
                changed, from what to what, and when. That record is permanent. Later edits can
                overwrite the page but cannot erase who wrote what.
              </p>
              <p>
                If you added an ORCID iD to your account — a free identifier researchers use so
                their work stays attached to their name — your contributions link to it, so you can
                point at them from outside this site.
              </p>
            </Step>
          </div>
        </Section>

        <Section eyebrow="The program" title="First, what RNA actually is">
          <Card>
            <p className="text-xs sm:text-sm text-[#424245] leading-relaxed">
              Your body keeps its building instructions in DNA — a master copy locked inside every
              cell, like a reference book that never leaves the library. RNA is the working copy. It
              is the page that gets photocopied out of that book and carried to the part of the cell
              that actually builds things.
            </p>
            <p className="text-xs sm:text-sm text-[#424245] leading-relaxed">
              That matters here because it is where almost every medicine ends up having its effect.
              A few newer drugs are made of RNA and work on those copies directly. Most drugs do
              something else entirely — they block a protein, or occupy a docking point on a cell —
              but the thing they are blocking was built from one of those copies, and the effect
              usually changes which copies the cell makes next. Whatever the route, it runs through
              the same instruction system.
            </p>
            <p className="text-xs sm:text-sm text-[#424245] leading-relaxed">
              A strand of RNA is written down as a string of four letters: A, U, C and G. That is
              the entire alphabet. When a page here shows you a long line of those letters, that is
              what it is — the drug, written out.
            </p>
          </Card>
        </Section>

        <Section eyebrow="The program" title="Three checks, in this order">
          <Card>
            <p className="text-xs sm:text-sm text-[#424245] leading-relaxed">
              The program is called <strong className="text-[#1D1D1F]">RNA Intelligence</strong>. It
              is not artificial intelligence and there is no language model anywhere in it. It is
              arithmetic and published chemistry, and that is deliberate: it means the same edit
              always gets the same answer — today, in ten years, on anyone&rsquo;s computer. You can
              re-run it yourself and get our result back. A finding you cannot recheck is not a
              finding, it is an opinion with a badge on it.
            </p>
            <p className="text-[11px] text-[#86868B] leading-relaxed">
              The measurements it uses are named in every report it produces:{' '}
              <span className="font-mono">{ENGINE_VERSION}</span>. That name is part of what gets
              checked, so a result produced under one set of measurements can never be mistaken for
              one produced under another.
            </p>
          </Card>

          <div className="space-y-4">
            <Check
              index={1}
              icon={<Ruler className="w-4 h-4" />}
              title="Is this written down correctly?"
              plain="It reads the drug as text and asks whether the text describes a real molecule at all — before asking anything about what the drug does."
            >
              <p>
                <strong className="text-[#1D1D1F]">The alphabet.</strong> For RNA, only A, U, C and
                G exist. A stray letter is a typing error, and the program says which character and
                where. There is one near-miss it handles rather than rejects: T belongs to DNA, not
                RNA, and where someone has clearly typed the DNA version it converts it and tells
                you it did, instead of silently accepting either.
              </p>
              <p>
                <strong className="text-[#1D1D1F]">Reading three at a time.</strong> Cells read
                those letters in groups of three, and each group names one building block of a
                protein. So for a strand meant to be read that way, the number of letters has to
                divide by three. Start one letter off and everything after it is wrong — the way{' '}
                <span className="font-mono">THE CAT ATE</span> becomes{' '}
                <span className="font-mono">HEC ATA TE</span> if you start in the wrong place.
              </p>
              <p>
                <strong className="text-[#1D1D1F]">Start and stop.</strong> Particular triplets mean
                &ldquo;begin building here&rdquo; and &ldquo;stop here&rdquo;. The program looks for
                them, works out where the instruction actually runs from and to, and flags a stop
                sign sitting in the middle of it — which would mean the protein is cut short.
              </p>
              <p>
                <strong className="text-[#1D1D1F]">Ordinary pill-shaped drugs</strong> are not
                written as letters. Chemists write them as a single line of text describing which
                atoms are joined to which — the same information a diagram carries, typed out. The
                program reads that line, counts the atoms and works out the molecule&rsquo;s weight
                and formula from them, rather than taking anyone&rsquo;s word for either.
              </p>
              <p className="text-[11px] text-[#86868B]">
                Length floors, so a fragment is not mistaken for a molecule: at least{' '}
                {MIN_NUCLEOTIDE_LENGTH} letters for RNA, at least {MIN_PEPTIDE_LENGTH} building
                blocks for a protein-type drug, and at least {CODING_FRAME_MIN_LENGTH} letters
                before it bothers checking the divide-by-three rule.
              </p>
            </Check>

            <Check
              index={2}
              icon={<Shuffle className="w-4 h-4" />}
              title="Would it hold that shape?"
              plain="A molecule is not a flat line. It folds, and the shape it settles into decides what it can do. This check works out that shape."
            >
              <p>
                A long strand of RNA does not lie straight. Parts of it stick to other parts and it
                folds back on itself, like a long strip of Velcro dropped on a table. Which parts
                stick is not random: A sticks to U, and C sticks to G. So from the letters alone you
                can work out the folds that are possible.
              </p>
              <p>
                Many folds are possible; the strand settles into whichever one is most stable. The
                program works out which one that is, using a published table of laboratory
                measurements of how strongly each pairing holds. The answer comes back as a number —
                the more negative, the more tightly it holds together — and as a little diagram of
                which parts ended up stuck to which.
              </p>
              <p>
                This is the same method and the same measurements used by the standard scientific
                software for the job. It is not an approximation of that software&rsquo;s answer; it
                is that calculation, run here.
              </p>
              <p>
                <strong className="text-[#1D1D1F]">For pill-shaped drugs</strong> the question is
                different, so the check is too. It works out a handful of physical properties —
                weight, greasiness, how many places the molecule can grip water — and compares them
                against a rule of thumb chemists use for whether something can survive being
                swallowed and still reach the bloodstream. Failing it is not a verdict on the drug.
                Plenty of real medicines fail it and are injected instead.
              </p>
              <p className="text-[11px] text-[#86868B]">
                The folding calculation gets slower very fast as a strand gets longer, so it stops
                at {MAX_FOLD_LENGTH.toLocaleString()} letters. Past that the record simply carries
                no folding result, and says so. That is not a failure — the vaccines built from long
                RNA strands land here, and their sequences are perfectly valid.
              </p>
            </Check>

            <Check
              index={3}
              icon={<CheckCircle2 className="w-4 h-4" />}
              title="Could you actually follow the recipe?"
              plain="Records can carry the laboratory steps for making or testing a substance. This checks the steps are in an order a person could physically work through."
            >
              <p>
                Each step can say which earlier step it depends on. Two things go wrong with that,
                and both are easy to write by accident and hard to spot by eye.
              </p>
              <p>
                <strong className="text-[#1D1D1F]">A circle.</strong> Step four waits for step six,
                and step six waits for step four. Nobody could ever start. The program traces every
                dependency through the whole list and reports exactly which steps form the loop.
              </p>
              <p>
                <strong className="text-[#1D1D1F]">Going backwards.</strong> Laboratory work has a
                natural order — {phaseCount} stages, from checking what you started with, through
                making it, cleaning it up, attaching anything that needs attaching, getting it into
                cells, and finally measuring what happened. A step that cleans something up before
                it has been made is out of order, and so is a cell experiment that waits on the
                measurement of its own result. Both are flagged with the two steps named.
              </p>
              <p>
                A record with no laboratory steps at all passes. Most medicines here have none
                written yet, and that is missing information rather than an error.
              </p>
            </Check>
          </div>
        </Section>

        <Section eyebrow="Earning trust" title="Why some people skip the queue">
          <Card>
            <p className="text-xs sm:text-sm text-[#424245] leading-relaxed">
              Reviewing takes someone&rsquo;s time, and making an editor with a hundred good edits
              wait behind a stranger wastes it. So the queue is not permanent. Accepted edits count,
              and past a threshold your changes publish the moment they pass the program.
            </p>

            <div className="space-y-2 pt-1">
              {TRUST_TIERS.map((tier) => {
                const publishesDirectly = AUTO_PUBLISH_TIERS.includes(tier)
                return (
                  <div
                    key={tier}
                    className="flex items-start justify-between gap-3 p-3.5 rounded-2xl bg-[#F5F5F7] text-xs"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <span className="font-bold text-[#1D1D1F] block">{TIER_LABEL[tier]}</span>
                      <span className="text-[#6E6E73] leading-relaxed block">
                        {TIER_DESCRIPTION[tier]}
                      </span>
                    </div>
                    <span className="shrink-0 text-right space-y-0.5">
                      <span className="font-mono font-bold text-[#1D1D1F] block">
                        {TRUST_TIER_THRESHOLDS[tier] === 0
                          ? 'from the start'
                          : `${TRUST_TIER_THRESHOLDS[tier]} edits`}
                      </span>
                      <span
                        className={`text-[10px] font-semibold block ${
                          publishesDirectly ? 'text-emerald-800' : 'text-[#86868B]'
                        }`}
                      >
                        {publishesDirectly ? 'publishes directly' : 'via the queue'}
                      </span>
                    </span>
                  </div>
                )
              })}
            </div>

            <p className="text-[11px] text-[#86868B] leading-relaxed">
              The program checks every edit at every level. Nobody can publish a broken structure,
              however many good edits they have made.
            </p>
          </Card>
        </Section>

        <Section eyebrow="The badges" title="What the marks on a page mean">
          <Card>
            <div className="space-y-4 text-xs sm:text-sm text-[#424245] leading-relaxed">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" aria-hidden="true" />
                  Machine-Verified Structure
                </span>
                <p>
                  The chemical structure on this page went through all three checks and came back
                  consistent. The short code beside it is worked out from exactly what was checked —
                  run the check again and the same code should come back, and if it does not,
                  something changed. It says nothing about whether the medicine works, whether the
                  price is right, or whether the writing is accurate.
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-black/[0.05]">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0071E3] bg-[#0071E3]/10 px-2.5 py-0.5 rounded-full border border-[#0071E3]/20">
                  <Users className="w-3 h-3" aria-hidden="true" />
                  MD &check;
                </span>
                <p>
                  This sits beside a note when the person who wrote it submitted medical credentials
                  and a human checked them. Filling in the form does not produce the badge. And if
                  that approval is ever withdrawn, the badge disappears from every note that person
                  ever wrote — not just the ones written afterwards.
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-black/[0.05]">
                <span className="text-[11px] font-semibold text-[#86868B]">
                  &ldquo;Not yet documented&rdquo;
                </span>
                <p>
                  Most medicines here have a name, a maker and a legal status and nothing else,
                  because nobody has written the rest yet. Those pages say so plainly instead of
                  filling the gap with something that sounds right. An empty section is an
                  invitation and it is honest. A confident paragraph nobody can source is neither.
                </p>
              </div>
            </div>
          </Card>
        </Section>

        <Section eyebrow="Being straight with you" title="What none of this proves">
          <Card>
            <ul className="space-y-3 text-xs sm:text-sm text-[#424245] leading-relaxed">
              <li>
                <strong className="text-[#1D1D1F]">
                  The program has no opinion about medicine.
                </strong>{' '}
                It checks that a molecule could exist and that a recipe could be followed. It cannot
                tell you whether a drug helps anyone, whether a trial was run properly, or whether a
                price is fair. A verified structure sitting under a wrong conclusion is a wrong
                conclusion with a correct molecule. Reading that badge as a stamp of medical
                accuracy is the easiest way to misread this site.
              </li>
              <li>
                <strong className="text-[#1D1D1F]">A reviewer can be wrong.</strong> They are people
                reading quickly. A bad edit can get through and a good one can get bounced. The
                queue and the history are public precisely so mistakes stay visible and can be
                argued with instead of buried.
              </li>
              <li>
                <strong className="text-[#1D1D1F]">A verified doctor can still be mistaken.</strong>{' '}
                The badge says someone checked the credential, not the claim. Specialists disagree,
                and a note with a badge on it is one clinician&rsquo;s view.
              </li>
              <li>
                <strong className="text-[#1D1D1F]">Sources beat everything.</strong> The strongest
                thing on any page is the reference you can go and read yourself. If a sentence has
                no source you can follow, treat it as unproven, whoever wrote it and whatever badge
                sits next to it.
              </li>
            </ul>
            <p className="text-[11px] text-[#86868B] leading-relaxed pt-1">
              RNAwiki is a public reference work, not medical advice. Nothing here is a
              recommendation to start, stop or change a treatment.
            </p>
          </Card>
        </Section>

        <Section eyebrow="Start" title="Fixing one thing is the fastest way in">
          <Card>
            <p className="text-xs sm:text-sm text-[#424245] leading-relaxed">
              You do not need to write a whole page. The most useful first edit is usually small: a
              missing brand name, a trial result stated too loosely, a mechanism that skips a step,
              a price that is out of date. Find a medicine you know something about and correct one
              thing.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-bold">
              <Link
                href="/browse"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] text-white transition"
              >
                Find a medicine
              </Link>
              <Link
                href="/review-queue"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white border border-[#0071E3]/30 text-[#0071E3] hover:bg-[#FAFAFC] transition"
              >
                See what is waiting for review
              </Link>
            </div>
          </Card>
        </Section>
      </div>
    </AppShell>
  )
}
