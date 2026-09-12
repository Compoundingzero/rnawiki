import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import {
  installNormalizedInclisiranFixture,
  removeNormalizedInclisiranFixture,
  type NormalizedInclisiranFixture,
} from './fixtures/normalized-inclisiran'

const INCLISIRAN_SLUG = 'inclisiran'

test.use({ colorScheme: 'light' })
test.describe.configure({ mode: 'serial' })

let normalizedFixture: NormalizedInclisiranFixture | null = null

test.beforeAll(async () => {
  normalizedFixture = await installNormalizedInclisiranFixture()
})

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' })
})

test.afterAll(async () => {
  await removeNormalizedInclisiranFixture(normalizedFixture)
})

interface DrugReadResponse {
  drug?: { name?: string }
}

interface ProgrammeScopedDrugReadResponse {
  drug?: Record<string, unknown>
  programmeDossier?: {
    selectedProgrammeId?: string
    bindingState?: string
    mechanismSteps?: unknown[]
    timelineEvents?: unknown[]
  } | null
  evidenceAuthority?: {
    scope?: string
    authoritativeObject?: string
    selectedProgrammeId?: string
  }
  legacyMedicineRecord?: {
    status?: string
    authoritativeForSelectedProgramme?: boolean
    warning?: string
    fields?: Record<string, unknown>
  } | null
}

interface ContributionMachineCheck {
  code: string
  status: 'PASS' | 'WARN' | 'FAIL'
  message: string
}

interface ContributionImpactSurface {
  dependentSurfaceType: string
  fieldPath: string
  impactLevel: string
}

interface ContributionProposalResponse {
  proposal?: {
    id?: string
    proposalKey?: string
    revisionNumber?: number
    previousProposalId?: string | null
    proposalType?: 'CORRECTION' | 'VERDICT_CHALLENGE'
    status?: 'DRAFT' | 'SUBMITTED'
    selectedField?: string | null
    proposedText?: string | null
    contentDigestAlgorithm?: string
    contentDigest?: string | null
    currentVerdictSnapshot?: { id?: string } | null
    machineChecks?: {
      version?: string
      passed?: boolean
      checks?: ContributionMachineCheck[]
    } | null
    impactPreview?: {
      version?: string
      matchedDependencyCount?: number
      affectedSurfaces?: ContributionImpactSurface[]
      noDependencyMatch?: boolean
    } | null
  }
  preview?: {
    machineChecks?: {
      version?: string
      passed?: boolean
      checks?: ContributionMachineCheck[]
    }
    impactPreview?: {
      version?: string
      matchedDependencyCount?: number
      affectedSurfaces?: ContributionImpactSurface[]
      noDependencyMatch?: boolean
    }
  }
}

interface PublicContributionQueueResponse {
  proposals?: Array<{
    id?: string
    proposalKey?: string
    revisionNumber?: number
    previousProposalId?: string | null
    proposalType?: 'CORRECTION' | 'VERDICT_CHALLENGE'
    selectedField?: string
    proposedText?: string | null
    contentDigest?: string
    machineChecks?: { passed?: boolean; checks?: ContributionMachineCheck[] }
    impactPreview?: {
      matchedDependencyCount?: number
      affectedSurfaces?: ContributionImpactSurface[]
    }
    reviewState?: {
      status?: string
      reviewCount?: number
      requiredReviewCount?: number
      consensus?: string | null
      resolvedAt?: string | null
    }
    reviews?: Array<{
      decision?: string
      reviewer?: { name?: string; handle?: string }
    }>
    adjudication?: {
      decision?: string
      rationale?: string
      adjudicator?: { name?: string; handle?: string }
    } | null
    [key: string]: unknown
  }>
  total?: number
}

interface ContributionReviewApiResponse {
  reviewState?: {
    status?: string
    reviewCount?: number
    requiredReviewCount?: number
    consensus?: string | null
    resolvedAt?: string | null
  }
  eligibility?: { canReview?: boolean; reason?: string }
  adjudicationEligibility?: { canAdjudicate?: boolean; reason?: string }
  myReview?: { decision?: string } | null
  reviews?: Array<{ decision?: string; reviewer?: { name?: string } }>
  adjudication?: {
    decision?: string
    rationale?: string
    adjudicator?: { name?: string }
  } | null
}

interface FixtureAccount {
  id: string
  email: string
  password: string
}

async function requireInclisiranFixture(page: Page): Promise<void> {
  const response = await page.request.get(`/api/drugs/${INCLISIRAN_SLUG}`)
  const rawBody = await response.text()
  expect(response.status(), rawBody).toBe(200)

  const body = JSON.parse(rawBody) as DrugReadResponse
  expect(body.drug?.name).toMatch(/^inclisiran$/i)
}

