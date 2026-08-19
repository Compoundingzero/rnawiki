# RNAwiki API contract

Every route below is the single agreed shape between the client components and the route handlers.
Change it in one place and both sides break, so change it here first.

All responses are JSON. Errors are always `{ error: string, code?: string, details?: unknown }` with
a real HTTP status — never a 200 carrying an error body.

Rate limits come from `lib/rate-limit.ts`. A limited request returns 429 with
`Retry-After` in seconds.

## Conventions

- A drug is addressed by its **slug** everywhere. The slug is the public id.
- Authentication is the `rnawiki_session` iron-session cookie. Absent or invalid → 401.
- Any write that needs a verified physician checks `verificationState === 'verified'` server-side.
  A client-supplied `isVerifiedDoctor` is ignored on every path.
- Timestamps are ISO 8601 UTC strings.

---

## Search and read

### `GET /api/search?q=<query>&limit=<n>`
Public. Rate limit PUBLIC_API. `limit` defaults 10, max 25.

```
200 { results: SearchHit[] }
SearchHit = { slug, name, tradeName?, modality, approvalStatus, patientFriendlyIndication,
              dossierDepth }
```
Empty query returns `{ results: [] }` without touching the database.

### `GET /api/drugs/:slug`
Public. Returns the full `DrugDossier` including published community notes.

```
200 { drug: DrugDossier }
404 { error: 'No dossier with that slug' }
```

### `GET /api/drugs?modality=&approvalStatus=&depth=&limit=&offset=`
Public, paginated browse. `limit` max 60.

```
200 { drugs: SearchHit[], total: number, limit: number, offset: number }
```

---

## Accounts

### `POST /api/auth/register`
Body `{ name, email, password, handle?, orcid? }`. Rate limit AUTH.

```
201 { user: PublicUser }
409 { error: 'That email is already registered' }
422 { error, details }   // zod issues
```

### `POST /api/auth/login`
Body `{ email, password }`. Rate limit AUTH. Timing-safe: the same 401 message for an unknown
email and a wrong password.

```
200 { user: PublicUser }
401 { error: 'Email or password is incorrect' }
```

### `POST /api/auth/logout` → `200 { ok: true }`

### `GET /api/auth/me` → `200 { user: PublicUser | null }`

`PublicUser` is `CommentUser` from `lib/types.ts` minus anything sensitive: no password hash, no
raw licence number (send `hasCredentialOnFile: boolean` instead), no email for anyone but the
account owner.

### `POST /api/auth/doctor-verification`
Authenticated. Body `{ fullName, licenseOrNpi, specialty, institution, workEmail }`.
Sets `verificationState = 'pending'`. **It can never set `'verified'`.**

```
202 { user: PublicUser, state: 'pending' }
```
The client must render "Submitted for review", not a verified badge. This is the one place the
wireframe was dishonest — it granted the blue check after a 900 ms timer — and it is corrected
here on purpose.

---

## Community notes

### `POST /api/drugs/:slug/notes`
Authenticated. Rate limit WRITE. Body `{ content }` (1–4000 chars).

```
201 { note: CommunityNote }
401 { error: 'Sign in to post a note' }
```

### `POST /api/notes/:id/upvote`
Authenticated. Toggles. Rate limit WRITE.

```
200 { upvotes: number, hasUpvoted: boolean }
```

---

## Edits — the RNA Intelligence pipeline

### `POST /api/drugs/:slug/sweep`
Authenticated. Rate limit WRITE. Runs the deterministic sweep WITHOUT saving, so the editor can
show live diagnostics as the contributor types.

Body `{ structureString, modality, workflow: LaboratoryProtocolStep[], cdnaMode? }`

```
200 { report: RnaIntelligenceReport }
```

### `POST /api/drugs/:slug/revisions`
Authenticated. Rate limit WRITE. Body `{ payload: Partial<DrugDossier>, summary }`.

Server-side sequence, in this exact order:
1. Run the full deterministic sweep on the submitted structure and workflow.
2. **Engine failure → instant rejection.** Persist a `machine_rejected` revision for the audit
   trail and return 422 with the diagnostics. It is never queued for a human.
3. Engine pass → trust-tier check (`lib/trust.ts`). `trusted`/`steward`/admin publish immediately;
   everyone else lands in the public review queue as `pending_review`.

```
200 { outcome: 'published', revisionId, drug: DrugDossier, report }
202 { outcome: 'pending_review', revisionId, report, queuePosition }
422 { outcome: 'machine_rejected', revisionId, report, error: <first error message> }
```

### `GET /api/review-queue?limit=&offset=`
Public — the queue is public by design.

```
200 { revisions: PendingRevision[], total }
PendingRevision = { id, drugSlug, drugName, authorName, authorHandle?, authorTrustTier,
                    summary, changedFields, machineVerified, verificationHash, createdAt }
```

### `POST /api/revisions/:id/review`
Requires `trusted` tier or admin. Body `{ decision: 'approve' | 'reject', note? }`.
Idempotent: reviewing an already-reviewed revision returns 409, never a second increment.

```
200 { revision, drug? }
409 { error: 'That revision has already been reviewed' }
```

---

## Feedback

### `POST /api/feedback`
Public. Rate limit FEEDBACK, keyed on `sessionHash` (never the raw IP).
Body `{ type: 'suggestion' | 'correction' | 'request', message, email?, drugSlug? }`.

```
201 { ok: true }
```

---

## Bookmarks

### `POST /api/drugs/:slug/save` — authenticated, toggles. `200 { saved: boolean }`
### `GET /api/me/saved` — authenticated. `200 { drugs: SearchHit[] }`
