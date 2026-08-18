import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/db'
import { entities } from '@/db/schema'
import { getCurrentUser } from '@/lib/auth'
import { createClaim } from '../actions'
import { ClaimForm } from '../ClaimForm'
import * as ui from '@/lib/admin/ui'

export const metadata: Metadata = { title: 'New claim', robots: { index: false, follow: false } }

interface Props {
  searchParams: Promise<{ error?: string; entityId?: string }>
}

async function getEntityOptions() {
  return db.select({ id: entities.id, canonicalName: entities.canonicalName }).from(entities).orderBy(entities.canonicalName)
}

export default async function NewClaimPage({ searchParams }: Props) {
  const [{ error, entityId }, entityOptions, user] = await Promise.all([searchParams, getEntityOptions(), getCurrentUser()])
  const preselected = entityId ? Number.parseInt(entityId, 10) : ''

  return (
    <div style={ui.page}>
      <p style={{ marginBottom: 'var(--space-2)' }}>
        <Link href="/admin/claims">← Claims</Link>
      </p>
      <h1 style={ui.h1}>New claim</h1>

      {error && <p style={ui.errorBanner}>{error}</p>}

      {entityOptions.length === 0 ? (
        <p style={{ color: 'var(--color-text-faint)' }}>
          No entities exist yet. <Link href="/admin/entities/new">Create an entity</Link> first.
        </p>
      ) : (
        <div style={ui.sectionCard}>
          <ClaimForm
            action={createClaim}
            entityOptions={entityOptions}
            canPublish={user?.role === 'administrator'}
            submitLabel="Create claim"
            values={{
              entityId: Number.isFinite(preselected) ? (preselected as number) : '',
              slug: '',
              claimType: 'effectiveness',
              consumerQuestion: '',
              directAnswer: '',
              measuredFinding: '',
              inference: '',
              proofBoundaryStage: 'biological_rationale_only',
              proofBoundaryExplanation: '',
              remainingUnknown: '',
              evidenceNeededNext: '',
              mechanismSummary: '',
              outcomeSummary: '',
              publicationStatus: 'draft',
              displayPriority: 0,
            }}
          />
        </div>
      )}
    </div>
  )
}
