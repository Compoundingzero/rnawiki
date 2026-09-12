/**
 * The two faces the site is set in, declared once.
 *
 * `next/font` self-hosts each face from the application origin at build time and puts the
 * `@font-face` rules in the layout's stylesheet, which is the stylesheet both the React shell and
 * the plain corpus document link. Declaring them here rather than inside `app/layout.tsx` means
 * one download and one set of variable class names for both renderers: a second declaration would
 * emit a second copy of every face.
 */
import { JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google'

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

/** The class the `<html>` element carries so `--font-*` resolve inside the page. */
export const fontVariableClassName = `${plusJakarta.variable} ${jetbrainsMono.variable}`