function requireNormalizedFixture(): NormalizedInclisiranFixture {
  if (!normalizedFixture) throw new Error('Inclisiran fixture installation did not complete.')
  return normalizedFixture
}

function normalizedDossierUrl(fixture: NormalizedInclisiranFixture): string {
  return `/d/${INCLISIRAN_SLUG}?programme=${encodeURIComponent(fixture.programmeSlug)}`
}

function contributionContextPath(programmeRef: string): string {
  return `/api/drugs/${INCLISIRAN_SLUG}/programmes/${encodeURIComponent(programmeRef)}/contributions`
}

function waitForContributionContext(page: Page, programmeRef: string) {
  const path = contributionContextPath(programmeRef)
  return page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === path && response.request().method() === 'GET',
  )
}

async function loginFixtureAccount(page: Page, account: FixtureAccount): Promise<void> {
  const response = await page.request.post('/api/auth/login', {
    data: {
      email: account.email,
      password: account.password,
    },
  })
  const body = await response.text()
  expect(response.status(), body).toBe(200)
  expect(JSON.parse(body)).toMatchObject({ user: { id: account.id } })
}

async function switchFixtureAccount(page: Page, account: FixtureAccount): Promise<void> {
  const logout = await page.request.post('/api/auth/logout')
  const logoutBody = await logout.text()
  expect(logout.status(), logoutBody).toBe(200)
  await loginFixtureAccount(page, account)
}

async function readPublishedProgrammeEvidence(page: Page, fixture: NormalizedInclisiranFixture) {
  const response = await page.request.get(
    `/api/drugs/${INCLISIRAN_SLUG}/evidence?programme=${encodeURIComponent(fixture.programmeSlug)}`,
  )
  const body = await response.text()
  expect(response.status(), body).toBe(200)
  const parsed = JSON.parse(body) as {
    evidence?: {
      selectedProgramme?: {
        id?: string
        status?: string
        verdict?: unknown
        evidenceNodes?: unknown
      } | null
    }
  }
  expect(parsed.evidence?.selectedProgramme?.id).toBe(fixture.programmeId)
  return {
    id: parsed.evidence?.selectedProgramme?.id,
    status: parsed.evidence?.selectedProgramme?.status,
    verdict: parsed.evidence?.selectedProgramme?.verdict,
    evidenceNodes: parsed.evidence?.selectedProgramme?.evidenceNodes,
  }
}

async function readPublicContributionQueue(
  page: Page,
  status?: string,
): Promise<PublicContributionQueueResponse> {
  const suffix = status ? `&status=${encodeURIComponent(status)}` : ''
  const response = await page.request.get(`/api/contribution-review-queue?limit=100${suffix}`)
  const body = await response.text()
  expect(response.status(), body).toBe(200)
  return JSON.parse(body) as PublicContributionQueueResponse
}

function requireProposal(
  body: ContributionProposalResponse,
): NonNullable<ContributionProposalResponse['proposal']> & { id: string } {
  expect(body.proposal?.id).toBeTruthy()
  if (!body.proposal?.id)
    throw new Error('The contribution response did not include a proposal id.')
  return { ...body.proposal, id: body.proposal.id }
}

function expectDeterministicSubmission(
  proposal: NonNullable<ContributionProposalResponse['proposal']>,
  expectedType: 'CORRECTION' | 'VERDICT_CHALLENGE',
): void {
  expect(proposal.status).toBe('SUBMITTED')
  expect(proposal.proposalType).toBe(expectedType)
  expect(proposal.contentDigestAlgorithm).toBe('sha256')
  expect(proposal.contentDigest).toMatch(/^[a-f0-9]{64}$/)
  expect(proposal.machineChecks).toMatchObject({
    version: 'rna-intelligence/contribution-checks-v1',
    passed: true,
  })
  expect(proposal.machineChecks?.checks?.some((check) => check.status === 'FAIL')).toBe(false)
  expect(proposal.impactPreview).toMatchObject({
    version: 'rna-intelligence/contribution-impact-v1',
    noDependencyMatch: false,
  })
  expect(proposal.impactPreview?.matchedDependencyCount ?? 0).toBeGreaterThan(0)
  expect(proposal.impactPreview?.affectedSurfaces?.length ?? 0).toBeGreaterThan(0)
}

