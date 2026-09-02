# The evidence reading engine

An engine that finds a recorded reading and hands it back with its sources. It writes nothing, it
calls no language model, and it never composes a sentence about a medicine.

The unit of work is a **reading unit**: one recorded value, one quoted statement, one population
statement, one adverse-reaction list, one source-agreement reading, one dated registry search, or
one section's recorded state. A dossier holds many; a question is usually about one.

## Contract

1. **A unit is a projection, never an authored record.** `lib/semantic/units.ts` is the only writer.
   Its text is source wording — an excerpt, a `textAsRecorded`, the resolver's own basis sentence —
   or a fixed template that joins stored fields under stated labels. No unit text is composed prose
   about a medicine.
2. **Every unit carries its exact sources.** `source_refs` is the recorded source list for that one
   reading, in recorded order, so any returned unit goes back to the fetched artifact.
3. **An absence is a unit.** A section that resolved to `NOT_APPLICABLE`,
   `NO_QUALIFYING_EVIDENCE_AFTER_SEARCH`, `RESULTS_NOT_POSTED` or `NOT_MEASURED` becomes an `ABSENT`
   unit carrying the resolver's basis sentence. An empty result set is a lookup failure; an `ABSENT`
   unit is an answer.
4. **A denial stays a denial.** A population statement whose source says the question was not
   established becomes `NEGATED`, as does a section that resolved to
   `SOURCE_STATED_NOT_ESTABLISHED` and an enzyme or transporter role recorded with negated polarity.
5. **Retrieval never decides identity.** Scope gates run after retrieval, in ordinary code. A unit
   belonging to another record is dropped however similar its text. An ambiguous name is refused. A
   query naming two records is refused, because RNAWiki holds no relationship between two medicines
   and will not manufacture one by putting two records side by side.
6. **The engine is not wired to any page.** `answerEvidenceQuery` is reached from
   `scripts/semantic/query.ts` and from tests. Where it belongs on the site, if anywhere, is the
   site owner's decision.

## Versions

| Component             | Version string            | File                          |
| --------------------- | ------------------------- | ----------------------------- |
| Projector             | `semantic-units/v1`       | `lib/semantic/units.ts`       |
| Lexical retrieval     | `semantic-lexical/v1`     | `lib/semantic/lexical.ts`     |
| Scope gates           | `semantic-scope-gates/v1` | `lib/semantic/scope-gates.ts` |
| Deterministic lookups | `semantic-lookups/v1`     | `lib/semantic/lookups.ts`     |
| Query entry point     | `semantic-search/v1`      | `lib/semantic/search.ts`      |

A stored correction records the combined string `semantic-search/v1+semantic-lexical/v1+semantic-scope-gates/v1`,
stamped server-side. A correction can therefore never claim to be about an engine version that did
not run.

