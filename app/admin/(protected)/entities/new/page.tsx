import type { Metadata } from 'next'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { createEntity } from '../actions'
import { EntityForm } from '../EntityForm'

export const metadata: Metadata = { title: 'New entity', robots: { index: false, follow: false } }

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function NewEntityPage({ searchParams }: Props) {
  const [{ error }, user] = await Promise.all([searchParams, getCurrentUser()])

  return (
    <div className="admin-page">
      <p className="metaline" style={{ marginBottom: 'var(--s4)' }}>
        <Link href="/admin/entities">← Entities</Link>
      </p>
      <h1 className="h1" style={{ marginBottom: 'var(--s5)' }}>
        New entity
      </h1>

      {error && (
        <div className="callout" data-tone="danger" role="alert" style={{ marginBottom: 'var(--s5)' }}>
          <p className="callout__title">Not saved</p>
          <p style={{ fontSize: 'var(--size-small)' }}>{error}</p>
        </div>
      )}

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
  )
}