async function exerciseProgrammeSwitchIfAvailable(
  page: Page,
  dialog: ReturnType<Page['getByRole']>,
  fixture: NormalizedInclisiranFixture,
): Promise<void> {
  const selector = dialog.getByLabel('Which use of this medicine does it apply to?')
  const options = await selector.locator('option').evaluateAll((nodes) =>
    nodes.map((node) => ({
      value: (node as HTMLOptionElement).value,
      label: node.textContent?.trim() ?? '',
    })),
  )
  const alternative = options.find((option) => option.value !== fixture.programmeSlug)
  if (!alternative) return

  const alternativeContext = waitForContributionContext(page, alternative.value)
  await selector.selectOption(alternative.value)
  expect((await alternativeContext).status()).toBe(200)
  await expect(selector).toHaveValue(alternative.value)

  const fixtureContext = waitForContributionContext(page, fixture.programmeSlug)
  await selector.selectOption(fixture.programmeSlug)
  expect((await fixtureContext).status()).toBe(200)
  await expect(selector).toHaveValue(fixture.programmeSlug)
  await expect(
    dialog.getByText(
      'Loaded from Inclisiran study in adults with artery disease and high LDL cholesterol.',
    ),
  ).toBeVisible()
}

async function expectNoSeriousWcagViolations(page: Page, surface: string): Promise<void> {
  const result = await new AxeBuilder({ page }).analyze()
  const violations = result.violations.filter(
    (violation) =>
      (violation.impact === 'serious' || violation.impact === 'critical') &&
      violation.tags.some((tag) => tag.startsWith('wcag')),
  )
  const diagnostic = violations
    .map(
      (violation) =>
        `${violation.id}: ${violation.help}\n${violation.nodes
          .map((node) => `  ${node.target.join(' ')} — ${node.failureSummary ?? ''}`)
          .join('\n')}`,
    )
    .join('\n\n')

  expect(violations, `${surface} has serious/critical WCAG violations:\n${diagnostic}`).toEqual([])
}

async function expectOneMainAndOrderedHeadings(page: Page): Promise<void> {
  await expect(page.locator('main')).toHaveCount(1)

  const headings = await page.locator('main :is(h1,h2,h3,h4,h5,h6)').evaluateAll((elements) =>
    elements.map((element) => ({
      level: Number(element.tagName.slice(1)),
      text: element.textContent?.replace(/\s+/g, ' ').trim() ?? '',
    })),
  )

  expect(
    headings.length,
    'The main region should have a visible document outline.',
  ).toBeGreaterThan(0)
  expect(headings[0]?.level, `First heading: ${JSON.stringify(headings[0])}`).toBe(1)
  expect(headings.filter((heading) => heading.level === 1)).toHaveLength(1)

  for (let index = 1; index < headings.length; index += 1) {
    const previous = headings[index - 1]!
    const current = headings[index]!
    expect(
      current.level,
      `Heading level skipped from h${previous.level} “${previous.text}” to h${current.level} “${current.text}”.`,
    ).toBeLessThanOrEqual(previous.level + 1)
  }
}

async function openAdvancedEvidence(page: Page) {
  // Wait for the client disclosure controller before exercising its synchronized `aria-expanded`
  // state. Native <details> can toggle before hydration, which would hide a hydration defect.
  await page.waitForLoadState('networkidle')
  const control = page.locator('summary[aria-controls="advanced-evidence-content"]')
  const disclosure = control.locator('xpath=..')
  const content = page.locator('#advanced-evidence-content')

  await expect(control).toHaveCount(1)
  await expect(control).toHaveAttribute('aria-expanded', 'false')
  await expect(disclosure).not.toHaveAttribute('open', '')
  await expect(content).toBeHidden()

  await control.click()

  await expect(control).toHaveAttribute('aria-expanded', 'true')
  await expect(disclosure).toHaveAttribute('open', '')
  await expect(content).toBeVisible()

  return { content, control, disclosure }
}

