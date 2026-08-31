# Pre-Release A agent history

This package preserves the identity of the last pre-repair dataset-agent outputs without copying
the 52 MB generated set. The ten outputs remain addressable at Git commit
`8d172371626039f6a9e1e8177e916fca33fbc675` under `data/agents/`; the separate audit snapshot
remains outside the repository and is referenced by its existing SHA-256 records.

Every run here is historical (`historical_pre_repair=true`) and ineligible for active review
(`eligible_for_active_review=false`). The 2,005 legacy queue rows must never be imported into the
live review queue. They predate the repaired corpus and lack migration 0017's stable candidate and
occurrence identities, exact field binding, and evidence digest.

`manifest.json` records each agent id, version, run date, fixed seed, coverage, candidate count,
common reconstructed input digest, output Git object, byte count, SHA-256, schema, and limitations.
`referenced-artifacts.sha256` is the compact hash ledger for both Git and externally preserved
artifacts. Its labels are references rather than local filenames, so verification resolves the
Git entries with `git show <commit>:<path>` and the external entries against the preserved snapshot.

The historical runner did not record an input digest. The manifest's common input digest was
computed retrospectively from the exact Git snapshot using the stable JSON rules now used for
candidate identity. It is reproducible evidence, but it is not represented as an original run
field. No medical content, generated output, candidate, or reviewer decision is stored here.
