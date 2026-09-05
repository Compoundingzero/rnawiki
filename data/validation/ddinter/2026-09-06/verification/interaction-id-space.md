# The pair `interaction_id` and the description table `id` are different id spaces

Checked 2026-09-06 while building `data/validation/ddinter/index.parquet`, because a first build
joined the two on equal integers and produced 8,371 pairs carrying a sentence about a different
drug pair.

## Measurement

    description ids (POST /server/interaction-source/):  n=8466   min=-1  max=8576
    pair interaction ids (POST /server/interact-with/):  n=302515 min=1   max=302665
    pair ids that also exist as a description id:        8464
    descriptions never named by a pair id:               2

302,515 distinct pair interaction ids matches the 302,516 DDI records the statistics page states,
so the pair ids are row ids of the interaction table. The description ids stop at 8,576 for 8,466
rows, so they are row ids of the description table. They overlap at the low end by coincidence.

## Four checked cases

| pair `interaction_id` | the pair it belongs to | text of the description row with the same id |
| --- | --- | --- |
| 9 | Chloral hydrate – Abacavir (Minor) | "Coadministration of sacubitril-valsartan with an ACE inhibitor may increase the risk of angioedema…" |
| 10 | Abacavir – Chlorpromazine (Minor) | "Severe adverse effects, including fatalities, have been reported following the administration of flumazenil…" |
| 3039 | Acalabrutinib – Warfarin (Major) | "Concomitant use of 5-HT3 receptor antagonists with agents that possess or enhance serotonergic activity…" |
| 21801 | Sertraline – Amiodarone (Major) | no description row with that id exists |

None of the four descriptions belongs to its pair.

## Consequence, applied in `scripts/revamp/ddinter_index.py`

`index.parquet` carries `interaction_id` and the seven mechanism flags the per-drug endpoint
returns (absorption, distribution, metabolism, excretion, synergistic effect, antagonistic effect,
others) and no description text. The 8,466 descriptions are written unjoined to
`interaction-descriptions.parquet`. No public DDInter endpoint returns the description belonging to
a named pair; retrieving them one pair at a time through the interaction checker would be 295,184
requests and is not attempted.

Commands: the four cases were read from `raw/interact-with*.ndjson` and
`raw/interaction-source/page-*.json`; the request log is `../requests.log`.