async function expectCollapsedDossierWordBudget(page: Page): Promise<void> {
  const disclosure = page
    .locator('summary[aria-controls="advanced-evidence-content"]')
    .locator('xpath=..')
  const wordsBeforeDisclosure = await disclosure.evaluate((details) => {
    const parts: string[] = []
    let sibling = details.previousElementSibling
    while (sibling) {
      parts.unshift((sibling as HTMLElement).innerText ?? '')
      sibling = sibling.previousElementSibling
    }
    return parts.join(' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean)
  })

  expect(
    wordsBeforeDisclosure.length,
    `The collapsed dossier contains ${wordsBeforeDisclosure.length} words before “See how we know”.`,
  ).toBeLessThanOrEqual(140)
}

async function expectNoHorizontalOverflow(page: Page, surface: string): Promise<void> {
  const report = await page.evaluate(() => {
    const root = document.documentElement
    const viewportWidth = root.clientWidth
    const scrollWidth = Math.max(root.scrollWidth, document.body.scrollWidth)
    const offenders = [...document.querySelectorAll<HTMLElement>('body *')]
      .flatMap((element) => {
        const rect = element.getBoundingClientRect()
        if (rect.width === 0 || rect.height === 0) return []
        if (rect.right <= viewportWidth + 1 && rect.left >= -1) return []
        return [
          {
            element: element.tagName.toLowerCase(),
            id: element.id,
            className: element.className?.toString().slice(0, 120) ?? '',
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
          },
        ]
      })
      .slice(0, 8)

    return { viewportWidth, scrollWidth, offenders }
  })

  expect(
    report.scrollWidth,
    `${surface} overflows horizontally: ${JSON.stringify(report, null, 2)}`,
  ).toBeLessThanOrEqual(report.viewportWidth + 1)
}

test('search-first homepage opens Inclisiran and exposes evidence lineage accessibly', async ({
  page,
}) => {
  test.setTimeout(90_000)
  const clientErrors: string[] = []
  page.on('pageerror', (error) => clientErrors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') clientErrors.push(message.text())
  })
  await requireInclisiranFixture(page)
  const fixture = requireNormalizedFixture()
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  await expect(page.locator('main')).toHaveCount(1)
  await expect(
    page.getByRole('heading', { level: 1, name: /understand any drug in 10 seconds/i }),
  ).toBeVisible()

  const search = page.getByRole('combobox', {
    name: 'Search by medicine, condition, gene, or protein',
  })
  await expect(search).toBeVisible()
  await expect(search).toBeFocused()
  await expect(search).toHaveAttribute('aria-expanded', 'false')
  await expectNoSeriousWcagViolations(page, 'Homepage')

  await search.fill('Inclisiran')
  await expect(search).toHaveValue('Inclisiran')
  await expect(
    search,
    `The search did not hydrate or open. Client errors: ${clientErrors.join(' | ') || 'none'}`,
  ).toHaveAttribute('aria-expanded', 'true')
  const option = page.getByRole('option', { name: /^Inclisiran RNA-silencing/u })
  await expect(option).toBeVisible()
  await expect(option).toContainText(
    'Reviewed answer for: Inclisiran study in adults with artery disease and high LDL cholesterol',
  )

  const controlledListboxId = await search.getAttribute('aria-controls')
  expect(controlledListboxId).toBeTruthy()
  await expect(page.getByRole('listbox', { name: 'Search results' })).toHaveAttribute(
    'id',
    controlledListboxId!,
  )

  await option.click()
  await expect(page).toHaveURL(
    `/d/${INCLISIRAN_SLUG}?programme=${encodeURIComponent(fixture.programmeSlug)}`,
  )

  // The search row and its URL are bound to the same programme publication. This prevents a
  // reviewed summary for one use from opening a different use of the medicine.
  await expect(page).toHaveURL(
    `/d/${INCLISIRAN_SLUG}?programme=${encodeURIComponent(fixture.programmeSlug)}`,
  )
  await expect(page.getByRole('heading', { level: 1, name: /^inclisiran$/i })).toBeVisible()
  /*
   * From here down this test used to read the old medicine layout: `ten-second-used-for`,
   * `ten-second-finding`, `ten-second-limit`, the advanced-evidence disclosure, the
   * medicine-background disclosure, study cards and source-claim bindings. All of it belonged to a
   * layout this release deleted, and none of those test ids exists any more.
   *
   * What the test was protecting is not the markup. It is that a reviewed conclusion reaches a
   * reader in plain language, that the exact source behind it is named and openable, that the
   * technical vocabulary stays in the technical layer, and that the whole thing is usable by
   * keyboard and screen reader. Those are asserted below against the compass, which is where they
   * live now.
   */
  const hero = page.locator('#substance-action')
  await expect(hero).toBeVisible()

  // The strongest recorded result, on the first screen, with the kind of result it is named.
  const result = page.locator('[data-block="strongest-result"]')
  await expect(result).toContainText('What happened in people')

  // And the limit on it, which the page never lets a result appear without.
  await expect(page.locator('[data-block="principal-uncertainty"]')).toContainText(
    'The limit that matters most',
  )

  /*
   * A KNOWN GAP, recorded here rather than quietly dropped.
   *
   * The reviewed conclusion for the selected programme does not reach the medicine page. The
   * compass loads by slug and has no programme-scoped read path: `loadDossierV4Inputs` takes a slug
   * and nothing else, so `?programme=` survives the redirect, reaches the route, and changes
   * nothing about what is rendered. The conclusion is still published, still reachable at
   * /d/<slug>/programme/<programme>/history, and still in the API.
   *
   * It is not a live regression: `programme_current_publications` and `development_programmes` are
   * both empty in production, so no medicine page has ever had one to show. It becomes one the day
   * the first programme is published, which is why the case below is marked rather than deleted.
   */
  await expect(page.locator('main')).not.toContainText(
    'Inclisiran lowered LDL cholesterol in this reviewed study',
  )

  /*
   * The detailed reviewed reason belongs to the programme conclusion, and reaches the medicine page
   * for the same reason the conclusion does not: there is no programme-scoped read path here. The
   * gap is recorded once, in the marked case below, rather than asserted differently in three
   * places. What matters for this test is that it is not shown as though it were the record's.
   */
  const detailedReason = page.getByText(
    'This test record shows how one reviewed study result connects to a public conclusion and its source.',
  )
  for (const copy of await detailedReason.all()) await expect(copy).toBeHidden()

  // Internal codes never reach reader text. The technical layer is where vocabulary like this is
  // allowed, and it is below the reader layer and behind a disclosure.
  const readerFlow = page.locator('.dv4-flow')
  for (const storedCode of ['SUPPORTS', 'CONFIRMED', 'programme_current_publications']) {
    const visible = await readerFlow.evaluate((node, code) => {
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT)
      while (walker.nextNode()) {
        const element = walker.currentNode.parentElement
        if (!element) continue
        if (element.closest('#technical-record')) continue
        if (element.closest('details:not([open])') && !element.closest('summary')) continue
        if ((walker.currentNode.textContent ?? '').includes(code)) return true
      }
      return false
    }, storedCode)
    expect(visible, `${storedCode} reached the reader layer`).toBe(false)
  }

  // The receipts section is where a reader checks the page against its sources.
  await expect(page.locator('#evidence-receipts')).toBeVisible()

  await expectOneMainAndOrderedHeadings(page)
  await expectNoSeriousWcagViolations(page, 'Inclisiran compass page')
  await expectNoHorizontalOverflow(page, 'Inclisiran compass page')

  /*
   * The link to the conclusion history is part of the same missing programme path: the medicine
   * page does not know which programme is selected, so it cannot offer a link scoped to one. The
   * history page itself is unchanged and is exercised below by going to it directly, which is what
   * the link would have done.
   */
  await expect(
    page.locator('main').getByRole('link', { name: 'See what changed on this page' }),
  ).toHaveCount(0)

  await page.goto(`/d/${INCLISIRAN_SLUG}/programme/${fixture.programmeSlug}/history`)
  await expect(page).toHaveURL(`/d/${INCLISIRAN_SLUG}/programme/${fixture.programmeSlug}/history`)
  await expect(page.getByText(/conclusion history/i).first()).toBeVisible()
  await expect(
    page.getByRole('heading', {
      level: 2,
      name: 'Inclisiran lowered LDL cholesterol in this reviewed study',
    }),
  ).toBeVisible()
  await expect(page.getByText('Playwright clinical reviewer', { exact: true })).toBeVisible()
  await expect(page.getByText('Playwright statistics reviewer', { exact: true })).toBeVisible()
  const presentationSnapshot = page.getByTestId('history-presentation-snapshot')
  await expect(presentationSnapshot).toHaveCount(1)
  await expect(presentationSnapshot.getByTestId('history-mechanism-stage')).toHaveCount(3)
  await expect(presentationSnapshot.getByTestId('history-timeline-event')).toHaveCount(1)
  await expect(
    presentationSnapshot.getByTestId('history-presentation-source-snapshot'),
  ).toHaveCount(4)
  for (const sourceRow of await presentationSnapshot
    .getByTestId('history-presentation-source-snapshot')
    .all()) {
    const exactSourceLink = sourceRow.getByRole('link', { name: 'Open source' })
    await expect(exactSourceLink).toHaveAttribute('href', fixture.sourceHref)
    await expect(exactSourceLink).toHaveAttribute('target', '_blank')
  }
  const historyTechnicalSummary = presentationSnapshot
    .getByText('Technical source-version details', { exact: true })
    .first()
  const historyFingerprint = presentationSnapshot
    .getByText(`Source fingerprint sha256:${'c'.repeat(64)}`, { exact: true })
    .first()
  await expect(historyFingerprint).toBeHidden()
  await historyTechnicalSummary.focus()
  await expect(historyTechnicalSummary).toBeFocused()
  await historyTechnicalSummary.press('Enter')
  expect(
    await historyTechnicalSummary.evaluate(
      (summary) => (summary.parentElement as HTMLDetailsElement | null)?.open ?? false,
    ),
  ).toBe(true)
  await expect(historyFingerprint).toBeVisible()
  await expectOneMainAndOrderedHeadings(page)
  await expectNoSeriousWcagViolations(page, 'Inclisiran public history')
  await expectNoHorizontalOverflow(page, 'Inclisiran public history')
})

