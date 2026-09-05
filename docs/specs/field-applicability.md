# Field applicability (revamp Phase 1.2)

**Status:** fixed 2026-09-05 (Fable). Machine-readable twin: `data/revamp/field-applicability.json`,
read by `scripts/revamp/derive_threshold.py`. Presence is henceforth counted over applicable fields
only. A field is `applicable`, `not-applicable` (structural, with the reason), or `pending_source`
(present on under 1 % of pages in every tier where it appears, until a Phase 2 source fills it — it
leaves the denominator and re-enters automatically when the census shows it filled).

Evidence for each structural call is the before-census (`data/revamp/field-census-before.csv`):
a field present on tens of percent of one population and near zero on another is a structural
non-applicability, not a data gap. Tier 1 is two populations — LONGEVITY-model pages (1,109) and
withdrawn CLINICAL-model pages (610) — and the matrix keeps them apart because their field sets
differ.

| Field | Tier 1 LONGEVITY | Tier 1 withdrawn (CLINICAL) | Tier 2 CLINICAL | Tier 3 DEVELOPMENT | Reason |
| --- | --- | --- | --- | --- | --- |
| hallmark | applicable | n/a | n/a | n/a | LONGEVITY field; a hallmark can be cited for any compound studied in ageing (49 % present) |
| organismLadder | applicable | n/a | n/a | n/a | LONGEVITY field (97 %) |
| itp | applicable only when the compound appears in the NIA ITP legend (`data/corpus-20k/raw/jax-itp`, 47 mapped agents) | n/a | n/a | n/a | programme membership, not a property of every compound: 4.6 % present is the size of the programme |
| endpointType | applicable | n/a | n/a | n/a | LONGEVITY (97 %) |
| humanCeiling | applicable | n/a | n/a | n/a | LONGEVITY (95 %) |
| clocks | applicable | n/a | n/a | n/a | any compound can be measured against a clock; 8.7 % is a data gap, kept in the denominator |
| doseResponse | applicable | n/a | n/a | n/a | LONGEVITY (70 %) |
| pathway | applicable | n/a | n/a | n/a | LONGEVITY (61 %) |
| kinetics | applicable, except combination products (existing rule NA-COMBINATION) | n/a | n/a | n/a | LONGEVITY (44 %) |
| interactions | applicable | applicable | applicable | n/a | shared field; 41 % / 15 % — a data gap Phase 2 (labels, Inxight) fills |
| trialFailures | applicable | applicable | applicable | n/a | registry-derived; applies wherever a registry study exists; kept applicable everywhere it is modelled |
| biomarkers | applicable | n/a | n/a | n/a | LONGEVITY (90 %) |
| regulatory | applicable | applicable | applicable | n/a | shared (78 % / 75 %); Phase 2 fills the jurisdictions |
| ongoingTrials | applicable | n/a | n/a | n/a | LONGEVITY (78 %) |
| faers | applicable | applicable | applicable | n/a | shared (46 % / 36 %) |
| doseStudied | applicable | applicable | applicable | n/a | lifted field, counted by the loader (40 % / 24 %) |
| approvalDate | not-applicable unless the page is approved in any cleared register | applicable | applicable | n/a | an approval date exists only for approved medicines; 72.6 % on withdrawn arcs, 51 % on Tier 2 |
| indication | n/a | applicable, except NA-LABEL-CLASS (supplement/botanical without a US label) | same | n/a | label-derived (9 % on withdrawn arcs whose labels are gone; 53 % Tier 2) |
| labelKinetics | n/a | applicable, except NA-LABEL-CLASS | same | n/a | label-derived (5 % / 27 %) |
| adverseEvents | n/a | applicable, except NA-LABEL-CLASS | same | n/a | label-derived (7 % / 31 %) |
| trialHistory | n/a | applicable | applicable | n/a | registry-derived (60 % / 71 %) |
| withdrawal | n/a | applicable | **not-applicable unless `withdrawn` is true** | n/a | 52 % on withdrawn arcs, 4.4 % on Tier 2: a withdrawal reason exists only for withdrawn pages |
| target | n/a | n/a | n/a | applicable, except no ChEMBL id (existing rule) | 10.8 % present; 3,969 pages not-applicable |
| mechanismClass | n/a | n/a | n/a | applicable, except no ChEMBL id | 11 % |
| highestPhase | n/a | n/a | n/a | applicable | applies everywhere (51 %) |
| whyStopped | n/a | n/a | n/a | applicable only when a registry study of the page is stopped | the registry reason exists only for stopped trials; 8 % present is the share with stopped trials |
| sponsor | n/a | n/a | n/a | applicable only when a registry study exists | sponsor is a registry fact (21 %) |
| patentStatus | n/a | n/a | n/a | **pending_source** | 0 present in every tier; Phase 2 source 9 (Orange Book patents, Purple Book) fills it, then it re-enters |
| everDosedInHumans | n/a | n/a | n/a | applicable | a boolean present by construction on 100 %; it counts once and never discriminates |
| relatedOnTarget | n/a | n/a | n/a | applicable, except no ChEMBL id | 9.6 % |

Consequences (corrected 2026-09-05 after `derive_threshold.py` measured the records): a LONGEVITY
record carries 16 field entries (15 nested + doseStudied), so its denominator is 15 without ITP and
16 for the 51 ITP-tested pages (14 where kinetics is NA-COMBINATION, 17 pages); approvalDate exists
on only 6 LONGEVITY records. The withdrawn-arc denominator is 11 minus label fields under
NA-LABEL-CLASS; the Tier 2 denominator is 10 (withdrawal excluded unless withdrawn; 132 recall-note
`present` entries with withdrawn = false leave both numerator and denominator) minus NA-LABEL-CLASS;
the Tier 3 denominator is 7 (patentStatus pending_source) minus the no-ChEMBL and no-registry
exclusions. highestPhase applies to every DEVELOPMENT page, so no Tier 3 page has exactly one
applicable field: the floor is 2 (everDosedInHumans + highestPhase) or 5 with a ChEMBL id; 3,512
Tier 3 pages hold fewer than 3 applicable fields and are reported as stubs. The stub floor of 3
(R15) makes a bucket below 3 ineligible for selection, so a small-denominator page can never read as
fully covered. The threshold
script buckets pages by **present count over applicable fields** within each tier and applies the
Gate 1b rule quoted in `data/revamp/orient.md` unchanged.
