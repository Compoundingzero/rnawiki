import type { Metadata } from 'next'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { createEntity } from '../actions'
import { EntityForm } from '../EntityForm'
import * as ui from '@/lib/admin/ui'

export const metadata: Metadata = { title: 'New entity', robots: { index: false, follow: false } }

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function NewEntityPage({ searchParams }: Props) {
  const [{ error }, user] = await Promise.all([searchParams, getCurrentUser()])

  return (
    <div style={ui.page}>
      <p style={{ marginBottom: 'var(--space-2)' }}>
        <Link href="/admin/entities">← Entities</Link>
      </p>
      <h1 style={ui.h1}>New entity</h1>

      {error && <p style={ui.errorBanner}>{error}</p>}

      <div style={ui.sectionCard}>
        <EntityForm
          action={createEntity}
          canPublish={user?.role === 'administrator'}
          submitLabel="Create entity"
          values={{
            canonicalName: '',
            slug: '',
            aliases: '',
            entityType: 'peptide',
            shortDescription: '',
            bottomLine: '',
            regulatoryCategory: 'unapproved_therapeutic_substance',
            accessRealityNote: '',
            publicationStatus: 'draft',
          }}
        />
      </div>
    </div>
  )
}
