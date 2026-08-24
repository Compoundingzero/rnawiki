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
  const usedFor = page.getByTestId('ten-second-used-for')
  await expect(usedFor).toContainText('Studied in adults with artery disease')
  await expect(usedFor).toContainText('LDL (“bad”) cholesterol')
  const detailedReasonCopies = page.getByText(
    'This test record shows how one reviewed study result connects to a public conclusion and its source.',
    { exact: true },
  )
  await expect(detailedReasonCopies).toHaveCount(2)
  for (const copy of await detailedReasonCopies.all()) await expect(copy).toBeHidden()
  const firstRead = page.getByTestId('ten-second-finding')
  await expect(firstRead).toBeVisible()
  await expect(firstRead).toContainText('After about 17 months')
  await expect(firstRead).toContainText('LDL (“bad”) cholesterol')
  await expect(firstRead).toContainText('about half')
  await expect(firstRead).toContainText('dummy treatment')
  await expect(firstRead.getByRole('button')).toHaveCount(0)
  await expect(firstRead.locator('[role="tooltip"]')).toHaveCount(0)

  const mechanismSummary = page.getByTestId('first-read-mechanism')
  const mechanismSummaryControl = mechanismSummary.locator('summary')
  await expect(mechanismSummary).not.toHaveAttribute('open', '')
  await mechanismSummaryControl.focus()
  await mechanismSummaryControl.press('Enter')
  await expect(mechanismSummary).toHaveAttribute('open', '')
  await expect(mechanismSummary).toContainText('This study measured what happened to')
  await expect(mechanismSummary).toContainText('LDL cholesterol')
  await expect(mechanismSummary.getByRole('button')).toHaveCount(0)
  await expect(mechanismSummary.locator('[role="tooltip"]')).toHaveCount(0)
  await expect(mechanismSummary).toContainText(
    'It did not test the molecular steps inside liver cells.',
  )
  await mechanismSummaryControl.press('Enter')
  await expect(mechanismSummary).not.toHaveAttribute('open', '')
  const limitation = page.locator('#limitation-heading').locator('..')
  await expect(limitation).toContainText('The study measured LDL (“bad”) cholesterol')
  await expect(limitation).toContainText('not whether people had fewer heart attacks or strokes.')

  const scopedApiResponse = await page.request.get(
    `/api/drugs/${INCLISIRAN_SLUG}?programme=${encodeURIComponent(fixture.programmeSlug)}`,
  )
  const scopedApiRaw = await scopedApiResponse.text()
  expect(scopedApiResponse.status(), scopedApiRaw).toBe(200)
  const scopedApi = JSON.parse(scopedApiRaw) as ProgrammeScopedDrugReadResponse
  expect(scopedApi.programmeDossier).toMatchObject({
    selectedProgrammeId: fixture.programmeSlug,
    bindingState: 'published_programme',
  })
  expect(scopedApi.programmeDossier?.mechanismSteps).toHaveLength(3)
  expect(scopedApi.programmeDossier?.timelineEvents).toHaveLength(2)
  expect(scopedApi.evidenceAuthority).toEqual({
    scope: 'programme',
    authoritativeObject: 'programmeDossier',
    selectedProgrammeId: fixture.programmeSlug,
  })
  expect(scopedApi.drug).toMatchObject({ name: expect.stringMatching(/^inclisiran$/i) })
  for (const unscopedField of [
    'approvalStatus',
    'indication',
    'patientFriendlyIndication',
    'oneSentenceVerdict',
    'laymanHowItWorks',
    'auditConfidence',
    'confidenceScore',
    'keyAudits',
    'mechanismSteps',
    'trials',
  ]) {
    expect(scopedApi.drug).not.toHaveProperty(unscopedField)
    expect(scopedApi.legacyMedicineRecord?.fields).toHaveProperty(unscopedField)
  }
  expect(scopedApi.legacyMedicineRecord).toMatchObject({
    status: 'legacy_unscoped_not_authoritative',
    authoritativeForSelectedProgramme: false,
  })
  expect(scopedApi.legacyMedicineRecord?.warning).toBe(
    'These fields belong to a general research summary covering the medicine as a whole. They were not reviewed for this specific use and are kept separate from the reviewed answer for that use.',
  )
  await expectCollapsedDossierWordBudget(page)
  await expectOneMainAndOrderedHeadings(page)

  const { content } = await openAdvancedEvidence(page)
  await expect(content.getByRole('heading', { level: 2 })).toBeVisible()
  await expect(
    content.getByText(
      'This test record shows how one reviewed study result connects to a public conclusion and its source.',
      { exact: true },
    ),
  ).toBeVisible()
  await expect(content.getByText('Relevant review background:')).toHaveCount(2)
  await expect(
    content.getByText('How medicines work in people (clinical pharmacology)'),
  ).toBeVisible()
  await expect(content.getByText('Medical statistics')).toBeVisible()
  await expect(
    content.getByRole('heading', { level: 3, name: 'How many studies have results here?' }),
  ).toBeVisible()
  await expect(content.getByText('1,561 participants across 1 study')).toBeVisible()
  await expect(content.getByText('People enrolled in studies with results')).toBeVisible()
  await expect(content.getByText('Actual count: 1,561 across 1 study')).toBeVisible()
  const studyStages = content.getByText('Testing stages and how the studies were run', {
    exact: true,
  })
  await studyStages.click()
  const recordedStudyDesign = content.getByTestId('recorded-study-design')
  await expect(recordedStudyDesign).toBeVisible()
  await expect(recordedStudyDesign).toContainText('Human study')
  await expect(recordedStudyDesign).toContainText('Phase 3')
  await expect(recordedStudyDesign.locator('[role="tooltip"]')).toHaveCount(0)
  await expect(
    content.getByText(/do not by themselves prove that the medicine is safe or helpful/i),
  ).toBeVisible()

  await expect(content.getByTestId('advanced-study-language')).toHaveCount(0)
  await expect(content).toBeVisible()
  const mechanismMap = content.getByTestId('programme-mechanism-map')
  await expect(mechanismMap).toBeVisible()
  await expect(
    mechanismMap.getByRole('heading', {
      level: 3,
      name: 'How the medicine is expected to work',
    }),
  ).toBeVisible()
  await expect(mechanismMap.getByTestId('programme-mechanism-stage')).toHaveCount(3)
  await expect(mechanismMap).toContainText('People received inclisiran or a')
  await expect(mechanismMap).toContainText('Researchers tracked')
  await expect(mechanismMap).toContainText('was lower with inclisiran')
  await expect(mechanismMap).toContainText('dummy treatment')
  await expect(mechanismMap).toContainText('LDL cholesterol')
  await expect(mechanismMap).toContainText('52.3 percentage points')
  await expect(mechanismMap.locator('[role="tooltip"]')).toHaveCount(0)
  await expect(mechanismMap.getByTestId('mechanism-evidence-basis')).toHaveCount(3)
  await expect(
    mechanismMap.getByText('This step was measured in people', { exact: true }),
  ).toHaveCount(3)
  await expect(mechanismMap.getByTestId('mechanism-stage-source-links')).toHaveCount(3)
  for (const sourceList of await mechanismMap.getByTestId('mechanism-stage-source-links').all()) {
    const exactSourceLink = sourceList.getByRole('link', { name: fixture.sourceLabel })
    await expect(exactSourceLink).toHaveAttribute('href', fixture.sourceHref)
    await expect(exactSourceLink).toHaveAttribute('target', '_blank')
  }
  const mechanismTechnicalSummary = mechanismMap
    .getByText('Technical detail', {
      exact: true,
    })
    .first()
  await mechanismTechnicalSummary.focus()
  await expect(mechanismTechnicalSummary).toBeFocused()
  await mechanismTechnicalSummary.press('Enter')
  expect(
    await mechanismTechnicalSummary.evaluate(
      (summary) => (summary.parentElement as HTMLDetailsElement | null)?.open ?? false,
    ),
  ).toBe(true)

  const decisionTimeline = content.getByTestId('programme-decision-timeline')
  await expect(decisionTimeline).toBeVisible()
  await expect(
    decisionTimeline.getByRole('heading', {
      level: 3,
      name: 'Events that changed what happened next',
    }),
  ).toBeVisible()
  await expect(
    decisionTimeline.locator('[data-testid="programme-timeline-event"][data-provenance="source"]'),
  ).toHaveCount(1)
  await expect(
    decisionTimeline.locator('[data-testid="programme-timeline-event"][data-provenance="rnawiki"]'),
  ).toHaveCount(1)
  const sourcedTimelineEvent = decisionTimeline.locator(
    '[data-testid="programme-timeline-event"][data-provenance="source"]',
  )
  await expect(sourcedTimelineEvent.locator(':scope > p').first()).toContainText('ORION-10')
  await expect(sourcedTimelineEvent.locator('[role="tooltip"]')).toHaveCount(0)
  await expect(decisionTimeline).toContainText('reported lower')
  await expect(decisionTimeline).toContainText('with inclisiran')
  const timelineSourceLink = decisionTimeline
    .getByTestId('timeline-event-source-links')
    .getByRole('link', { name: fixture.sourceLabel })
  await expect(timelineSourceLink).toHaveAttribute('href', fixture.sourceHref)
  await expect(timelineSourceLink).toHaveAttribute('target', '_blank')
  await expect(
    decisionTimeline.getByText('RNAWiki published the first reviewed conclusion', { exact: true }),
  ).toBeVisible()
  await expect(decisionTimeline.getByText('Page update · not a study result')).toBeVisible()
  for (const storedCode of [
    'MEASURED_IN_PEOPLE',
    'IMPORTANT_RESULT',
    'ACTUAL',
    'programme-presentation/v1',
  ]) {
    await expect(content.getByText(storedCode, { exact: true })).toHaveCount(0)
  }

  const evidenceDetails = content.getByText('View evidence details', { exact: true })
  expect(
    await evidenceDetails.count(),
    'Inclisiran needs at least one normalized public claim detail in its evidence chain.',
  ).toBeGreaterThan(0)
  const firstEvidenceDetail = evidenceDetails.first()
  await firstEvidenceDetail.click()
  expect(
    await firstEvidenceDetail.evaluate(
      (summary) => (summary.parentElement as HTMLDetailsElement | null)?.open ?? false,
    ),
  ).toBe(true)
  const firstEvidenceDetailContent = firstEvidenceDetail.locator('xpath=..')
  await expect(firstEvidenceDetailContent).toContainText('510 days')
  await expect(firstEvidenceDetailContent).toContainText('-52.3 percentage points')
  await expect(firstEvidenceDetailContent.locator('[role="tooltip"]')).toHaveCount(0)

  await expect(content.getByText('What researchers measured').first()).toBeVisible()
  await expect(content.getByText('Comparison group').first()).toBeVisible()
  await expect(firstEvidenceDetailContent).toContainText('Dummy treatment')
  await expect(content.getByText('Exact result').first()).toBeVisible()
  await expect(firstEvidenceDetailContent).toContainText(
    'the difference between the two groups’ average',
  )
  await expect(content.getByText('How uncertain is this estimate?').first()).toBeVisible()
  await expect(firstEvidenceDetailContent).toContainText('The difference between groups could be')
  await expect(firstEvidenceDetailContent).toContainText('48.8 to 55.7 percentage points')
  await expect(
    content.getByText('A measurement from the body, such as a laboratory value').first(),
  ).toBeVisible()

  const orionStudyCard = content.locator('#studies article').filter({ hasText: 'ORION-10' })
  await expect(orionStudyCard.getByRole('heading', { level: 4 })).toContainText('ORION-10')
  await expect(orionStudyCard).toContainText('NCT03399370')
  await expect(orionStudyCard.locator('[role="tooltip"]')).toHaveCount(0)

  await expectOneMainAndOrderedHeadings(page)
  await expectNoSeriousWcagViolations(page, 'Expanded Inclisiran dossier')

  const sourceLink = content.getByRole('link', { name: fixture.sourceLabel }).first()
  await expect(sourceLink).toBeVisible()
  await expect(sourceLink).toHaveAttribute('href', fixture.sourceHref)
  await expect(sourceLink).toHaveAttribute('target', '_blank')
  const dossierFingerprint = content.getByText(`Source fingerprint sha256:${'c'.repeat(64)}`, {
    exact: true,
  })
  await expect(dossierFingerprint).toBeHidden()
  const dossierSourceDetails = content
    .getByText('Exact saved copy details', { exact: true })
    .first()
  await dossierSourceDetails.focus()
  await expect(dossierSourceDetails).toBeFocused()
  await dossierSourceDetails.press('Enter')
  await expect(dossierFingerprint).toBeVisible()

  const historyLink = content.getByRole('link', { name: 'See what changed on this page' })
  await expect(historyLink).toHaveCount(1)
  await expect(historyLink).toHaveAttribute(
    'href',
    `/d/${INCLISIRAN_SLUG}/programme/${fixture.programmeSlug}/history`,
  )
  await historyLink.click()

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

