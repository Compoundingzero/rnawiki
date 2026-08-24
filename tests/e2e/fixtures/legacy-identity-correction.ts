import { randomUUID } from 'node:crypto'

import { config } from 'dotenv'

import { hashPassword } from '../../../lib/auth'

config()

export interface LegacyIdentityCorrectionFixture {
  drugId: string
  slug: string
  originalName: string
  sourceUrl: string
  sourceTitle: string
  author: { id: string; email: string; password: string; name: string }
  reviewer: { id: string; email: string; password: string; name: string }
}

export async function installLegacyIdentityCorrectionFixture(): Promise<LegacyIdentityCorrectionFixture> {
  if (process.env.E2E_DISPOSABLE_DATABASE !== '1') {
    throw new Error(
      'The identity-correction journey requires E2E_DISPOSABLE_DATABASE=1 because its revision history is append-only.',
    )
  }

  const [{ db }, schema] = await Promise.all([import('../../../db'), import('../../../db/schema')])
  const runKey = randomUUID().replaceAll('-', '').slice(0, 12)
  const password = `Playwright-identity-${runKey}-safe!42`
  const passwordHash = await hashPassword(password)
  const drugId = `e2e-legacy-drug-${runKey}`
  const slug = `e2e-legacy-medicine-${runKey}`
  const authorId = `e2e-legacy-author-${runKey}`
  const reviewerId = `e2e-legacy-reviewer-${runKey}`
  const originalName = `Legacy identity fixture ${runKey}`

  await db.transaction(async (tx) => {
    await tx.insert(schema.users).values([
      {
        id: authorId,
        email: `${authorId}@example.test`,
        passwordHash,
        name: 'Playwright identity contributor',
        handle: `identity-contributor-${runKey}`,
      },
      {
        id: reviewerId,
        email: `${reviewerId}@example.test`,
        passwordHash,
        name: 'Playwright identity reviewer',
        handle: `identity-reviewer-${runKey}`,
        trustTier: 'trusted',
      },
    ])
    await tx.insert(schema.drugs).values({
      id: drugId,
      slug,
      name: originalName,
      modality: 'Small Molecule',
      approvalStatus: 'Pre-clinical / Open Source',
      dossierDepth: 'stub',
    })
  })

  return {
    drugId,
    slug,
    originalName,
    sourceUrl: 'https://www.fda.gov/drugs/drug-approvals-and-databases',
    sourceTitle: 'FDA drug approvals and databases',
    author: {
      id: authorId,
      email: `${authorId}@example.test`,
      password,
      name: 'Playwright identity contributor',
    },
    reviewer: {
      id: reviewerId,
      email: `${reviewerId}@example.test`,
      password,
      name: 'Playwright identity reviewer',
    },
  }
}
