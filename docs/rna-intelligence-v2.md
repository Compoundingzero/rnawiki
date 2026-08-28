# RNA Intelligence 2.0 and 2.1

RNA Intelligence is a set of fixed software rules. It does not use a language model, write medical
text or decide whether a medicine works. Within one engine version, the same stored record and
reference date return the same findings and SHA-256 digest.

## What changed from the original system

The original engine mainly checked molecular structures, sequences and laboratory workflow data.
Version 2.0 keeps those checks and adds a separate evidence engine for development programmes:

- a conclusion is tied to one intended use, population, dose or exposure and set of trials;
- each measured statement must point to an exact, dated source snapshot;
- the five evidence questions distinguish **supported**, **contradicted**, **unknown** and **not
  measured**;
- impossible dates, missing units, wrong programme/trial links and unsupported conclusions can
  block publication;
- unclear wording, weak source choices and overconfident language produce warnings for reviewers;
- a source change is traced to every linked claim, evidence step, summary and conclusion that may
  need another review; and
- reviewers approve a locked content digest, so an edit after review makes the approval stale.

This is a significant expansion of what the machine can validate, but it is not automated medical
judgement. A passing report means “the record is internally complete enough for review,” not “the
conclusion is true.”

## What 2.1 adds for the dossier presentation

RNA Intelligence 2.1 is selected only when a candidate carries a complete
`programme-presentation/v1` bundle. It validates the mechanism map and the optional
decision-changing timeline as part of the same immutable proposal as the conclusion. Existing
prepared or published revisions without a presentation version remain on
`rna-intelligence/evidence-2.0.1`; their stored bytes and digests are not rebuilt as 2.1 records.

For a versioned presentation, the engine now checks that:

- the mechanism map contains three to five distinct stages in one fixed order;
- every stage has a programme-scoped claim that `SUPPORTS` or `QUALIFIES` the displayed text;
- every displayed mechanism claim resolves to an exact immutable source snapshot whose
  claim-to-source relationship is `SUPPORTS`;
- a **Measured in people** label is backed by a `MEASURED` or `REGULATORY_FINDING` claim from a
  human trial inside the reviewed record. A statement from the study sponsor alone cannot receive that
  label;
- a **Measured outside people** label is backed by a directly measured claim from an exact scoped
  laboratory or non-human study; and
- **Predicted** is a reviewer-assigned description, not a measurement. The engine checks the
  prediction's claim and source links but cannot verify an unstored model or line of reasoning;
- every displayed mechanism/timeline claim relationship—including support, qualification and
  contradiction—has an exact verdict-scoped dependency edge, so a changed claim can reopen the
  specific displayed item; and
- every authored timeline event has an allowed event type, a valid actual/planned/unclear date
  basis, and one `SUPPORTS` claim citing the same saved source snapshot as the event.

The timeline is optional. When a reviewed presentation has no sourced events, the dossier hides it;
RNAWiki does not add decorative milestones. When a sourced timeline does exist, the public view may
also show the publication and revision dates derived by RNAWiki, clearly distinguished from source
events. Publication dates remain available in version history even when the dossier timeline is
hidden.

These checks are a material improvement to provenance and change tracking. They do not generate a
mechanism, timeline or conclusion, and they do not make presentation coverage universal. Only
programme revisions that have gone through the new versioned presentation workflow show this
structured view.

## The eight groups of checks

### A — molecular and workflow checks

Checks the stored chemical structure or sequence, where one applies, and checks that a laboratory
workflow is internally consistent. Passing Group A supports the narrow label **Structure checked**.
It says nothing about benefit or safety.

### B — one clearly defined use

Stops medicine-wide failure labels, medicine/programme mismatches, wrong trial links and conclusion
scope that omits the intended use, population, dose or time period. A stopped-programme
classification is allowed only for a stopped or withdrawn programme.

### C — sources for the statements being made

Stops measured statements without a stored source snapshot, malformed or internally unresolved
source records, unexplained numeric units and conclusions with no supporting claims. It warns when
primary results are missing, sources conflict, or a source has been corrected or retracted. These
rules inspect stored source state; entering a web address does not make RNA Intelligence fetch or
verify that page.

### D — dates and study structure

Stops impossible date order, duplicate trial identifiers, human-outcome claims attached to a
non-human study and comparator numbers without a comparator group.

### E — the five evidence questions

Checks that every visible evidence state has supporting or contradicting claims. It keeps “unknown”
separate from “not measured” and warns when a biomarker result is presented as patient benefit
without the necessary evidence.