test('signed-out readers are asked to authenticate before suggesting a correction', async ({
  page,
}) => {
  await requireInclisiranFixture(page)
  const fixture = requireNormalizedFixture()
  await page.goto(normalizedDossierUrl(fixture))
  await expect(page.getByRole('heading', { level: 1, name: /^inclisiran$/i })).toBeVisible()
  const { content } = await openAdvancedEvidence(page)

  await content.getByRole('button', { name: 'Suggest a correction' }).click()

  await expect(page.getByRole('dialog', { name: 'Create your account' })).toBeVisible()
  await expect(page.getByRole('dialog', { name: 'Suggest a correction' })).toHaveCount(0)
  await expect(page.getByLabel('Email')).toBeVisible()
  await expect(page.getByLabel('Password')).toBeVisible()
})

test('a signed-in contributor saves private evidence work, submits it, and cannot mutate the public verdict', async ({
  page,
}) => {
  test.setTimeout(90_000)
  await requireInclisiranFixture(page)
  const fixture = requireNormalizedFixture()
  await loginFixtureAccount(page, fixture.contributor)
  const publishedBefore = await readPublishedProgrammeEvidence(page, fixture)
  const publishedVerdictId = (publishedBefore.verdict as { id?: string } | null)?.id
  expect(publishedVerdictId).toBeTruthy()

  const correctionText =
    `Synthetic Playwright evidence-node correction ${fixture.programmeSlug}; ` +
    'this is test data, not a medical assertion.'
  const challengeText =
    `Synthetic Playwright conclusion challenge ${fixture.programmeSlug}; ` +
    'this is test data, not a medical assertion.'
  const correctionSource = `https://example.test/rnawiki/${fixture.programmeSlug}/correction`
  const challengeSource = `https://example.test/rnawiki/${fixture.programmeSlug}/challenge`

  await page.goto(normalizedDossierUrl(fixture))
  await expect(page.getByRole('heading', { level: 1, name: /^inclisiran$/i })).toBeVisible()
  const { content } = await openAdvancedEvidence(page)

  const correctionContext = waitForContributionContext(page, fixture.programmeSlug)
  await content.getByRole('button', { name: 'Suggest a correction' }).click()
  expect((await correctionContext).status()).toBe(200)

  const correctionDialog = page.getByRole('dialog', { name: 'Suggest a correction' })
  await expect(correctionDialog).toBeVisible()
  await exerciseProgrammeSwitchIfAvailable(page, correctionDialog, fixture)

  await correctionDialog
    .getByLabel('What needs changing?')
    .selectOption('evidenceNode.plainSummary')
  await correctionDialog
    .getByLabel('Which evidence step changes?')
    .selectOption(fixture.evidenceNodeId)
  await correctionDialog.getByLabel('What should the record say?').fill(correctionText)
  await correctionDialog.getByLabel('Source type').selectOption('OTHER')
  await correctionDialog
    .getByLabel('Study or publication identifier (for example, an NCT number or DOI)')
    .fill(`SYNTHETIC-CORRECTION-${fixture.programmeSlug}`)
  await correctionDialog.getByLabel('Public web link').fill(correctionSource)
  await correctionDialog
    .getByLabel(
      'Is this directly measured, reported by the sponsor, a regulatory finding, or your interpretation?',
    )
    .selectOption('RNAWIKI_JUDGEMENT')
  await correctionDialog
    .getByLabel('Why does the source support this change?')
    .fill(
      'The source is a reserved synthetic locator used only to verify deterministic proposal handling.',
    )
  await correctionDialog
    .getByLabel('What is wrong or missing in the current record?')
    .fill('The test-only evidence node needs a run-specific correction marker for this journey.')
  await correctionDialog.getByRole('radio', { name: 'Both' }).check()
  await correctionDialog
    .getByLabel('Technical detail (optional)')
    .fill('No medical endpoint is asserted; this detail is synthetic browser-test input.')
  await correctionDialog
    .getByLabel('Conflict-of-interest details')
    .fill('None; this is a synthetic automated browser journey.')
  await correctionDialog
    .getByRole('checkbox', { name: 'I confirm this disclosure is complete and accurate.' })
    .check()

  await expect(
    correctionDialog.getByLabel('Before and after').getByText(correctionText),
  ).toBeVisible()
  await expect(correctionDialog.getByText('example.test', { exact: true })).toBeVisible()
  await expect(correctionDialog.getByText(new URL(correctionSource).pathname)).toBeVisible()

  const correctionDraftResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === contributionContextPath(fixture.programmeSlug) &&
      response.request().method() === 'POST',
  )
  await correctionDialog.getByRole('button', { name: 'Save draft' }).click()
  const correctionDraftHttp = await correctionDraftResponse
  const correctionDraftRaw = await correctionDraftHttp.text()
  expect(correctionDraftHttp.status(), correctionDraftRaw).toBe(201)
  const correctionDraft = requireProposal(
    JSON.parse(correctionDraftRaw) as ContributionProposalResponse,
  )
  expect(correctionDraft).toMatchObject({
    proposalType: 'CORRECTION',
    status: 'DRAFT',
    selectedField: 'evidenceNode.plainSummary',
  })
  await expect(
    correctionDialog.getByText(
      'Draft saved. It is private to your account until you submit it for review.',
    ),
  ).toBeVisible()
  await expect(
    correctionDialog.getByRole('heading', { name: 'Automated checks', exact: true }),
  ).toBeVisible()
  await expect(correctionDialog.getByText('Where this change may appear')).toBeVisible()
  await expect(correctionDialog.getByText('This edit may affect:')).toBeVisible()

  const queueWhilePrivate = await readPublicContributionQueue(page)
  expect(queueWhilePrivate.proposals?.some((proposal) => proposal.id === correctionDraft.id)).toBe(
    false,
  )

  const correctionPatchResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === `/api/contributions/${correctionDraft.id}` &&
      response.request().method() === 'PATCH',
  )
  const correctionSubmitResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === `/api/contributions/${correctionDraft.id}/submit` &&
      response.request().method() === 'POST',
  )
  await correctionDialog.getByRole('button', { name: 'Submit for review' }).click()
  expect((await correctionPatchResponse).status()).toBe(200)
  const correctionSubmitHttp = await correctionSubmitResponse
  const correctionSubmitRaw = await correctionSubmitHttp.text()
  expect(correctionSubmitHttp.status(), correctionSubmitRaw).toBe(200)
  const correctionSubmitted = requireProposal(
    JSON.parse(correctionSubmitRaw) as ContributionProposalResponse,
  )
  expect(correctionSubmitted.id).toBe(correctionDraft.id)
  expectDeterministicSubmission(correctionSubmitted, 'CORRECTION')
  expect(correctionSubmitted.currentVerdictSnapshot?.id).toBe(publishedVerdictId)
  await expect(
    correctionDialog.getByText(
      'Submitted for independent human review. The public record has not changed.',
    ),
  ).toBeVisible()

  await correctionDialog.getByRole('button', { name: 'Close contribution form' }).click()
  await expect(correctionDialog).toBeHidden()

  const challengeContext = waitForContributionContext(page, fixture.programmeSlug)
  await content.getByRole('button', { name: 'Challenge this answer' }).click()
  expect((await challengeContext).status()).toBe(200)

  const challengeDialog = page.getByRole('dialog', { name: 'Challenge this answer' })
  await expect(challengeDialog).toBeVisible()
  await challengeDialog
    .getByLabel('Which conclusion are you challenging?')
    .selectOption('verdict.publicLabel')
  await challengeDialog.getByLabel('Source type').selectOption('OTHER')
  await challengeDialog
    .getByLabel('Study or publication identifier (for example, an NCT number or DOI)')
    .fill(`SYNTHETIC-CHALLENGE-${fixture.programmeSlug}`)
  await challengeDialog.getByLabel('Public web link').fill(challengeSource)
  await challengeDialog
    .getByLabel('Which evidence step changes?')
    .selectOption(fixture.evidenceNodeId)
  await challengeDialog
    .getByLabel('What kind of evidence supports your challenge?')
    .selectOption('RNAWIKI_JUDGEMENT')
  await challengeDialog.getByLabel('What verdict do you propose?').fill(challengeText)
  await challengeDialog
    .getByLabel('What was wrong or missing in the current reasoning?')
    .fill('This synthetic challenge verifies that a conclusion objection stays programme-scoped.')
  await challengeDialog
    .getByLabel('Why does the source support your proposed conclusion?')
    .fill('The reserved source locator exists only to exercise the frozen review-bundle contract.')
  await challengeDialog.getByRole('radio', { name: 'Both' }).check()
  await challengeDialog
    .getByLabel('Conflict-of-interest details')
    .fill('None; this is a synthetic automated browser journey.')
  await challengeDialog
    .getByRole('checkbox', { name: 'I confirm this disclosure is complete and accurate.' })
    .check()

  const challengeDraftResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === contributionContextPath(fixture.programmeSlug) &&
      response.request().method() === 'POST',
  )
  const challengeSubmitResponse = page.waitForResponse(
    (response) =>
      /\/api\/contributions\/[^/]+\/submit$/.test(new URL(response.url()).pathname) &&
      response.request().method() === 'POST',
  )
  await challengeDialog.getByRole('button', { name: 'Submit for review' }).click()
  const challengeDraftHttp = await challengeDraftResponse
  const challengeDraftRaw = await challengeDraftHttp.text()
  expect(challengeDraftHttp.status(), challengeDraftRaw).toBe(201)
  const challengeDraft = requireProposal(
    JSON.parse(challengeDraftRaw) as ContributionProposalResponse,
  )
  expect(challengeDraft).toMatchObject({
    proposalType: 'VERDICT_CHALLENGE',
    status: 'DRAFT',
    selectedField: 'verdict.publicLabel',
  })

  const challengeSubmitHttp = await challengeSubmitResponse
  const challengeSubmitRaw = await challengeSubmitHttp.text()
  expect(challengeSubmitHttp.status(), challengeSubmitRaw).toBe(200)
  const challengeSubmitted = requireProposal(
    JSON.parse(challengeSubmitRaw) as ContributionProposalResponse,
  )
  expect(challengeSubmitted.id).toBe(challengeDraft.id)
  expect(challengeSubmitted).toMatchObject({
    proposalKey: challengeSubmitted.id,
    revisionNumber: 1,
    previousProposalId: null,
  })
  expectDeterministicSubmission(challengeSubmitted, 'VERDICT_CHALLENGE')
  expect(challengeSubmitted.currentVerdictSnapshot?.id).toBe(publishedVerdictId)
  await expect(
    challengeDialog.getByText(
      'Submitted for independent human review. The public record has not changed.',
    ),
  ).toBeVisible()

  const publishedAfter = await readPublishedProgrammeEvidence(page, fixture)
  expect(publishedAfter).toEqual(publishedBefore)

  const queueApi = await readPublicContributionQueue(page)
  const correctionQueueItem = queueApi.proposals?.find(
    (proposal) => proposal.id === correctionSubmitted.id,
  )
  const challengeQueueItem = queueApi.proposals?.find(
    (proposal) => proposal.id === challengeSubmitted.id,
  )
  expect(correctionQueueItem).toMatchObject({
    proposalType: 'CORRECTION',
    selectedField: 'evidenceNode.plainSummary',
    proposedText: correctionText,
    contentDigest: correctionSubmitted.contentDigest,
    machineChecks: { passed: true },
  })
  expect(challengeQueueItem).toMatchObject({
    proposalType: 'VERDICT_CHALLENGE',
    selectedField: 'verdict.publicLabel',
    proposedText: challengeText,
    contentDigest: challengeSubmitted.contentDigest,
    machineChecks: { passed: true },
  })
  expect(correctionQueueItem?.impactPreview?.matchedDependencyCount ?? 0).toBeGreaterThan(0)
  expect(challengeQueueItem?.impactPreview?.matchedDependencyCount ?? 0).toBeGreaterThan(0)
  for (const item of [correctionQueueItem, challengeQueueItem]) {
    const serialized = JSON.stringify(item)
    expect(serialized).not.toContain(fixture.contributor.id)
    expect(serialized).not.toContain(fixture.contributor.email)
    expect(item).not.toHaveProperty('authorUserId')
    expect(item).not.toHaveProperty('email')
  }

  await challengeDialog.getByRole('link', { name: 'Open the public review queue' }).click()
  await expect(page).toHaveURL('/review-queue')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Evidence awaiting review' }),
  ).toBeVisible()

  const correctionCard = page.locator('article').filter({ hasText: correctionText })
  await expect(correctionCard).toHaveCount(1)
  await expect(correctionCard.getByText('Correction', { exact: true }).first()).toBeVisible()
  await expect(
    correctionCard.getByText('Automated completeness checks', { exact: true }),
  ).toBeVisible()
  await expect(correctionCard.getByText(/0 blockers/)).toBeVisible()
  await expect(
    correctionCard.getByText('What else may need updating', { exact: true }),
  ).toBeVisible()
  await expect(
    correctionCard.getByText('Awaiting two independent reviews. No public record has changed.'),
  ).toBeVisible()

  const challengeCard = page.locator('article').filter({ hasText: challengeText })
  await expect(challengeCard).toHaveCount(1)
  await expect(
    challengeCard.getByText('Challenge to a conclusion', { exact: true }).first(),
  ).toBeVisible()
  await expect(
    challengeCard.getByText('Automated completeness checks', { exact: true }),
  ).toBeVisible()
  await expect(challengeCard.getByText(/0 blockers/)).toBeVisible()
  await expect(
    challengeCard.getByText('What else may need updating', { exact: true }),
  ).toBeVisible()
  await expect(
    challengeCard.getByText('Awaiting two independent reviews. No public record has changed.'),
  ).toBeVisible()

  // Reviewer A sees no other decision, records an immutable approval, and leaves the proposal
  // awaiting a second independently reached decision.
  await switchFixtureAccount(page, fixture.reviewers[0]!)
  await page.reload()
  await expect(
    page.getByRole('heading', { level: 1, name: 'Evidence awaiting review' }),
  ).toBeVisible()
  await challengeCard.getByRole('button', { name: 'Review this proposal' }).click()
  await expect(
    challengeCard.getByText(/Other reviewer decisions are hidden until you submit your own/),
  ).toBeVisible()
  await challengeCard.getByRole('radio', { name: 'Accept for RNAWiki staff to apply' }).check()
  await challengeCard.getByRole('checkbox', { name: 'Clinical pharmacology' }).check()
  await challengeCard
    .getByRole('checkbox', { name: /I reviewed this proposal independently/ })
    .check()
  await challengeCard
    .getByLabel('Your conflict-of-interest disclosure')
    .fill('None; synthetic Playwright reviewer A.')
  await challengeCard
    .getByRole('checkbox', { name: 'I confirm this disclosure is complete and accurate.' })
    .check()

  const firstReviewResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === `/api/contributions/${challengeSubmitted.id}/reviews` &&
      response.request().method() === 'POST',
  )
  await challengeCard.getByRole('button', { name: 'Submit independent review' }).click()
  const firstReviewHttp = await firstReviewResponse
  const firstReviewRaw = await firstReviewHttp.text()
  expect(firstReviewHttp.status(), firstReviewRaw).toBe(201)
  const firstReview = JSON.parse(firstReviewRaw) as ContributionReviewApiResponse
  expect(firstReview).toMatchObject({
    reviewState: {
      status: 'AWAITING_SECOND_REVIEW',
      reviewCount: 1,
      requiredReviewCount: 2,
      consensus: null,
    },
    myReview: { decision: 'APPROVE' },
  })
  await expect(
    challengeCard.getByText(
      'One independent review is recorded; the second decision remains pending.',
    ),
  ).toBeVisible()

  const queueAfterFirstReview = await readPublicContributionQueue(page, 'AWAITING_SECOND_REVIEW')
  const publiclyBlindChallenge = queueAfterFirstReview.proposals?.find(
    (proposal) => proposal.id === challengeSubmitted.id,
  )
  expect(publiclyBlindChallenge?.reviewState).toMatchObject({
    status: 'AWAITING_SECOND_REVIEW',
    reviewCount: 1,
  })
  expect(publiclyBlindChallenge?.reviews).toEqual([])

  // Reviewer B reloads under a distinct trusted account. The first decision must still be absent
  // before B commits a conflicting rejection.
  await switchFixtureAccount(page, fixture.reviewers[1]!)
  await page.reload()
  await challengeCard.getByRole('button', { name: 'Review this proposal' }).click()
  await expect(
    challengeCard.getByText(/Other reviewer decisions are hidden until you submit your own/),
  ).toBeVisible()
  await expect(challengeCard.getByText(fixture.reviewers[0]!.name)).toHaveCount(0)
  await challengeCard.getByRole('radio', { name: 'Reject', exact: true }).check()
  await challengeCard.getByRole('checkbox', { name: 'Biostatistics' }).check()
  await challengeCard
    .getByRole('checkbox', { name: /I reviewed this proposal independently/ })
    .check()
  await challengeCard
    .getByLabel('Reason for your decision (required for this decision)')
    .fill('The synthetic proposal is intentionally rejected to exercise disagreement handling.')
  await challengeCard
    .getByLabel('Your conflict-of-interest disclosure')
    .fill('None; synthetic Playwright reviewer B.')
  await challengeCard
    .getByRole('checkbox', { name: 'I confirm this disclosure is complete and accurate.' })
    .check()

  const secondReviewResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === `/api/contributions/${challengeSubmitted.id}/reviews` &&
      response.request().method() === 'POST',
  )
  await challengeCard.getByRole('button', { name: 'Submit independent review' }).click()
  const secondReviewHttp = await secondReviewResponse
  const secondReviewRaw = await secondReviewHttp.text()
  expect(secondReviewHttp.status(), secondReviewRaw).toBe(201)
  const secondReview = JSON.parse(secondReviewRaw) as ContributionReviewApiResponse
  expect(secondReview.reviewState).toMatchObject({
    status: 'DISAGREEMENT',
    reviewCount: 2,
    requiredReviewCount: 2,
    consensus: null,
  })
  expect(secondReview.reviews).toHaveLength(2)
  expect(new Set(secondReview.reviews?.map((review) => review.decision))).toEqual(
    new Set(['APPROVE', 'REJECT']),
  )
  await expect(
    challengeCard.getByText(
      'The two independent reviews disagree. A qualified RNAWiki steward must make the final decision; this step is called adjudication.',
    ),
  ).toBeVisible()
  await expect(challengeCard.getByText(fixture.reviewers[0]!.name)).toBeVisible()
  await expect(challengeCard.getByText(fixture.reviewers[1]!.name)).toBeVisible()

  // A third account with steward authority resolves the disagreement. This review outcome is an
  // intake decision only; the published programme verdict remains untouched.
  await switchFixtureAccount(page, fixture.adjudicator)
  await page.reload()
  await challengeCard
    .getByRole('button', { name: 'Check whether you can make the final decision' })
    .click()
  await expect(challengeCard.getByText('Make the final decision', { exact: true })).toBeVisible()
  await challengeCard.getByRole('radio', { name: 'Request changes' }).check()
  await challengeCard.getByRole('checkbox', { name: 'Regulatory review' }).check()
  await challengeCard
    .getByLabel('Why is this the final decision?')
    .fill(
      'The synthetic disagreement requires revision before implementation; no medical conclusion is changed.',
    )
  await challengeCard
    .getByLabel('Your conflict-of-interest disclosure')
    .fill('None; synthetic Playwright adjudicator.')
  await challengeCard
    .getByRole('checkbox', { name: 'I confirm this disclosure is complete and accurate.' })
    .check()

  const adjudicationResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname ===
        `/api/contributions/${challengeSubmitted.id}/adjudication` &&
      response.request().method() === 'POST',
  )
  await challengeCard.getByRole('button', { name: 'Record final decision' }).click()
  const adjudicationHttp = await adjudicationResponse
  const adjudicationRaw = await adjudicationHttp.text()
  expect(adjudicationHttp.status(), adjudicationRaw).toBe(201)
  const adjudicated = JSON.parse(adjudicationRaw) as ContributionReviewApiResponse
  expect(adjudicated.reviewState).toMatchObject({
    status: 'CHANGES_REQUESTED',
    reviewCount: 2,
    requiredReviewCount: 2,
    consensus: 'CHANGES_REQUESTED',
  })
  expect(adjudicated.reviewState?.resolvedAt).toBeTruthy()
  expect(adjudicated.adjudication).toMatchObject({
    decision: 'CHANGES_REQUESTED',
    adjudicator: { name: fixture.adjudicator.name },
  })

  // Terminal decisions leave the open queue. Re-open the explicit audit filter so the resolved
  // record, both independent decisions and the adjudication remain publicly inspectable.
  await page.goto('/review-queue?status=CHANGES_REQUESTED')
  const resolvedChallengeCard = page.locator('article').filter({ hasText: challengeText })
  await expect(resolvedChallengeCard).toHaveCount(1)
  await expect(
    resolvedChallengeCard.getByText(
      'Reviewers requested changes. The submitted version cannot be edited, and the public record is unchanged.',
    ),
  ).toBeVisible()
  await expect(
    resolvedChallengeCard.getByText('Steward’s final decision: Request changes'),
  ).toBeVisible()
  await expect(resolvedChallengeCard.getByText(fixture.adjudicator.name)).toBeVisible()
  await expect(resolvedChallengeCard.getByText(fixture.reviewers[0]!.name)).toBeVisible()
  await expect(resolvedChallengeCard.getByText(fixture.reviewers[1]!.name)).toBeVisible()

  const resolvedQueue = await readPublicContributionQueue(page, 'CHANGES_REQUESTED')
  const resolvedChallenge = resolvedQueue.proposals?.find(
    (proposal) => proposal.id === challengeSubmitted.id,
  )
  expect(resolvedChallenge?.reviewState).toMatchObject({
    status: 'CHANGES_REQUESTED',
    reviewCount: 2,
    consensus: 'CHANGES_REQUESTED',
  })
  expect(resolvedChallenge?.reviews).toHaveLength(2)
  expect(resolvedChallenge?.adjudication).toMatchObject({
    decision: 'CHANGES_REQUESTED',
    adjudicator: { name: fixture.adjudicator.name },
  })
  expect(await readPublishedProgrammeEvidence(page, fixture)).toEqual(publishedBefore)

  // The original author reopens the real dossier rather than branching from the public queue.
  // Attributed review and adjudication feedback remain attached to frozen revision 1, while the
  // only available mutation is an explicit server-created revision in the same audit lineage.
  await switchFixtureAccount(page, fixture.contributor)
  await page.goto(normalizedDossierUrl(fixture))
  await expect(page.getByRole('heading', { level: 1, name: /^inclisiran$/i })).toBeVisible()
  const { content: revisionContent } = await openAdvancedEvidence(page)
  const revisionContext = waitForContributionContext(page, fixture.programmeSlug)
  await revisionContent.getByRole('button', { name: 'Challenge this answer' }).click()
  expect((await revisionContext).status()).toBe(200)

  const revisionDialog = page.getByRole('dialog', { name: 'Challenge this answer' })
  await expect(revisionDialog).toBeVisible()
  await expect(
    revisionDialog.getByRole('heading', { name: 'Reviewer feedback on version 1' }),
  ).toBeVisible()
  const reviewerFeedback = revisionDialog.getByRole('list', {
    name: 'Independent reviewer feedback',
  })
  await expect(reviewerFeedback).toBeVisible()
  const rejectingReviewer = reviewerFeedback
    .getByRole('listitem')
    .filter({ hasText: fixture.reviewers[1]!.name })
  await expect(rejectingReviewer).toHaveCount(1)
  await expect(rejectingReviewer.getByText('Reviewer 2 · Reject', { exact: true })).toBeVisible()
  await expect(
    rejectingReviewer.getByRole('link', { name: fixture.reviewers[1]!.name }),
  ).toHaveAttribute('href', /^\/u\/playwright-statistics-/)
  await expect(
    rejectingReviewer.getByText(
      'The synthetic proposal is intentionally rejected to exercise disagreement handling.',
    ),
  ).toBeVisible()
  await rejectingReviewer.getByText('Reviewer conflict-of-interest disclosure').click()
  await expect(rejectingReviewer.getByText('None; synthetic Playwright reviewer B.')).toBeVisible()
  await expect(
    revisionDialog.getByText('Steward decision after reviewer disagreement · Changes requested', {
      exact: true,
    }),
  ).toBeVisible()
  await expect(
    revisionDialog.getByRole('link', { name: fixture.adjudicator.name }),
  ).toHaveAttribute('href', /^\/u\/playwright-adjudicator-/)
  await expect(
    revisionDialog.getByText(
      'The synthetic disagreement requires revision before implementation; no medical conclusion is changed.',
    ),
  ).toBeVisible()
  await expect(revisionDialog.getByRole('button', { name: 'Save draft' })).toHaveCount(0)
  await expect(revisionDialog.getByRole('button', { name: 'Submit for review' })).toHaveCount(0)
  await expect(
    revisionDialog.getByText(/Use Revise proposal above to open the next editable version/),
  ).toBeVisible()

  const reviseResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === `/api/contributions/${challengeSubmitted.id}/revise` &&
      response.request().method() === 'POST',
  )
  await revisionDialog.getByRole('button', { name: 'Revise proposal' }).click()
  const reviseHttp = await reviseResponse
  const reviseRaw = await reviseHttp.text()
  expect(reviseHttp.status(), reviseRaw).toBe(201)
  const revisionDraft = requireProposal(JSON.parse(reviseRaw) as ContributionProposalResponse)
  expect(revisionDraft.id).not.toBe(challengeSubmitted.id)
  expect(revisionDraft).toMatchObject({
    proposalKey: challengeSubmitted.proposalKey,
    revisionNumber: 2,
    previousProposalId: challengeSubmitted.id,
    proposalType: 'VERDICT_CHALLENGE',
    status: 'DRAFT',
    proposedText: challengeText,
    contentDigest: null,
  })
  await expect(
    revisionDialog.getByText('Version 2 is now a private draft linked to the earlier review.'),
  ).toBeVisible()
  await expect(
    revisionDialog.getByText(
      'A new editable version is open below. Change it, save the draft, then submit it for a new independent review.',
    ),
  ).toBeVisible()

  const revisedChallengeText =
    `Synthetic Playwright revised conclusion response ${fixture.programmeSlug}; ` +
    'lineage revision 2 is test data, not a medical assertion.'
  const revisedReasoning =
    'This synthetic revision responds to the attributed reviewer note without changing any public medical record.'
  await revisionDialog.getByLabel('What verdict do you propose?').fill(revisedChallengeText)
  await revisionDialog
    .getByLabel('What was wrong or missing in the current reasoning?')
    .fill(revisedReasoning)

  const revisionSaveResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === `/api/contributions/${revisionDraft.id}` &&
      response.request().method() === 'PATCH',
  )
  await revisionDialog.getByRole('button', { name: 'Save draft' }).click()
  const revisionSaveHttp = await revisionSaveResponse
  const revisionSaveRaw = await revisionSaveHttp.text()
  expect(revisionSaveHttp.status(), revisionSaveRaw).toBe(200)
  const savedRevision = requireProposal(JSON.parse(revisionSaveRaw) as ContributionProposalResponse)
  expect(savedRevision).toMatchObject({
    id: revisionDraft.id,
    proposalKey: challengeSubmitted.proposalKey,
    revisionNumber: 2,
    previousProposalId: challengeSubmitted.id,
    status: 'DRAFT',
    proposedText: revisedChallengeText,
  })
  await expect(
    revisionDialog.getByText(
      'Draft saved. It is private to your account until you submit it for review.',
    ),
  ).toBeVisible()

  const queueWhileRevisionIsPrivate = await readPublicContributionQueue(page)
  expect(
    queueWhileRevisionIsPrivate.proposals?.some(
      (proposal) => proposal.proposalKey === challengeSubmitted.proposalKey,
    ),
  ).toBe(false)
  const auditWhileRevisionIsPrivate = await readPublicContributionQueue(page, 'CHANGES_REQUESTED')
  expect(
    auditWhileRevisionIsPrivate.proposals
      ?.filter((proposal) => proposal.proposalKey === challengeSubmitted.proposalKey)
      .map((proposal) => proposal.id),
  ).toEqual([challengeSubmitted.id])
  expect(await readPublishedProgrammeEvidence(page, fixture)).toEqual(publishedBefore)

  // Closing and reopening proves that refresh does not branch the lineage: the server returns the
  // same private revision 2, its edited form state, and the immutable feedback from revision 1.
  await revisionDialog.getByRole('button', { name: 'Close contribution form' }).click()
  await expect(revisionDialog).toBeHidden()
  await page.reload()
  const { content: restoredRevisionContent } = await openAdvancedEvidence(page)
  const restoredRevisionContext = waitForContributionContext(page, fixture.programmeSlug)
  await restoredRevisionContent.getByRole('button', { name: 'Challenge this answer' }).click()
  expect((await restoredRevisionContext).status()).toBe(200)

  const restoredRevisionDialog = page.getByRole('dialog', {
    name: 'Challenge this answer',
  })
  await expect(
    restoredRevisionDialog.getByText(
      'Your latest draft version was restored with the earlier reviewer feedback.',
    ),
  ).toBeVisible()
  await expect(
    restoredRevisionDialog.getByRole('heading', { name: 'Reviewer feedback on version 1' }),
  ).toBeVisible()
  await expect(
    restoredRevisionDialog.getByText(
      'A new editable version is open below. Change it, save the draft, then submit it for a new independent review.',
    ),
  ).toBeVisible()
  await expect(restoredRevisionDialog.getByRole('button', { name: 'Revise proposal' })).toHaveCount(
    0,
  )
  await expect(restoredRevisionDialog.getByLabel('What verdict do you propose?')).toHaveValue(
    revisedChallengeText,
  )
  await expect(
    restoredRevisionDialog.getByLabel('What was wrong or missing in the current reasoning?'),
  ).toHaveValue(revisedReasoning)

  const revisionPatchBeforeSubmit = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === `/api/contributions/${revisionDraft.id}` &&
      response.request().method() === 'PATCH',
  )
  const revisionSubmitResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === `/api/contributions/${revisionDraft.id}/submit` &&
      response.request().method() === 'POST',
  )
  await restoredRevisionDialog.getByRole('button', { name: 'Submit for review' }).click()
  expect((await revisionPatchBeforeSubmit).status()).toBe(200)
  const revisionSubmitHttp = await revisionSubmitResponse
  const revisionSubmitRaw = await revisionSubmitHttp.text()
  expect(revisionSubmitHttp.status(), revisionSubmitRaw).toBe(200)
  const revisedSubmitted = requireProposal(
    JSON.parse(revisionSubmitRaw) as ContributionProposalResponse,
  )
  expect(revisedSubmitted).toMatchObject({
    id: revisionDraft.id,
    proposalKey: challengeSubmitted.proposalKey,
    revisionNumber: 2,
    previousProposalId: challengeSubmitted.id,
    proposalType: 'VERDICT_CHALLENGE',
    status: 'SUBMITTED',
    proposedText: revisedChallengeText,
  })
  expectDeterministicSubmission(revisedSubmitted, 'VERDICT_CHALLENGE')
  expect(revisedSubmitted.contentDigest).not.toBe(challengeSubmitted.contentDigest)
  expect(revisedSubmitted.currentVerdictSnapshot?.id).toBe(publishedVerdictId)
  await expect(
    restoredRevisionDialog.getByText(
      'Submitted for independent human review. The public record has not changed.',
    ),
  ).toBeVisible()

  const defaultQueueAfterRevision = await readPublicContributionQueue(page)
  const openLineage = defaultQueueAfterRevision.proposals?.filter(
    (proposal) => proposal.proposalKey === challengeSubmitted.proposalKey,
  )
  expect(openLineage).toHaveLength(1)
  expect(openLineage?.[0]).toMatchObject({
    id: revisedSubmitted.id,
    proposalKey: challengeSubmitted.proposalKey,
    revisionNumber: 2,
    previousProposalId: challengeSubmitted.id,
    proposedText: revisedChallengeText,
    reviewState: {
      status: 'AWAITING_REVIEWS',
      reviewCount: 0,
      requiredReviewCount: 2,
    },
  })
  expect(
    defaultQueueAfterRevision.proposals?.some((proposal) => proposal.id === challengeSubmitted.id),
  ).toBe(false)

  const terminalAuditAfterRevision = await readPublicContributionQueue(page, 'CHANGES_REQUESTED')
  const terminalLineage = terminalAuditAfterRevision.proposals?.filter(
    (proposal) => proposal.proposalKey === challengeSubmitted.proposalKey,
  )
  expect(terminalLineage).toHaveLength(1)
  expect(terminalLineage?.[0]).toMatchObject({
    id: challengeSubmitted.id,
    revisionNumber: 1,
    previousProposalId: null,
    reviewState: {
      status: 'CHANGES_REQUESTED',
      consensus: 'CHANGES_REQUESTED',
    },
  })
  expect(
    terminalAuditAfterRevision.proposals?.some((proposal) => proposal.id === revisedSubmitted.id),
  ).toBe(false)
  expect(await readPublishedProgrammeEvidence(page, fixture)).toEqual(publishedBefore)

  await restoredRevisionDialog.getByRole('link', { name: 'Open the public review queue' }).click()
  await expect(page).toHaveURL('/review-queue')
  const revisedChallengeCard = page.locator('article').filter({ hasText: revisedChallengeText })
  await expect(revisedChallengeCard).toHaveCount(1)
  await expect(
    revisedChallengeCard.getByText(/^Submitted version 2 · reference [a-f0-9]{16}$/i),
  ).toBeVisible()
  await expect(page.locator('article').filter({ hasText: challengeText })).toHaveCount(0)

  await page.goto('/review-queue?status=CHANGES_REQUESTED')
  const retainedRevisionOneCard = page.locator('article').filter({ hasText: challengeText })
  await expect(retainedRevisionOneCard).toHaveCount(1)
  await expect(
    retainedRevisionOneCard.getByText(/^Submitted version 1 · reference [a-f0-9]{16}$/i),
  ).toBeVisible()
  await expect(page.locator('article').filter({ hasText: revisedChallengeText })).toHaveCount(0)
  expect(await readPublishedProgrammeEvidence(page, fixture)).toEqual(publishedBefore)

  await expectNoSeriousWcagViolations(page, 'Contribution review queue')
  await expectNoHorizontalOverflow(page, 'Contribution review queue')
})

