import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import {
  installDossierV3Fixture,
  removeDossierV3Fixture,
  type DossierV3Fixture,
} from './fixtures/dossier-v3'

/**
 * The three readers on one page (docs/dossier-information-architecture.md, "Acceptance"):
 * the café-worker test on the Decision Card, the new-biohacker test on the goal lens and the
 * registry role split, and the expert test on the deep-evidence disclosures and the ledger. Plus
 * the machine checks: one main, heading order, keyboard operation, no horizontal overflow at 320 px,
 * no axe violations, no raw internal key in the reader text.
 */

test.describe.configure({ mode: 'serial' })

let fixture: DossierV3Fixture | null = null

test.beforeAll(async () => {
  fixture = await installDossierV3Fixture()
})

test.afterAll(async () => {
  await removeDossierV3Fixture(fixture)
})

function requireFixture(): DossierV3Fixture {
  if (!fixture) throw new Error('The dossier v3 fixture did not finish installing.')
  return fixture
}

test('the v3 document is served for the fixture slug and the corpus document for others', async ({
  request,
}) => {
  const { slug } = requireFixture()
  const response = await request.get(`/d/${slug}`)
  expect(response.status()).toBe(200)
  expect(response.headers()['x-rnawiki-dossier']).toBe('v3')
})

test('café-worker test: the five answers sit in the first section, in words', async ({ page }) => {
  const { slug, name } = requireFixture()
  await page.goto(`/d/${slug}`)
  await expect(page.getByRole('heading', { level: 1, name })).toBeVisible()
  const card = page.locator('#in-ten-seconds')
  await expect(card.getByText('What it is', { exact: true })).toBeVisible()
  await expect(card.getByText(`${name} is a prescription medicine.`)).toBeVisible()
  await expect(card.getByText('Why people use it', { exact: true })).toBeVisible()
  await expect(card.getByText('Best-supported result', { exact: true })).toBeVisible()
  await expect(
    card.getByText('RNAWiki has not yet published a reviewed conclusion for this use.'),
  ).toBeVisible()
  await expect(card.getByText('Supervision or regulatory status', { exact: true })).toBeVisible()
  await expect(card.getByText(/Professional supervision is normally required/)).toBeVisible()
  await expect(card.getByText(/boxed warning/i).first()).toBeVisible()
  // Nothing on the card is a raw key, a development code or an organism ladder.
  const text = (await card.innerText()).toLowerCase()
  expect(text).not.toMatch(/organism ladder|cmax|mtor|nct\d{8}|[a-c]_[a-z]+[A-Z]/)
})

test('new-biohacker test: goal lens, role split and the not-safe sentence', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  const registry = page.locator('#does-it-work')
  await expect(
    registry.getByText(/was the tested treatment in 1 of 3 registered studies/),
  ).toBeVisible()
  await expect(
    registry.getByText(/listed it as an exposure in an observational study/),
  ).toBeVisible()
  await expect(registry.getByText(/not the time anyone took it/).first()).toBeVisible()
  const interactions = page.locator('#interactions')
  await expect(interactions.getByText(/^No interaction found in/)).toBeVisible()
  await expect(
    interactions.getByText('Not finding an interaction is not the same as showing there is none.'),
  ).toBeVisible()
  // The absence statement itself never says safe; the only "safe together" on the section is the
  // category definition that says the absence does NOT mean it.
  expect(await interactions.locator('.dv3-lede').innerText()).not.toMatch(/\bsafe\b/i)
  await expect(interactions.getByText(/does not mean the pair is safe together/)).toHaveCount(1)
  // Prescription medicine: clinician questions, no self-experiment plan, no dosing instruction.
  const measure = page.locator('#what-to-measure')
  await expect(measure.getByText(/Self-experiment planning is not offered/)).toBeVisible()
  await expect(measure.getByRole('heading', { name: /Questions to ask a clinician/ })).toBeVisible()
  expect((await measure.innerText()).toLowerCase()).not.toMatch(/\btake \d+ ?mg\b|recommended dose/)
})

test('expert test: deep evidence sits below the answer and the ledger is visible', async ({
  page,
}) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  const headings = await page.locator('main h2').allInnerTexts()
  const index = (label: string) => headings.findIndex((text) => text.startsWith(label))
  expect(index('In 10 seconds')).toBeLessThan(index('Does it work?'))
  expect(index('Does it work?')).toBeLessThan(index('Deep evidence'))
  expect(index('Deep evidence')).toBeLessThan(index('What changed'))
  const changed = page.locator('#what-changed')
  await expect(changed.getByText(/remove synonym/)).toBeVisible()
  await expect(changed.getByText(/did not alter a public conclusion/)).toBeVisible()
  const deep = page.locator('#deep-evidence')
  const gate = deep.getByRole('group').filter({ hasText: 'Index-quality gate' })
  await expect(gate).toHaveCount(1)
})

test('structure: one main, sticky navigator, keyboard-operable disclosures, 320 px, axe', async ({
  page,
}) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  await expect(page.locator('main')).toHaveCount(1)
  const nav = page.getByRole('navigation', { name: 'Sections of this page' })
  await expect(nav).toBeVisible()
  await expect(nav.getByRole('link')).toHaveCount(11)
  expect(await nav.evaluate((element) => getComputedStyle(element).position)).toBe('sticky')

  // Keyboard: the first disclosure on the card opens with Enter and closes with Enter.
  const summary = page.locator('#in-ten-seconds details summary').first()
  await summary.focus()
  await page.keyboard.press('Enter')
  await expect(summary.locator('..')).toHaveAttribute('open', '')
  await page.keyboard.press('Enter')
  await expect(summary.locator('..')).not.toHaveAttribute('open', '')

  // Navigator link jumps to the section.
  await nav.getByRole('link', { name: 'Safety' }).click()
  await expect(page).toHaveURL(/#safety$/)

  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze()
  expect(axe.violations.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([])

  await page.setViewportSize({ width: 320, height: 700 })
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )
  expect(overflow).toBe(false)
})

test('the goal lens is a filter and never a change to the record', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  const lens = page.getByRole('group', { name: 'Pick your goal' })
  await expect(lens).toBeVisible()
  await expect(lens.getByRole('radio', { name: /All goals/ })).toBeChecked()
  await expect(lens.getByText('It does not change the underlying record.')).toBeVisible()
})