### F — conclusion consistency

Compares a conclusion chosen by a reviewer with the structured evidence. It reports mismatches but
never chooses a replacement conclusion. A legitimate exception requires a named human decision and
written reason.

### G — wording ordinary readers can understand

Warns about unexplained abbreviations, very long sentences or paragraphs, difficult terms without
an explanation, absolute safety claims, treatment advice, numbers without a comparator or time
point, and vague uses of “failed” or “worked.” It flags text; it never rewrites it.

### H — new evidence and everything it may affect

Compares source versions and follows stored links from a changed claim to the page sections that use
it. Each affected item is placed in one of four handling levels: exact source data, needs medical
interpretation, may change the conclusion, or may change important safety information.

## What every finding contains

Every finding records:

- a stable rule code;
- `BLOCK`, `WARNING` or `REVIEW_IMPACT`;
- a plain explanation;
- the exact field, programme, claim, evidence step or source involved; and
- the action needed to fix or review it.

`canPublish: true` means only that no machine blocker remains. Human review is a separate gate.

The Groups B–H vocabulary currently contains 149 unique emitted rule codes. The test suite must
produce every one from a focused input and verify its group, level and required action. There are no
“internal only” or unreachable exceptions. A new emitted code cannot compile until it is added to
the catalog, and the coverage test then fails until an executable case is supplied.

## Where the full evidence engine runs

The complete Groups B–H engine runs when a programme conclusion is prepared for review. Versioned
presentations use the protected whole-bundle authoring and preparation path before review. The
engine runs again inside the publication transaction using the locked database rows. The engine
version, input digest and full proposal digest—including presentation copy, order, basis, claim
links and exact source snapshot ids—are stored with the revision and with each counted review.
An accepted contribution reaches this same path only after the server clones the exact current
publication, applies its selected change, and rebuilds Groups B–H input from stored rows. A cited
pending ClinicalTrials.gov snapshot is parser-normalized into the candidate study snapshot before
the digest is calculated; accepting the contribution never publishes it. Unchanged statements keep
their exact previous citations. The validator permits only the current source version and its
immediate predecessor, and it permits that predecessor only on a claim, trial or timeline binding
copied exactly from the immediately previous public verdict.

For a broad scientific revision to an already published programme, the operator supplies one
strict complete bundle through `authorSuccessorProgrammeVerdictDraft(...)` or
`POST /api/programme-verdicts/successors`. That bundle replaces the candidate's complete trial
scope, claims, five evidence nodes, interpretability assessments, conclusion fields, dependencies,
mechanism stages and sourced timeline. The server resolves only existing normalized programme and
trial ids plus exact current source snapshots; pending, stale, retracted, withdrawn and
cross-programme inputs fail before a draft can persist. It assigns graph ids, revision lineage and
timestamps, runs the same proposal builder and Groups B–H validation inside the transaction, and
leaves the result as an unprepared `DRAFT`. This is deliberately separate from one-field community
corrections. It does not mutate the current public bundle or bypass preparation, two qualified
reviews and publication.

Other boundaries use narrower checks that match their job:

- a correction form checks its selected field, source, programme scope, proposed value and declared
  conflict of interest;
- an older record's identity form accepts only one medicine-name or trade-name change, checks the
  source address and exact before/after values, and always sends it to an independent person. It
  does not run the evidence engine or claim that software verified the source;
- ClinicalTrials.gov monitoring compares exact registry fields and the full submitted study record,
  then creates a review task when the meaning may have changed; and
- ingestion and enrichment run the narrower Group A checks when a stored molecule or sequence has
  the required input. There is no public molecular editor.

Community notes do not enter any RNA Intelligence check. They publish as a separate commentary
layer and cannot change the evidence record or a reviewed conclusion.

Calling these narrower checks “the full evidence engine” would be misleading, so the runtime map is
kept in [`lib/rna-intelligence/EVIDENCE_INTEGRATION.md`](../lib/rna-intelligence/EVIDENCE_INTEGRATION.md).

## Account and attribution boundary

RNAWiki has one account type. Trust standing, internal-review access and scientific-review
qualifications are permissions on that account; they are not different login types. Every note,
identity correction and programme proposal takes its author from the authenticated server session.
The request cannot choose another author. Notes store an author snapshot, identity corrections store
the contributor with the immutable before-and-after record, and programme proposals store a
non-null account reference that appears in the public queue and review history. Draft proposals are
private to their author and become immutable when submitted.

