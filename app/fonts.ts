import { Source_Serif_4, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'

// Self-hosted at build time by next/font — no runtime request to Google, no layout shift from
// a late-arriving webfont, and no external origin in the CSP. Weights are restricted to the ones
// the design actually uses; every extra weight is a file every reader downloads.

export const serif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-serif',
  fallback: ['Iowan Old Style', 'Palatino Linotype', 'Georgia', 'serif'],
})

export const sans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-sans',
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'Helvetica Neue', 'sans-serif'],
})

export const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-mono',
  fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
})

export const fontVariables = `${serif.variable} ${sans.variable} ${mono.variable}`
