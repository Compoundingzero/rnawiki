import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { SEEDED_SLUGS } from './fixtures/seeded-entities'

/**
 * Automated accessibility scan of the three surfaces a reader actually uses: the front door, a
 * record, and a search result list. The bar is the build contract's: no serious or critical axe
 * violation.
 *
 * DEPENDENCY NOTE
 *
 * `@axe-core/playwright` (MPL-2.0) is a declared devDependency, so this scan is imported
 * statically and is NOT allowed to skip. It previously resolved the module through a variable
 * specifier and skipped when absent, because the package sat in node_modules without appearing in
 * package.json or package-lock.json — a clean `npm ci` would have deleted it and taken this file's
 * collection with it. It is declared now, and an accessibility gate that can quietly disappear is
 * not a gate, so the escape hatch is gone with it.
 *
 * What the scan does NOT cover, and why the manual rules in the other specs still matter: axe
 * cannot tell that both disclosure labels are in the DOM with one hidden, that the record is
 * closed by default, or that the wording is honest. Those are asserted in
 * tests/e2e/evidence-record.spec.ts.
 */

type AxeViolation = {
  id: string
  impact?: string | null
  help: string
  nodes: { target: unknown[] }[]
}

const BLOCKING_IMPACTS = new Set(['serious', 'critical'])

function describeViolations(violations: AxeViolation[]): string {
  return violations
    .map((v) => `${v.impact}: ${v.id} — ${v.help} (${v.nodes.length} node(s), first: ${JSON.stringify(v.nodes[0]?.target)})`)
    .join('\n')
}

async function scan(page: Page): Promise<AxeViolation[]> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  return (results.violations as AxeViolation[]).filter((v) => BLOCKING_IMPACTS.has(v.impact ?? ''))
}

test.describe('accessibility (axe)', () => {
  test('the homepage has no serious or critical violations', async ({ page }) => {
    await page.goto('/')
    const violations = await scan(page)
    expect(violations.length, `axe violations on /\n${describeViolations(violations)}`).toBe(0)
  })

  test('search results have no serious or critical violations', async ({ page }) => {
    await page.goto('/search?q=tendon')
    const violations = await scan(page)
    expect(violations.length, `axe violations on /search\n${describeViolations(violations)}`).toBe(0)
  })

  test('a record page has no serious or critical violations, closed', async ({ page }) => {
    const response = await page.goto(`/r/${SEEDED_SLUGS.bpc157}`)
    test.skip(!response || !response.ok(), `${SEEDED_SLUGS.bpc157} is not seeded/published yet.`)
    const violations = await scan(page)
    expect(
      violations.length,
      `axe violations on /r/${SEEDED_SLUGS.bpc157}\n${describeViolations(violations)}`
    ).toBe(0)
  })

  test('a record page has no serious or critical violations with an Evidence Record open', async ({ page }) => {
    const response = await page.goto(`/r/${SEEDED_SLUGS.bpc157}`)
    test.skip(!response || !response.ok(), `${SEEDED_SLUGS.bpc157} is not seeded/published yet.`)

    // The open state is where the heading levels, the labelled rows and the nested disclosure all
    // appear. Scanning only the closed page would scan almost none of the record.
    await page.locator('.er__summary').first().click()
    await expect(page.locator('.er__body').first()).toBeVisible()

    const violations = await scan(page)
    expect(
      violations.length,
      `axe violations on an opened evidence record\n${describeViolations(violations)}`
    ).toBe(0)
  })
})
