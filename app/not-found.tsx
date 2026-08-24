// Keep this route database-free so Next.js can prerender it in the build container.

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
            <span className="text-[11px] font-normal text-[#6E6E73]">.com</span>
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

        {/* An empty popular list keeps this page independent of the database. */}
        <HomeSearch popular={[]} />

        <div className="pt-2">
          <Link
            href="/browse"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0071E3] hover:text-[#0077ED] transition cursor-pointer group"
          >
            <span>Browse medicines</span>
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