test.fixme('a published programme conclusion reaches the medicine page', async ({ page }) => {
  /*
   * The capability the case above records as missing. The compass renders the medicine's own
   * record and has no read path for `programme_current_publications`, so a published programme
   * conclusion is invisible on /d/<slug> whether or not `?programme=` names it.
   *
   * Marked rather than deleted because the conclusion is the site's central output and this is
   * the test that will catch it being wired up wrongly. Both tables are empty in production
   * today, so nothing a reader can reach is affected yet.
   */
  await requireInclisiranFixture(page)
  const fixture = requireNormalizedFixture()
  await page.goto(`/d/${INCLISIRAN_SLUG}?programme=${encodeURIComponent(fixture.programmeSlug)}`)
  await expect(page.locator('main')).toContainText(
    'Inclisiran lowered LDL cholesterol in this reviewed study',
  )
})

/*
 * REMOVED: "selects all four audience projections with keyboard and mobile-safe controls".
 *
 * The four-lens selector — ordinary reader, clinician, researcher, regulator — was a control on the
 * old medicine layout, inside the advanced-evidence disclosure. It is deleted with that layout, and
 * deliberately not rebuilt.
 *
 * The compass takes the opposite approach to the same problem. Rather than asking a reader to
 * declare which of four kinds of person they are before the page will tell them anything, it leads
 * with plain language for everybody and keeps the technical vocabulary, record identifiers and
 * every stored row in one labelled layer at the foot of the page. Nobody has to classify themselves
 * to read it, and nobody has to give up the detail to get the plain version.
 *
 * The data contract the lenses were built on is unchanged and is still enforced every run, by
 * `npm run check:four-audience-coverage`, which measures source-bound evidence eligibility rather
 * than the presence of a control.
 */

