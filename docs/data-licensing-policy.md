# Data licensing policy

Last reviewed: 2026-08-30

The core RNAWiki dataset is licensed **CC BY 4.0**. The full legal text is in
[`LICENSE-DATA`](../LICENSE-DATA), which carries the Creative Commons Attribution 4.0 International
Public License and nothing else.

Code is licensed separately and is unaffected by this document: the application in this repository
is AGPL-3.0, in [`LICENSE`](../LICENSE). Two licences, two files, two scopes.

## Why this document exists

The licence text shipped in this repository has always been CC BY 4.0. It has never contained the
word ShareAlike. But until this change the top-level `README.md` said CC BY-SA 4.0 in two places,
`data/README.md` said CC BY-SA 4.0 and added the ShareAlike obligation in prose, the exporter in
`scripts/export/dataset.ts` stamped `CC BY-SA 4.0` into every manifest it wrote, and the
checked-in `data/manifest.json` carried that stamp.

That is not a cosmetic inconsistency. It is exactly the defect for which this project refuses to
ingest another dataset. From
[`docs/recorded-background-data.md`](recorded-background-data.md): ChEBI ships a CC BY 4.0 licence
file whose neighbouring README says CC BY-SA, and RNAWiki does not ingest it until EBI answers
which governs. A careful downstream user applying RNAWiki's own published standard to RNAWiki would
have reached the same verdict and declined to use this dataset — correctly, because a reader cannot
tell from the outside whether the restrictive claim or the permissive file is the real one.

The legal text is the licence that was actually granted, so it wins. The core dataset is CC BY 4.0.
`tests/unit/data-licence-consistency.test.ts` reads the real files from disk and fails if these
declarations ever drift apart again.

## What RNAWiki licenses

Under CC BY 4.0, RNAWiki licenses the things it actually made:

- **The selection.** Which medicines are in the corpus, which sources were read for a record, and
  which facts were judged worth recording.
- **The schema and the structure.** Field names, the normalized programme model, the five
  evidence-chain nodes, the record-depth classification, the shape of the NDJSON rows and the CSV
  columns.
- **RNAWiki's own prose.** Summaries, explanatory text, plain-language rewrites, dossier writing and
  reviewer-authored conclusions produced by contributors for this site.
- **The derived and computed values.** Counts, digests, structure-check results and the bindings
  that connect a claim to the exact source snapshot it cites.

## What RNAWiki does not own and does not relicense

CC BY 4.0 on this dataset grants nothing over material RNAWiki never held rights in. A licence
cannot give away what the licensor does not have.

- **Cited papers.** A DOI, a PMID, an abstract and a published article remain under whatever terms
  their publisher set. RNAWiki records the identifier and, where it can, a short quotation. It does
  not redistribute the paper.
- **Third-party source documents.** Registry records, monographs and any document fetched from
  another body keep that body's terms.
- **Manufacturer label text.** A quoted passage from an FDA-approved label is the manufacturer's
  writing submitted to a regulator, not writing done for this site. `data/README.md` records that
  such passages are marked as quotations where they appear, opening "From the FDA-approved label:".
  Marking them is what makes the boundary visible to a reader; it is not a transfer of rights.

If you reuse a specific quoted passage or a specific cited work, your terms for that material come
from its owner, not from `LICENSE-DATA`.

## Public domain and CC0 source facts

A large part of this corpus is assembled from openFDA (Drugs@FDA, the NDC Directory, SPL labels),
the FDA substance registry, ClinicalTrials.gov, the CMS National Average Drug Acquisition Cost
survey and the NIH Dietary Supplement Label Database. These are US Government works or are released
without copyright reservation, so those underlying facts are in the public domain or effectively
CC0 and were never RNAWiki's to license.

RNAWiki does not claim, and must not appear to claim, copyright over a US Government fact merely
because that fact passed through this pipeline. What RNAWiki contributes on top of those facts —
the selection, the normalization, the bindings, the checks and the prose — is what CC BY 4.0
covers here. Nothing in this dataset's licence restricts anyone from going to the original public
source and using it freely.

Bare facts are in any case a weak object of copyright in most jurisdictions. That is a further
reason to describe the contribution accurately rather than to overclaim.

## Attribution

CC BY 4.0 asks for credit. In practice, for this dataset:

- Name **RNAWiki** and link to `https://rnawiki.com`.
- State **which snapshot** you used. Read `generatedAt` from
  [`data/manifest.json`](../data/manifest.json) and quote it. The directory is regenerated and
  overwritten wholesale on every successful export, so a citation without a date does not identify
  what you actually used.
- Say **that you changed it**, if you did.
- Keep attribution attached to the data, not only to a project page that may later be reorganized.

There is no ShareAlike obligation. You may publish a derivative under different terms.

An attribution is not an endorsement. Crediting RNAWiki does not mean RNAWiki has reviewed or agrees
with what you built, and a source identifier in a snapshot does not establish that the statement it
sits beside is correct or fully sourced.

## How source excerpts are treated

Records carry short verbatim quotations from the documents they were read from. These exist so that
a reader can check that a recorded value is actually present in its source rather than inferred,
and they are deliberately too short to substitute for the source document.

The limit is enforced in code, not by convention:

- `lib/background/label-extraction.ts` sets `EXTRACTION_MAX_EXCERPT = 400` and truncates around the
  matched text when a passage runs longer.
- `lib/rna-intelligence/background-rules.ts` sets `MAX_EXCERPT_LENGTH = 400` and raises a rule
  violation when a stored excerpt exceeds it.

