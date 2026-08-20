import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const shots = [
  ['ref-home',   'http://127.0.0.1:3200/',                1440, 900],
  ['live-home',  'https://rnawiki.com/',                  1440, 900],
  ['ref-home-m', 'http://127.0.0.1:3200/',                390,  844],
  ['live-home-m','https://rnawiki.com/',                  390,  844],
]
for (const [name, url, w, h] of shots) {
  const page = await browser.newPage({ viewport: { width: w, height: h } })
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 })
    await page.waitForTimeout(1200)
    await page.screenshot({ path: `/tmp/fidelity/${name}.png`, fullPage: true })
    console.log('ok', name)
  } catch (e) { console.log('FAIL', name, String(e).slice(0, 120)) }
  await page.close()
}
await browser.close()
