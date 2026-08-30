# Denial Corpus execution worklog

A resumable record of the remediation described in `docs/audits/denial-corpus/`. Another session
should be able to read this file and continue without guessing what was done or why.

## Starting state

| Fact                  | Value                                                             |
| --------------------- | ----------------------------------------------------------------- |
| Starting branch       | `main`                                                            |
| Starting commit       | `8186a66ed97c1a78da56ba8aca9f0044d282f6eb`                        |
| Working branch        | `fix/denial-corpus-production`                                    |
| Working tree at start | dirty — 14 modified files, 0 untracked                            |
| Preserved patch       | `<scratchpad>/preserve/working-tree-8186a66.patch` (22,015 lines) |
| Stashes present       | `stash@{0}`, `stash@{1}` — **preserved, not touched**             |

Dirty files carried onto the branch (all from the 30 August audit session, all tested green before
the branch was cut — 1,674 unit tests passing, typecheck, lint and format clean, all 9,855 envelopes
validating):

```
M data/agents/enzyme-and-transporter-documentation.json
M docs/dataset-agents.md
M lib/agents/dataset/enzyme-documentation.ts
M lib/background/label-extraction.ts
M lib/background/printed-numbers.ts
M lib/dossier-read-serializer.ts
M lib/medicine-dossier-view-model.ts
M lib/public-medicine-language.ts
M lib/rna-intelligence/background-rules.ts
M tests/unit/agents/enzyme-documentation.test.ts
M tests/unit/dossier-read-serializer.test.ts
M tests/unit/label-extraction.test.ts
M tests/unit/printed-numbers.test.ts
M tests/unit/public-medicine-language.test.ts
```

**These are not to be reimplemented.** They already contain: the public-boundary repair (Phase 2),
the first-screen instruction-voice guard (part of Phase 3), the quantity-parser dispersion fix and
token-based numeric witness (part of Phase 6), and the enzyme-agent polarity split. They are
committed in reviewable units below rather than replaced.

## Safety rules honoured throughout

- No `git reset --hard`, no `git clean`, no history rewrite, no force-push.
- Stashes untouched.
- Working-tree patch saved outside the repository before the first edit.
- Seed data under `scripts/seed-data/` is never mass-rewritten; batches 19, 20 and 27–30 are
  user-owned and are not edited or staged.
- Public exposure is controlled at the serializer and projection boundaries, never by deleting
  stored source material.

## Known external blocker

**The openFDA bulk label archive is not present on this machine.** Phase 6C (regeneration of
`extracted-background.generated.ts` and `source-consensus.generated.ts`) and the record-level
curated-skip repair both depend on it. Everything that does not depend on the archive proceeds; the
archive-gated work is marked BLOCKED with the exact command to run, and Release A cannot deploy
until it completes. See the Phase 6 entry.

## Phase log

### Phase 0 — Reproducible baseline

Status: **in progress**

Directories created: `scripts/audit/denial-corpus/`, `docs/audits/denial-corpus/`,
`data/audits/denial-corpus/`, `docs/worklogs/`.

---

_(Each phase below is appended as it completes, with commands run, measured results, commit SHA and
blockers.)_
