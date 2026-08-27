import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  ArrowDown,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  FileSearch,
  GitBranch,
  Link2,
  RefreshCcw,
  Scale,
  ShieldCheck,
} from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { countDrugs, countProgrammeEvidence } from '@/lib/queries/drugs'
import { EVIDENCE_RULE_CODES } from '@/lib/rna-intelligence/evidence-rule-catalog'
import { getCurrentUser } from '@/lib/session'

// Reads the signed-in user, so it touches the database and has no dynamic segment in its path.
// Railway's build container cannot reach the database, so it must not be a prerender candidate.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'How RNAWiki works',
  description:
    'How RNAWiki links medicine statements to sources, checks the record and uses human review before publishing a conclusion.',
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
        <span className="block text-[11px] font-bold uppercase tracking-widest text-[#6E6E73]">
          {eyebrow}
        </span>
        <h2 className="text-xl font-extrabold tracking-tight text-[#1D1D1F] sm:text-2xl">
          {title}
        </h2>
      </div>
      {children}
    </section>
  )
}

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-5 rounded-3xl border border-black/[0.08] bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.03)] sm:p-8">
      {children}
    </div>
  )
}

function StoryStep({
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
    <li className="grid gap-3 py-6 first:pt-0 last:pb-0 sm:grid-cols-[2.5rem_1fr] sm:gap-4">
      <span
        className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0071E3]/10 text-[#0071E3]"
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="space-y-2">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#0071E3]">
          Step {number}
        </p>
        <h3 className="text-lg font-extrabold leading-snug tracking-tight text-[#1D1D1F]">
          {title}
        </h3>
        <div className="space-y-2 text-xs leading-relaxed text-[#424245] sm:text-sm">
          {children}
        </div>
      </div>
    </li>
  )
}

function FlowItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex flex-col items-center gap-2 text-center">
      <span className="w-full rounded-2xl border border-black/[0.08] bg-[#FAFAFC] px-4 py-3 text-xs font-bold text-[#1D1D1F] sm:text-sm">
        {children}
      </span>
      <ArrowDown className="h-4 w-4 text-[#6E6E73]" aria-hidden="true" />
    </li>
  )
}

function BadgeExplanation({ badge, children }: { badge: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-2 border-t border-black/[0.06] py-5 first:border-t-0 first:pt-0 last:pb-0">
      <div>{badge}</div>
      <p className="text-xs leading-relaxed text-[#424245] sm:text-sm">{children}</p>
    </div>
  )
}

const quietBadge =
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold'

