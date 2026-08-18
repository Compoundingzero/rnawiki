# RNAwiki public API (v1)

Free, read-only, no auth. It serves only published content — no drafts, no reviewer notes, no
internal ids beyond what the site already exposes (entity slugs, and the claim numeric id used in
`/embed/claim/[id]`).

- All responses are `application/json`, all endpoints allow any origin
  (`Access-Control-Allow-Origin: *`).
- Success is cacheable: `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`.
  Errors are `no-store`.
- **Rate limit:** 60 requests/minute per IP. Over it returns `429`
  `{"error": "Too many requests. Please slow down."}`.
- **Not found:** a missing slug/id and an unpublished one return the same
  `404 {"error": "Not found"}`. The API never reveals that unpublished content exists.

## The claim shape

Returned by both endpoints below — nested per claim by the entity endpoint, bare by the claim
endpoint.

| field | type | meaning |
|---|---|---|
| `directAnswer` | string | The 1–2 sentence consumer-facing answer, caveat included. |
| `measuredFinding` | string | What was directly measured. |
| `inference` | string | What people conclude from that finding, stated separately from the measurement. |
| `proofBoundaryStage` | string | Machine key, weakest → strongest: `biological_rationale_only`, `isolated_cell_evidence`, `animal_evidence`, `observational_human_evidence`, `uncontrolled_human_intervention`, `controlled_human_evidence`, `independently_supported_controlled_human_evidence`, `regulatory_evidence`. Defined in [`docs/evidence-classification.md`](evidence-classification.md). |
| `proofBoundaryStageLabel` | string | Human-readable label, e.g. "Controlled human evidence". |
| `evidenceContext` | array | One entry per linked source: `{ relationship, relationshipLabel, claimPartAddressed, directlyMeasuredResult, independentGroupStatus }`. `relationship` is `supports`, `contradicts`, `limits` or `contextualizes`; `independentGroupStatus` is a boolean. |
| `sourceLinks` | array | One entry per source with at least one public link: `{ doi, pmid, regulatoryUrl }`, each nullable. Internal source ids are never included. |
| `lastReviewedAt` | string \| null | ISO 8601 timestamp of the last scientific review, `null` if unreviewed. |
| `canonicalUrl` | string | Permanent citable URL for the claim (an entity-page anchor). |

Nothing else is exposed on a claim: no reviewer name or credentials, no publication-status workflow
state, no `remainingUnknown`/`evidenceNeededNext`, and no source metadata beyond those three link
fields.

## `GET /api/v1/entities/[slug]`

One published entity with its published claims nested. `slug` is the same slug as `/r/[slug]`.

```bash
curl -s https://rnawiki.com/api/v1/entities/example-entity
```

```json
{
  "canonicalName": "Example Peptide",
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
  "claims": [ "…one object per published claim, in the claim shape above…" ]
}
```

**Errors:** `404` no such entity, or not published. `429` rate-limited.

## `GET /api/v1/claims/[claimId]`

One published claim by numeric id, returned as the bare claim object above with no wrapping entity
— dereference `canonicalUrl` for page context. Empty `evidenceContext`/`sourceLinks` arrays and a
`null` `lastReviewedAt` are all valid.

```bash
curl -s https://rnawiki.com/api/v1/claims/42
```

**Errors:** `404` no such claim, the claim isn't published, or its entity isn't published. `429`
rate-limited.

## `GET /api/v1/search?q=...`

Case-insensitive substring (`ILIKE`) search over published entity names/aliases and published claim
questions. Returns up to 10 entity matches and 10 claim matches, entities first. `q` is required,
trimmed, truncated to 200 characters.

```bash
curl -s "https://rnawiki.com/api/v1/search?q=tendon"
```

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

`results` is a flat array; read `type` to tell entities and claims apart.

**Errors:** `400 {"error": "Query parameter \"q\" is required."}` for a missing or empty `q`. `429`
rate-limited.

## Known limitations

- **Rate limiting is in-memory, per instance** (`lib/rate-limit.ts`). It resets on every deploy and
  is not shared across replicas — correct for one running instance only. Multi-instance scale needs
  a shared store such as Redis.
- **Search is a separate implementation** from the site's own `lib/search.ts`, which does full-text
  typo-tolerant ranking for the human `/search` page. Results and ranking can differ until the two
  are unified, which they should be.
