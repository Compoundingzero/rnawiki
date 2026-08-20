import { afterAll, describe, expect, it } from 'vitest'
import { eq, inArray } from 'drizzle-orm'
import { db } from '@/db'
import { communityNotes, drugs, users } from '@/db/schema'
import { createNote, listNotesForDrug } from '@/lib/queries/notes'
import { newId } from '@/lib/ids'

/**
 * A physician's verification can be withdrawn — a lapsed licence, or one that was never real. The
 * notes that account already posted are exactly the ones the revocation was meant to stop
 * vouching for, so the badge has to disappear from them too.
 *
 * The specialty and institution on the note stay as they were written: those are a record of what
 * the note was signed with, and rewriting hundreds of old notes because someone changed jobs would
 * be its own kind of dishonesty. Only the badge is live.
 */
describe('the MD badge follows revocation, not the snapshot alone', () => {
  const drugId = `test-drug-${newId('t')}`
  const userId = newId('usr')
  const createdNoteIds: string[] = []

  afterAll(async () => {
    if (createdNoteIds.length > 0) {
      await db.delete(communityNotes).where(inArray(communityNotes.id, createdNoteIds))
    }
    await db.delete(users).where(eq(users.id, userId))
    await db.delete(drugs).where(eq(drugs.id, drugId))
  })

  it('shows the badge while verified and drops it once verification is withdrawn', async () => {
    await db.insert(drugs).values({
      id: drugId,
      slug: drugId,
      name: 'Test Substance',
      modality: 'Small Molecule',
      approvalStatus: 'FDA Approved',
    })

    await db.insert(users).values({
      id: userId,
      email: `${userId}@example.test`,
      passwordHash: 'x',
      name: 'Dr Test Physician',
      handle: userId,
      isDoctor: true,
      medicalSpecialty: 'Cardiologist',
      institution: 'Test Medical Centre',
      verificationState: 'verified',
      verifiedAt: new Date(),
    })

    const note = await createNote({
      drugId,
      author: userId,
      content: 'A clinical observation posted while the account was verified.',
    })
    createdNoteIds.push(note.id)

    const whileVerified = await listNotesForDrug(drugId)
    expect(whileVerified[0]?.isVerifiedDoctor).toBe(true)
    expect(whileVerified[0]?.medicalSpecialty).toBe('Cardiologist')

    // The steward withdraws verification.
    await db
      .update(users)
      .set({ verificationState: 'rejected', verifiedAt: null })
      .where(eq(users.id, userId))

    const afterRevocation = await listNotesForDrug(drugId)
    expect(afterRevocation[0]?.isVerifiedDoctor).toBe(false)
    // The note still records what it was signed with; only the badge is live.
    expect(afterRevocation[0]?.content).toBe(note.content)
    expect(afterRevocation[0]?.author).toBe(note.author)
  })
})
