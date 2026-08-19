import { test, expect } from '@playwright/test'
import { SEEDED_SLUGS } from './fixtures/seeded-entities'

test.describe('standalone claim embed', () => {
  test('/embed/claim/[id] renders standalone (no header/footer/nav) for a published claim', async ({ page }) => {
    const entityResponse = await page.goto(`/r/${SEEDED_SLUGS.bpc157}`)
    test.skip(
      !entityResponse || !entityResponse.ok(),
      `Entity "${SEEDED_SLUGS.bpc157}" is not seeded/published yet — skipping until seed data lands.`
    )

    // Resolve the claim id from the record page itself, via the "Download record as JSON" link the
    // Evidence Record's utilities panel renders at /api/v1/claims/{id}.
    //
    // This used to hardcode claim id 1 and skip with "not implemented yet" when that 404'd. The
    // route has been implemented the whole time — serial ids simply start wherever the last reseed
    // left them (233 at the time of writing), so the probe always missed and the test always
    // skipped, reporting a working route as missing work. The entity API deliberately does not
    // expose numeric claim ids, so the rendered link is the correct source. Nothing is hidden here:
    // the link is server-rendered inside a closed <details>, which is still in the DOM.
    const jsonLink = page.locator('a[href^="/api/v1/claims/"]').first()
    await expect(jsonLink).toHaveCount(1)
    const jsonHref = await jsonLink.getAttribute('href')
    const claimId = jsonHref?.split('/').pop()
    expect(claimId, 'could not resolve a claim id from the record page').toMatch(/^\d+$/)

    const response = await page.goto(`/embed/claim/${claimId}`)
    expect(response?.ok(), `/embed/claim/${claimId} did not render`).toBe(true)

    // Standalone: no site header ("RNAwiki" home link / "Primary" nav) and no site footer.
    await expect(page.getByRole('navigation', { name: 'Primary' })).toHaveCount(0)
    await expect(page.locator('footer')).toHaveCount(0)

    // But the claim content itself is present.
    await expect(page.locator('body')).not.toBeEmpty()
  })

  /**
   * The embed is the only surface that renders inside pages RNAwiki does not control, and it was
   * the one surface the evidence-position guard missed: it rendered the ladder for every claim
   * type, so "What does actually getting treated with Casgevy involve?" — a logistics question —
   * syndicated a rail filled to "a medicines regulator reviewed the evidence and approved it".
   * Every other call site wraps EvidenceReach in stagePositionApplies(); this asserts the embed
   * does too, in both directions, so the guard cannot be dropped again without a failure.
   */
  test('the evidence ladder is shown only for claim types that have an evidence position', async ({ page, request }) => {
    const entityResponse = await page.goto(`/r/${SEEDED_SLUGS.casgevy}`)
    test.skip(
      !entityResponse || !entityResponse.ok(),
      `Entity "${SEEDED_SLUGS.casgevy}" is not seeded/published yet — skipping until seed data lands.`
    )

    // Read every id off the record page BEFORE navigating anywhere: the loop below navigates to
    // each embed in turn, and a locator bound to the record page stops resolving the moment the
    // first goto() replaces the document.
    const hrefs = await page.locator('a[href^="/api/v1/claims/"]').evaluateAll((els) =>
      els.map((el) => (el as HTMLAnchorElement).getAttribute('href') ?? '')
    )
    test.skip(hrefs.length === 0, 'No published claims on this record yet.')

    let checkedWithPosition = 0
    let checkedWithout = 0

    for (const href of hrefs) {
      const claimId = href.split('/').pop()
      expect(claimId, 'could not resolve a claim id from the record page').toMatch(/^\d+$/)

      // The API is the source of truth for whether a position applies — it calls the same
      // stagePositionApplies() the pages do, and exposes the answer as evidencePositionApplies.
      const api = await request.get(`/api/v1/claims/${claimId}`)
      expect(api.ok(), `/api/v1/claims/${claimId} did not respond`).toBe(true)
      const claim = await api.json()
      expect(
        typeof claim.evidencePositionApplies,
        'the API no longer reports evidencePositionApplies'
      ).toBe('boolean')

      const embed = await page.goto(`/embed/claim/${claimId}`)
      expect(embed?.ok(), `/embed/claim/${claimId} did not render`).toBe(true)
      const ladders = await page.locator('.reach').count()

      if (claim.evidencePositionApplies) {
        expect(ladders, `claim ${claimId} (${claim.claimType}) should show an evidence position`).toBe(1)
        checkedWithPosition++
      } else {
        expect(ladders, `claim ${claimId} (${claim.claimType}) must not show an evidence position`).toBe(0)
        checkedWithout++
      }
    }

    // Casgevy carries both kinds, so a run that only ever saw one side proves nothing.
    expect(checkedWithPosition, 'no positioned claim was exercised').toBeGreaterThan(0)
    expect(checkedWithout, 'no non-positioned claim was exercised').toBeGreaterThan(0)
  })
})
