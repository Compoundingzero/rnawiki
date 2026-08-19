# Licensing

RNAwiki is published under two licences, because the software and the evidence records are
different things and reusers need different terms for each.

| What | Licence | File |
|---|---|---|
| Source code — the application, components, queries, migrations, scripts and tests | GNU Affero General Public License v3.0 | [`LICENSE`](../LICENSE) |
| Evidence records — the editorial writing and the structured claim database | Creative Commons Attribution 4.0 International | [`LICENSE-DATA`](../LICENSE-DATA) |

Copyright © 2026 RNAwiki (https://rnawiki.com).

## The code: AGPL-3.0

You may read, run, modify and redistribute the software. Two obligations come with it:

1. Distributing a modified version means distributing its source under the same licence.
2. **Running a modified version as a network service means offering that service's users the
   source of your modified version.** This is the clause that separates the AGPL from the GPL, and
   it is the reason it was chosen: RNAwiki is a website, so a licence whose obligations only fire
   on distribution would not fire at all.

Self-hosting an unmodified copy, reading the code, and auditing how a published answer was
produced all carry no obligation beyond the licence notice.

## The evidence records: CC BY 4.0

You may copy, redistribute, adapt and build on the evidence records, including commercially and
including as training or retrieval data for a machine-learning system, provided you give credit.

Credit means naming RNAwiki, linking to the record you used, and indicating whether you changed
it. A claim's canonical URL is the stable citation target — the record page anchor, for example
`https://rnawiki.com/r/bpc-157#claim-tendon-healing`. The public API returns the same URL as
`canonicalUrl` on every claim.

A worked attribution:

> Evidence record from RNAwiki (https://rnawiki.com/r/bpc-157#claim-tendon-healing),
> CC BY 4.0. Retrieved 19 August 2026. Unmodified.

Attribution is not a formality here. The record is versioned and its conclusion can change, so a
citation without a link and a retrieval date describes a state of the evidence that may no longer
hold. `claimVersion` and the public change history exist so a citation can be pinned to what was
actually said.

## What RNAwiki cannot license to you

The CC BY grant covers **RNAwiki's own work**: the plain-language writing, the classification of a
claim's evidence position, the recorded relationships between claims and sources, the claim events,
and the structure of the database.

It does not cover, because they are not RNAwiki's to grant:

- The cited papers themselves, their abstracts and their figures. Those belong to their authors and
  publishers, and each carries its own terms.
- Regulatory documents, which carry the terms of the issuing authority.
- Any third-party trademark, including the names of medicines and their manufacturers.

Identifiers and facts — a DOI, a PMID, an NCT number, a sample size, a reported p-value — are not
copyrightable in themselves, and nothing here asserts a claim over them.

## What neither licence grants

Neither licence is a warranty, and neither is a medical authorisation. Both disclaim liability in
their own terms. RNAwiki explains research evidence; it is not reviewed by a clinician and does not
provide medical advice, diagnosis, dosing or sourcing guidance. Reusing a record does not transfer
any authority it does not have.

Publication status in this repository is editorial workflow and never scientific review — see
[`docs/editorial-methodology.md`](editorial-methodology.md). A reuser who presents a published
record as peer-reviewed is misrepresenting it, whatever the licence permits.

## Contributing

Contributions are accepted under the same two licences: code under AGPL-3.0, evidence content under
CC BY 4.0. There is no contributor licence agreement and no copyright assignment.

Evidence contributions go through the editorial workflow in
[`docs/editorial-methodology.md`](editorial-methodology.md), not through a pull request that edits
the database directly. Every cited source must be a real, checkable DOI, PMID, trial identifier or
regulatory URL, verified at the time it is added. The rule against fabricated citations,
reviewers and statistics in [`CLAUDE.md`](../CLAUDE.md) applies to contributors exactly as it
applies to the maintainer.
