# Four-audience evidence contract

RNAWiki has one canonical medicine record and four selectable projections over it. The ordinary
reader, biotech researcher, chemist, and physicist or quantitative scientist controls change the
field grouping shown in the projection panel and its starting anchor. They do not create separate
claims or medicine records. The complete canonical dossier remains below the panel, and every
claim, limitation, measurement, source binding, and source excerpt remains available from the same
`MedicineDossierViewModel`.

The machine-readable contract is
[`four-audience-evidence-contract.json`](./four-audience-evidence-contract.json). The application
contract is `lib/dossier-audience-lenses.ts`; `DossierAudienceLensSelector` provides the native
radio-button selector; the fixed question universe is `buildDossierQuestionRegistry`; and exact
conflict and freshness overlays come from `buildQuestionIssueIndex`.

## The four lenses

| Lens           | Reader                              | Selectable projection                                               |
| -------------- | ----------------------------------- | ------------------------------------------------------------------- |
| `ordinary`     | Ordinary reader                     | Six everyday questions, limits, applicability, and evidence state   |
| `biotech`      | Biotech researcher                  | Programme, trials, outcomes, evidence gaps, sources, and review     |
| `chemist`      | Chemist                             | Entity, composition, external identity, structure, and ambiguity    |
| `quantitative` | Physicist or quantitative scientist | Measurement context, derivations, uncertainty, and all source reads |

Selection changes only the projection panel. It cannot rewrite a statement, select a preferred
source, turn a missing field into a conclusion, or remove content from the complete dossier. A
sparse projection names the missing canonical field and source binding rather than manufacturing
specialist content.

Every projected row is typed as medical/evidence, canonical identity, review/freshness operation,
or an explicit coverage gap. A medical/evidence row is rendered only when at least one exact saved
source binding resolves against the canonical dossier. If none resolves, the projection does not
print or count the claim as answered: it prints a neutral **exact source binding not recorded** row
for the affected canonical field. The unchanged claim can still exist in the complete canonical
dossier below the panel; the projection never rewrites it or invents a source.

Canonical identity is a narrow routing exemption, not a scientific-provenance category. Only the
selected medicine record key and selected programme key may use it without a source. Chemical
identity, composition, registry identity, name-family ambiguity, regulatory status, and other
claim-bearing identity fields use the medical/evidence path and fail closed without an exact source
binding. Those paths cannot select their own row kind to bypass the source requirement.

The projection's `sourceBoundMedicalEvidenceRecords` counter includes only medical/evidence rows
that retain at least one resolved source. Identity rows, operational rows, and coverage gaps never
enter that count.

Every projected record visibly names its row type, canonical field, scope, and
observed-versus-derived state. It shows every exact source binding carried by that field. A source
row retains its direct link, identifier, source version, source effective date, retrieval or
verification date, snapshot hash, and freshness when recorded. Source version, effective date, and
source-specific freshness are shown as **not recorded** when the canonical view lacks them; the
selector does not substitute a nearby source or dossier-wide date.

## The six ordinary-reader questions

Every record receives the same six questions for navigation. That produces six registry entries per
record, but registry entries are not six clinical answers. A question can say that the corpus does
not yet document an answer, that sources differ, or that an exact source needs rechecking.

| Question                                             | Canonical question intent             | Conservative evidence eligibility                                                                                                                                                                                                                                                                     |
| ---------------------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What is this medicine used or studied for?           | `purpose`                             | A reviewed indication scope with an exact resolved source binding, or an exact recorded-use statement with its qualifying source identity. A medicine name, review status, or registry pointer alone does not qualify.                                                                                |
| What happened to people in the cited study or label? | `bottom-line`, `measurement`          | A reviewed outcome with an exact resolved source binding, or a recorded key-study result carrying trial, endpoint, result, timepoint, and source. A trial registration without a result does not qualify.                                                                                             |
| How large was the measured result?                   | `results-magnitude`                   | A source-bound measured result with a printed number. A qualitative finding or a number without its unit/context does not qualify as a magnitude.                                                                                                                                                     |
| What important harm or limitation was recorded?      | `harms`, `meaning-limitations`        | A reviewed limitation with an exact resolved source binding, or a source-bound safety finding. In the recorded-background snapshot the audit counts only boxed warnings and contraindications; it does not promote a common-event list into an “important harm.”                                      |
| Who might this evidence not apply to?                | `applicability`                       | Source-bound study applicability with a trial identifier and recorded inclusion criteria. The reader sees exclusions when recorded; the audit does not infer an excluded population from silence.                                                                                                     |
| What is unknown, conflicting or stale?               | `unknowns`, plus exact issue overlays | A reviewed unknown with an exact resolved source binding, a mapped consensus field whose `comparisonState` is exactly `differ`, or a runtime source binding with a persisted successful assertion check confirming drift. `not_comparable`, an unreachable fetch, and dossier-wide age never qualify. |

The coverage report measures source-bound evidence eligibility in the checked-in snapshot. It does
not claim that every eligible field is already rendered as a question answer, and it does not count
the fixed registry denominator as clinical coverage.

## Specialist measurements

- Chemistry identity is present when the canonical record has at least one recorded molecular
  formula, weight, structure string, or sequence. Background source identity and the legacy
  molecular record are reported separately before their union is counted.
- Quantitative uncertainty is present only when the source printed an uncertainty interval for a
  recorded result. Source disagreement is not an uncertainty interval.
- Source conflict requires comparable readings and `comparisonState: differ`. The report keeps
  `not_comparable` in a separate count.
- Question-level stale requires the exact binding ID and the exact persisted successful assertion
  check described by the freshness contract. When the checked-in public snapshot does not export
  that runtime projection, the report says **not observable** rather than reporting zero.

## What “source read” means

The headline audit measure is **no source excerpt read**: no qualifying source object anywhere in
the recorded-background envelope carries a quotable excerpt. A structured registry pointer can be
checkable provenance, but it is not a clinical source read and does not move a record out of this
group.

The report separately counts **no qualifying source recorded**, meaning no complete source object
with kind, identifier, label, and retrieval date exists anywhere in the envelope. These measures
must remain separate.

## Non-negotiable boundaries

- Lenses never rewrite evidence. An unsourced medical/evidence claim is withheld only from the
  projection panel as an explicit coverage gap; the complete canonical dossier remains available.
- Selecting a lens never changes or replaces the canonical dossier below the projection.
- A comparison that requires missing context is not a disagreement.
- Network failure is not source drift.
- Drift creates a review item and never edits medicine content.
- Missing data describes this corpus, not the medicine and not the state of scientific knowledge.
