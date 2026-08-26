import { afterAll, describe, expect, it, vi } from 'vitest'

const { cookieJar } = vi.hoisted(() => ({ cookieJar: new Map<string, string>() }))

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = cookieJar.get(name)
      return value === undefined ? undefined : { name, value }
    },
    set: (name: string, value: string) => cookieJar.set(name, value),
    delete: (name: string) => cookieJar.delete(name),
  }),
}))

import { eq, inArray } from 'drizzle-orm'

import { POST as postNote } from '@/app/api/drugs/[slug]/notes/route'
import { db } from '@/db'
import { communityNotes, drugs, users } from '@/db/schema'
import { newId } from '@/lib/ids'
import { listNotesByUser, listNotesForDrug } from '@/lib/queries/notes'
import { resetRateLimits } from '@/lib/rate-limit'
import { signIn } from '@/lib/session'

describe('community-note attribution', () => {
  const drugId = newId('drug')
  const slug = `note-attribution-${drugId}`
  const authorId = newId('usr')
  const forgedAuthorId = newId('usr')
  const noteIds: string[] = []

  afterAll(async () => {
    if (noteIds.length > 0) {
      await db.delete(communityNotes).where(inArray(communityNotes.id, noteIds))
    }
    await db.delete(drugs).where(eq(drugs.id, drugId))
    await db.delete(users).where(inArray(users.id, [authorId, forgedAuthorId]))
    cookieJar.clear()
    resetRateLimits()
  })

  it('takes the author from the server session, keeps the saved name, and joins the current handle', async () => {
    await db.insert(drugs).values({
      id: drugId,
      slug,
      name: 'Attribution test medicine',
      modality: 'Small Molecule',
      approvalStatus: 'Pre-clinical / Open Source',
    })
    await db.insert(users).values([
      {
        id: authorId,
        email: `${authorId}@example.test`,
        passwordHash: 'not-used',
        name: 'Actual note author',
        handle: `actual-${authorId}`.slice(0, 64),
        orcid: '0000-0002-1825-0097',
      },
      {
        id: forgedAuthorId,
        email: `${forgedAuthorId}@example.test`,
        passwordHash: 'not-used',
        name: 'Body-supplied forged author',
        handle: `forged-${forgedAuthorId}`.slice(0, 64),
      },
    ])

    await signIn(authorId)
    resetRateLimits()
    const response = await postNote(
      new Request(`http://localhost/api/drugs/${slug}/notes`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': '203.0.113.90',
          'user-agent': 'vitest-note-attribution',
        },
        body: JSON.stringify({
          content: 'This note must be attributed to the signed-in account.',
          author: forgedAuthorId,
          authorUserId: forgedAuthorId,
          authorName: 'Forged display name',
          authorHandle: `forged-${forgedAuthorId}`,
          role: 'Physician',
          isVerifiedDoctor: true,
          medicalSpecialty: 'Forged specialty',
          institution: 'Forged institution',
        }),
      }),
      { params: Promise.resolve({ slug }) },
    )
    expect(response.status).toBe(201)
    const body = (await response.json()) as { note: Record<string, unknown> }
    const note = body.note
    noteIds.push(String(note.id))
    expect(note).toMatchObject({
      author: 'Actual note author',
      authorHandle: `actual-${authorId}`.slice(0, 64),
      authorUserId: authorId,
      role: 'Community contributor',
      content: 'This note must be attributed to the signed-in account.',
      orcid: '0000-0002-1825-0097',
    })
    expect(note).not.toHaveProperty('isVerifiedDoctor')
    expect(note).not.toHaveProperty('medicalSpecialty')
    expect(note).not.toHaveProperty('institution')
    expect(note).not.toHaveProperty('verifiedBadge')

    const storedRows = await db
      .select({
        authorUserId: communityNotes.authorUserId,
        authorName: communityNotes.authorName,
        role: communityNotes.role,
        isVerifiedDoctor: communityNotes.isVerifiedDoctor,
      })
      .from(communityNotes)
      .where(eq(communityNotes.id, String(note.id)))
    expect(storedRows[0]).toEqual({
      authorUserId: authorId,
      authorName: 'Actual note author',
      role: 'Community contributor',
      isVerifiedDoctor: false,
    })

    const currentHandle = `renamed-${authorId}`.slice(0, 64)
    await db
      .update(users)
      .set({ name: 'Later account display name', handle: currentHandle })
      .where(eq(users.id, authorId))

    const [dossierNotes, profileNotes] = await Promise.all([
      listNotesForDrug(drugId),
      listNotesByUser(authorId, 10),
    ])
    for (const projected of [dossierNotes[0], profileNotes[0]]) {
      expect(projected).toMatchObject({
        author: 'Actual note author',
        authorHandle: currentHandle,
        authorUserId: authorId,
        role: 'Community contributor',
      })
    }

    await db.delete(users).where(eq(users.id, authorId))
    const afterAccountDeletion = await listNotesForDrug(drugId)
    expect(afterAccountDeletion[0]).toMatchObject({
      author: 'Actual note author',
      role: 'Community contributor',
    })
    expect(afterAccountDeletion[0]).not.toHaveProperty('authorHandle')
    expect(afterAccountDeletion[0]).not.toHaveProperty('authorUserId')
  })
})
