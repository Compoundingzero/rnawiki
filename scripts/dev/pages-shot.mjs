import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const shots = [
  ['page-stub',    'https://rnawiki.com/d/lisinopril',  1440, 900],
  ['page-browse',  'https://rnawiki.com/browse',        1440, 900],
]
for (const [name, url, w, h] of shots) {
  const page = await browser.newPage({ viewport: { width: w, height: h } })
  await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 })
  await page.waitForTimeout(900)
  await page.screenshot({ path: `/tmp/fidelity/${name}.png`, fullPage: true })
  console.log('ok', name)
  await page.close()
}
await browser.close()