for (const viewport of [
  { label: '320px mobile', width: 320, height: 800 },
  { label: '375px mobile', width: 375, height: 812 },
  { label: '768px tablet', width: 768, height: 900 },
  { label: 'desktop', width: 1280, height: 900 },
]) {
  test(`has no horizontal overflow at ${viewport.label}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await requireInclisiranFixture(page)
    const fixture = requireNormalizedFixture()

    await page.goto('/')
    await expectNoHorizontalOverflow(page, `Homepage at ${viewport.label}`)

    await page.goto(normalizedDossierUrl(fixture))
    await expect(page.getByRole('heading', { level: 1, name: /^inclisiran$/i })).toBeVisible()
    const firstRead = page.getByTestId('ten-second-finding')
    await expect(firstRead).toContainText('dummy treatment')
    await expect(firstRead.getByRole('button')).toHaveCount(0)
    await expect(firstRead.locator('[role="tooltip"]')).toHaveCount(0)
    await expectNoHorizontalOverflow(page, `Collapsed dossier at ${viewport.label}`)

    const { content } = await openAdvancedEvidence(page)
    await expect(content.getByTestId('advanced-study-language')).toHaveCount(0)
    await expect(content.getByTestId('programme-mechanism-stage')).toHaveCount(3)
    await expect(content.getByTestId('programme-timeline-event')).toHaveCount(2)

    const studyCards = content.getByTestId('study-card')
    await expect(studyCards.first()).toBeVisible()
    for (const card of await studyCards.all()) {
      const box = await card.boundingBox()
      expect(box, `Study card has no box at ${viewport.label}`).not.toBeNull()
      expect(box!.x).toBeGreaterThanOrEqual(0)
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1)
    }

    const studyIdentifier = content.getByText('NCT03399370', { exact: true }).first()
    const identifierLines = await studyIdentifier.evaluate((element) =>
      [...element.getClientRects()].filter((rect) => rect.width > 0 && rect.height > 0),
    )
    expect(
      identifierLines.length,
      `The study number wrapped into ${identifierLines.length} lines at ${viewport.label}.`,
    ).toBeLessThanOrEqual(2)

    await expectNoHorizontalOverflow(page, `Expanded dossier at ${viewport.label}`)

    const backgroundControl = page.locator('summary[aria-controls="medicine-background-content"]')
    if ((await backgroundControl.count()) > 0) {
      await backgroundControl.click()
      await expect(page.locator('#medicine-background-content')).toBeVisible()
      await expectNoHorizontalOverflow(page, `Medicine background at ${viewport.label}`)
    }

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
    baseURL: 'http://localhost:3000',
    colorScheme: 'light',
    hasTouch: true,
    reducedMotion: 'reduce',
    viewport: { width: 375, height: 812 },
  })

  try {
    const page = await context.newPage()
    await requireInclisiranFixture(page)
    await page.goto(normalizedDossierUrl(fixture))

    const firstRead = page.getByTestId('ten-second-finding')
    await expect(firstRead).toContainText('LDL (“bad”) cholesterol')
    await expect(firstRead).toContainText('dummy treatment')
    await expect(firstRead.getByRole('button')).toHaveCount(0)
    await expect(firstRead.locator('[role="tooltip"]')).toHaveCount(0)

    const firstReadBox = await firstRead.boundingBox()
    expect(firstReadBox).not.toBeNull()
    expect(firstReadBox!.x).toBeGreaterThanOrEqual(0)
    expect(firstReadBox!.x + firstReadBox!.width).toBeLessThanOrEqual(375)
    await expectNoHorizontalOverflow(page, 'Static mobile first read')
  } finally {
    await context.close()
  }
})