export default async function HowItWorksPage() {
  const [user, medicineCount, programmeCoverage] = await Promise.all([
    getCurrentUser(),
    countDrugs(),
    countProgrammeEvidence(),
  ])

  return (
    <AppShell initialUser={user}>
      <div className="mx-auto w-full max-w-2xl space-y-12 px-4 py-8 animate-fade-in sm:space-y-16 sm:px-6 sm:py-12">
        <header className="space-y-4">
          <span className="block text-[11px] font-bold uppercase tracking-widest text-[#6E6E73]">
            How this works
          </span>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-[#1D1D1F] sm:text-5xl">
            How RNAWiki checks
            <br />
            <span className="text-[#0071E3]">medicine evidence.</span>
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-[#6E6E73]">
            On pages for a specific use and group of people, RNAWiki keeps each important statement
            next to its linked saved source versions. It records whether each source supports the
            statement, contradicts it, or adds context. It also shows what a study measured, what it
            did not measure and who reviewed a published conclusion.
          </p>
          <p className="max-w-xl text-sm font-medium leading-relaxed text-[#1D1D1F]">
            RNA Intelligence 2.0 is software made from fixed rules. It can find missing sources,
            malformed or unresolved source records and conflicting evidence. It does not
            automatically fetch or verify a web page merely because a contributor entered its
            address. It does not write medicine facts or decide what the evidence means. Version 2.1
            adds checks for the mechanism map and timeline shown on newly reviewed pages for one
            specific use.
          </p>
        </header>

        <Section
          eyebrow="Made for different levels of detail"
          title="Plain first. Exact when you need it."
        >
          <Card>
            <div className="space-y-3 text-xs leading-relaxed text-[#424245] sm:text-sm">
              <p>
                A medicine page starts with the intended use, the clearest research result and the
                biggest unanswered question. A general research summary can contain longer technical
                wording. RNAWiki keeps that wording available, but does not make readers decode it
                before seeing the main point.
              </p>
              <p>
                The short answer must make sense without a glossary. If an unfamiliar study word is
                not essential, it moves out of the first screen. If it is essential, its familiar
                meaning appears in the same sentence. Readers do not need to hover or tap to
                understand the main point.
              </p>
              <p>
                A separate “More about this medicine” section keeps useful general background,
                including safety information and how the medicine was given. Those details stay
                expandable and are not mixed into the short evidence conclusion or presented as
                personal dosing advice.
              </p>
              <p className="font-medium text-[#1D1D1F]">
                “See how we know” keeps the exact study names, measurements, comparison groups,
                source versions and professional wording for readers who want to inspect them.
                Simpler wording changes the reading order, not the underlying evidence.
              </p>
            </div>
          </Card>
        </Section>

        <Section eyebrow="The short version" title="Four steps from source to published conclusion">
          <Card>
            <ol className="divide-y divide-black/[0.06]">
              <StoryStep
                number={1}
                icon={<Link2 className="h-4 w-4" />}
                title="A contributor proposes a sourced change"
              >
                <p>
                  One RNAWiki account can post community notes and submit the edit proposals that a
                  page supports. On a page with research for one specific use, a contributor chooses
                  one exact field, supplies the proposed replacement, identifies a source and
                  explains the change. On a general medicine page without that research structure,
                  the smaller edit form accepts only a medicine-name or trade-name correction.
                </p>
                <p className="font-medium text-[#1D1D1F]">
                  Saving or submitting a proposal changes nothing public. It creates attributed
                  review work; it does not add a fact to the medicine record.
                </p>
              </StoryStep>

              <StoryStep
                number={2}
                icon={<GitBranch className="h-4 w-4" />}
                title="Fixed rules check the record"
              >
                <p>
                  A contributor draft first receives smaller checks for its selected field, source,
                  intended use, proposed value and conflict-of-interest statement. Those checks do
                  not run the full evidence engine or decide whether the proposed medical wording is
                  true.
                </p>
                <p>
                  Before a complete programme conclusion can be reviewed for publication, RNA
                  Intelligence checks that the medicine, intended use, trial, statement, source and
                  dates belong together. It looks for missing support, impossible dates, unit errors
                  and records that disagree with one another. The complete checks run again from
                  locked database rows during publication.
                </p>
                <p>
                  With the same software version, the same stored record and reference date produce
                  the same check result. Passing means the record is complete enough for a person to
                  review. It does not prove that a medical conclusion is correct.
                </p>
              </StoryStep>

              <StoryStep
                number={3}
                icon={<Scale className="h-4 w-4" />}
                title="People judge what the evidence means"
              >
                <p>
                  Human reviewers read the sources, consider the study’s limits and check what was
                  actually measured. Important medical conclusions require two people to review the
                  same locked version independently before publication. A steward—a trusted editor
                  responsible for the review process—must have separately confirmed that each person
                  has the relevant scientific qualification; an account label or self-selected
                  interest is not enough.
                </p>
                <p>
                  Each conclusion applies only to one development programme: one intended use, group
                  of people, dose or exposure and set of studies. Dose means the amount given;
                  exposure means the amount measured as reaching the body or intended target. The
                  conclusion is never a judgement on the medicine in every possible use. Missing
                  evidence remains unknown; it is not counted as failure.
                </p>
                <p>
                  Submitted corrections and challenges first use three independent reviewers. If
                  they accept a change to a public conclusion, a steward or administrator can ask
                  RNAWiki to build a complete replacement from the accepted proposal and the current
                  public version. RNAWiki then runs all of the evidence checks again. Two
                  scientifically qualified reviewers sign that exact replacement before it can be
                  published.
                </p>
                <p>
                  RNAWiki separately records which scientific areas each conclusion reviewer is
                  qualified to review. A different steward or administrator grants or removes that
                  qualification; people cannot grant it to themselves. If the two reviewers
                  disagree, a different qualified steward makes the final decision and explains it.
                  The audit record calls this adjudication.
                </p>
                <p>
                  Accepting a proposal does not by itself rewrite the public page. If both reviewers
                  ask for changes, both reject it, or the steward decides against it after a
                  disagreement, that version closes and cannot be published. Any correction is
                  reviewed as a new version while readers keep the current one.
                </p>
              </StoryStep>

              <StoryStep
                number={4}
                icon={<RefreshCcw className="h-4 w-4" />}
                title="New evidence reopens the record"
              >
                <p>
                  The scheduled monitor currently checks ClinicalTrials.gov records that have an NCT
                  study identifier (the registry number that starts with “NCT”). When one changes,
                  RNAWiki saves the new version, finds the linked statements and page sections that
                  may be affected, and opens a review task when the meaning could change. Other
                  source types are not yet scheduled.
                </p>
                <p>
                  Readers continue to see the current approved version during review. If a
                  replacement version of the evidence and conclusion is approved, the linked short
                  answer, evidence steps, registry study details, sources and conclusion change
                  together, and only the source task covered by that version is closed. The earlier
                  version remains in the public history.
                </p>
                <p>
                  When RNAWiki finds that only exact registry facts have changed—such as study
                  status, enrolment, results availability or dates—and they are not being used by a
                  scientific statement or study-quality assessment, a contributor may submit the
                  saved before-and-after comparison without writing medical text. Two independent
                  people review that submission. A steward or administrator can then build a
                  complete proposed successor, which still needs two independent qualified reviewers
                  before publication.
                </p>
                <p>
                  If the changed source supports a scientific statement or study-quality assessment,
                  the small refresh path stops. There is no one-click claim-rewrite form: a steward
                  or administrator must author a complete replacement evidence record. It includes
                  the relevant studies, evidence statements, evidence-chain answers, saved sources
                  and conclusion. When that version uses the reviewed presentation format, its
                  mechanism content and any sourced timeline events are included too. Two
                  independent qualified reviewers must approve that exact proposed record before it
                  can be published. RNAWiki never invents the replacement wording.
                </p>
              </StoryStep>
            </ol>
          </Card>
        </Section>

        <Section
          eyebrow="New in RNA Intelligence 2.1"
          title="The mechanism map and timeline are reviewed content"
        >
          <Card>
            <div className="space-y-4 text-xs leading-relaxed text-[#424245] sm:text-sm">
              <p>
                On programme pages using the new presentation format, the mechanism map contains
                three to five ordered stages. Each stage has ordinary-language text, optional
                technical detail, a clear evidence label and links to the exact saved source
                versions behind its statements.
              </p>
              <p>
                The evidence label says whether a stage was measured in people, measured only in
                laboratory or non-human work, predicted, or is not yet known. “Measured in people”
                requires a direct measurement or a regulator’s finding from a human study. A
                sponsor—the company or organisation running the study—may report a result, but that
                report alone is not labelled as a direct measurement. “Measured outside people”
                requires a direct measurement from a linked laboratory or non-human study.
                “Predicted” is a reviewer’s expectation, not a measurement; the software checks the
                linked statement and source, but it cannot verify an unstored model or reasoning.
              </p>
              <p>
                A timeline appears only when reviewers have included real events that could change
                how the programme is understood. Every such event must point to the saved source
                version that supports it and say whether its date occurred, is planned, or was
                reported without clear timing. If there are no reviewed source events, RNAWiki hides
                the timeline instead of filling it with decorative milestones. Publication dates
                still appear in version history.
              </p>
              <p className="font-medium text-[#1D1D1F]">
                The map, timeline, sources and conclusion are locked into the same checked version
                before people review it. RNA Intelligence checks those links and labels; it does not
                write the map or decide the medical meaning.
              </p>
              <p>
                This format is being added through reviewed versions for specific uses. Pages with
                only general or source information may not have a mechanism map or timeline, and
                RNAWiki does not invent either one to make coverage look complete.
              </p>
            </div>
          </Card>
        </Section>

        <Section eyebrow="Current coverage" title="Why some medicine pages have less detail">
          <Card>
            <div className="space-y-3 text-xs leading-relaxed text-[#424245] sm:text-sm">
              <p>
                RNAWiki is separating medicine research by intended use and group, one verified
                source at a time. It does not guess an intended use, dose, trial result, reviewer or
                conclusion to make a page look complete.
              </p>
              <p className="font-medium text-[#1D1D1F]">
                Current coverage: {medicineCount.toLocaleString()} medicine records,{' '}
                {programmeCoverage.programmes.toLocaleString()} development programmes recorded, and{' '}
                {programmeCoverage.reviewedProgrammes.toLocaleString()} with a published reviewed
                conclusion.
              </p>
              <p>
                A medicine page without a reviewed answer for one specific question may therefore
                show a clearly labelled general research summary. Research found in an official
                registry may show its study and source but say that reviewers have not published a
                conclusion. Only evidence and a conclusion reviewed together are shown as a reviewed
                answer.
              </p>
            </div>
          </Card>
        </Section>

        <Section
          eyebrow="Correcting medicine names"
          title="Names use a smaller, source-backed review path"
        >
          <Card>
            <div className="space-y-3 text-xs leading-relaxed text-[#424245] sm:text-sm">
              <p>
                When a medicine page does not yet have research separated by its intended use, a
                reader can suggest a correction to one name at a time: either the medicine name or
                its trade or brand name. The contributor must give the exact replacement, the source
                page’s title and web address, and a plain explanation of why the change is needed.
              </p>
              <p>
                Every identity correction waits for one independent human reviewer—even when the
                contributor is a trusted editor or administrator. People cannot review their own
                correction, and an accepted identity correction does not raise a contributor’s
                scientific-review standing. The reviewer checks the contributor’s source; RNAWiki
                does not fetch that page or claim that RNA Intelligence proved the name is true.
              </p>
              <p>
                RNAWiki records the source, explanation, before-and-after values, contributor and
                database-set times together. These details cannot be changed after submission. At
                approval, the database checks that the old name still matches what the reviewer saw
                and applies that one change in the same step as the review decision.
              </p>
              <p className="font-medium text-[#1D1D1F]">
                Evidence, safety, effectiveness, trials, mechanisms and conclusions cannot use this
                small correction path. Those changes must be tied to one intended use, group of
                people, dose and set of studies, then checked by RNA Intelligence and reviewed in
                context.
              </p>
              <p>
                Earlier pending edits that did not include these safeguards remain visible in the
                public history but are archived and cannot be reviewed or published. A contributor
                can submit a new sourced name correction or use the full evidence-review path
                instead.
              </p>
            </div>
          </Card>
        </Section>

        <Section eyebrow="One account, permanent attribution" title="Comment and propose edits">
          <Card>
            <div className="space-y-3 text-xs leading-relaxed text-[#424245] sm:text-sm">
              <p>
                RNAWiki has one account type. Every signed-in account can post a community note and
                submit the sourced correction or challenge available on a medicine page. Editorial
                standing and scientific-review qualifications control who may take part in review or
                complete publication later; they are permissions on the same account, not different
                kinds of login.
              </p>
              <p>
                The server takes the author’s account identity and name from the signed-in session.
                A note or edit request cannot supply a different author. Community notes save the
                account attribution with the text. Edit proposals save the account identity, become
                unchangeable when submitted and show the contributor in the public review queue or
                history.
              </p>
              <p>
                A community note appears as reader commentary, separate from the evidence record.
                RNA Intelligence does not check or fact-check it, and posting it cannot change the
                reviewed answer. An edit proposal follows the source, software-check and
                human-review paths described above; signing in never gives anyone direct publication
                access.
              </p>
              <p>
                “Accepted contributions” counts programme proposals that reached the final{' '}
                <strong className="text-[#1D1D1F]">accepted for implementation</strong> review
                state. It does not count requests for changes as accepted, does not mean every item
                has been published, and never raises an account’s trust level automatically. A
                public medicine record changes only after the separate publication review described
                above.
              </p>
              <p>
                Reader feedback can include an optional contact address. Only a steward or
                administrator can see that private queue and close a report with a recorded reason.
                To limit repeated spam, RNAWiki stores a day-specific coded identifier for anonymous
                submissions. The original internet address is never stored. The coded identifier is
                not shown in the queue or any public response.
              </p>
            </div>
          </Card>
        </Section>

        <Section
          eyebrow="What changed in version 2.0"
          title="Stronger checks and a safer review path"
        >
          <Card>
            <ul className="space-y-5 text-xs leading-relaxed text-[#424245] sm:text-sm">
              <li>
                <strong className="block text-[#1D1D1F]">
                  Conclusions are limited to one use.
                </strong>
                The same medicine can have different results for different conditions or groups of
                people. RNAWiki now stores and reviews those development programmes separately.
              </li>
              <li>
                <strong className="block text-[#1D1D1F]">
                  Sources are saved as dated versions.
                </strong>
                A statement points to the exact source record checked at that time. A later source
                change cannot quietly alter the evidence behind an already published conclusion.
              </li>
              <li>
                <strong className="block text-[#1D1D1F]">
                  The full conclusion changes together.
                </strong>
                The short summary, evidence steps, linked sources and conclusion are published as
                one version. On pages using the new presentation format, the mechanism map and
                sourced timeline are part of that version too. RNAWiki does not update one of those
                parts while leaving the others behind. When a steward needs to make a broad medical
                revision, they submit a complete replacement version: its studies, statements, five
                evidence steps, study-limit checks, source links and conclusion are checked
                together. If that replacement uses the reviewed presentation format, its mechanism
                map and any sourced timeline events are checked in the same version. The current
                approved version stays public until the replacement passes the separate human review
                and publication steps.
              </li>
              <li>
                <strong className="block text-[#1D1D1F]">
                  Reviews are tied to the exact version.
                </strong>
                Two people review the same locked set of content and sources independently. They may
                both approve it; if they disagree, a different qualified steward makes and explains
                the final decision. Editing the set invalidates those decisions and requires review
                again.
              </li>
              <li>
                <strong className="block text-[#1D1D1F]">
                  New evidence creates follow-up work.
                </strong>
                RNAWiki records what changed, which conclusions may depend on it and whether the
                change is routine, needs interpretation or could affect safety or the conclusion.
              </li>
            </ul>
          </Card>
        </Section>

        <Section eyebrow="The evidence path" title="Where a conclusion comes from">
          <Card>
            <ol
              className="mx-auto max-w-sm space-y-2"
              aria-label="Source to verdict and new-evidence review flow"
            >
              <FlowItem>Source</FlowItem>
              <FlowItem>One statement from that source</FlowItem>
              <FlowItem>Five evidence questions</FlowItem>
              <FlowItem>Human-reviewed conclusion</FlowItem>
              <li className="rounded-2xl border border-[#0071E3]/20 bg-[#0071E3]/[0.06] px-4 py-3 text-center text-xs font-bold text-[#1D1D1F] sm:text-sm">
                A source change starts another review
              </li>
            </ol>

            <div className="space-y-3 border-t border-black/[0.06] pt-5 text-xs leading-relaxed text-[#424245] sm:text-sm">
              <p>
                A <strong className="text-[#1D1D1F]">source</strong> is the registry, publication,
                regulatory record or other identifiable record. A{' '}
                <strong className="text-[#1D1D1F]">claim</strong> is the precise statement drawn
                from it. For every source-to-claim link, RNAWiki records whether that saved source
                version supports the claim, contradicts it, or adds context. Separately, RNAWiki
                records whether the claim is a direct measurement, a sponsor’s report, a regulator’s
                finding, a human reviewer’s interpretation, or still uncertain. Those are different
                kinds of evidence and are not presented as equal.
              </p>
              <p>
                The <strong className="text-[#1D1D1F]">evidence chain</strong> asks five questions:
                Was the medicine given to people? Did enough reach the right place? Did it affect
                the intended target? Did the expected change happen in the body? Did patients
                experience a meaningful result?
              </p>
              <p>
                Each answer can be supported, contradicted, mixed, unknown or not measured.
                “Unknown” means there is not enough information. “Not measured” means the study did
                not test that question. Neither means the medicine failed.
              </p>
              <p>
                A <strong className="text-[#1D1D1F]">programme conclusion</strong> is the reviewers’
                explanation of what those linked statements mean for one intended use. Software can
                flag a mismatch, but only people can publish the conclusion.
              </p>
            </div>
          </Card>
        </Section>

        <Section
          eyebrow="RNA Intelligence 2.0 and 2.1"
          title="What software checks and what people decide"
        >
          <Card>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#1D1D1F]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                  <h3 className="text-sm font-extrabold">It can check</h3>
                </div>
                <ul className="list-disc space-y-2 pl-4 text-xs leading-relaxed text-[#424245] marker:text-[#6E6E73] sm:text-sm">
                  <li>
                    during ingestion, a narrower checker can validate recorded molecular or sequence
                    structure where applicable
                  </li>
                  <li>whether the medicine, intended use and trial match</li>
                  <li>whether each statement has the required source</li>
                  <li>units, dates and trial details that cannot all be true</li>
                  <li>whether each evidence answer has support</li>
                  <li>which summaries, conclusions or exports use changed evidence</li>
                </ul>
              </div>
              <div className="space-y-3 sm:border-l sm:border-black/[0.06] sm:pl-6">
                <div className="flex items-center gap-2 text-[#1D1D1F]">
                  <Scale className="h-4 w-4 text-[#0071E3]" aria-hidden="true" />
                  <h3 className="text-sm font-extrabold">People must decide</h3>
                </div>
                <ul className="list-disc space-y-2 pl-4 text-xs leading-relaxed text-[#424245] marker:text-[#6E6E73] sm:text-sm">
                  <li>whether a source is persuasive in context</li>
                  <li>whether a study answered the intended question</li>
                  <li>how much uncertainty or disagreement remains</li>
                  <li>what the result means for patients</li>
                  <li>whether a conclusion should be published or changed</li>
                </ul>
              </div>
            </div>
            <p className="border-t border-black/[0.06] pt-5 text-xs font-medium leading-relaxed text-[#1D1D1F] sm:text-sm">
              The current rule catalogue has {EVIDENCE_RULE_CODES.length} named checks covering
              sources, scope, dates, evidence links, conclusion consistency, plain language and
              source updates. The test suite has one focused case that makes each named check run
              and verifies the result it produces.
            </p>
            <p className="text-xs font-medium leading-relaxed text-[#1D1D1F] sm:text-sm">
              A failed software check can stop an incomplete or internally inconsistent record from
              being published. A warning asks a reviewer to look more closely. Neither result proves
              that a medicine works or does not work.
            </p>
          </Card>
        </Section>

        <Section eyebrow="Checks you may see" title="What each check means">
          <Card>
            <p className="text-xs leading-relaxed text-[#424245] sm:text-sm">
              These are narrow check concepts; the exact wording may differ by page state. No one
              check means that an entire medicine page is correct, complete or current.
            </p>

            <div>
              <BadgeExplanation
                badge={
                  <span
                    className={`${quietBadge} border-emerald-500/20 bg-emerald-50 text-emerald-800`}
                  >
                    <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                    Structure checked
                  </span>
                }
              >
                The stored chemical or sequence record passed the technical checks that apply to it.
                This does not say that the medicine works or is safe. If no technical check applies,
                RNAWiki says that instead of showing this label.
              </BadgeExplanation>

              <BadgeExplanation
                badge={
                  <span className={`${quietBadge} border-sky-500/20 bg-sky-50 text-sky-800`}>
                    <Link2 className="h-3 w-3" aria-hidden="true" />
                    Sources linked
                  </span>
                }
              >
                The marked statements link to stored sources that readers can inspect. A working
                link does not guarantee that a source is complete, current or conclusive. For a
                mechanism stage, the saved source must be recorded as supporting the linked claim; a
                background source or a source that contradicts it cannot stand in for that support.
              </BadgeExplanation>

              <BadgeExplanation
                badge={
                  <span
                    className={`${quietBadge} border-violet-500/20 bg-violet-50 text-violet-800`}
                  >
                    <BadgeCheck className="h-3 w-3" aria-hidden="true" />
                    Verdict independently reviewed
                  </span>
                }
              >
                Two qualified people independently reviewed the same locked conclusion and source
                set. If they disagreed, a different qualified steward made and explained the final
                decision; that disagreement remains in the public history. The conclusion still
                applies only to the intended use shown on the page.
              </BadgeExplanation>

              <BadgeExplanation
                badge={
                  <span className={`${quietBadge} border-black/10 bg-[#F5F5F7] text-[#424245]`}>
                    <Clock3 className="h-3 w-3" aria-hidden="true" />
                    Checked on [date]
                  </span>
                }
              >
                The date shows when RNAWiki last checked that named source. It does not promise that
                the source has not changed since that date.
              </BadgeExplanation>

              <BadgeExplanation
                badge={
                  <span className={`${quietBadge} border-amber-500/25 bg-amber-50 text-amber-900`}>
                    <RefreshCcw className="h-3 w-3" aria-hidden="true" />
                    New evidence under review
                  </span>
                }
              >
                A checked source changed and may affect the page’s conclusion. The current approved
                version stays visible while people review the change.
              </BadgeExplanation>
            </div>
          </Card>
        </Section>

        <Section eyebrow="Read with context" title="What RNAWiki can and cannot tell you">
          <Card>
            <div className="flex items-start gap-3">
              <FileSearch className="mt-0.5 h-4 w-4 shrink-0 text-[#0071E3]" aria-hidden="true" />
              <div className="space-y-3 text-xs leading-relaxed text-[#424245] sm:text-sm">
                <p>
                  A useful dossier lets you trace a statement back to its source and review history.
                  If evidence is missing, conflicting, old or was never measured, RNAWiki should say
                  so plainly.
                </p>
                <p>
                  RNAWiki is a public reference work, not medical advice. Nothing here is a
                  recommendation to start, stop or change a treatment.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-bold">
              <Link
                href="/browse"
                className="inline-flex items-center gap-1.5 rounded-2xl bg-[#0071E3] px-4 py-2 text-white transition hover:bg-[#0077ED]"
              >
                Explore medicines
              </Link>
              <Link
                href="/review-queue"
                className="inline-flex items-center gap-1.5 rounded-2xl border border-[#0071E3]/30 bg-white px-4 py-2 text-[#0071E3] transition hover:bg-[#FAFAFC]"
              >
                See the review queue
              </Link>
            </div>
          </Card>
        </Section>
      </div>
    </AppShell>
  )
}
