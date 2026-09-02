# Medicine dossier 2.0

## Product boundary

RNAWiki continues to lead with **Understand any drug in 10 seconds.** Search remains the homepage's
primary action. The canonical medicine URL remains `/d/[medicine-slug]`; a selected question about
one use is shareable as `/d/[medicine-slug]?programme=[programme-slug]`.

The dossier uses a short reading path with nested detail:

1. Medicine identity and the plain question this page answers: what the medicine was used or
   studied for, and in whom.
2. A short answer with the intended use, clearest research result, and main uncertainty. Published
   wording for a specific use remains bound to its reviewed revision; general research summaries
   use their stored plain result fields instead of exposing a dense technical verdict as the first
   read.
3. The first screen uses everyday words that stand on their own. If one unfamiliar term is essential,
   its familiar meaning appears in the same sentence. Readers never need to hover, tap, or open a
   glossary to understand the short answer.
4. A collapsed **How does it work?** explanation keeps the simple mechanism close without putting
   molecular details in the first read.
5. The original longer wording remains available in the general research summary, clearly labelled
   as detailed wording rather than a second conclusion.
6. **See how we know**, collapsed by default.
7. The reviewed answer, connected evidence steps, study-quality questions, results, mechanism, sources,
   freshness, and review history.
8. A separate collapsed **More about this medicine** section for useful medicine-wide background
   from the general research summary. It is a sibling of the evidence disclosure, not part of the
   proof for the selected reviewed answer.
9. Substantive community commentary, when present, remains separate from both reviewed evidence
   and general medicine background. Empty community sections stay hidden.

The first screen does not use contextual definition controls. Unfamiliar wording must be replaced
with familiar wording, defined briefly in the sentence, or moved out of the short answer. Technical
terms are not discarded: the exact clinical or scientific wording remains available under
**Read the full research wording** or **See how we know** for readers comparing the page with a study
or source. Exact study identifiers, percentages, comparison groups, endpoint wording, uncertainty
ranges, source fingerprints, and professional classifications belong in that expanded evidence
path unless a value is necessary to understand the main result.

No evidence-bearing copy is defined in a component. A reviewed view for a specific use is assembled
from database rows. Pages without a published reviewed version keep their medicine-wide research
visibly separate under **What the research reports** and **General research summary**. The summary
must say: **This combines research on different uses and groups. It is background, not a reviewed
answer for one specific use.** When no reviewed answer has
been published, the interface says **No reviewed answer yet**; the application does not create a
verdict to fill a gap.

## Scope and verdict rules

The authoritative hierarchy is:

```text
Medicine
└── Development programme
    ├── Indication and population
    ├── Dose, route, sponsor, jurisdiction, and dates
    ├── Trials and interpretability assessments
    ├── Source snapshots and evidence claims
    ├── Five evidence-chain nodes
    └── Reviewed verdict revision
```

A stopped-programme verdict can exist only when programme status is `STOPPED` or `WITHDRAWN`.
`IDEA_FAILED`, `MOLECULE_FAILED`, and `TEST_UNANSWERED` never describe a medicine globally.
Active, recruiting, planned, completed, or approved programmes may have a reviewed conclusion but
cannot receive a stopped-programme verdict code. Missing evidence is `UNKNOWN` or `NOT_MEASURED`,
never an inferred failure.

## Reviewed programme evidence chain

The public chain always uses the same causal order:

1. Human exposure — was it given to people?
2. Useful exposure — did enough reach the right place?
3. Target engagement — did it hit the intended target?
4. Biological response — did the body change as expected?
5. Patient outcome — did patients actually benefit?

Each node has a visible text state and icon in addition to colour. Nodes are horizontal only when
there is genuinely enough room and vertical at mobile widths. A node links to claims, and claims
link to immutable source snapshots. Claim nature (`MEASURED`, `SPONSOR_REPORTED`,
`REGULATORY_FINDING`, `RNAWIKI_JUDGEMENT`, or `UNKNOWN`) is displayed separately from node state.

Medicine-wide research findings are not silently promoted into this causal chain. When no reviewed
evidence graph exists for one specific use, populated notes appear as an unconnected **Research
findings** list, without step numbers, connectors, or reviewed scientific-state badges.

## Editing and public laboratory content

Material medical conclusions, safety interpretations, evidence-node states, and programme verdicts
always require human review. Trust level does not bypass this boundary. Only tightly scoped,
source-exact metadata may remain eligible for automatic publication after deterministic checks.

Existing technical molecular and workflow data is preserved. Actionable laboratory procedures are
not rendered in the public medicine dossier and are not expanded or generated by dossier 2.0.

## General medicine information kept separate

