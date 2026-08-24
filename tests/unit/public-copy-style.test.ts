import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const ACTIVE_PUBLIC_COPY_FILES = [
  'app/how-it-works/page.tsx',
  'app/review-queue/page.tsx',
  'app/review-queue/CanonicalPublicationPanel.tsx',
  'app/review-queue/ContributionReviewPanel.tsx',
  'app/review-queue/FeedbackReviewPanel.tsx',
  'app/review-queue/PhysicianVerificationReviewPanel.tsx',
  'app/review-queue/ReviewerQualificationPanel.tsx',
  'app/review-queue/SourceRefreshAuthoringPanel.tsx',
  'components/DossierContributionActions.tsx',
  'components/LegacyIdentityCorrectionActions.tsx',
  'components/HomeSearch.tsx',
  'components/HomeView.tsx',
  'components/MedicineDossierV2.tsx',
  'components/MedicineRecordContextSections.tsx',
  'components/CommunityCommentary.tsx',
  'components/QuickGuideButton.tsx',
  'components/QuickGuideModal.tsx',
  'components/AccountModal.tsx',
  'components/DoctorVerificationModal.tsx',
  'components/FeedbackModal.tsx',
  'components/SiteFooter.tsx',
  'components/SiteHeader.tsx',
  'app/browse/page.tsx',
  'app/d/[slug]/history/page.tsx',
  'app/d/[slug]/programme/[programme]/history/page.tsx',
  'app/u/[handle]/page.tsx',
  'app/page.tsx',
  'app/error.tsx',
  'app/global-error.tsx',
  'app/not-found.tsx',
  'components/AdvancedEvidenceDisclosure.tsx',
  'components/MedicineBackgroundDisclosure.tsx',
  'components/MedicineContextDisclosure.tsx',
  'lib/public-medicine-context.ts',
  'lib/public-medicine-language.ts',
  'docs/dossier-v2-product-spec.md',
] as const

const PRESENTATION_PUBLIC_COPY_FILES = [
  'components/MedicineDossierV2.tsx',
  'app/review-queue/CanonicalPublicationPanel.tsx',
  'app/d/[slug]/programme/[programme]/history/page.tsx',
] as const

// Product-spec section 27 explicitly bans these vague promotional words from new UI copy.
const GENERATED_COPY_WORDS = [
  'delve',
  'unlock',
  'revolutionary',
  'cutting-edge',
  'game-changing',
  'seamless',
  'empower',
  'harness',
  'journey',
  'landscape',
  'groundbreaking',
  'robust',
  'science-backed',
  'clinically proven',
  'state-of-the-art',
  'next-generation',
  'transformative',
  'holistic',
  'leverage',
  'utilize',
  'paradigm',
  'synergy',
  'actionable insight',
  'deep dive',
  'at scale',
  'ai-powered',
  'best-in-class',
  'effortless',
  'future-ready',
  'next-level',
  'world-class',
] as const

describe('public copy style', () => {
  it('keeps the simple home-page promise unchanged', () => {
    const source = readFileSync(join(process.cwd(), 'components/HomeView.tsx'), 'utf8')
    expect(source).toContain('Understand any drug')
    expect(source).toContain('10 seconds')
  })

  it('describes exact registry-delta limits without implying medical safety', () => {
    const source = readFileSync(join(process.cwd(), 'app/review-queue/page.tsx'), 'utf8')
    expect(source).toContain('What the contributor could and could not change')
    expect(source).toContain('Registry fields read by RNAWiki')
    expect(source).toContain('Saved comparison reference')
    expect(source).toContain('Exact registry facts only')
    expect(source).toContain('RNAWiki’s software produced every before-and-after value')
    expect(source).not.toContain('Why this is safe to review')
    expect(source).not.toContain('Parser-derived registry update')
    expect(source).not.toContain('official registry parser')
  })

  it('uses reader-safe history and general-research labels', () => {
    const history = readFileSync(join(process.cwd(), 'app/d/[slug]/history/page.tsx'), 'utf8')
    const specification = readFileSync(
      join(process.cwd(), 'docs/dossier-v2-product-spec.md'),
      'utf8',
    )
    expect(history).toContain('introduced stricter source and review safeguards')
    expect(history).not.toContain('safety upgrade')
    for (const label of [
      'General research summary',
      'What the research reports',
      'No reviewed answer yet',
    ]) {
      expect(specification).toContain(label)
    }
    expect(specification).not.toContain('What the older record says')
    expect(specification).not.toContain('Older medicine-wide summary')
    expect(specification).not.toContain('legacy/not-audited')
  })

  it.each(ACTIVE_PUBLIC_COPY_FILES)('%s avoids vague generated-sounding language', (file) => {
    const source = readFileSync(join(process.cwd(), file), 'utf8').toLowerCase()
    for (const phrase of GENERATED_COPY_WORDS) {
      expect(source, `${file} contains banned phrase “${phrase}”`).not.toContain(phrase)
    }
  })

  it.each([
    'app/review-queue/page.tsx',
    'app/review-queue/CanonicalPublicationPanel.tsx',
    'app/review-queue/ReviewerQualificationPanel.tsx',
    'app/review-queue/SourceRefreshAuthoringPanel.tsx',
    'components/DossierContributionActions.tsx',
    'components/LegacyIdentityCorrectionActions.tsx',
  ])('%s uses the RNAWiki product casing', (file) => {
    const source = readFileSync(join(process.cwd(), file), 'utf8')
    expect(source, `${file} contains the incorrect product casing “RNAwiki”`).not.toContain(
      'RNAwiki',
    )
  })

  it.each(PRESENTATION_PUBLIC_COPY_FILES)(
    '%s explains presentation evidence and dates without exposing stored codes',
    (file) => {
      const source = readFileSync(join(process.cwd(), file), 'utf8')

      for (const label of ['Date occurred', 'Planned date', 'Date reported; timing unclear']) {
        expect(source, `${file} must include the ordinary-language label “${label}”`).toContain(
          label,
        )
      }
      if (file === 'components/MedicineDossierV2.tsx') {
        expect(source).toContain('This step was measured in people')
        expect(source).toContain('This step was measured only in laboratory or non-human work')
        expect(source).toContain('This step is still a prediction')
        expect(source).toContain('It is not yet known whether this step happens')
        expect(source).toContain('Human reviewers decide what the science means')
      } else {
        for (const label of [
          'Measured in people',
          'Measured outside people',
          'Predicted',
          'Not yet known',
        ]) {
          expect(source, `${file} must include the ordinary-language label “${label}”`).toContain(
            label,
          )
        }
        expect(source).toContain('comes from a human study')
        expect(source).toContain('comes from laboratory or non-human work')
      }
      expect(source).toMatch(
        /(?:“planned date” is a schedule, not a completed event|planned date is a schedule, not something that has already happened|a future date is a plan—not proof that it happened)/,
      )
    },
  )
})
