import Link from 'next/link'

import { ContributorSpotlightSettings } from './ContributorSpotlightSettings'
import { PUBLIC_SOCIAL_PLATFORM_LABEL } from '@/lib/contributor-public-settings'
import type {
  HomepageContributorSpotlightEntry,
  HomepageContributorSpotlightView,
} from '@/lib/homepage-contributor-spotlight'

export interface HomepageContributorSpotlightProps {
  spotlight: HomepageContributorSpotlightView
}

function publishedChangeLabel(count: number): string {
  return `${count.toLocaleString()} published ${count === 1 ? 'change' : 'changes'} this week`
}

/** First position is slightly emphasized; the lower positions stay quiet. Never trophies. */
function rankBadgeClass(rank: HomepageContributorSpotlightEntry['rank']): string {
  return rank === 1
    ? 'bg-[#0A66D8] text-white'
    : 'border border-[#0A66D8]/20 bg-[#EEF5FF] text-[#0A66D8]'
}

export function HomepageContributorSpotlight({ spotlight }: HomepageContributorSpotlightProps) {
  return (
    <section aria-labelledby="weekly-contributors-heading" className="space-y-5">
      <div className="space-y-2 px-1">
        <p className="text-xs font-bold uppercase tracking-wider text-[#0A66D8]">
          Published this week
        </p>
        <h2
          id="weekly-contributors-heading"
          className="text-2xl font-[650] tracking-tight text-[#1D1D1F] sm:text-[32px]"
        >
          Top contributors this week
        </h2>
        <p className="text-xs leading-5 text-[#6E6E73]">
          {spotlight.week.label} · UTC. The week runs Monday through Sunday; positions reset when a
          new week starts.
        </p>
      </div>

      {spotlight.entries.length > 0 ? (
        <ol className="space-y-3" aria-label="Top three contributors this week">
          {spotlight.entries.map((entry) => {
            const visibleAnswers = entry.publishedAnswers.slice(0, 3)
            const additionalAnswerCount = entry.publishedAnswers.length - visibleAnswers.length
            return (
              <li
                key={entry.handle}
                className={`rounded-2xl border bg-white p-5 shadow-xs sm:p-6 ${
                  entry.rank === 1 ? 'border-[#0A66D8]/25' : 'border-black/[0.08]'
                }`}
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold ${rankBadgeClass(entry.rank)}`}
                    aria-label={`Position ${entry.rank}`}
                  >
                    {entry.rank}
                  </span>
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                      <Link
                        href={entry.profileHref}
                        className="break-all text-base font-bold text-[#1D1D1F] underline decoration-black/15 underline-offset-4 hover:text-[#0A66D8]"
                      >
                        @{entry.handle}
                      </Link>
                      <span className="rounded-full bg-[#EEF5FF] px-2.5 py-1 font-mono text-xs font-semibold text-[#0A66D8]">
                        {publishedChangeLabel(entry.publishedChangeCount)}
                      </span>
                    </div>

                    <ul
                      className="space-y-1.5"
                      aria-label={`Published changes by @${entry.handle}`}
                    >
                      {visibleAnswers.map((answer) => (
                        <li
                          key={`${answer.href}-${answer.publishedAt}`}
                          className="text-xs leading-5"
                        >
                          <Link href={answer.href} className="text-[#6E6E73] hover:text-[#0A66D8]">
                            <span className="font-semibold text-[#1D1D1F]">
                              {answer.medicineName}
                            </span>
                            {' — '}
                            {answer.programmeTitle}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    {additionalAnswerCount > 0 && (
                      <p className="text-[11px] text-[#6E6E73]">
                        +{additionalAnswerCount.toLocaleString()} more published{' '}
                        {additionalAnswerCount === 1 ? 'change' : 'changes'}
                      </p>
                    )}

                    {entry.socialLinks.length > 0 && (
                      <div className="space-y-1.5 border-t border-black/[0.06] pt-3">
                        <div className="flex flex-wrap gap-x-3 gap-y-2">
                          {entry.socialLinks.map((link) => (
                            <a
                              key={link.platform}
                              href={link.url}
                              rel="ugc nofollow noopener noreferrer"
                              className="text-xs font-semibold text-[#0A66D8] hover:underline"
                            >
                              {PUBLIC_SOCIAL_PLATFORM_LABEL[link.platform]}
                            </a>
                          ))}
                        </div>
                        <p className="text-[10px] leading-4 text-[#6E6E73]">
                          Social links supplied by this account; ownership is not verified by
                          RNAWiki.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      ) : (
        <div className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-xs sm:p-6">
          <p className="text-sm font-semibold text-[#1D1D1F]">
            No published contributor changes this week yet.
          </p>
          <p className="mt-1 text-xs leading-5 text-[#6E6E73]">
            This list updates only when a reviewed contribution becomes part of a current published
            medicine answer.
          </p>
        </div>
      )}

      <details className="group rounded-2xl border border-black/[0.08] bg-white shadow-xs">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-xs font-semibold text-[#1D1D1F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A66D8] [&::-webkit-details-marker]:hidden">
          How this weekly list works
          <span
            aria-hidden="true"
            className="text-base font-normal text-[#0A66D8] group-open:rotate-45"
          >
            +
          </span>
        </summary>
        <div className="space-y-2 border-t border-black/[0.06] px-4 py-3 text-[11px] leading-5 text-[#6E6E73]">
          <p>
            A change counts only after independent review, implementation and publication, and only
            while that version remains the current medicine answer. Comments, drafts, submissions,
            accepted work waiting for publication and replaced versions do not count.
          </p>
          <p>
            Positions use the number of qualifying published changes, then the earliest qualifying
            publication that week, then the account handle. They do not measure medical expertise.
          </p>
        </div>
      </details>

      <ContributorSpotlightSettings />
    </section>
  )
}
