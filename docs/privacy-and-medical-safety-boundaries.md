# Privacy and medical-safety boundaries

## Non-negotiable truth rules, and where each is enforced

| Rule                                                                | Enforcement                                                                                               |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 1 A mechanism is not proof of human benefit                         | Mechanism stages carry an evidence origin; the "What this does not prove" card is always rendered         |
| 2 A biomarker change is not a benefit                               | `maximumClaimStrength` + SQL `reviewed_claims_strength_cap`; outcome class D/E capped at `biomarker_only` |
| 3 Mention in a trial ≠ administered                                 | `trial-role-classifier/v1`; only `experimental_intervention` counts as tested                             |
| 4 A comparator or background therapy is not the tested intervention | `administered_role_unclear` when arms cannot be resolved; SQL `reviewed_claims_benefit_needs_tested_role` |
| 5 A class is not a substance                                        | Identity spec: `MEMBER_OF_CLASS` never transfers evidence                                                 |
| 6 Salt, base, isomer, metabolite, formulation, combination differ   | `IDENTITY_RELATIONS`; only `SAME_ENTITY_AS` transfers evidence; combination pages keyed by component set  |
| 7 A spontaneous report is a signal                                  | Fixed framing above every count; counts are "reaction mentions"                                           |
| 8 No evidence found ≠ safe                                          | `interactionAbsenceLine`; absence states carry "This is not evidence of safety"                           |
| 9 Absence of evidence ≠ evidence of absence                         | `no_qualifying_evidence_after_search` state text                                                          |
| 10 A predicted edge is a hypothesis                                 | `predicted_edges` never joins a public page unreviewed; tier C lines say "Predicted from mechanism"       |
| 11 Relative effects need absolute context                           | `validateClaimInput` refuses `relative` without `absoluteEffect`                                          |
| 12 Every strong public claim has source, scope, review state, class | `reviewed_claims` columns and CHECKs; drafts never render                                                 |
| 13 Unknown is a valid, visible result                               | "What we still do not know" is a first-class section; completion states are shown on the card             |
| 14 Simplified wording never strengthens a claim                     | `plainVersionViolations`                                                                                  |
| 15 A disclaimer is not information architecture                     | The Decision Card's absence states are structural, not a footer sentence                                  |

## Prescription and supervised medicines

The page never generates individualised prescription dosing. For a substance whose supervision level
is `required`, or that is suppressed, controlled, withdrawn or investigational, the "What to
measure" section renders the clinician-question pattern only (`measureFrom`). Dose text appears on
the page only inside the deep-evidence layer, exactly as the registry or label recorded it, under
its own source. Nothing on any page says a substance is suitable for children; the Decision Card
says so in its note.

## The single-person observation plan

Offered only for a substance classed as a supplement, nutrient, botanical preparation or
over-the-counter medicine that is not suppressed, controlled or withdrawn. It is a structure —
goal, primary outcome, baseline, one changed variable, confounder record, washout, stop rules,
side-effect record, and a final reading that separates "consistent with benefit" from "proved
cause" — and it never calculates an amount. It is refused for children, pregnancy, prescription
self-medication, controlled substances, high-risk compounds, active serious disease without
professional oversight, and any substance the identity stage could not class.

## Privacy

- Analytics load only after consent (`components/GoogleAnalytics.tsx`, `lib/island/analytics.ts`),
  send page views only, and strip query strings and fragments. The page path names the substance
  viewed; a reader who declines analytics sends nothing.
- The goal lens is radio inputs in the page; a chosen goal is not sent anywhere and is not stored.
- The stack checker and the experiment planner, when implemented, keep every input (substances,
  conditions, surgery dates, measurements) in the reader's browser (`localStorage`), make no request
  that carries them, and never emit an analytics event that names a substance or condition. Any
  future sync requires explicit consent, encryption, export and deletion.
- The private user graph is not part of the public evidence graph and is never used to train a
  model.
- Search text is not logged with an identifier; the search API rate-limits by hashed session.

## Review boundaries

RNA Intelligence and the dossier v3 code check structure. They do not call a language model, write
medical prose or select a verdict. A reviewed claim is signed by a person who is not its author
(`reviewed_claims_reviewer_not_author`), is frozen once reviewed, and can only be superseded or
retracted by a later transaction that the "What changed" section shows.