The separate **More about this medicine** disclosure retains populated condition background,
general safety and administration context, conventional comparison context, common questions,
pricing, and molecular identity. Each is mapped from the database-backed medicine row and labelled
as general medicine information; none is used to construct or support a reviewed answer for one
specific use.
Substantive published community commentary appears after that disclosure as a separate section,
because commentary is neither evidence nor background from the medicine record.

- Price figures remain exactly as reported. Stored sources are linked when present; otherwise the
  page says that source, date, place, and assumptions cannot be checked from the field alone.
- Conventional approaches are alphabetical, explicitly non-equivalent, and never presented as a
  recommendation or ranking. Natural-food daily-use and home-remedy fields are not exposed.
- Common answers are labelled as background, not instructions for starting, stopping, or changing
  treatment.
- Safety and administration wording remains closed by default and is explicitly general medicine
  information, not personal dosing advice. It preserves recorded side effects, serious risks,
  contraindication wording, and how the medicine was given without moving those details into the
  ten-second evidence conclusion.
- General research findings lead with their plain summary. Their stored measured metric, exact technical
  wording, inference, audit flag, and audit-specific source remain available under **Technical
  evidence details** so professional information is not discarded by simplification.
- Community notes render only when at least one published note has substantive text. Posting and
  helpful-mark controls use the existing authenticated server routes. The server attributes a note
  to the signed-in account rather than accepting an author from the request. Commentary is not
  evidence, is not checked by RNA Intelligence, and does not affect a reviewed conclusion.
- The collapsed molecular record may show the recorded sequence or structure string, formula,
  weight, and deterministic check status. It never receives `laboratoryWorkflow`, reagents,
  synthesis, purification, or quality-control steps.
- Empty context modules are omitted.

## Accessibility and rendering

- The first layer and advanced content are server rendered.
- The short answer is ordinary, selectable text. Its meaning does not depend on hover, touch,
  JavaScript, a glossary, or assistive-technology-only copy.
- Professional wording and exact evidence use labelled native disclosures that remain operable by
  touch and keyboard.
- A direct advanced-section hash opens the disclosure after hydration and moves keyboard focus to
  the linked heading.
- Focus rings, text labels, and minimum touch sizes do not rely on hover or colour.
- Explanatory and interactive text is at least 14 CSS pixels; secondary metadata is at least 12 CSS
  pixels. Dense multi-column evidence layouts collapse to an ordered vertical read on small and
  medium screens.
- Motion is limited and disabled by `prefers-reduced-motion`.
- Empty advanced modules are omitted.
- The layout must not scroll horizontally at 320 or 375 CSS pixels.

## Compatibility migration

The database migration is additive. Existing medicine columns and URLs remain intact. The public
read path uses a current programme publication only when the publication pointer, published verdict,
published claims, and published nodes are internally consistent. Otherwise, medicine-wide material
remains visibly labelled **General research summary** or **What the research reports**, and missing
reviewed answers say **No reviewed answer yet**. Existing content is never silently promoted into a
reviewed answer for one specific use.

## Record completeness

A record that carries a completion assessment shows one **How complete this record is** section,
placed directly after the question universe inside the closed advanced evidence disclosure. A record
without an assessment shows nothing in its place, and the section navigator offers the row only where
the anchor exists.

The section prints the status sentence, the date the states last changed, the number of applicable
sections that have reached a state, and then all twenty sections in reading order: the section name,
its state as visible text, the sentence saying what was found or not found and where, the counts
behind it in words, and the exact source references. A reference links out only where a public page
exists for that identifier shape: label set ids to DailyMed, registration numbers to
ClinicalTrials.gov, compound ids to PubChem, organism ids to NCBI Taxonomy. A search record, an
ingest label or an identifier of an unexpected shape stays text, because a link that may not open is
worse than the identifier on its own. Where a person reading the named source could add something
the parser did not, the section says so. Where a section has no state yet, it carries what has to
happen, and every such section is repeated in a short **Still open** list above the full list.

Two rules govern the copy.

1. **A state describes the sources that were read, never the medicine.** "Searched; no qualifying
   record found" is a search result. "Registered; results not posted" is a registry fact.
   "Does not apply to this kind of record" is a rule about the record class. None of them is
   evidence about safety, effect or use, and none may be summarised as one.
2. **No record is shown in relation to another record.** Where a registry identifier on this record
   also appears elsewhere in the corpus, the identity sentence says that the records are kept
   separate. It never names, counts or links the other records, because the corpus holds salt and
   parent pairs, biosimilar families and registry errors under one identifier, and a pointer between
   them would assert a sameness no resolver established.

Raw state codes, basis kinds, the resolver version and the input digest appear only inside the
labelled technical record disclosure at the end of the section, which is closed by default.
