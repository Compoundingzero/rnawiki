// How editing works — written for someone who has never edited a wiki.
//
// /methodology explains the same pipeline to a reader who wants the biochemistry. This page
// explains it to everyone else, and the two must not disagree: every threshold below is IMPORTED
// from the module that enforces it, so if the trust tiers change, this page changes with them.
//
// The register is deliberate. No jargon that is not immediately unpacked, short sentences, and the
// awkward parts stated rather than skipped — what a machine check cannot catch, what happens when
// a reviewer is wrong, and what a badge does not mean. A page about trust that oversells itself
// undoes the thing it is for.

import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { CheckCircle2, Eye, PenLine, ShieldCheck, Users } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { getCurrentUser } from '@/lib/session'
import { TIER_DESCRIPTION, TIER_LABEL } from '@/lib/trust'
import { AUTO_PUBLISH_TIERS, TRUST_TIERS, TRUST_TIER_THRESHOLDS } from '@/lib/types'

// Reads the signed-in user, so it touches the database and has no dynamic segment. Railway's
// build container cannot resolve postgres.railway.internal, so it must not be prerendered.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'How editing works',
  description:
    'Anyone can edit a page on RNAwiki. This explains what happens to your edit, who checks it, how long it takes, and what the badges on a page actually mean.',
  alternates: { canonical: '/how-editing-works' },
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

