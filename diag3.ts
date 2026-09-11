import { chromium } from '@playwright/test'
import { sentenceStats } from '@/lib/dossier-v3/copy-contract'
async function main() {
  const b = await chromium.launch()
  const p = await (await b.newContext({ viewport: { width: 1440, height: 1200 } })).newPage()
  await p.goto('http://localhost:3100/d/creatine-monohydrate', { waitUntil: 'networkidle' })
  const text: string = await p.evaluate(() => {
    const main = document.querySelector('main')
    const tech = ['technical-record', 'evidence-receipts'].map((i) => document.getElementById(i)).filter(Boolean) as HTMLElement[]
    const tags = new Set('P,LI,TD,TH,DT,DD,H1,H2,H3,H4,H5,H6,SUMMARY,FIGCAPTION,CAPTION,BLOCKQUOTE,LABEL,LEGEND'.split(','))
    const out: string[] = []
    const stack: Element[] = main ? [main] : []
    while (stack.length) {
      const n = stack.pop()
      if (!n) continue
      if (tags.has(n.tagName)) {
        if (tech.some((s) => s.contains(n))) continue
        const pieces: string[] = []
        const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT)
        while (w.nextNode()) { const t = w.currentNode.textContent?.trim(); if (t) pieces.push(t) }
        const v = pieces.join(' ').replace(/\s+/g, ' ').trim()
        if (v) out.push(/[.!?:;]$/.test(v) ? v : v + '.')
        continue
      }
      for (let i = n.children.length - 1; i >= 0; i -= 1) { const c = n.children[i]; if (c) stack.push(c) }
    }
    return out.join(' ')
  })
  const stats = sentenceStats(text, 40)
  console.log('over30', stats.over30, 'of', stats.sentences)
  for (const s of stats.longest ?? []) if (s.words > 30) console.log(s.words, '|', s.text.slice(0, 190))
  await b.close()
}
main()