Storage is migration `0023_semantic_reading_units`: `evidence_reading_units` (unit id is a SHA-256
over the reading's exact content, with a generated `tsvector` over `text` and a GIN index on it) and
`result_debugger_corrections` (append-only, enforced by a trigger, like
`dossier_completion_review_decisions`).

## Absence semantics

Three outcomes are kept apart everywhere, in storage, in the lookups and in a result set:

- `ASSERTED` — a source states this reading.
- `NEGATED` — a source states the question was not settled, or that a role does not apply.
- `ABSENT` — nothing qualifying was found, and the unit records where that was looked for.

The deterministic lookups add a fourth outcome that is about the projection rather than about the
medicine: `NOT_PROJECTED` means no unit answers the question and the record holds no recorded
absence for that section either. Reading that as "the medicine has none" would be wrong, which is
why it is a separate status with its own sentence.

Boundary questions work the same way. `populationBoundary` and `formulationBoundary` are built only
from stored statements: where nothing is recorded for the asked group, the sentence names the groups
that are recorded — "No recorded statement for pregnancy; the recorded statements cover children
only." Nothing is inferred about the medicine from what the sources left out.

## The benchmark: what it is and what it is not

`scripts/semantic/benchmark.ts` writes `docs/audits/semantic/lexical-benchmark.json` and `.md`.

It **is** a template-generated retrieval set. Each query is built mechanically from one record's
name and the section or field label of one sampled unit, with a fixed seed, and the correct answer
is that unit. Both retrievers see the same candidate pool, and the same scope gates are applied to
both.

It **is not** a measure of answer quality, of whether a recorded reading is right, or of how people
actually phrase questions — nobody typed any of these queries. It does not measure retrieval over
the whole corpus either: the pool is the sampled units, because handing one method 270,000
candidates and the other 2,000 would compare pool sizes rather than methods.

### Measured on 2026-09-02

Seed `20260902`, 400 records, 5 units each, so a 2,000-unit pool and 1,943 queries after templates
answered by two sampled units were dropped. The corpus held 273,110 units.

| Retriever            | Recall@1 | Recall@5 | Recall@20 |   MRR | Refused |
| -------------------- | -------: | -------: | --------: | ----: | ------: |
| Lexical, no gates    |    0.964 |    0.977 |     0.977 | 0.970 |       0 |
| Lexical, scope gates |    0.921 |    0.933 |     0.933 | 0.926 |      86 |
| Dense, no gates      |    0.864 |    0.999 |     1.000 | 0.926 |       0 |
| Dense, scope gates   |    0.828 |    0.956 |     0.956 | 0.887 |      86 |

Three readings of that table are worth writing down, because each is easy to get backwards.

The dense model finds the right unit somewhere in the top five almost every time (0.999 without
gates) and picks it first less often than plain text search does (0.864 against 0.964). Ranking a
short recorded value above a long basis sentence is what `ts_rank_cd` normalisation already does
well on wording the corpus itself produced.

Gates cost both retrievers about the same, and the cost is refusals. All 86 were `TWO_MEDICINES`,
and 85 of the 86 are one collision: the corpus holds a record named `enzyme`, and this engine's own
section label for that section is "enzyme and transporter signals". The eighty-sixth is "plasma
protein binding of Esmolol", against a record named `protein`. A corpus that files single English
words as substances will do this, and the answer is the refusal, whose explanation names both
candidates so the person can ask again.

Two earlier versions of the gates refused more, and both causes were repaired rather than tolerated.
Multi-word scope phrases ("liver impairment", "kidney impairment") are now read as scopes before any
name is matched, which cleared the collisions with the records named `liver` and `kidney`. And the
longest name a query may match was raised from eight words to sixteen, because the longest canonical
name in this corpus is twelve: under the old cap, "Streptococcus Pneumoniae Type 33f Capsular
Polysaccharide Diphtheria Crm197 Protein Conjugate Antigen" never matched whole, and its component
words matched two other records instead. That repair alone moved gated recall@5 from 0.925 to 0.933
for lexical and from 0.949 to 0.956 for dense.

1,615 of the 1,943 queries ask about a section state, because 197,040 of the 273,110 units are
section states. The benchmark is therefore weighted towards "what does this record say about X at
all", which is the question the corpus most often answers with an explicit absence.

## The dense model and its download

`--dense` loads `Xenova/bge-small-en-v1.5` through `@huggingface/transformers` (pinned at `4.2.0` in
`package.json`) and runs it on the local CPU. Nothing about the model is committed to this
repository.

On first run the library downloads the ONNX weights, config and tokenizer from the Hugging Face hub
into `$RNAWIKI_INGEST_DATA/models/Xenova/bge-small-en-v1.5`. That directory measured **129 MB** after
the download on 2026-09-02, almost all of it `onnx/model.onnx`. Later runs read the cache and reach
the network only when a file is missing.

Embeddings use CLS pooling with L2 normalisation, so cosine similarity is a dot product, computed by
brute force over the pool. When the download fails, the benchmark records the dense result as
`SOURCE_UNAVAILABLE` with the exact error text and states no dense number at all.

## Pass rule for a vector index

> A pgvector shadow index is added only when dense retrieval beats lexical retrieval on recall@5 by
> at least 5 points absolute, with the scope gates applied.

Two conditions have to hold together: the pass rule, and the `vector` extension being installable on
the server. Both are recorded in the audit JSON as `passRule.met` and `pgvectorAvailable`.

### Why no vector index was added

Migration `0024` was not written, for two independent reasons recorded on 2026-09-02:

1. **The pass rule was not met.** With the scope gates applied, dense recall@5 was **0.9557** and
   lexical recall@5 was **0.9326** — a margin of **2.3 points**, under the 5 required. The dense
   model is ahead, and not by enough to justify a second index, a model download in the deploy path
   and a shadow column that has to be kept in step with every projection.
2. **The `vector` extension is not available on this server.**
   `select 1 from pg_available_extensions where name = 'vector'` returns no rows against the local
   PostgreSQL 18.6 build, so `create extension vector` would fail even with the pass rule met.

An operator who wants to revisit this runs, in order:

```bash
# 1. Install the extension for this PostgreSQL build (Homebrew example), then restart the server.
brew install pgvector

# 2. Confirm the server can now offer it.
psql "$DATABASE_URL" -c "select * from pg_available_extensions where name = 'vector';"

# 3. Re-run the benchmark and read the pass rule from the audit file.
npm run semantic:benchmark -- --dense
cat docs/audits/semantic/lexical-benchmark.json
```

Only if that file reports both flags true does the extension get created and the column added, and
neither by hand: `create extension if not exists vector;` belongs at the top of a generated
migration `0024`, written by adding the column and its HNSW index to `db/schema.ts` and running
`npx drizzle-kit generate --name semantic_vector_shadow_index`, the same way `0023` was made.

## The Result Debugger

`POST /api/result-debugger` records one genuine correction; `GET /api/result-debugger` lists recent
ones. Authorization is the steward or administrator capability the agent evidence queue uses
(`requireAgentReviewer`).

A correction states the exact query, the unit ids that came back in the order they came back, what
should have come back instead — a named unit, a recorded absence, or both — and the reason in the
reviewer's own words. The engine version is stamped server-side. The table is append-only: a later
disagreement is a second row, never an edit of the first.

No correction is seeded. The table holds zero rows until a person files one, and
`tests/integration/result-debugger-corrections.test.ts` asserts exactly that.

```bash
curl -X POST "$SITE_URL/api/result-debugger" \
  -H 'content-type: application/json' \
  --cookie "$SESSION_COOKIE" \
  -d '{"query":"half-life of metformin","returnedUnitIds":["<64 hex>"],"expectedUnitId":"<64 hex>","reason":"The top result was the section state, not the recorded value."}'
```

## Operator commands

```bash
# Project every canonical record into reading units, and reconcile the stored rows.
npm run semantic:project                    # writes data/semantic/units-summary.json
npm run semantic:project -- --check         # re-derives without writing; exits 1 on a difference
npm run semantic:project -- --slugs=metformin,warfarin

# Measure retrieval. Add --dense for the local model comparison.
npm run semantic:benchmark
npm run semantic:benchmark -- --dense
npm run semantic:benchmark -- --drugs=50 --per-drug=5 --seed=20260902

# Ask the engine a question, or look one up deterministically.
npm run semantic:query -- "half-life of metformin"
npm run semantic:query -- --entity=metformin --section=pharmacokinetics
npm run semantic:query -- --entity=metformin --question=population_pediatric
npm run semantic:query -- --entity=metformin --population=PEDIATRIC
```

The projection script is safe to re-run: it writes only `evidence_reading_units`, keyed by a digest
of each reading's content, and a record whose projection is unchanged is skipped without a write.

## Tests

- `tests/unit/semantic-units.test.ts` — projector purity, the three assertion states, source refs on
  every unit, and that the database enum lists match the TypeScript ones.
- `tests/unit/semantic-lookups.test.ts` — an absence never becomes a finding, an ambiguous name is
  refused rather than guessed, and boundary sentences are built only from stored statements.
- `tests/unit/semantic-scope-gates.test.ts` — another record's units are dropped, two medicines are
  refused, population and formulation scopes restrict, and `answerEvidenceQuery` keeps readings and
  recorded absences apart.
- `tests/unit/result-debugger-validation.test.ts` — correction validation, including the server-side
  engine version stamp.
- `tests/unit/result-debugger-route.test.ts` — the route refuses a reader without the steward
  capability, refuses a client-supplied engine version, and lists nothing by default.
- `tests/integration/result-debugger-corrections.test.ts` — append-only enforcement and the zero-row
  default, skipped unless `E2E_DISPOSABLE_DATABASE=1`.