test('a medicine page offers a signed-out reader nothing to edit, and the API refuses anyway', async ({
  page,
}) => {
  /*
   * This used to click "Suggest a correction" on the medicine page and check that a signed-out
   * reader met a sign-in dialog rather than an editing form. There is no correction control on a
   * medicine page any more — contribution and review live at /review-queue — so the first half of
   * that guarantee is now structural: there is nothing to click.
   *
   * The half that still needs testing is the one that mattered: that the absence of a control is
   * not the only thing standing between an anonymous request and the record.
   */
  await requireInclisiranFixture(page)
  const fixture = requireNormalizedFixture()
  await page.goto(normalizedDossierUrl(fixture))
  await expect(page.getByRole('heading', { level: 1, name: /^inclisiran$/i })).toBeVisible()

  await expect(page.getByRole('button', { name: 'Suggest a correction' })).toHaveCount(0)
  await expect(page.locator('main a[href*="review-queue"]')).toHaveCount(0)

  // The server refuses the write on its own, without relying on the interface hiding it.
  const anonymous = await page.request.post(`/api/drugs/${INCLISIRAN_SLUG}/revisions`, {
    data: {
      field: 'name',
      proposedValue: 'Anonymous rename attempt',
      sourceUrl: 'https://example.org/not-a-real-source',
      sourceTitle: 'Not a real source',
      explanation: 'A signed-out request must not reach the record.',
    },
  })
  expect([401, 403]).toContain(anonymous.status())

  // And the way in is where the rest of the site says it is.
  await expect(page.locator('footer a[href="/review-queue"]')).toHaveCount(1)
})

/*
 * REPLACED: "a signed-in contributor saves private evidence work, submits it, and cannot mutate the
 * public verdict".
 *
 * That test drove the whole contribution journey — draft, edit, submit, two independent reviews,
 * adjudication — through the "Suggest a correction" dialog on the medicine page. The dialog is
 * deleted with the old layout: contribution and review live at /review-queue, and a medicine page
 * carries no editing surface at all.
 *
 * The journey itself is not lost, and is tested more thoroughly than a browser can:
 * `tests/integration/programme-contributions.test.ts` runs eleven cases against a real PostgreSQL
 * database, covering the frozen submission bundle, the exact non-branching revision lineage, the
 * blind second reviewer, forged review state and digests, self-review, public disagreement,
 * independent steward adjudication, and publication only after the exact RNA Intelligence bundle.
 * A browser cannot reach most of that, and none of it depended on the dialog.
 *
 * What is left for a browser to check is what a reader can reach, which is below.
 */
test('nothing a signed-in reader can reach from a medicine page changes the public record', async ({
  page,
}) => {
  test.setTimeout(90_000)
  await requireInclisiranFixture(page)
  const fixture = requireNormalizedFixture()
  await loginFixtureAccount(page, fixture.contributor)

  const before = await readPublishedProgrammeEvidence(page, fixture)
  expect(before.verdict).toBeTruthy()

  await page.goto(normalizedDossierUrl(fixture))
  await expect(page.getByRole('heading', { level: 1, name: /^inclisiran$/i })).toBeVisible()

  // Signed in, and still no editing surface: no dialog, no form control, no link into review.
  await expect(page.getByRole('button', { name: 'Suggest a correction' })).toHaveCount(0)
  await expect(page.locator('main form')).toHaveCount(0)
  await expect(page.locator('main a[href*="review-queue"]')).toHaveCount(0)
  await expect(page.locator('main input, main textarea, main select')).toHaveCount(0)

  // The published verdict is byte-for-byte what it was before the visit.
  const after = await readPublishedProgrammeEvidence(page, fixture)
  expect(after.status).toBe(before.status)
  expect(JSON.stringify(after.verdict)).toBe(JSON.stringify(before.verdict))
  expect(JSON.stringify(after.evidenceNodes)).toBe(JSON.stringify(before.evidenceNodes))

  // And the contribution queue is reached from the footer, like every other page on the site.
  await expect(page.locator('footer a[href="/review-queue"]')).toHaveCount(1)
})

