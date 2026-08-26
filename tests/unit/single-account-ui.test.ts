import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

describe('one-account public product surface', () => {
  it('offers one generic account flow with resilient session reconciliation', () => {
    const auth = source('components/AuthModal.tsx')
    const header = source('components/SiteHeader.tsx')
    const shell = source('components/AppShell.tsx')

    expect(shell).toContain("from './AuthModal'")
    expect(auth).toContain('Use one account to comment and propose edits')
    expect(auth).toContain('acceptedAccountTransitionRef')
    expect(auth).toContain('const reconciledUser = await refreshUser()')
    expect(header).toContain('aria-label={`Account for ${currentUser.name}`}')

    for (const removed of [
      'DoctorVerificationModal',
      'Physician verification',
      'Verified Physician',
      'submitDoctorVerification',
      'isVerifiedPhysician',
    ]) {
      expect(`${auth}\n${header}\n${shell}`).not.toContain(removed)
    }
  })

  it('shows contribution identity without credential or saved-medicine surfaces', () => {
    const account = source('components/AccountModal.tsx')
    const commentary = source('components/CommunityCommentary.tsx')
    const profile = source('app/u/[handle]/page.tsx')

    expect(account).toContain('One account for every contributor')
    expect(account).toContain('accepted edits remain attributed to you in the public history')
    expect(commentary).toContain('note.authorHandle')
    expect(commentary).toContain('/u/${encodeURIComponent(note.authorHandle)}')
    expect(commentary).toContain('Notes from signed-in contributors')

    for (const removed of [
      'Saved medicines',
      'savedDrugs',
      'Verified physician',
      'medicalSpecialty',
      'verificationState',
      'isVerifiedDoctor',
    ]) {
      expect(`${account}\n${commentary}\n${profile}`).not.toContain(removed)
    }
  })

  it('has no public physician-submission or review routes', () => {
    for (const path of [
      'app/api/auth/doctor-verification/route.ts',
      'app/api/physician-verifications/route.ts',
      'app/api/physician-verifications/[id]/route.ts',
      'app/api/physician-verifications/[id]/decision/route.ts',
      'app/review-queue/PhysicianVerificationReviewPanel.tsx',
      'components/DoctorVerificationModal.tsx',
    ]) {
      expect(existsSync(join(process.cwd(), path)), path).toBe(false)
    }

    expect(source('app/review-queue/page.tsx')).not.toContain('PhysicianVerificationReviewPanel')
    expect(source('lib/api-client.ts')).not.toContain('submitDoctorVerification')
  })

  it('keeps physician-era database data out of live account and profile projections', () => {
    const projectionSources = [
      source('lib/session.ts'),
      source('lib/api-response.ts'),
      source('app/u/[handle]/page.tsx'),
    ].join('\n')

    for (const removed of [
      'hasCredentialOnFile',
      'medicalSpecialty',
      'verificationState',
      'isVerifiedDoctor',
    ]) {
      expect(projectionSources).not.toContain(removed)
    }
  })
})
