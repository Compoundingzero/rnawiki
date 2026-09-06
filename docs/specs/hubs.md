# Hubs (revamp Phase 5)

**Status:** fixed 2026-09-06 by the lead (Fable). `docs/specs/revamp-2026-09.md` §Phase 5 sets the
criteria and the gate; this file sets the page. Everything a hub says is generated from its
members' stored fields and derived sections; nothing is free-written. The Phase 4 slop gate
applies to hub syntheses.

## 1. Hub types, membership, slugs

| Type | Members | Criterion | Slug |
| --- | --- | --- | --- |
| Target | pages whose target rows (ChEMBL mechanism, Inxight, DrugCentral, IUPHAR, UniProt accession) name the target | ≥ 5 members, of which ≥ 1 approved (any register) or ≥ 3 reached a clinical phase | `/h/target/<gene-symbol-or-uniprot-name>` |
| Mechanism class | pages sharing an ATC level-4 code or an IUPHAR ligand class | ≥ 5 members | `/h/class/<atc4-or-iuphar-class>` |
| Pathway | LONGEVITY pages whose pathway field names the pathway (mTOR, AMPK, sirtuins, NAD+ metabolism, senolytic targets, autophagy, GLP-1, and whatever the field surfaces) | ≥ 5 members | `/h/pathway/<pathway>` |

Membership is computed by `scripts/revamp/hubs_build.py` from `data/revamp/fields-v2` and
`data/revamp/identity/canonical-v3.ndjson`, written to `data/revamp/hubs/members.parquet`
(hub_id, type, name, page, membership_evidence, member_role: approved | clinical | development |
withdrawn). A page can belong to many hubs; a hub never lists a page twice.

## 2. Page anatomy (in order)

1. Title and one-line definition from the source vocabulary (UniProt name for a target, ATC
   description for a class, the pathway name for a pathway); the source and date in the same line.
2. **Comparison table** over every member, one row per member page, columns in this order:
   name (link) · approval by jurisdiction (SG · US · AU · UK · EU · JP · CA, each cell a status
   word or "not found") · Singapore forensic class (POM / P / GSL / not listed) · generic
   available (yes / no / no record) · potency (pChEMBL against this hub's target, blank on other
   hub types) · approved indications (label, first three, count) · withdrawn (reason, where) ·
   trials (count · results-posted share) · tier. Rows sort: approved first (by number of
   jurisdictions), then clinical by highest phase, then development, then withdrawn. The table is
   markup; its cells are values, never sentences, so the uniqueness ruler reads only the synthesis.
3. **Synthesis** — four to eight sentences, each generated from a template bound to table columns
   and the members' derived sections, in this order and only when the inputs exist:
   - What is approved: "N of M members are approved somewhere; K in Singapore (list up to five,
     with forensic class)." Template `H1`.
   - What died and why: from the members' failure autopsies (seed 3) and withdrawn arcs: "R
     members stopped development; the registry's stated reasons cluster as accrual (a), safety (b),
     futility (c) …; W were withdrawn after approval (name, reason, where)." Template `H2`.
   - What a Singapore reader can access: "Of the approved members, S are in the HSA listing: P
     prescription-only, Q pharmacy-only, G general sale; T are on a Misuse of Drugs Act schedule."
     Template `H3`. Never a recommendation; never a dose.
   - What is predicted from mechanism: from the interaction engine, hub-wide: "The mechanism
     predicts additive <class> effects across E member pairs; L of those are also
     label-documented." Template `H4`.
   - What the registry-to-publication gap says: from seed 12 over the members: "Across the hub's
     U completed trials, V posted results; the oldest unposted completed trial is <NCT>, <year>."
     Template `H5`.
   - Potency spread (target hubs only): "Recorded pChEMBL values span a to b across C members;
     the most potent recorded is <name> (binding assay)." Template `H6`.
   - Longevity evidence (pathway hubs only): from the organism ladder and ITP fields: "D members
     carry lifespan evidence in <organisms>; I are in the NIA Interventions Testing Program."
     Template `H7`.
   Each sentence carries its provenance map (sentence → columns/fields). A template that would
   name a device ("the problem", "the lesson") is forbidden; a template whose inputs are absent is
   skipped without a placeholder.
4. **Members** list (all, linked), grouped by role, with the member's one-line first question
   as its description.
5. Sources: the vocabulary record, the registers and dates consulted.

## 3. Indexing and links

- Hubs are indexable and in a `hubs.xml` sitemap child; Tier 3 remains absent from every sitemap.
- Every hub links every member; every member page carries a "Hubs" row listing every hub it
  belongs to (markup, never prose), so leaves below their tier's threshold are `noindex,follow`
  and still reach the hubs.
- Navigation: `/h` index page listing hub types and hubs (alphabetical within type, with member
  counts); the home page keeps its frozen bar and gains nothing.
- `scripts/revamp/link_graph_check.py` (CI): no hub with fewer than five leaves; no indexable
  leaf without at least one hub (or a recorded reason: no target, class or pathway field); no hub
  unreachable from `/h`; every member link answers 200 on the build.

## 4. First batch and measurement

Rank target hubs by approved-member count × relevance (1 when the target carries an ITP or
ageing-trial link, else 0.5); pathway hubs by approved-member count (relevance 1). Build the top
20 target hubs and 10 pathway hubs first; measure positional and lexical overlap across the 30
syntheses with the corpus-20k scripts (`scripts/corpus-20k/overlap/measure.py`); both lines
(0.20 positional, 0.353 lexical) must clear. Then build every hub meeting §1 and re-measure over
all hubs. Record in `data/revamp/hubs/measure-first-batch.json` and `measure-all.json`.

## 5. Copy rules

Explain each term once on the hub (pChEMBL, forensic class, results-posted). No promotional
words. A hub never states that a compound works, is safe, or should be taken; it reports what the
registers, labels, registry and derived sections record, with dates.