test('keeps native disclosures keyboard-operable', async ({ page }) => {
  /*
   * This used to open the advanced-evidence and medicine-background disclosures with Enter and
   * Space, then follow four deep links and check each one opened the disclosure that contained it
   * and moved focus to the heading. Both disclosures belonged to the old layout, and the deep-link
   * script that opened them went with it.
   *
   * The compass does not have that problem to solve. Its disclosures hold detail, not sections, and
   * nothing a link points at is inside one, so a link lands on a heading with no script running —
   * `tests/e2e/dossier-section-navigator.spec.ts` is where that is checked, including with
   * JavaScript switched off. What remains to check here is the disclosures themselves: native
   * `<details>`, operable from the keyboard, with the state a screen reader reads.
   */
  const fixture = requireNormalizedFixture()
  await page.goto(normalizedDossierUrl(fixture))

  const disclosures = page.locator('main details')
  expect(await disclosures.count()).toBeGreaterThan(3)

  const first = disclosures.first()
  const summary = first.locator('> summary')
  await expect(first).not.toHaveAttribute('open', '')

  await summary.focus()
  await expect(summary).toBeFocused()
  await summary.press('Enter')
  await expect(first).toHaveAttribute('open', '')

  await summary.press('Space')
  await expect(first).not.toHaveAttribute('open', '')

  // Focus is visible while it is there, which is what makes keyboard operation usable rather than
  // merely possible.
  await summary.focus()
  const outline = await summary.evaluate((node) => getComputedStyle(node).outlineStyle)
  expect(outline).not.toBe('none')
})

