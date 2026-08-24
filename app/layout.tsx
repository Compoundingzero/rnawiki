import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'

// next/font serves these from the application origin.
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

const siteUrl = process.env.SITE_URL ?? 'https://rnawiki.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'RNAWiki — Medicine evidence, explained',
    template: '%s — RNAWiki',
  },
  description:
    'Plain-language medicine records that show what studies measured, which sources support each conclusion, and what remains unknown.',
  applicationName: 'RNAWiki',
  openGraph: {
    type: 'website',
    siteName: 'RNAWiki',
    title: 'RNAWiki — Medicine evidence, explained',
    description:
      'See what human studies measured, where each conclusion applies, and what researchers still do not know.',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RNAWiki — Medicine evidence, explained',
    description:
      'See what human studies measured, where each conclusion applies, and what researchers still do not know.',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#F5F5F7',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[#F5F5F7] text-[#1D1D1F] antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:text-xs focus:font-bold focus:text-[#0071E3] focus:shadow-lg"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  )
}
