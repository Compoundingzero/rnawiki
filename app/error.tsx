'use client'

// The route-level error boundary.
//
// Calm and plain, and deliberately incurious in public: a reader gets a sentence and a way
// forward, never a stack trace, a query fragment or an ORM message. Those leak table names and
// sometimes data, and they tell the person in front of the screen nothing they can act on.
//
// The one technical detail shown is `error.digest` — an opaque id Next.js assigns to the server
// error and writes to the server log. It carries no information by itself, and it is the only
// thing that lets somebody reporting a fault and somebody reading the logs find the same event.

import { useEffect } from 'react'
import Link from 'next/link'
import { RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // The browser console is the developer's copy. The server already has the real one, with the
    // stack, indexed by the same digest.
    console.error('[rnawiki] render error', error)
  }, [error])

  return (
    <main id="main" className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-8 text-center animate-fade-in">
        <Link href="/" className="inline-flex items-center gap-2 select-none">
          <span className="text-base font-bold tracking-tight text-[#1D1D1F]">
            RNA<span className="text-[#0071E3]">wiki</span>
            <span className="text-[11px] font-normal text-[#86868B]">.com</span>
          </span>
        </Link>

        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1D1D1F] leading-tight">
            Something went wrong on our side.
          </h1>
          <p className="text-sm text-[#6E6E73] leading-relaxed">
            This page failed to load. Nothing you did caused it and nothing you were reading has
            changed. Trying again often works.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-sm font-bold transition cursor-pointer shadow-xs active:scale-95"
          >
            <RefreshCw className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Try again</span>
          </button>
          <Link
            href="/browse"
            className="px-5 py-2.5 rounded-2xl bg-white hover:bg-[#F5F5F7] text-[#1D1D1F] text-sm font-bold border border-black/[0.08] transition cursor-pointer shadow-xs"
          >
            Browse medicines
          </Link>
        </div>

        {error.digest && (
          <p className="text-[11px] text-[#86868B]">
            Reference <code className="font-mono text-[#6E6E73]">{error.digest}</code>
          </p>
        )}
      </div>
    </main>
  )
}
