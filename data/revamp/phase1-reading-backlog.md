# Findings from the lead's reading of the 180-page sanity sample (Phase 1.5, 2026-09-05)

Each item names the phase that owns the fix. None changes the threshold derivation.

## Identity (Phase 3)
- `K3:nan` "COPPER OLEINATE" (Tier 1, 8 fields): a NaN ChEMBL key merged hundreds of unrelated records (cisplatin analogue, rosemary extract, vehicle/placebo, IL-1β, cadexomer iodine…) and 800+ trials. Split by source record; every merged key must be non-null.
- `(R)-BICALUTAMIDE` (Tier 3) carries the racemate's 149 trials and no synonyms: registry matching by name landed on the stereo split. Trials matched by a parent name belong to the parent page; the enantiomer keeps only trials naming it.
- Biosimilar pages (adalimumab-afzb / -ryvk, trastuzumab-dkst / -pkrb, rituximab-pvvr, aflibercept-jbvf, pegfilgrastim-bmez, ustekinumab-aekn) render the parent's whole trial set, so each pair reads identical except the brand. The rendered duplicate check (3.6) will flag them; differentiate by the biosimilar's own BLA, approval date and own trials, and list the parent's trials as the parent's.
- Seven Pneumovax-23 serotype antigen pages (Tier 1, 6 fields) share one trial set verbatim: components of one product. Compose onto the product (the "a page is a product" rule) or link as components; they sit below the line today.
- `K4:alkaline`, `K4:polyamine` (Tier 3): registry intervention-name fragments, not substances. Review list.
- `AMOXICILLIN/CLAVULANIC ACID` (COMBO) is in Tier 3 DEVELOPMENT despite approvals everywhere: the combination page has no register mapping. Phase 2 label/register mapping must map multi-ingredient products to the combination page.

## Generators (Phase 4)
- Dose-response ("More X was worse in Y: at what point?") quotes sentences from unrelated papers when the Europe PMC search matched only the shape word: 2C-B quotes an economics abstract ("AGG-GTFP nexus"), D-PROLINE quotes NiONPs on plants, Aluminum Sulfate quotes serum lead. Rule: a quoted sentence must contain the compound name or a recorded synonym, else the section does not fire.
- "Classification S8 is recorded for Phenformin" leaks a raw suppression enum into prose; render the ordinary-language label.
- Tier 2 register rows dominate the page text (dozens of "US ANDA… approved · Drugs@FDA · application …: Prescription · 2026-08-28" lines). Render registers as a compact table with the repeated tokens as headers, a one-line summary per jurisdiction ("8 US applications: 5 prescription, 3 discontinued"), and the id list inside a disclosure. This is the visible cause of Tier 2's lexical floor and is re-measured after Phase 4.
- Trial-endpoint lists ("Trial NCT… <outcome>; <timeframe>") run to 15+ lines on vaccine and oncology pages; cap the inline list and disclose the rest.

## Reads well at the line
- Tier 1 at 7: register status + measured endpoints + a ladder rung or half-life (Aducanumab, Pegaptanib, Phenformin with C. elegans/mouse/rat lifespan rungs, Anacaulase with its label half-life).
- Tier 2 at 8–9: label indication + registers + phases + stop reasons + half-life (Alosetron, Rilzabrutinib, Minoxidil, Azathioprine).
- Tier 3 at 4: stop reasons are the most informative line on the tier (Lotiglipron's transaminase termination, Stannsoporfin's "redefine study population").
