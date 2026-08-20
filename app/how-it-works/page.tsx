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
import { CANONICAL_PHASE_ORDER } from '@/lib/rna-intelligence'
import {
  CODING_FRAME_MIN_LENGTH,
  MIN_NUCLEOTIDE_LENGTH,
  MIN_PEPTIDE_LENGTH,
} from '@/lib/rna-intelligence/layer1-sequence'
import { MAX_FOLD_LENGTH } from '@/lib/rna-intelligence/layer2-structure'
import { TIER_LABEL, TIER_SUMMARY } from '@/lib/trust'
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
            Who writes this, <br />
            and <span className="text-[#0071E3]">why should you believe it</span>?
          </h1>
          <p className="text-sm text-[#6E6E73] leading-relaxed">
            Anyone with an account can change a page here, including you. Nothing goes up just
            because somebody typed it. Every change is checked twice before you see it: first by a
            program, then by a person. This page explains both, and assumes you know no science at
            all.
          </p>
        </header>

        <Section eyebrow="First" title="Seven words, so the rest makes sense">
          <Card>
            <p className="text-xs sm:text-sm text-[#424245] leading-relaxed">
              The rest of this page uses these and nothing else. Read them once and you are set.
            </p>
            <dl className="space-y-3 text-xs sm:text-sm">
              {[
                ['Atom', 'The smallest piece matter comes in. Far too small to see.'],
                [
                  'Molecule',
                  'Atoms joined together. Water is a molecule. So is sugar. So is every drug on this site.',
                ],
                [
                  'Cell',
                  'Your body is built from tiny closed-off units called cells. You have trillions of them.',
                ],
                [
                  'DNA',
                  'Inside every cell is a full set of instructions for building you. Think of a reference book that never leaves the library.',
                ],
                [
                  'RNA',
                  'A working copy of one page of that book, carried out of the library to be used. The site is named after it.',
                ],
                [
                  'Protein',
                  'What gets built from those copies. Proteins do the actual jobs in your body — digesting food, carrying oxygen, fighting infection.',
                ],
                [
                  'Study',
                  'When a drug is given to real people under careful conditions to find out what it does. Sometimes called a trial. Nothing to do with courts.',
                ],
              ].map(([term, meaning]) => (
                <div key={term} className="flex flex-col sm:flex-row sm:gap-3">
                  <dt className="font-bold text-[#1D1D1F] sm:w-24 shrink-0">{term}</dt>
                  <dd className="text-[#424245] leading-relaxed">{meaning}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </Section>

        <Section eyebrow="The short version" title="Four things happen to an edit">
          <Card>
            <ol className="space-y-3 text-xs sm:text-sm text-[#424245] leading-relaxed">
              <li>
                <strong className="text-[#1D1D1F]">A program checks the drug itself.</strong>{' '}
                Straight away, while you are still typing. If you have described a molecule that
                could not be real, it tells you which letter is wrong and the save button stays off.
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
                After {autoPublishAt} accepted edits, your changes go up straight away.
              </li>
            </ol>
          </Card>
        </Section>

        <Section eyebrow="Editing" title="Your edit, from the button to the page">
          <div className="space-y-4">
            <Step number={1} icon={<PenLine className="w-4 h-4" />} title="You write it">
              <p>
                Open any medicine and press the edit button. (It is labelled{' '}
                <em>Edit Wiki Dossier &amp; Scientific Records</em>. A dossier is just this
                site&rsquo;s word for a medicine&rsquo;s page.)
              </p>
              <p>The form splits that page into five parts:</p>
              <ul className="space-y-1 pl-4 list-disc marker:text-[#86868B]">
                <li>the plain-English summary of what the drug does</li>
                <li>other medicines and foods that do a similar job</li>
                <li>how the drug is built — which atoms it is made of, and how they are joined</li>
                <li>what it costs to make, and what it sells for</li>
                <li>the laboratory steps for making or testing it</li>
              </ul>
              <p>Change whatever you know something about and leave the rest alone.</p>
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
                It looks for things that are impossible, not things it disagrees with. It runs while
                you are still typing, so you see a problem before you send the edit rather than
                after. The next section explains exactly what it reads.
              </p>
              <p>
                Some of what it finds stops the edit dead — a letter that cannot exist, a recipe
                that loops back on itself. The rest is a warning: something worth a second look that
                does not make the edit wrong. Warnings do not block anything. They are printed
                beside the edit so the person reviewing it can see them too.
              </p>
              <p className="text-[#1D1D1F] font-medium">
                Nothing that fails this check reaches a person. It cannot be approved by anyone, at
                any level, including whoever runs the site.
              </p>
            </Step>

            <Step number={3} icon={<Eye className="w-4 h-4" />} title="A person reads it">
              <p>
                Passing the program means your edit is <em>possible</em>, not that it is true. The
                program can agree that a drug is written down correctly while the sentence beside it
                still gets the science wrong — saying a drug helped people when the study it came
                from found the opposite. Only a person catches that. So an edit from someone new
                waits in the{' '}
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

        <Section eyebrow="The program" title="Why a drug site is named after RNA">
          <Card>
            <p className="text-xs sm:text-sm text-[#424245] leading-relaxed">
              Your DNA is the reference book. RNA is the photocopy someone takes out to the workshop
              and works from. The copy is what actually gets used to build a protein.
            </p>
            <p className="text-xs sm:text-sm text-[#424245] leading-relaxed">
              That is where medicines end up. A few newer drugs are themselves made of RNA and work
              on those copies directly. Most drugs do something else: they get in the way of a
              protein, or plug into a socket on the outside of a cell, like a key in a lock. But the
              protein they are blocking was built from one of those copies in the first place. And
              blocking it usually changes which copies the cell makes next.
            </p>
            <p className="text-xs sm:text-sm text-[#424245] leading-relaxed">
              So RNA is either the target or one step away from it. That is the thread this site
              follows.
            </p>
            <p className="text-xs sm:text-sm text-[#424245] leading-relaxed">
              RNA is written down using only four letters: A, U, C and G. That is the whole
              alphabet. One length of it is called a strand. When a page here shows you a long line
              of those four letters, that is the drug, written out.
            </p>
          </Card>
        </Section>

        <Section eyebrow="The program" title="Three checks, in this order">
          <Card>
            <p className="text-xs sm:text-sm text-[#424245] leading-relaxed">
              The program is called <strong className="text-[#1D1D1F]">RNA Intelligence</strong>.
              The name is misleading in one way worth clearing up: there is no AI in it. It does not
              write anything and it does not have opinions. It does sums, using measurements that
              scientists have published from laboratory experiments.
            </p>
            <p className="text-xs sm:text-sm text-[#424245] leading-relaxed">
              That matters because it means the same edit always gets the same answer. Not usually.
              Always — today, in ten years, on anybody&rsquo;s computer. Nobody can get a different
              result by asking again or by asking nicely.
            </p>
          </Card>

          <div className="space-y-4">
            <Check
              index={1}
              icon={<Ruler className="w-4 h-4" />}
              title="Is this written down correctly?"
              plain="Before asking anything about what a drug does, the program asks whether what you typed describes a real molecule at all."
            >
              <p>
                <strong className="text-[#1D1D1F]">The alphabet.</strong> For RNA, only A, U, C and
                G exist. Any other letter is a typing mistake, and you are told which one and where
                it is.
              </p>
              <p>
                There is one exception. The letter T belongs to DNA, where it does the same job U
                does in RNA. People type it out of habit. Rather than reject the edit, the program
                swaps every T it finds for a U and tells you how many it changed, so you can check
                that is what you meant.
              </p>
              <p>
                <strong className="text-[#1D1D1F]">Reading three at a time.</strong> Cells read
                those letters in groups of three. Each group of three names one piece of the protein
                being built. So the number of letters has to divide by three, or the last group is
                incomplete.
              </p>
              <p>
                Start one letter off and everything after it is wrong.{' '}
                <span className="font-mono">THE CAT ATE</span> read from the second letter becomes{' '}
                <span className="font-mono">HEC ATA TE</span>. Same letters, no meaning.
              </p>
              <p>
                <strong className="text-[#1D1D1F]">Start and stop.</strong> Some groups of three
                mean &ldquo;begin building here&rdquo; and some mean &ldquo;stop here&rdquo;. The
                program finds them and works out where the instruction actually runs from and to. It
                also warns you about a stop sign sitting in the middle, which would mean the cell
                builds half a protein and abandons it.
              </p>
              <p>
                <strong className="text-[#1D1D1F]">Ordinary pills</strong> are not written in
                letters. A chemist can write a whole drug as one line of text saying which atoms are
                joined to which — the same thing a diagram of the drug would show, typed out instead
                of drawn. The program reads that line and counts the atoms itself. It works out what
                the drug is made of rather than taking anyone&rsquo;s word for it.
              </p>
              <p className="text-[11px] text-[#86868B]">
                It also refuses anything too short to be a real drug: under {MIN_NUCLEOTIDE_LENGTH}{' '}
                letters of RNA, or under {MIN_PEPTIDE_LENGTH} protein pieces. It only bothers with
                the divide-by-three rule past {CODING_FRAME_MIN_LENGTH} letters, because below that
                a strand is usually not an instruction for building anything.
              </p>
            </Check>

            <Check
              index={2}
              icon={<Shuffle className="w-4 h-4" />}
              title="Would it hold that shape?"
              plain="A drug is not a flat line. It folds up, and the shape it settles into decides what it can do."
            >
              <p>
                A long strand of RNA does not lie straight. Parts of it stick to other parts, and it
                folds back on itself — like a long strip of Velcro dropped on a table.
              </p>
              <p>
                Which parts stick is not random. A sticks to U, and C sticks to G. There is also a
                weaker third pairing, G with U, which the calculation allows for. So from the
                letters alone you can work out every fold that is possible.
              </p>
              <p>
                Usually many are possible, and the strand settles into whichever holds together most
                firmly. The program works out which one that is. It uses a table of laboratory
                measurements, published by scientists, of how strongly each pairing holds.
              </p>
              <p>
                You get back a number and a small picture. The picture shows which parts ended up
                stuck to which. The number is always below zero, and the further below, the more
                firmly the strand holds its shape. A short strand might come back around &minus;10.
                A tightly folded one, &minus;40 or lower.
              </p>
              <p>
                This is the same method, using the same published measurements, that scientists use
                in their own software for this job. It is not a guess at what that software would
                say.
              </p>
              <p>
                It will not always agree with it to the last decimal place. This uses a smaller part
                of the published measurements than the full research software does, so on some
                shapes the two differ slightly. On the commonest shape of all, they agree exactly.
              </p>
              <p>
                <strong className="text-[#1D1D1F]">For ordinary pills</strong> the question is
                different, so the check is too. It works out a few simple things about the drug: how
                heavy it is, how greasy or watery it is, and how readily it dissolves. The weight is
                counted exactly from the atoms. The greasiness is an estimate — a well-known way of
                approximating it, not a measurement, and the page marks it as one. Chemists have a
                rough rule about which combinations survive the stomach and still reach the blood.
                The program checks the drug against that rule. Failing it is not a mark against the
                drug — plenty of real medicines fail it, which is why they are injected instead of
                swallowed.
              </p>
              <p className="text-[11px] text-[#86868B]">
                Working out the folding gets slower very fast as a strand gets longer, so it stops
                at {MAX_FOLD_LENGTH.toLocaleString()} letters. Past that, the page simply carries no
                folding result and says so. That is not a failure. The COVID vaccines are built from
                strands far longer than this, and their letters are perfectly correct.
              </p>
            </Check>

            <Check
              index={3}
              icon={<CheckCircle2 className="w-4 h-4" />}
              title="Could you actually follow the recipe?"
              plain="A page can carry the laboratory steps for making or testing a substance. This checks the steps are in an order a person could really work through."
            >
              <p>
                Each step can say which earlier step it needs finished first. If no step says so,
                the program assumes they simply run in the order they are listed, which is what a
                recipe usually means.
              </p>
              <p>Four things go wrong here, and all four are easy to type and hard to see:</p>
              <p>
                <strong className="text-[#1D1D1F]">A circle.</strong> Step four says it needs step
                six finished first. Step six says it needs step four. Nobody could ever start. The
                program works through the list and reports every step it could not reach — which
                includes the steps in the circle, and any step waiting behind them.
              </p>
              <p>
                <strong className="text-[#1D1D1F]">Two steps with the same name.</strong> If a step
                points at &ldquo;step three&rdquo; and there are two of them, nobody can tell which
                is meant. The program stops there.
              </p>
              <p>
                <strong className="text-[#1D1D1F]">Pointing at a step that is not there.</strong> A
                step waiting for one that was deleted, or never written.
              </p>
              <p>
                <strong className="text-[#1D1D1F]">Going backwards.</strong> Laboratory work has a
                natural order, {phaseCount} stages long. You check what you started with. You make
                the thing. You clean it up. You attach anything that has to be attached to it. You
                get it into cells. You measure what happened.
              </p>
              <p>
                A step that cleans something up before it has been made is out of order. So is a
                step that says &ldquo;grow the cells&rdquo; but claims it has to wait for the
                measurement taken at the end. The program flags both and names the two steps
                involved.
              </p>
              <p>
                A page with no laboratory steps passes. Most medicines here have none written yet.
                That is information nobody has added, not a mistake.
              </p>
            </Check>
          </div>
        </Section>

        <Section eyebrow="Earning trust" title="Why some people skip the queue">
          <Card>
            <p className="text-xs sm:text-sm text-[#424245] leading-relaxed">
              Reviewing takes someone&rsquo;s time. Making an editor with a hundred good edits queue
              behind a stranger wastes it. So the queue is not permanent. Once {autoPublishAt} of
              your edits have been accepted, your changes go up the moment they pass the program.
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
                        {TIER_SUMMARY[tier]}
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
              The program checks every edit at every level. Nobody can put up a drug that is written
              down wrongly, however many good edits they have made.
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
                  This means the drug on the page passed all three checks above. It is written down
                  correctly, it would hold together, and its recipe is in a workable order.
                </p>
                <p>
                  Next to the badge is a short code. It is worked out from the drug as written and
                  the steps of its recipe — not from the rest of the page. Run the check again on
                  the same drug and the same code comes back. If someone quietly changes the drug
                  afterwards, the code no longer matches, and anyone can see that.
                </p>
                <p className="text-[#1D1D1F] font-medium">
                  It says nothing about whether the medicine works, whether the price is fair, or
                  whether the writing on the page is right.
                </p>
                <p>
                  It also means much less on some pages than on others, and this is worth knowing.
                  Antibodies and other large biological drugs are far too big to write down the way
                  a pill or a strand of RNA can be. There is no line of letters to check. On those
                  pages the badge confirms only that a description is present. On a small molecule
                  or an RNA drug, it means the full three checks ran.
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-black/[0.05]">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0071E3] bg-[#0071E3]/10 px-2.5 py-0.5 rounded-full border border-[#0071E3]/20">
                  <Users className="w-3 h-3" aria-hidden="true" />
                  MD &check;
                </span>
                <p>
                  MD means medical doctor. You will see this next to a comment when the person who
                  wrote it gave us proof they are a doctor and somebody here checked that proof.
                  Filling in the form does not get you the badge on its own.
                </p>
                <p>
                  If that approval is ever taken away, the badge disappears from every comment that
                  person ever wrote — not only the ones written afterwards.
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
                <strong className="text-[#1D1D1F]">
                  A doctor with a badge can still be wrong.
                </strong>{' '}
                The badge says we checked that they are a doctor. It does not say we checked what
                they wrote. Doctors disagree with each other all the time, and a comment with a
                badge on it is still one person&rsquo;s view.
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