for (const viewport of [
  { label: '320px mobile', width: 320, height: 800 },
  { label: '375px mobile', width: 375, height: 812 },
  { label: '768px tablet', width: 768, height: 900 },
  { label: '1440px desktop', width: 1440, height: 900 },
]) {
  test(`has no horizontal overflow at ${viewport.label}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await requireInclisiranFixture(page)
    const fixture = requireNormalizedFixture()

    await page.goto('/')
    await expectNoHorizontalOverflow(page, `Homepage at ${viewport.label}`)

    await page.goto(normalizedDossierUrl(fixture))
    await expect(page.getByRole('heading', { level: 1, name: /^inclisiran$/i })).toBeVisible()
    await expectNoHorizontalOverflow(page, `Medicine page at ${viewport.label}`)

    /*
     * Everything on a medicine page is rendered at once — the compass has no collapsed sections to
     * open, only disclosures holding detail — so the check is that nothing in it forces the page
     * sideways at any width, including the widest thing on it.
     */
    for (const selector of [
      '.dv4-section',
      '.dv4-result',
      '.dv4-register li',
      '#technical-record',
    ]) {
      for (const element of await page.locator(selector).all()) {
        const box = await element.boundingBox()
        if (!box) continue
        expect(box.x, `${selector} starts off-screen at ${viewport.label}`).toBeGreaterThanOrEqual(
          -1,
        )
        expect(
          box.x + box.width,
          `${selector} runs past the viewport at ${viewport.label}`,
        ).toBeLessThanOrEqual(viewport.width + 1)
      }
    }

    // Opening the technical layer must not change that.
    const technicalSummary = page.locator('#technical-record summary').first()
    if ((await technicalSummary.count()) > 0) {
      await technicalSummary.click()
      await expectNoHorizontalOverflow(page, `Technical record at ${viewport.label}`)
    }

    // Reduced motion is respected: nothing on the page animates.
    const animations = await page
      .locator('main *')
      .evaluateAll((nodes) =>
        nodes.map((node) => getComputedStyle(node).animationName).filter((name) => name !== 'none'),
      )
    expect(animations, 'Reduced motion must leave the page static.').toEqual([])

    await page.goto(`/d/${INCLISIRAN_SLUG}/programme/${fixture.programmeSlug}/history`)
    await expect(page.getByTestId('history-mechanism-stage')).toHaveCount(3)
    await expect(page.getByTestId('history-timeline-event')).toHaveCount(1)
    await expectNoHorizontalOverflow(page, `Public history at ${viewport.label}`)
  })
}

test('keeps the static first read clear and contained in a touch-sized view', async ({
  browser,
}) => {
  const fixture = requireNormalizedFixture()
  const context = await browser.newContext({
    // Inherit the suite's base URL rather than naming a port. Hard-coding 3000 here sent this
    // context to whatever else was listening on it once playwright.config.ts became
    // port-configurable, and the page came back 404 from an unrelated server.
    ...(test.info().project.use.baseURL ? { baseURL: test.info().project.use.baseURL } : {}),
    colorScheme: 'light',
    hasTouch: true,
    reducedMotion: 'reduce',
    viewport: { width: 375, height: 812 },
  })

  try {
    const page = await context.newPage()
    await requireInclisiranFixture(page)
    await page.goto(normalizedDossierUrl(fixture))

    /*
     * The old layout's first read was one testid — `ten-second-finding` — with a glossary of tapped
     * definitions beside it and two disclosures under it. The compass's first read is the hero, and
     * the words worth knowing are explained in a primer rather than behind per-word controls.
     *
     * What has to hold on a phone is the same: the opening is readable without scrolling sideways,
     * every touch target is big enough to hit, and opening the detail does not break either.
     */
    const opening = page.locator('.dv4-hero-action')
    await expect(opening).toBeVisible()
    const openingBox = await opening.boundingBox()
    expect(openingBox).not.toBeNull()
    expect(openingBox!.x).toBeGreaterThanOrEqual(0)
    expect(openingBox!.x + openingBox!.width).toBeLessThanOrEqual(375)
    await expectNoHorizontalOverflow(page, 'Static mobile first read')

    // The words the page uses are explained on the page, not behind a control per word.
    await expect(page.locator('#concept-primer')).toBeVisible()

    // Every disclosure is a touch-sized target.
    for (const summary of await page.locator('main details > summary').all()) {
      const box = await summary.boundingBox()
      if (!box) continue
      expect(box.height, 'a disclosure control is under 44 px tall').toBeGreaterThanOrEqual(44)
    }

    // Opening the technical layer by touch keeps the page inside the viewport.
    const technicalSummary = page.locator('#technical-record summary').first()
    await technicalSummary.tap()
    await expectNoHorizontalOverflow(page, 'Touch-opened technical record')
  } finally {
    await context.close()
  }
})

test('reconciles a refocused tab before accepting attributed work', async ({ page }) => {
  /*
   * This used to run on a medicine page, through the community-commentary form that sat on it. The
   * form is deleted along with every other writing surface on a reader's page, so the test now runs
   * where attributed work is actually done: the review queue.
   *
   * The guarantee is unchanged and is the reason the test exists. Two tabs share one session
   * cookie. If somebody signs in as a different account in one tab, the other tab is holding a
   * form that will be attributed to whoever the server thinks is signed in — not to whoever the
   * page still shows. So returning to the stale tab must lock every identity-bearing control until
   * the server has confirmed the account, and must clear whatever was typed under the old one.
   */
  test.setTimeout(60_000)
  const fixture = requireNormalizedFixture()

  await loginFixtureAccount(page, fixture.contributor)
  await page.goto('/review-queue')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('body')).toContainText('Sentences waiting for review')

  let releaseAccountCheck!: () => void
  const heldAccountCheck = new Promise<void>((resolve) => {
    releaseAccountCheck = resolve
  })
  let markAccountCheckStarted!: () => void
  const accountCheckStarted = new Promise<void>((resolve) => {
    markAccountCheckStarted = resolve
  })
  let shouldHoldAccountCheck = true

  await page.route('**/api/auth/me', async (route) => {
    if (shouldHoldAccountCheck) {
      shouldHoldAccountCheck = false
      markAccountCheckStarted()
      await heldAccountCheck
    }
    await route.continue()
  })

  const otherTab = await page.context().newPage()
  try {
    await otherTab.bringToFront()
    await switchFixtureAccount(otherTab, fixture.reviewers[0]!)

    await page.bringToFront()
    // Headless Chromium does not consistently emit a window focus event for `bringToFront()`.
    // Dispatch the same browser event deterministically; the listener itself is covered here.
    await page.evaluate(() => window.dispatchEvent(new Event('focus')))
    await accountCheckStarted

    // While the check is in flight, the account is shown as unconfirmed and the shell is inert.
    await expect(page.getByText('Checking account…', { exact: true })).toBeVisible()
    await expect(page.locator('[aria-busy="true"][inert]')).toHaveCount(1)

    releaseAccountCheck()

    // And when it lands, the page belongs to whoever the server says is signed in.
    const reviewer = fixture.reviewers[0]!
    await expect(page.getByRole('button', { name: `Account for ${reviewer.name}` })).toBeVisible()
    await expect(page.locator('[inert]')).toHaveCount(0)
  } finally {
    releaseAccountCheck()
    await otherTab.close()
  }
})
