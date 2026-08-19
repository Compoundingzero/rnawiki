// 404.
//
// Deliberately self-contained: no database read, no `cookies()`, no `AppShell`. Next.js renders
// this route as `/_not-found` and will try to prerender it at build time, and Railway's build
// container cannot reach the database — a 404 page that needs a server round trip is a 404 page
// that can take the whole build down with it. So it carries the reference wireframe's visual
// language on its own: the same ground, the same logo lockup, the same search box, the same blue.
//
// Two ways out, because a reader who lands here wanted a specific medicine: search for it, or
// browse the corpus. The search box is the site's real one — it needs JavaScript, which is why the
// link to /browse sits beside it rather than behind it.

import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import { HomeSearch } from '@/components/HomeSearch'

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <main id="main" className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl space-y-10 text-center animate-fade-in">
        <Link href="/" className="inline-flex items-center gap-2 select-none">
          <span className="text-base font-bold tracking-tight text-[#1D1D1F]">
            RNA<span className="text-[#0071E3]">wiki</span>
            <span className="text-[11px] font-normal text-[#86868B]">.com</span>
          </span>
        </Link>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1D1D1F] leading-tight">
            There is no page here.
          </h1>
          <p className="text-sm text-[#6E6E73] max-w-md mx-auto leading-relaxed">
            The address may have changed, or the medicine you are looking for may not have a record
            yet. Both are worth checking.
          </p>
        </div>

        {/* The site's own search. `popular` is empty on purpose — this page reads nothing from the
            database, and the "Popular:" row simply does not render. */}
        <HomeSearch popular={[]} />

        <div className="pt-2">
          <Link
            href="/browse"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0071E3] hover:text-[#0077ED] transition cursor-pointer group"
          >
            <span>Browse every medicine</span>
            <ArrowRight
              className="w-4 h-4 group-hover:translate-x-0.5 transition shrink-0"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </main>
  )
}