export default async function HowEditingWorksPage() {
  const user = await getCurrentUser()

  const autoPublishTier = TRUST_TIERS.find((tier) => AUTO_PUBLISH_TIERS.includes(tier)) ?? 'trusted'
  const autoPublishAt = TRUST_TIER_THRESHOLDS[autoPublishTier]

  return (
    <AppShell initialUser={user}>
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12 sm:space-y-16 animate-fade-in">
        <header className="space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#86868B] block">
            Editing
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1D1D1F] tracking-tight leading-tight">
            Anyone can edit this. <br />
            Here is <span className="text-[#0071E3]">what happens next</span>.
          </h1>
          <p className="text-sm text-[#6E6E73] leading-relaxed">
            Every page on this site can be changed by anyone with an account, including you. Nothing
            you write goes live because you wrote it. This page explains what your edit actually
            goes through, who looks at it, how long it takes, and what the badges on a page do and
            do not mean.
          </p>
        </header>

        <Section eyebrow="The short version" title="Four things happen to an edit">
          <Card>
            <ol className="space-y-3 text-xs sm:text-sm text-[#424245] leading-relaxed list-none counter-reset">
              <li>
                <strong className="text-[#1D1D1F]">A computer checks the chemistry.</strong>{' '}
                Instantly, before anything else. If the molecule you typed could not exist, the edit
                is refused on the spot and you are told which character was wrong.
              </li>
              <li>
                <strong className="text-[#1D1D1F]">A person checks the meaning.</strong> A computer
                cannot tell whether a sentence about a drug is true. Someone reads it.
              </li>
              <li>
                <strong className="text-[#1D1D1F]">It goes live, with your name on it.</strong>{' '}
                Every version is kept for ever and attributed to whoever wrote it.
              </li>
              <li>
                <strong className="text-[#1D1D1F]">You earn the right to skip the queue.</strong>{' '}
                After enough accepted edits, your changes publish immediately.
              </li>
            </ol>
          </Card>
        </Section>

        <Section eyebrow="In detail" title="Your edit, from the button to the page">
          <div className="space-y-4">
            <Step number={1} icon={<PenLine className="w-4 h-4" />} title="You write it">
              <p>
                Open any medicine and press <em>Edit Wiki Dossier &amp; Scientific Records</em>. You
                get a form with the page split into five parts: the plain-English summary, the
                alternatives, the chemical structure, the pricing and the laboratory protocol.
                Change whatever you know something about and leave the rest alone.
              </p>
              <p>
                You have to write one line saying what you changed. It is the first thing a reviewer
                reads, and an edit that does not explain itself is an edit nobody can check.
              </p>
            </Step>

            <Step
              number={2}
              icon={<ShieldCheck className="w-4 h-4" />}
              title="A computer checks it, as you type"
            >
              <p>
                A program reads the chemical structure and the laboratory steps and looks for things
                that are impossible rather than merely wrong. A genetic sequence containing a letter
                that is not a real base. A protein-coding sequence whose length is not divisible by
                three, when the genetic code is read three letters at a time. A laboratory protocol
                where step four depends on step six, which depends on step four.
              </p>
              <p>
                This runs while you are still typing, so you see the problem before you submit. If
                something fails, the <em>Save</em> button stays switched off and the message tells
                you what and where. This is not a moderator disagreeing with you — it is arithmetic.
              </p>
              <p className="text-[#1D1D1F] font-medium">
                Nothing that fails this check reaches a human. It cannot be approved by anyone, at
                any level, including the people who run the site.
              </p>
              <p className="text-[11px] text-[#86868B]">
                Every rule it applies is listed on{' '}
                <Link href="/methodology" className="text-[#0071E3] hover:underline">
                  the methodology page
                </Link>
                , along with what it cannot catch.
              </p>
            </Step>

            <Step number={3} icon={<Eye className="w-4 h-4" />} title="A person reads it">
              <p>
                Passing the machine check means your edit is possible, not that it is true. A
                perfectly valid molecule can sit underneath a sentence that gets the trial result
                backwards. So an edit from a new contributor waits in the{' '}
                <Link href="/review-queue" className="text-[#0071E3] hover:underline">
                  public review queue
                </Link>{' '}
                until an experienced editor reads it.
              </p>
              <p>
                The queue is public. You can watch your own edit sitting in it, see its position,
                and see everyone else&rsquo;s. There is no private moderation channel and no way to
                have something approved out of sight.
              </p>
              <p>
                A reviewer either accepts the edit or sends it back with a reason. Being sent back
                is not a strike against you — most first edits get a note, and you can fix it and
                resubmit as many times as you like.
              </p>
            </Step>

            <Step
              number={4}
              icon={<CheckCircle2 className="w-4 h-4" />}
              title="It goes live and stays on the record"
            >
              <p>
                Once accepted, the page updates and your edit joins that medicine&rsquo;s revision
                history: what you changed, from what to what, and when. That record is permanent.
                Later edits can overwrite the page but cannot erase who wrote what.
              </p>
              <p>
                If you added an ORCID iD to your account — the identifier researchers use to attach
                work to their name — your contributions are linked to it, so you can point at them
                from outside the site.
              </p>
            </Step>
          </div>
        </Section>

        <Section eyebrow="Earning trust" title="Why some people skip the queue">
          <Card>
            <p className="text-xs sm:text-sm text-[#424245] leading-relaxed">
              Reviewing takes someone&rsquo;s time, and making an editor with a hundred good edits
              wait behind a stranger wastes it. So the queue is not permanent. Accepted edits count,
              and once you have enough of them your changes publish the moment they pass the machine
              check.
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
              {`Edits still go through the machine check at every tier. A ${TIER_LABEL[
                autoPublishTier
              ].toLowerCase()} who has made ${autoPublishAt} accepted edits cannot publish a broken structure either.`}
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
                  The chemical structure on this page was checked by the program and is internally
                  consistent. The code beside it is a fingerprint of exactly what was checked, so
                  the same check can be re-run and compared. It says nothing about whether the
                  medicine works, whether the price is right, or whether the writing is accurate.
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-black/[0.05]">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0071E3] bg-[#0071E3]/10 px-2.5 py-0.5 rounded-full border border-[#0071E3]/20">
                  <Users className="w-3 h-3" aria-hidden="true" />
                  MD &check;
                </span>
                <p>
                  This appears beside a note when the person who wrote it submitted medical
                  credentials and a human checked them. Filling in the form does not produce the
                  badge; someone has to approve it, and the badge disappears from every note that
                  person ever wrote if the approval is later withdrawn.
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-black/[0.05]">
                <span className="text-[11px] font-semibold text-[#86868B]">
                  &ldquo;Not yet documented&rdquo;
                </span>
                <p>
                  Most medicines on this site have a name, a maker and a regulatory status and
                  nothing else, because nobody has written the rest yet. Those pages say so in plain
                  words instead of filling the gap with something plausible. An empty section is an
                  invitation, and it is honest; a confident paragraph nobody can source is neither.
                </p>
              </div>
            </div>
          </Card>
        </Section>

        <Section eyebrow="Being straight with you" title="Where this can still go wrong">
          <Card>
            <ul className="space-y-3 text-xs sm:text-sm text-[#424245] leading-relaxed">
              <li>
                <strong className="text-[#1D1D1F]">A reviewer can be wrong.</strong> They are people
                reading quickly. A wrong edit can get through and a good one can get bounced. The
                queue and the revision history are public precisely so that mistakes are visible and
                can be argued with rather than buried.
              </li>
              <li>
                <strong className="text-[#1D1D1F]">The machine check is narrow on purpose.</strong>{' '}
                It proves a molecule is possible and a protocol is orderly. It has no opinion about
                whether a drug helps anyone. Treating that badge as a stamp of medical accuracy is
                the single easiest way to misread this site.
              </li>
              <li>
                <strong className="text-[#1D1D1F]">A verified doctor can still be mistaken.</strong>{' '}
                The badge says someone checked the credential, not the claim. Specialists disagree,
                and a note with a badge on it is one clinician&rsquo;s view.
              </li>
              <li>
                <strong className="text-[#1D1D1F]">Sources beat everything.</strong> The strongest
                thing on any page is the citation. If a sentence has no source you can follow, treat
                it as unproven no matter who wrote it or what badge is next to it.
              </li>
            </ul>
            <p className="text-[11px] text-[#86868B] leading-relaxed pt-1">
              RNAwiki is a public reference work, not medical advice. Nothing here is a
              recommendation to start, stop or change a treatment.
            </p>
          </Card>
        </Section>

        <Section eyebrow="Start" title="Fixing something is the fastest way in">
          <Card>
            <p className="text-xs sm:text-sm text-[#424245] leading-relaxed">
              You do not need to write a whole page. The most useful first edit is usually small: a
              missing brand name, a trial result stated loosely, a mechanism that skips a step, a
              price that is out of date. Find a medicine you know something about and correct one
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