## Publication and review boundary

A programme conclusion becomes public only when its complete stored evidence bundle passes the
machine rules and the required independent human review. Exactly two people must sign the same
digest, and each scientific expertise tag must have a current, separately steward-granted
qualification; account trust level or a self-selected profile tag is not a qualification. A person
can sign a version only once. Reviewers cannot see the first decision before recording the second,
and disagreement requires a different qualified steward's attributed decision. The public pointer
moves in one database transaction; the earlier public version stays in history. No contributor
trust level may bypass review for a programme conclusion, major efficacy or safety interpretation,
or evidence-chain state.

For an exact task-bound ClinicalTrials.gov change, the monitor freezes a cumulative comparison from
the still-public baseline to the latest pending snapshot. If the changed source is not linked to a
claim or interpretability assessment and every changed field is parser-exact, a `SOURCE_REFRESH`
proposal contains that comparison and a conflict-of-interest disclosure only—no selected field,
replacement prose or invented claim. Two independent contribution reviews may accept it for steward
materialization, but the resulting complete replacement evidence record still passes the evidence
engine and two independent qualified canonical reviews. That record contains the studies, evidence
statements, evidence-chain answers, saved sources and conclusion that would move together. A reviewed
mechanism map and any sourced timeline events are inherited only when they are present in the current
publication; the source-refresh path does not invent either one. Only publication advances the
reviewed trial snapshot and freshness, closes the exact task and moves the public pointer atomically.

If the changed source supports a claim, interpretability assessment or non-exact field, the task is
marked `NEEDS_SCIENTIFIC_REVISION` and cannot use that narrow path. A steward or administrator must author a complete,
source-backed replacement evidence record; the system does not invent replacement scientific
wording. Two independent qualified reviewers must approve the exact proposed record before it can be
published. A strictly empty onboarding record retains its separate dual-reviewed metadata-only path
and never creates a conclusion.

Medicines that have not yet been moved to the programme model continue to use the visibly separate
legacy read path. A sourced identity correction for one of those records is stored immutably and
requires one independent reviewer; evidence and conclusion changes cannot use that small path.
RNAWiki does not invent programme scope, claims, reviewers or verdicts to make an older record look
complete.

## Group I — recorded background (`rna-intelligence/background-1.1.0`)

Group I is a separate deterministic engine for the `medicine-background/v1` envelope: the recorded
mechanism statements, molecular identity, interaction counterparties, warnings and
contraindications, population statements, most-common reactions, pharmacokinetics, trial-protocol
or label schedule, approved product variants, recorded prices, anatomy targets, recorded
eligibility criteria, main-study results and registry identifiers shown as medicine-wide research
context. It validates structure and provenance — the envelope version and
ISO dates, known source kinds with kind-specific identifier shapes, excerpt length, contiguous
schedule steps, the controlled jurisdiction, currency, price-type and anatomy vocabularies, and the
rule that a discrepant value records the other reading with its own source. It also rejects advice
or commerce phrasing anywhere in recorded context.

Its central guarantee is mechanical provenance for numbers: every displayed numeric value must
literally appear in the short source excerpt fetched at authoring time, so a number that was
remembered instead of read fails validation. Version 1.1.0 extends that guarantee from numbers to
words: a named mechanism target, an interaction counterparty and every listed adverse reaction must
each appear in the recorded excerpt, so a term the source never printed cannot be indexed onto it.

Quoted modules are held to a stricter rule still. A recorded statement must match its source
excerpt character for character. That equality is what lets a mechanism sentence or a boxed warning
carry a label's own "patients should be monitored" while the advice-and-commerce scan keeps
applying in full to every field RNAWiki writes in its own voice — the engine can tell the source's
words from ours because it can prove the former were not edited.

Derived sentences — the steady-state note and the per-month US-dollar normalization — are
deterministic functions of the recorded values; the engine recomputes each one and fails on any
mismatch rather than trusting the stored copy.

The engine runs in two places. `npm run check:medicine-content` validates every stored envelope and
is part of `npm run gate`, and `scripts/apply-recorded-background.ts` runs the same validation
before any write, so a failing envelope never reaches a medicine row. Like every other group, Group
I checks structure only; people judge meaning. The Group I vocabulary contains 38 stable `I_` rule
codes, each registered in `BACKGROUND_RULE_CODES` with an executable focused case in the coverage
test.
