# RNAwiki public API (v1)

A free, read-only, no-auth JSON API over the same published content the site itself renders.
It exposes only what has gone through editorial publication — no drafts, no reviewer notes, no
internal database ids beyond the ones already public on the site (entity slugs, and the claim
numeric id already used in `/embed/claim/[id]`).

All responses are `application/json`. All endpoints allow cross-origin requests
(`Access-Control-Allow-Origin: *`) and are cacheable — expect
`Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400` on success, `no-store` on
errors.

**Rate limit:** 60 requests/minute per IP, enforced in-memory per server instance
(see "Limitations" below). Exceeding it returns `429` with `{"error": "Too many requests. Please slow down."}`.

**Not found:** a slug/id that doesn't exist and a slug/id that exists but isn't published return
the *same* `404 {"error": "Not found"}` — the API never reveals that unpublished content exists.

---

## The claim shape

Both `GET /api/v1/entities/[slug]` (nested, one per claim) and `GET /api/v1/claims/[claimId]`
(a single claim) return claims in this exact shape:

| field | type | meaning |
|---|---|---|
| `directAnswer` | string | The 1–2 sentence consumer-facing answer, caveat included. |
| `measuredFinding` | string | What was actually, directly measured. |
| `inference` | string | What people conclude from that finding, made explicit and separated from the measurement. |
| `proofBoundaryStage` | string | Machine key — one of `biological_rationale_only`, `isolated_cell_evidence`, `animal_evidence`, `observational_human_evidence`, `uncontrolled_human_intervention`, `controlled_human_evidence`, `independently_supported_controlled_human_evidence`, `regulatory_evidence` (weakest → strongest). |
| `proofBoundaryStageLabel` | string | Human-readable label for `proofBoundaryStage` (e.g. "Controlled human evidence"). |
| `evidenceContext` | array | One entry per linked evidence source: `{ relationship, relationshipLabel, claimPartAddressed, directlyMeasuredResult, independentGroupStatus }`. `relationship` is one of `supports`, `contradicts`, `limits`, `contextualizes`. `independentGroupStatus` is a boolean. |
| `sourceLinks` | array | One entry per evidence source that has at least one public link: `{ doi, pmid, regulatoryUrl }` (each nullable — only non-null fields are meaningful). Internal source/database ids are never included. |
| `lastReviewedAt` | string \| null | ISO 8601 timestamp of the claim's last scientific review, or `null` if not yet reviewed. |
| `canonicalUrl` | string | The permanent, citable URL for this claim on the site (an entity page anchor). |

No other fields are exposed on a claim — in particular, no reviewer name/credentials, no
publication-status/workflow state, no `remainingUnknown`/`evidenceNeededNext` editorial-process
fields, and no evidence source metadata beyond the three link fields above.

---

## `GET /api/v1/entities/[slug]`

Returns one published entity with all of its published claims nested.

**Path parameter:** `slug` — the entity's URL slug (same as `/r/[slug]` on the site).

### Response (200)

```json
{
  "canonicalName": "Ring Energy",
  "slug": "example-entity",
  "aliases": ["Alt Name"],
  "entityType": "supplement_ingredient",
  "shortDescription": "One-sentence description.",
  "bottomLine": "2-3 sentence plain-language bottom line, caveat included.",
  "regulatoryCategory": "dietary_supplement",
  "canonicalUrl": "https://rnawiki.com/r/example-entity",
  "updatedAt": "2026-06-01T00:00:00.000Z",
  "regulatoryStatuses": [
    {
      "jurisdiction": "United States",
      "legalCategory": "dietary_supplement",
      "approvedIndications": null,
      "statusStatement": "Sold as a dietary supplement; not FDA-approved to treat any condition.",
      "source": "https://www.fda.gov/...",
      "checkedDate": "2026-05-01T00:00:00.000Z"
    }
  ],
  "claims": [
    {
      "directAnswer": "...",
      "measuredFinding": "...",
      "inference": "...",
      "proofBoundaryStage": "controlled_human_evidence",
      "proofBoundaryStageLabel": "Controlled human evidence",
      "evidenceContext": [
        {
          "relationship": "supports",
          "relationshipLabel": "Supports",
          "claimPartAddressed": "...",
          "directlyMeasuredResult": "...",
          "independentGroupStatus": true
        }
      ],
      "sourceLinks": [{ "doi": "10.1000/xyz123", "pmid": "12345678", "regulatoryUrl": null }],
      "lastReviewedAt": "2026-06-01T00:00:00.000Z",
      "canonicalUrl": "https://rnawiki.com/r/example-entity#claim-tendon-healing"
    }
  ]
}
```

