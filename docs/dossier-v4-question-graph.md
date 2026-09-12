# Dossier v4 — the question graph

## What is implemented

A deterministic baseline. No model runs, and no model may write a public sentence.

**Next-question ranking.** `buildNextQuestions` in `lib/dossier-v4/view-model.ts` walks a fixed
objective order and emits the questions the record can actually support:

1. prevent a misunderstanding — the claim decoder, when a recorded claim goes past the evidence;
2. surface a meaningful outcome — a study that did not show what it set out to show;
3. reveal safety;
4. reveal a population mismatch;
5. reveal the evidence boundary;
6. reveal an important unknown;
7. support deeper learning — the first prerequisite concept.

Nothing counts clicks or time on the page, and the objective that placed each question is shown
next to it, so the ordering can be argued with.

**Prerequisite traversal.** `prerequisiteWalk` expands the concepts a page uses back through their
prerequisites, depth-first, and caps the result while keeping the concept being explained.

**Evidence-path retrieval.** The body path is a typed node and edge list. Every edge carries its
relation, evidence origin, direction, scope, review state, whether it is verified or inferred, and
its uncertainty reason.

**Applicability and alternative retrieval.** Read from the record's own rows and hub membership,
labelled as membership rather than as a comparison.

## What is deliberately deferred

No model is trained, and the identity gate on `graph_versions` stays closed. The projector
(`scripts/dossier-v3/project-graph.ts`) runs, and its output does not reach a reader.

Deferred: heterogeneous evidence-path ranking, identity anomaly detection, learned trial-role
classification, contradiction discovery, community experience clustering, temporal staleness
prediction.

## The boundary a prediction may never cross

A prediction lives in `predicted_edges` with its model version, graph version, candidate relation,
confidence, calibration state, supporting and contradicting subgraphs, review state and created
date. It may prioritise a review queue. It may not generate public medical truth, and no attention
weight is ever offered as an explanation in place of a source-backed path.

The compass states this on the page rather than only in a document: where no prediction is held for
a record, the body path says so, and the staircase's bottom rung says RNAWiki does not publish one
as a finding.

## Training data that is off limits

Private stacks, private experiments, and any third-party forum or archive without a licence,
consent and a documented policy.
