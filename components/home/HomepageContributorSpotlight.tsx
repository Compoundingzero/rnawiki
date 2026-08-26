import Link from 'next/link'

import { ContributorSpotlightSettings } from './ContributorSpotlightSettings'
import { PUBLIC_SOCIAL_PLATFORM_LABEL } from '@/lib/contributor-public-settings'
import type { HomepageContributorSpotlightView } from '@/lib/homepage-contributor-spotlight'

export interface HomepageContributorSpotlightProps {
  spotlight: HomepageContributorSpotlightView
}

function publishedChangeLabel(count: number): string {
  return `${count.toLocaleString()} published ${count === 1 ? 'change' : 'changes'} this week`
}

export function HomepageContributorSpotlight({ spotlight }: HomepageContributorSpotlightProps) {
  return (
    <section aria-labelledby="weekly-contributors-heading" className="space-y-5">
      <div className="space-y-2 px-1">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#0066CC]">
          Published this week
        </p>
        <h2
          id="weekly-contributors-heading"
          className="text-2xl font-extrabold tracking-tight text-[#1D1D1F] sm:text-3xl"
        >
          Contributors whose changes are live
        </h2>
        <p className="text-xs leading-5 text-[#6E6E73]">
          {spotlight.week.label} · UTC. The week runs Monday through Sunday.
        </p>
      </div>

      {spotlight.entries.length > 0 ? (
        <ol className="space-y-3" aria-label="Weekly published contributor positions">
          {spotlight.entries.map((entry) => {
            const visibleAnswers = entry.publishedAnswers.slice(0, 3)
            const additionalAnswerCount = entry.publishedAnswers.length - visibleAnswers.length
            return (
              <li
                key={entry.handle}
                className="rounded-3xl border border-black/[0.08] bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.025)] sm:p-6"
              >
                <div className="flex items-start gap-4">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/[0.1] bg-[#F5F5F7] text-xs font-bold text-[#424245]"
                    aria-label={`Position ${entry.rank}`}
                  >
                    {entry.rank}
                  </span>
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <Link
                        href={entry.profileHref}
                        className="break-all text-base font-bold text-[#1D1D1F] underline decoration-black/15 underline-offset-4 hover:text-[#0066CC]"
                      >
                        @{entry.handle}
                      </Link>
                      <span className="text-[11px] font-semibold text-[#0066CC]">
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
                          <Link href={answer.href} className="text-[#424245] hover:text-[#0066CC]">
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
                              className="text-xs font-semibold text-[#0066CC] hover:underline"
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
        <div className="rounded-3xl border border-black/[0.08] bg-white p-5 sm:p-6">
          <p className="text-sm font-semibold text-[#1D1D1F]">
            No contributor-linked medicine changes have been published yet this week.
          </p>
          <p className="mt-1 text-xs leading-5 text-[#6E6E73]">
            This area updates only when a reviewed contribution becomes part of a current published
            medicine answer.
          </p>
        </div>
      )}

      <details className="group rounded-2xl border border-black/[0.07] bg-white">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-xs font-semibold text-[#424245] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3] [&::-webkit-details-marker]:hidden">
          How this weekly list works
          <span
            aria-hidden="true"
            className="text-base font-normal text-[#0071E3] group-open:rotate-45"
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
