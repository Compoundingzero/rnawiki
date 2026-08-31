# Post-repair agent rerun

Release B1 reran all ten registered deterministic agents over 9,855 repaired
`medicine-background/v1` envelopes. The active package is
[`data/agents/current/manifest.json`](../../data/agents/current/manifest.json); the immutable
pre-Release-A identity package is
[`data/audits/agents/pre-release-a/manifest.json`](../../data/audits/agents/pre-release-a/manifest.json).

The current run uses date `2026-08-31`, seed `20260828`, corpus digest
`559289a2a3413d7371833ad7ff365c761098a80924196f86617610fd1a2732cf`, and the full corpus commit
recorded in the manifest. The runner executed the whole suite twice before writing it and the
checked-in package subsequently passed `npm run agents:check`: all output bytes and manifest hashes
matched, with zero medical-boundary violations.

## Measured result

| Agent                            | Historical pre-repair | Current post-repair |      Delta |
| -------------------------------- | --------------------: | ------------------: | ---------: |
| Silence ledger                   |                    40 |                  40 |          0 |
| Mechanism text grouping          |                     5 |                   5 |          0 |
| Peer-group anomaly screen        |                   119 |                 119 |          0 |
| Enzyme/transporter documentation |                   114 |                 144 |        +30 |
| Substance synonyms               |                 1,196 |               1,199 |         +3 |
| Evidence density                 |                    40 |               1,122 |     +1,082 |
| Numeric distributions            |                     0 |                   0 |          0 |
| Adverse-reaction term structure  |                   395 |                 398 |         +3 |
| Excerpt integrity                |                     0 |                   0 |          0 |
| Coverage ledger                  |                    96 |                  96 |          0 |
| **Total**                        |             **2,005** |           **3,123** | **+1,118** |

The current package also contains 42,607 public or internal finding rows. A finding row is an
agent-specific structural output; it is not a count of defects and must not be added across agents
as if every row represented the same thing.

The first post-repair diagnostic emitted 2,230 queue rows. Identity validation refused to import
them because 189 were duplicate source readings of an already represented
medicine/counterparty question. The producer now emits one conceptual candidate for that question
and retains every exact source reading in the evidence snapshot. No reading was discarded. That
first hardening step produced 2,041 conceptual candidates.

A later queue-completeness audit found that evidence density still applied a presentation cap of 40. Removing it retained all 1,122 eligible evidence-density candidates, bringing the active total
to 3,123. Silence ledger deliberately samples 40 of 147,981 eligible questions and coverage ledger
samples 96 of 9,700 eligible records; both identify the mode and available count and carry a compact
index of every eligible candidate. Every other candidate-producing agent retains its complete set.

By reason, the historical/current counts are: `ATTRIBUTION_SUSPECT` 40/59, `COVERAGE_GAP` 650/1,746,
`POSSIBLE_DUPLICATE_SUBSTANCE` 1,196/1,199, and `UNUSUAL_FOR_PEER_GROUP` 119/119. The registered
reason codes with no current occurrence are `SOURCES_DISAGREE` and `SOURCE_DRIFT`; disagreement is
represented in the source-consensus dataset, while drift remains the separately persisted exact
source-binding monitor.

## What can and cannot be compared

The agent-level and reason-level deltas above are exact. Individual “removed”, “new”,
source-changed, and value-changed continuity is deliberately reported as **not exactly measurable**.
The historical rows have no semantic field path, candidate key, occurrence key, canonical value
digest, source-snapshot digest, or reason-schema version. Deriving those identities now from rendered
question prose would invent history. The net increase of 1,118 is measured, but it is not labelled
as 1,118 newly discovered defects.

That limitation is fixed prospectively. Every current candidate now carries a semantic field path,
exact observation, all source readings, and explicit routing metadata. Candidate identity excludes
wording, score and corpus counts; occurrence identity includes the exact candidate-local value,
canonical source snapshots and an evidence-identity version that changes only when the detector's
observation semantics change. The package-wide corpus digest and display run version stay on the
run, so an unrelated medicine or wording-only release cannot reopen a reviewed occurrence.

## Reachability

No registered output is consumerless. Silence, enzyme/transporter documentation and coverage feed
public dataset readers as well as review. The remaining candidate-producing agents feed the private
workbench and a documented internal report. Numeric distributions deliberately emits no candidates
and is an internal quantitative report. Excerpt integrity is allowed to emit zero candidates: a
clean source-binding check should not manufacture work to satisfy a count.

The machine-readable version of this audit is
[`post-repair-agent-rerun.json`](post-repair-agent-rerun.json).