### Errors

- `404 {"error": "Not found"}` — no such entity, or it exists but isn't published.
- `429` — rate-limited.

### Example

```bash
curl -s https://rnawiki.com/api/v1/entities/example-entity
```

---

## `GET /api/v1/claims/[claimId]`

Returns a single published claim, in the exact shape described above (with no wrapping entity
object — dereference `canonicalUrl` for full page context).

**Path parameter:** `claimId` — the claim's numeric id.

### Response (200)

```json
{
  "directAnswer": "...",
  "measuredFinding": "...",
  "inference": "...",
  "proofBoundaryStage": "controlled_human_evidence",
  "proofBoundaryStageLabel": "Controlled human evidence",
  "evidenceContext": [],
  "sourceLinks": [],
  "lastReviewedAt": null,
  "canonicalUrl": "https://rnawiki.com/r/example-entity#claim-tendon-healing"
}
```

### Errors

- `404 {"error": "Not found"}` — no such claim, the claim isn't published, or its entity isn't published.
- `429` — rate-limited.

### Example

```bash
curl -s https://rnawiki.com/api/v1/claims/42
```

---

## `GET /api/v1/search?q=...`

Simple substring search (case-insensitive `ILIKE`) over published entities
(`canonicalName`/`aliases`) and published claims (`consumerQuestion`). Returns up to 10 entity
matches and 10 claim matches, entities first.

This is a deliberately minimal, self-contained implementation independent of the site's main
search (`lib/search.ts`), which does full-text + typo-tolerant ranking for the human `/search`
page. **The two should eventually be unified** so the API and the site rank results the same way
— they currently don't.

**Query parameter:** `q` — required, trimmed, truncated to 200 characters.

### Response (200)

```json
{
  "query": "tendon",
  "results": [
    {
      "type": "entity",
      "canonicalName": "Example Peptide",
      "slug": "example-peptide",
      "shortDescription": "...",
      "canonicalUrl": "https://rnawiki.com/r/example-peptide"
    },
    {
      "type": "claim",
      "id": 42,
      "consumerQuestion": "Does it improve tendon healing?",
      "directAnswer": "...",
      "proofBoundaryStage": "animal_evidence",
      "proofBoundaryStageLabel": "Animal evidence",
      "entityName": "Example Peptide",
      "entitySlug": "example-peptide",
      "canonicalUrl": "https://rnawiki.com/r/example-peptide#claim-tendon-healing"
    }
  ]
}
```

`results` is a flat array; check `type` to tell entity and claim results apart.

### Errors

- `400 {"error": "Query parameter \"q\" is required."}` — missing/empty `q`.
- `429` — rate-limited.

### Example

```bash
curl -s "https://rnawiki.com/api/v1/search?q=tendon"
```

---

## Known limitations (by design, for now)

- **Rate limiting is per-instance, in-memory** (`lib/rate-limit.ts`). It resets on every deploy
  and isn't shared across replicas — correct for a single running instance, not for multi-instance
  scale. A shared store (e.g. Redis) would be needed for that.
- **Search is a separate implementation from `lib/search.ts`** by design (see above), so results
  and ranking can differ from the human search page until the two are unified.