Four hundred characters is roughly two or three sentences. An excerpt is a verification handle, and
excerpts must not be accumulated across records to reassemble a source document. If you need the
whole document, go to the source.

Where a value was transcribed from a structured record rather than read from a sentence, there is no
sentence to quote. Those values are held to a different requirement — the record identifier that
makes them reproducible — rather than being counted as missing excerpts.

## ShareAlike third-party data stays in a separate companion dataset

Some useful third-party datasets are licensed ShareAlike. ChEMBL publishes under CC BY-SA 3.0 and
DrugCentral under CC BY-SA 4.0. ShareAlike is a copyleft obligation: a derivative of that material
must itself be released under the same or a compatible licence.

Mixing such material into the core dataset would therefore do one of two things, both bad:

1. It would silently make the combined product subject to ShareAlike while `LICENSE-DATA` continued
   to say CC BY 4.0 — recreating, with real legal consequences, precisely the contradiction this
   document was written to remove.
2. Or it would force the whole core dataset to become CC BY-SA, imposing a copyleft obligation on
   every existing downstream user who took it under CC BY, including on the parts RNAWiki assembled
   from public-domain government sources that carry no such obligation at all.

So the rule is structural rather than a matter of care at review time. **ShareAlike third-party
material lives in a separate companion dataset with its own licence file, its own manifest and its
own download.** A companion dataset must:

- ship the upstream licence text as its own licence file, not point at `LICENSE-DATA`;
- carry its own manifest whose `licence` field names that upstream licence;
- be downloadable separately, so that a user taking only the CC BY core never incidentally acquires
  a copyleft obligation;
- name the upstream project, its version and the date it was retrieved, so a later licence change
  upstream is traceable to what was actually taken.

A user who wants both can combine them and accept the stricter terms. That has to be their explicit
decision, made with the licences visible, rather than a consequence of two files having been put in
the same folder.

Non-commercial and unlicensed material is handled more strictly again: it is excluded outright
rather than shipped as a companion. PubChem sections sourced from DrugBank (CC BY-NC)
and similar non-commercial sources are dropped at parse time rather than filtered later, and sources
with contested or absent licence terms are not ingested at all.

## This is an engineering decision, not legal advice

**Read this section before relying on anything above.**

This document is an engineering implementation of a decision already taken by the project owner:
that the core dataset is CC BY 4.0, matching the legal text that has always shipped. It records how
that decision is implemented in the repository — which files declare what, which limits are enforced
in code, and how third-party material is kept structurally separate.

It is **not legal advice**, and it was not written or reviewed by a lawyer. It should not be relied
on as an opinion about what any licence requires, about what copyright subsists in any part of this
corpus, or about anyone's obligations under any jurisdiction's law.

Specific questions that need professional legal review before anyone relies on them:

1. **Database rights.** Does the EU/UK sui generis database right subsist in this corpus, who holds
   it, and does a CC BY 4.0 grant over the dataset dispose of it? CC BY 4.0 licenses sui generis
   database rights where the licensor holds them, but whether they arise here — and for a corpus
   assembled substantially from US public-domain sources — is not something this document settles.
2. **Copyright in the compilation.** Does the selection and arrangement clear the originality
   threshold for compilation copyright in the relevant jurisdictions, and does the answer differ
   between Singapore, the US, the UK and the EU?
3. **Excerpt use.** Is a sub-400-character verbatim quotation, retained for verification and
   attributed to its source, within fair use, fair dealing or the relevant quotation exception in
   each jurisdiction where this dataset is distributed — including where thousands of such
   quotations from many documents appear in one downloadable file?
4. **Label text.** What is the copyright status of an FDA-approved label passage, given that the
   text is authored by a manufacturer but published by a US Government body as part of a regulatory
   record? The `data/README.md` limitation note treats these as the manufacturer's words; that is a
   description of provenance, not a legal conclusion.
5. **Licence compatibility.** Would a companion dataset built on CC BY-SA 3.0 material (ChEMBL)
   and one built on CC BY-SA 4.0 material (DrugCentral) be combinable with each other, and what
   would a user combining either with the CC BY core actually owe?
6. **Retrospective effect.** Every published `data/manifest.json` before this change stated CC BY-SA
   4.0. What, if anything, is owed to a downstream user who took a snapshot under that declaration
   and relied on it — and does correcting the declaration to the more permissive licence that the
   shipped legal text always granted create any exposure at all?
7. **Contributor grant.** Under what terms do contributors grant RNAWiki the right to publish their
   prose under CC BY 4.0, and is that grant recorded anywhere a court would recognise?

Until those are answered by a qualified professional, treat this document as what it is: an accurate
description of what the repository now does and why, written by the engineer who made the files
agree.

## What was not verified when this document was written

Per the project's own honesty rules, the gaps are stated rather than papered over.

- The CC BY 4.0 text in `LICENSE-DATA`, the zero occurrences of ShareAlike in it, and the four
  conflicting declarations were all verified directly against the files in this repository.
- The 400-character excerpt limit was verified by reading the two constants that enforce it.
- The ChEMBL (CC BY-SA 3.0) and DrugCentral (CC BY-SA 4.0) licence identifiers were **not** fetched
  and read from those projects in this change; they are recorded here as the licences those projects
  are understood to publish under. Neither dataset is ingested. Before any ingestion, read the
  upstream licence file at the time of ingestion and record what it said, as was done for the
  sources in [`docs/recorded-background-data.md`](recorded-background-data.md).
