import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const shots = [
  ['live-home2',   'https://rnawiki.com/',                 1440, 900],
  ['live-home-m2', 'https://rnawiki.com/',                 390,  844],
  ['live-dossier', 'https://rnawiki.com/d/inclisiran',     1440, 900],
  ['ref-dossier',  'http://127.0.0.1:3200/',               1440, 900],
]
for (const [name, url, w, h] of shots) {
  const page = await browser.newPage({ viewport: { width: w, height: h } })
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 })
    if (name === 'ref-dossier') {
      await page.getByText('Read 10-Second Dossier').first().click()
      await page.waitForTimeout(1200)
    }
    await page.waitForTimeout(1000)
    await page.screenshot({ path: `/tmp/fidelity/${name}.png`, fullPage: true })
    console.log('ok', name)
  } catch (e) { console.log('FAIL', name, String(e).slice(0, 100)) }
  await page.close()
}
await browser.close()
