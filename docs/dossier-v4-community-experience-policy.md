# Dossier v4 — community experience policy

## Position

RNAWiki does not read, scrape, copy or import reports from any third-party forum or archive. The
community lane holds reports sent to RNAWiki by people who consented to their use, and nothing else.
Until that intake exists the lane renders in the `feature_not_enabled` state, with its categories
and its ranking rules visible.

The lane renders before any report exists on purpose. A lane that appears only once it is full of
favourable reports is an advert.

## Separation

Reports are never counted as evidence, never mixed into a goal row, and never aggregated into a
probability. One person is not a rate. The lane is its own truth lane and its own section.

## Record shape

`report_id`, `exact_entity_id`, `identity_confidence`, `goal`, `age_range`, `relevant_context`,
`formulation`, `route`, `reported_duration`, `expected_result`, `subjective_result`,
`objective_result`, `no_effect`, `adverse_effect`, `discontinued`, `professional_care_required`,
`co_interventions`, `confounders`, `reporter_confidence`, `follow_up`, `moderation_state`,
`privacy_state`, `consent_version`.

## Categories

Ten, in `lib/dossier-v4/taxonomy.ts`. Four are for things going wrong, and one is for nothing
happening: expected effect, no noticeable effect, unexpected effect, adverse experience, stopped
early, combination experience, long-term experience, withdrawal or rebound, uncertain product,
medical attention.

## Ranking

Permitted: completeness, identity certainty, context, follow-up, confounder disclosure, and whether
objective and subjective results were kept apart.

Forbidden: sentiment, and any aggregation of reported amounts into a suggestion.

## Before intake opens

A licence and consent review, a moderation and triage process with a named owner, a privacy state
per report, a consent version recorded on every row, and a deletion path. None of those exists yet,
which is why the lane says it is not switched on rather than inviting a report it cannot yet handle.
