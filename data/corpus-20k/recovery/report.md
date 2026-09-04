# Phase 1 — recovering the 20 compounds the biohacker slices could not reach

One pass, 2026-09-04. Every avenue is logged in `attempts.ndjson` (681 entries), including the ones that were
refused, blocked or empty, so an exclusion can be read against exactly what was tried. Machine summary:
`summary.json`. Identity stopped at the first avenue that answered; the literature and registry avenues ran for
every compound regardless, so a compound found by name still carries an honest record of whether human evidence
exists.

**Found: 19 of 20. Excluded: 1.**

## Result table

| Compound | Found | Source(s) | Identifiers | Human evidence | If excluded, avenues exhausted |
| --- | --- | --- | --- | --- | --- |
| bromantane | yes | PubChem PUG-REST, ChEMBL 37 bulk, FDA UNII list | CID 4660557; LWJALJDRFBXHKX-UHFFFAOYSA-N; UNII N1ILS53XWK; CAS 87913-26-6; CHEMBL4303520 | literature only — CTgov intervention 0 as 'bromantane'; PubMed 74 (clinical trial[pt] 10); Europe PMC 95 (trial-typed 9) | — |
| cardarine (GW501516) | yes | PubChem PUG-REST, ChEMBL 37 bulk, FDA UNII list, Open Targets 26.06 (CC0) | CID 9803963; YDBLKRPLXZNVNB-UHFFFAOYSA-N; UNII 7I2HA1NU22; CAS 317318-70-0; CHEMBL38943; ChEMBL max_phase 2.0; Open Targets stage APPROVAL; DrugBank DB05416 | registry — CTgov intervention 3 as 'GW501516'; PubMed 372 (clinical trial[pt] 6); Europe PMC 1526 (trial-typed 13) | — |
| DMT | yes | PubChem PUG-REST, ChEMBL 37 bulk, FDA UNII list, Open Targets 26.06 (CC0) | CID 6089; DMULVCHRPCFFGV-UHFFFAOYSA-N; UNII WUB601BHAA; CAS 61-50-7; CHEMBL12420; ChEMBL max_phase 2.0; Open Targets stage PHASE_2; DrugBank DB01488 | registry — CTgov intervention 55 as 'dimethyltryptamine'; PubMed 1470 (clinical trial[pt] 67); Europe PMC 3545 (trial-typed 134) | — |
| follistatin-344 | **no** | none | none | literature only — CTgov intervention 0 as 'follistatin 344'; PubMed 10 (clinical trial[pt] 0); Europe PMC 6743 (trial-typed 119) | PubChem PUG-REST on every name form (HTTP 404); ChEMBL 37 bulk structures by InChIKey; ChEMBL web API; Open Targets CC0 drug table and search; FDA UNII substance-name list; EMA medicines table; Health Canada DPD (marketed, inactive, approved, dormant); NIA ITP lifespan cohorts; DrugBank Open vocabulary (403 login page); Europe PMC; PubMed E-utilities; ClinicalTrials.gov v2. TGA, PMDA, WHO INN, Google Patents and Examine.com were never requested: gate not passed. |
| GHB | yes | PubChem PUG-REST, ChEMBL 37 bulk, FDA UNII list, Open Targets 26.06 (CC0), EMA register, Health Canada DPD | CID 10413; SJZRECIVHVDYJC-UHFFFAOYSA-N; UNII 30IW36W5B2; CAS 591-81-1; CHEMBL1342; ChEMBL max_phase 4.0; Open Targets stage APPROVAL; DrugBank DB01440 | registry — CTgov intervention 66 as 'gamma-hydroxybutyrate'; PubMed 3552 (clinical trial[pt] 189); Europe PMC 6190 (trial-typed 284) | — |
| isotonitazene | yes | PubChem PUG-REST, FDA UNII list | CID 145721979; OIOQREYBGDAYGT-UHFFFAOYSA-N; UNII ZFY1ZBQ8AV; CAS 14188-81-9 | none found — CTgov intervention 0 as 'isotonitazene'; PubMed 187 (clinical trial[pt] 0); Europe PMC 339 (trial-typed 0) | — |
| JWH-018 | yes | PubChem PUG-REST, ChEMBL 37 bulk, FDA UNII list | CID 10382701; JDNLPKCAXICMBW-UHFFFAOYSA-N; UNII G391998J57; CAS 209414-07-3; CHEMBL561013 | registry — CTgov intervention 1 as 'JWH-018'; PubMed 336 (clinical trial[pt] 3); Europe PMC 600 (trial-typed 5) | — |
| kratom (mitragynine) | yes | PubChem PUG-REST, ChEMBL 37 bulk, FDA UNII list | CID 3034396; LELBFTMXCIIKKX-QVRQZEMUSA-N; UNII EP479K822J; CAS 4098-40-2; CHEMBL299031 | registry — CTgov intervention 13 as 'kratom'; PubMed 1254 (clinical trial[pt] 5); Europe PMC 2098 (trial-typed 14) | — |
| ligandrol (LGD-4033) | yes | PubChem PUG-REST, ChEMBL 37 bulk, FDA UNII list, Open Targets 26.06 (CC0) | CID 44137686; OPSIVAKKLQRWKC-VXGBXAGGSA-N; UNII 1EJT54415A; CAS 1165910-22-4; CHEMBL5170587; Open Targets stage PHASE_2; DrugBank DB13934 | registry — CTgov intervention 1 as 'VK5211'; PubMed 50 (clinical trial[pt] 1); Europe PMC 146 (trial-typed 2) | — |
| LSD | yes | PubChem PUG-REST, ChEMBL 37 bulk, FDA UNII list, Open Targets 26.06 (CC0) | CID 5761; VAYOSLLFUXYJDT-RDTXWAMCSA-N; UNII 8NA5SWF92O; CAS 50-37-3; CHEMBL263881; ChEMBL max_phase 2.0; Open Targets stage APPROVAL; DrugBank DB04829 | registry — CTgov intervention 47 as 'lysergide'; PubMed 11490 (clinical trial[pt] 408); Europe PMC 103426 (trial-typed 2165) | — |
| morning glory (LSA / ergine) | yes | PubChem PUG-REST, ChEMBL 37 bulk, FDA UNII list | CID 442072; GENAHGKEFJLNJB-QMTHXVAHSA-N; UNII 073830XH10; CAS 478-94-4; CHEMBL227213 | registry — CTgov intervention 2 as 'lysergic acid amide'; PubMed 94 (clinical trial[pt] 0); Europe PMC 421 (trial-typed 1) | — |
| muscimol | yes | PubChem PUG-REST, ChEMBL 37 bulk, FDA UNII list, Open Targets 26.06 (CC0) | CID 4266; ZJQHPWUVQPJPQT-UHFFFAOYSA-N; UNII D5M179TY2E; CAS 2763-96-4; CHEMBL273481; ChEMBL max_phase 1.0; Open Targets stage PHASE_1; DrugBank DB12458 | registry — CTgov intervention 2 as 'muscimol'; PubMed 7206 (clinical trial[pt] 15); Europe PMC 13921 (trial-typed 38) | — |
| phencyclidine | yes | PubChem PUG-REST, ChEMBL 37 bulk, FDA UNII list, Open Targets 26.06 (CC0) | CID 6468; JTJMJGYZQZDUJJ-UHFFFAOYSA-N; UNII J1DOI7UV76; CAS 77-10-1; CHEMBL275528; ChEMBL max_phase 2.0; Open Targets stage UNKNOWN; DrugBank DB03575 | registry — CTgov intervention 2 as 'phencyclidine'; PubMed 5790 (clinical trial[pt] 38); Europe PMC 29786 (trial-typed 1038) | — |
| phenibut | yes | PubChem PUG-REST, ChEMBL 37 bulk, FDA UNII list, Open Targets 26.06 (CC0) | CID 14113; DAFOCGYVTAOKAJ-UHFFFAOYSA-N; UNII T2M58D6LA8; CAS 1078-21-3; CHEMBL315818; Open Targets stage APPROVAL; DrugBank DB13455 | literature only — CTgov intervention 0 as 'phenibut'; PubMed 313 (clinical trial[pt] 13); Europe PMC 440 (trial-typed 7) | — |
| phenylpiracetam | yes | PubChem PUG-REST, ChEMBL 37 bulk, FDA UNII list | CID 132441; LYONXVJRBWWGQO-UHFFFAOYSA-N; UNII 99QW5JU66Y; CAS 77472-70-9; CHEMBL348639 | literature only — CTgov intervention 0 as 'phenylpiracetam'; PubMed 34 (clinical trial[pt] 4); Europe PMC 72 (trial-typed 4) | — |
| stenabolic (SR9009) | yes | PubChem PUG-REST, ChEMBL 37 bulk, FDA UNII list, Open Targets 26.06 (CC0) | CID 57394020; MMJJNHOIVCGAAP-UHFFFAOYSA-N; UNII X5DCA09N30; CAS 1379686-30-2; CHEMBL1961796; Open Targets stage PRECLINICAL; DrugBank DB14013 | literature only — CTgov intervention 0 as 'SR9009'; PubMed 149 (clinical trial[pt] 0); Europe PMC 559 (trial-typed 1) | — |
| testolone (RAD-140) | yes | PubChem PUG-REST, ChEMBL 37 bulk, FDA UNII list, Open Targets 26.06 (CC0) | CID 44200882; XMBUPPIEVAFYHO-KPZWWZAWSA-N; UNII 4O87Q44KNC; CAS 1182367-47-0; CHEMBL1672635; ChEMBL max_phase 2.0; Open Targets stage PHASE_1_2; DrugBank DB13939 | registry — CTgov intervention 1 as 'RAD140'; PubMed 42 (clinical trial[pt] 1); Europe PMC 139 (trial-typed 1) | — |
| YK-11 | yes | PubChem PUG-REST, FDA UNII list | CID 119058028; KCQHQCDHFVGNMK-PQUNLUOYSA-N; UNII Z9748J6B0R; CAS 1370003-76-1 | literature only — CTgov intervention 0 as 'YK-11'; PubMed 20 (clinical trial[pt] 0); Europe PMC 76 (trial-typed 1) | — |
| sermorelin | yes | PubChem PUG-REST, ChEMBL 37 bulk, FDA UNII list | CID 16132413; WGWPRVFKDLAUQJ-MITYVQBRSA-N; UNII 89243S03TE; CAS 86168-78-7; CHEMBL428135 | registry — CTgov intervention 27 as 'sermorelin'; PubMed 561 (clinical trial[pt] 71); Europe PMC 814 (trial-typed 76) | — |
| ketamine | yes | PubChem PUG-REST, ChEMBL 37 bulk, FDA UNII list, Open Targets 26.06 (CC0), EMA register, Health Canada DPD | CID 3821; YQEZLKZALYSWHR-UHFFFAOYSA-N; UNII 690G0D6V8H; CAS 6740-88-1; CHEMBL742; ChEMBL max_phase 4.0; Open Targets stage APPROVAL; DrugBank DB01221 | registry — CTgov intervention 1884 as 'ketamine'; PubMed 30280 (clinical trial[pt] 3109); Europe PMC 196900 (trial-typed 5031) | — |

## Conflicts this pass found and did not resolve

| Compound | Conflict |
| --- | --- |
| cardarine (GW501516) | Open Targets/ChEMBL records maximumClinicalStage APPROVAL, but no EMA authorisation row and no Health Canada active-ingredient row was found for any name form in this pass. Carry the stage as a ChEMBL-derived field with its source named; do not render it as an approval. |
| LSD | Open Targets/ChEMBL records maximumClinicalStage APPROVAL, but no EMA authorisation row and no Health Canada active-ingredient row was found for any name form in this pass. Carry the stage as a ChEMBL-derived field with its source named; do not render it as an approval. |
| phenibut | Open Targets/ChEMBL records maximumClinicalStage APPROVAL, but no EMA authorisation row and no Health Canada active-ingredient row was found for any name form in this pass. Carry the stage as a ChEMBL-derived field with its source named; do not render it as an approval. |

Identity assignments withdrawn during the pass, both logged as `identity-correction` in `attempts.ndjson`:

- **isotonitazene** — WITHDRAWN: an earlier Open Targets exact-name search matched the synonym 'etonitazene', which is a different 2-benzylbenzimidazole opioid, not isotonitazene. The identifier is removed; isotonitazene carries no ChEMBL id from this pass.
- **follistatin-344** — WITHDRAWN: the FDA substance-name match was on the bare name 'follistatin' (UNII 506IY26H2I, display name FOLLISTATIN), which is the protein generally and not the 344-amino-acid isoform this record is about. It is kept as a related substance, not as this compound's identifier.

## Per-compound detail

### bromantane

- Identity: CID 4660557; LWJALJDRFBXHKX-UHFFFAOYSA-N; UNII N1ILS53XWK; CAS 87913-26-6; CHEMBL4303520
- PubChem resolved the name form `bromantane`
- FDA substance display name: BROMANTANE
- EMA: no medicine matches any name form
- Health Canada DPD: no active-ingredient row matches any name form
- Europe PMC: 95 records, 9 typed Clinical Trial or Randomized Controlled Trial
  - top 5: PMID 40558871; PMID 40875496; PMID 36680072; PMID 35284596; PMID 39825342
- PubMed: 74 records, 10 under `clinical trial[pt]` (PMIDs 42565399, 26087610, 22834121, 22288153, 21434470)
- ClinicalTrials.gov v2 intervention-name counts: `bromantane` 0, `ladasten` 0, `bromantan` 0
- Avenues logged: 32

### cardarine (GW501516)

- Identity: CID 9803963; YDBLKRPLXZNVNB-UHFFFAOYSA-N; UNII 7I2HA1NU22; CAS 317318-70-0; CHEMBL38943; ChEMBL max_phase 2.0; Open Targets stage APPROVAL; DrugBank DB05416
- PubChem resolved the name form `GW501516`
- ChEMBL preferred name: GW501516
- FDA substance display name: GW-501516
- EMA: no medicine matches any name form
- Health Canada DPD: no active-ingredient row matches any name form
- Europe PMC: 1526 records, 13 typed Clinical Trial or Randomized Controlled Trial
  - top 5: PMID 42556327; PMID 42461211; PMID 39993702; PMID 40006519; PMID 32298044
- PubMed: 372 records, 6 under `clinical trial[pt]` (PMIDs 22814748, 22683888, 21816786, 18024853, 17500064)
- ClinicalTrials.gov v2 intervention-name counts: `GW501516` 3, `GW 501516` 3, `endurobol` 3, `cardarine` 0
  - NCT ids seen: NCT00841217 (INTERVENTIONAL, COMPLETED), NCT00388180 (OBSERVATIONAL, COMPLETED), NCT00158899 (INTERVENTIONAL, COMPLETED)
- Avenues logged: 33

### DMT

- Identity: CID 6089; DMULVCHRPCFFGV-UHFFFAOYSA-N; UNII WUB601BHAA; CAS 61-50-7; CHEMBL12420; ChEMBL max_phase 2.0; Open Targets stage PHASE_2; DrugBank DB01488
- PubChem resolved the name form `N,N-dimethyltryptamine`
- ChEMBL preferred name: N,N-DIMETHYLTRYPTAMINE
- FDA substance display name: DIMETHYLTRYPTAMINE
- EMA: no medicine matches any name form
- Health Canada DPD: no active-ingredient row matches any name form
- Europe PMC: 3545 records, 134 typed Clinical Trial or Randomized Controlled Trial
  - top 5: PMID 42427129; PMID 42544757; PMID 41468116; PMID 42509061; PMID 42421344
- PubMed: 1470 records, 67 under `clinical trial[pt]` (PMIDs 42068196, 41896202, 41761045, 41699126, 41451514)
- ClinicalTrials.gov v2 intervention-name counts: `dimethyltryptamine` 55, `N,N-dimethyltryptamine` 55, `DMT fumarate` 16, `SPL026` 3
  - NCT ids seen: NCT06252506 (INTERVENTIONAL, COMPLETED), NCT05347849 (INTERVENTIONAL, COMPLETED), NCT05839509 (INTERVENTIONAL, TERMINATED), NCT07693257 (INTERVENTIONAL, NOT_YET_RECRUITING), NCT05032833 (INTERVENTIONAL, COMPLETED), NCT03308994 (OBSERVATIONAL, COMPLETED), NCT03345940 (INTERVENTIONAL, TERMINATED), NCT04673383 (INTERVENTIONAL, COMPLETED)
- Avenues logged: 37

### follistatin-344

- Identity: **not recovered**
- Related substance only, not this record's identifier: UNII 506IY26H2I (FOLLISTATIN) — the follistatin protein generally, not the 344-amino-acid isoform
- EMA: no medicine matches any name form
- Health Canada DPD: no active-ingredient row matches any name form
- Europe PMC: 6743 records, 119 typed Clinical Trial or Randomized Controlled Trial
  - top 5: DOI 10.20944/preprints202512.1011.v3; PMID 41966639; DOI 10.20944/preprints202512.1011.v1; PMID 42123471; PMID 40312924
- PubMed: 10 records, 0 under `clinical trial[pt]`
- ClinicalTrials.gov v2 intervention-name counts: `follistatin 344` 0, `AAV1-FS344` 0
  - excluded as ambiguous: `follistatin` 14 (the protein generally, not the 344-amino-acid isoform), `ACE-083` 4 (a follistatin-based fusion protein, a different molecule)
  - NCT ids seen: NCT04112875 (INTERVENTIONAL, COMPLETED), NCT02901379 (INTERVENTIONAL, COMPLETED), NCT06411366 (INTERVENTIONAL, COMPLETED), NCT06229899 (OBSERVATIONAL, COMPLETED), NCT02354781 (INTERVENTIONAL, COMPLETED), NCT03236662 (INTERVENTIONAL, COMPLETED), NCT07397468 (INTERVENTIONAL, RECRUITING), NCT02927080 (INTERVENTIONAL, TERMINATED)
- Avenues logged: 36

### GHB

- Identity: CID 10413; SJZRECIVHVDYJC-UHFFFAOYSA-N; UNII 30IW36W5B2; CAS 591-81-1; CHEMBL1342; ChEMBL max_phase 4.0; Open Targets stage APPROVAL; DrugBank DB01440
- PubChem resolved the name form `gamma-hydroxybutyric acid`
- ChEMBL preferred name: OXYBATE
- FDA substance display name: OXYBATE
- EMA: Xyrem (Authorised, EMEA/H/C/000593)
- Health Canada DPD: SODIUM OXYBATE [allfiles]
- Europe PMC: 6190 records, 284 typed Clinical Trial or Randomized Controlled Trial
  - top 5: PMID 29999861; PMID 41204836; PMID 41981935; PMID 41628267; PMID 41576638
- PubMed: 3552 records, 189 under `clinical trial[pt]` (PMIDs 41831073, 41469688, 41442817, 41204836, 41090230)
- ClinicalTrials.gov v2 intervention-name counts: `gamma-hydroxybutyrate` 66, `Xyrem` 64, `oxybate` 64, `sodium oxybate` 59, `calcium magnesium potassium and sodium oxybates` 3
  - NCT ids seen: NCT04451668 (INTERVENTIONAL, COMPLETED), NCT00371137 (INTERVENTIONAL, COMPLETED), NCT00641186 (INTERVENTIONAL, COMPLETED), NCT04006925 (INTERVENTIONAL, COMPLETED), NCT03626727 (INTERVENTIONAL, WITHDRAWN), NCT05837091 (INTERVENTIONAL, RECRUITING), NCT05869773 (INTERVENTIONAL, COMPLETED), NCT07625280 (INTERVENTIONAL, RECRUITING)
- Avenues logged: 34

### isotonitazene

- Identity: CID 145721979; OIOQREYBGDAYGT-UHFFFAOYSA-N; UNII ZFY1ZBQ8AV; CAS 14188-81-9
- PubChem resolved the name form `isotonitazene`
- FDA substance display name: ISOTONITAZENE
- EMA: no medicine matches any name form
- Health Canada DPD: no active-ingredient row matches any name form
- Europe PMC: 339 records, 0 typed Clinical Trial or Randomized Controlled Trial
  - top 5: PMID 42046253; PMID 42346338; PMID 42017785; PMID 42609078; PMID 42601813
- PubMed: 187 records, 0 under `clinical trial[pt]`
- ClinicalTrials.gov v2 intervention-name counts: `isotonitazene` 0, `nitazene` 0
- Avenues logged: 35

### JWH-018

- Identity: CID 10382701; JDNLPKCAXICMBW-UHFFFAOYSA-N; UNII G391998J57; CAS 209414-07-3; CHEMBL561013
- PubChem resolved the name form `JWH-018`
- FDA substance display name: JWH-018
- EMA: no medicine matches any name form
- Health Canada DPD: no active-ingredient row matches any name form
- Europe PMC: 600 records, 5 typed Clinical Trial or Randomized Controlled Trial
  - top 5: PMID 42115297; PMID 42630986; PMID 42244876; PMID 41276483; PMID 41184621
- PubMed: 336 records, 3 under `clinical trial[pt]` (PMIDs 33501595, 29245085, 29164599)
- ClinicalTrials.gov v2 intervention-name counts: `JWH-018` 1, `JWH 018` 1
  - excluded as ambiguous: `synthetic cannabinoid` 24 (a compound class, not this molecule)
  - NCT ids seen: NCT06044415 (INTERVENTIONAL, UNKNOWN), NCT03458416 (INTERVENTIONAL, TERMINATED), NCT01786109 (INTERVENTIONAL, COMPLETED), NCT04129489 (INTERVENTIONAL, TERMINATED), NCT04734080 (INTERVENTIONAL, COMPLETED), NCT06235346 (OBSERVATIONAL, COMPLETED)
- Avenues logged: 32

### kratom (mitragynine)

- Identity: CID 3034396; LELBFTMXCIIKKX-QVRQZEMUSA-N; UNII EP479K822J; CAS 4098-40-2; CHEMBL299031
- PubChem resolved the name form `mitragynine`
- FDA substance display name: MITRAGYNINE
- EMA: no medicine matches any name form
- Health Canada DPD: no active-ingredient row matches any name form
- Europe PMC: 2098 records, 14 typed Clinical Trial or Randomized Controlled Trial
  - top 5: PMID 40571261; PMID 39560283; PMID 42584332; PMID 42676565; PMID 42572688
- PubMed: 1254 records, 5 under `clinical trial[pt]` (PMIDs 42144893, 41837407, 39724441, 38474495, 32607084)
- ClinicalTrials.gov v2 intervention-name counts: `kratom` 13, `Mitragyna speciosa` 13, `mitragynine` 7, `7-hydroxymitragynine` 1
  - NCT ids seen: NCT06640569 (OBSERVATIONAL, TERMINATED), NCT07218549 (INTERVENTIONAL, NOT_YET_RECRUITING), NCT06089980 (OBSERVATIONAL, RECRUITING), NCT06072170 (INTERVENTIONAL, COMPLETED), NCT07204171 (INTERVENTIONAL, NOT_YET_RECRUITING), NCT05812001 (INTERVENTIONAL, UNKNOWN), NCT05457803 (OBSERVATIONAL, COMPLETED), NCT04392011 (INTERVENTIONAL, COMPLETED)
- Avenues logged: 36

### ligandrol (LGD-4033)

- Identity: CID 44137686; OPSIVAKKLQRWKC-VXGBXAGGSA-N; UNII 1EJT54415A; CAS 1165910-22-4; CHEMBL5170587; Open Targets stage PHASE_2; DrugBank DB13934
- PubChem resolved the name form `LGD-4033`
- FDA substance display name: VK-5211
- EMA: no medicine matches any name form
- Health Canada DPD: no active-ingredient row matches any name form
- Europe PMC: 146 records, 2 typed Clinical Trial or Randomized Controlled Trial
  - top 5: PMID 42547066; PMID 41261783; PMID 41367083; PMID 41079187; PMC10392554
- PubMed: 50 records, 1 under `clinical trial[pt]` (PMIDs 22459616)
- ClinicalTrials.gov v2 intervention-name counts: `VK5211` 1, `LGD-4033` 0, `ligandrol` 0, `LGD 4033` 0
  - NCT ids seen: NCT02578095 (INTERVENTIONAL, COMPLETED)
- Avenues logged: 34

### LSD

- Identity: CID 5761; VAYOSLLFUXYJDT-RDTXWAMCSA-N; UNII 8NA5SWF92O; CAS 50-37-3; CHEMBL263881; ChEMBL max_phase 2.0; Open Targets stage APPROVAL; DrugBank DB04829
- PubChem resolved the name form `lysergide`
- ChEMBL preferred name: LYSERGIDE
- FDA substance display name: LYSERGIDE
- EMA: no medicine matches any name form
- Health Canada DPD: no active-ingredient row matches any name form
- Europe PMC: 103426 records, 2165 typed Clinical Trial or Randomized Controlled Trial
  - top 5: PMID 42657527; PMID 41930230; PMID 42656086; PMID 42626628; PMID 42574097
- PubMed: 11490 records, 408 under `clinical trial[pt]` (PMIDs 42315644, 42102823, 42082971, 42068187, 42047222)
- ClinicalTrials.gov v2 intervention-name counts: `lysergide` 47, `lysergic acid diethylamide` 47, `LSD tartrate` 12, `MM120` 6
  - excluded as ambiguous: `LSD` 81 (the bare abbreviation also matches unrelated arms; the named forms are used instead)
  - NCT ids seen: NCT00566098 (INTERVENTIONAL, COMPLETED), NCT05670184 (INTERVENTIONAL, UNKNOWN), NCT04421105 (INTERVENTIONAL, COMPLETED), NCT03207165 (INTERVENTIONAL, COMPLETED), NCT07061886 (INTERVENTIONAL, COMPLETED), NCT00975481 (INTERVENTIONAL, COMPLETED), NCT07585786 (OBSERVATIONAL, NOT_YET_RECRUITING), NCT04386538 (INTERVENTIONAL, UNKNOWN)
- Avenues logged: 34

### morning glory (LSA / ergine)

- Identity: CID 442072; GENAHGKEFJLNJB-QMTHXVAHSA-N; UNII 073830XH10; CAS 478-94-4; CHEMBL227213
- PubChem resolved the name form `ergine`
- FDA substance display name: LYSERGAMIDE
- EMA: no medicine matches any name form
- Health Canada DPD: no active-ingredient row matches any name form
- Europe PMC: 421 records, 1 typed Clinical Trial or Randomized Controlled Trial
  - top 5: PMID 40700269; PMID 42313736; DOI 10.21203/rs.3.rs-8000194/v1; PMID 41680420; PMID 41160625
- PubMed: 94 records, 0 under `clinical trial[pt]`
- ClinicalTrials.gov v2 intervention-name counts: `lysergic acid amide` 2, `ergine` 0, `Argyreia nervosa` 0
  - excluded as ambiguous: `Ipomoea` 1 (plant genus, not the alkaloid), `morning glory` 1 (plant common name)
  - NCT ids seen: NCT00314340 (INTERVENTIONAL, COMPLETED), NCT02033707 (INTERVENTIONAL, COMPLETED), NCT04350346 (INTERVENTIONAL, UNKNOWN), NCT07606014 (INTERVENTIONAL, RECRUITING)
- Avenues logged: 36

### muscimol

- Identity: CID 4266; ZJQHPWUVQPJPQT-UHFFFAOYSA-N; UNII D5M179TY2E; CAS 2763-96-4; CHEMBL273481; ChEMBL max_phase 1.0; Open Targets stage PHASE_1; DrugBank DB12458
- PubChem resolved the name form `muscimol`
- ChEMBL preferred name: MUSCIMOL
- FDA substance display name: MUSCIMOL
- EMA: no medicine matches any name form
- Health Canada DPD: no active-ingredient row matches any name form
- Europe PMC: 13921 records, 38 typed Clinical Trial or Randomized Controlled Trial
  - top 5: DOI 10.20944/preprints202606.1570.v1; PMID 42272832; PMID 42368324; PMID 41965649; PMID 41820030
- PubMed: 7206 records, 15 under `clinical trial[pt]` (PMIDs 30407567, 25790455, 9151364, 8290671, 1358231)
- ClinicalTrials.gov v2 intervention-name counts: `muscimol` 2, `ibotenic acid` 2, `Amanita muscaria` 0
  - NCT ids seen: NCT00005925 (INTERVENTIONAL, TERMINATED), NCT00921128 (INTERVENTIONAL, WITHDRAWN)
- Avenues logged: 34

### phencyclidine

- Identity: CID 6468; JTJMJGYZQZDUJJ-UHFFFAOYSA-N; UNII J1DOI7UV76; CAS 77-10-1; CHEMBL275528; ChEMBL max_phase 2.0; Open Targets stage UNKNOWN; DrugBank DB03575
- PubChem resolved the name form `phencyclidine`
- ChEMBL preferred name: PHENCYCLIDINE
- FDA substance display name: PHENCYCLIDINE
- EMA: no medicine matches any name form
- Health Canada DPD: no active-ingredient row matches any name form
- Europe PMC: 29786 records, 1038 typed Clinical Trial or Randomized Controlled Trial
  - top 5: PMID 42285199; PMID 42152229; PMID 42583891; PMID 42678305; PMID 42178157
- PubMed: 5790 records, 38 under `clinical trial[pt]` (PMIDs 30595429, 29419341, 27018030, 23644161, 21854273)
- ClinicalTrials.gov v2 intervention-name counts: `phencyclidine` 2, `phencyclidine hydrochloride` 2, `Sernyl` 2
  - excluded as ambiguous: `PCP` 1192 (matches primary-care-provider and Pneumocystis-pneumonia arms, not the drug)
  - NCT ids seen: NCT01517828 (INTERVENTIONAL, UNKNOWN), NCT07560878 (INTERVENTIONAL, RECRUITING), NCT03035877 (INTERVENTIONAL, COMPLETED), NCT05834881 (INTERVENTIONAL, COMPLETED), NCT05753683 (INTERVENTIONAL, RECRUITING), NCT06115746 (INTERVENTIONAL, RECRUITING), NCT00328848 (INTERVENTIONAL, COMPLETED), NCT00000991 (INTERVENTIONAL, COMPLETED)
- Avenues logged: 35

### phenibut

- Identity: CID 14113; DAFOCGYVTAOKAJ-UHFFFAOYSA-N; UNII T2M58D6LA8; CAS 1078-21-3; CHEMBL315818; Open Targets stage APPROVAL; DrugBank DB13455
- PubChem resolved the name form `phenibut`
- FDA substance display name: PHENIBUT
- EMA: no medicine matches any name form
- Health Canada DPD: no active-ingredient row matches any name form
- Europe PMC: 440 records, 7 typed Clinical Trial or Randomized Controlled Trial
  - top 5: PMID 42459031; PMID 42462355; PMID 42395253; PMID 41692998; PMID 41832720
- PubMed: 313 records, 13 under `clinical trial[pt]` (PMIDs 29265084, 28805758, 27029450, 28300804, 26087584)
- ClinicalTrials.gov v2 intervention-name counts: `phenibut` 0, `fenibut` 0, `Anvifen` 0, `Noofen` 0
- Avenues logged: 37

### phenylpiracetam

- Identity: CID 132441; LYONXVJRBWWGQO-UHFFFAOYSA-N; UNII 99QW5JU66Y; CAS 77472-70-9; CHEMBL348639
- PubChem resolved the name form `phenylpiracetam`
- FDA substance display name: FONTURACETAM
- EMA: no medicine matches any name form
- Health Canada DPD: no active-ingredient row matches any name form
- Europe PMC: 72 records, 4 typed Clinical Trial or Randomized Controlled Trial
  - top 5: PMID 41048238; PMID 37357012; PMID 39269293; PMID 40047835; PMID 38826708
- PubMed: 34 records, 4 under `clinical trial[pt]` (PMIDs 25403298, 24430043, 23887448, 21626817)
- ClinicalTrials.gov v2 intervention-name counts: `phenylpiracetam` 0, `carphedon` 0, `fonturacetam` 0, `phenotropil` 0
- Avenues logged: 36

### stenabolic (SR9009)

- Identity: CID 57394020; MMJJNHOIVCGAAP-UHFFFAOYSA-N; UNII X5DCA09N30; CAS 1379686-30-2; CHEMBL1961796; Open Targets stage PRECLINICAL; DrugBank DB14013
- PubChem resolved the name form `SR9009`
- FDA substance display name: SR-9009
- EMA: no medicine matches any name form
- Health Canada DPD: no active-ingredient row matches any name form
- Europe PMC: 559 records, 1 typed Clinical Trial or Randomized Controlled Trial
  - top 5: PMID 42530886; PMID 42564045; PMID 40389157; PMID 40765588; PMID 41927564
- PubMed: 149 records, 0 under `clinical trial[pt]`
- ClinicalTrials.gov v2 intervention-name counts: `SR9009` 0, `SR 9009` 0, `stenabolic` 0
- Avenues logged: 34

### testolone (RAD-140)

- Identity: CID 44200882; XMBUPPIEVAFYHO-KPZWWZAWSA-N; UNII 4O87Q44KNC; CAS 1182367-47-0; CHEMBL1672635; ChEMBL max_phase 2.0; Open Targets stage PHASE_1_2; DrugBank DB13939
- PubChem resolved the name form `RAD140`
- ChEMBL preferred name: RAD-140
- FDA substance display name: VOSILASARM
- EMA: no medicine matches any name form
- Health Canada DPD: no active-ingredient row matches any name form
- Europe PMC: 139 records, 1 typed Clinical Trial or Randomized Controlled Trial
  - top 5: PMID 37758180; PMID 40585415; PMID 42064485; PMID 41703239; PMID 40680216
- PubMed: 42 records, 1 under `clinical trial[pt]` (PMIDs 34565686)
- ClinicalTrials.gov v2 intervention-name counts: `RAD140` 1, `RAD-140` 1, `testolone` 0
  - excluded as ambiguous: `RAD 140` 13 (the spaced form matches unrelated radiotherapy and device arms)
  - NCT ids seen: NCT03088527 (INTERVENTIONAL, COMPLETED), NCT03920098 (OBSERVATIONAL, UNKNOWN), NCT04119141 (INTERVENTIONAL, UNKNOWN), NCT01114295 (INTERVENTIONAL, WITHDRAWN), NCT05889364 (OBSERVATIONAL, UNKNOWN), NCT04294641 (INTERVENTIONAL, COMPLETED)
- Avenues logged: 32

### YK-11

- Identity: CID 119058028; KCQHQCDHFVGNMK-PQUNLUOYSA-N; UNII Z9748J6B0R; CAS 1370003-76-1
- PubChem resolved the name form `YK-11`
- FDA substance display name: YK-11
- EMA: no medicine matches any name form
- Health Canada DPD: no active-ingredient row matches any name form
- Europe PMC: 76 records, 1 typed Clinical Trial or Randomized Controlled Trial
  - top 5: PMID 42450037; PMID 40757306; PMID 39660819; PMID 40729027; PMID 40656529
- PubMed: 20 records, 0 under `clinical trial[pt]`
- ClinicalTrials.gov v2 intervention-name counts: `YK-11` 0, `YK11` 0
- Avenues logged: 31

### sermorelin

- Identity: CID 16132413; WGWPRVFKDLAUQJ-MITYVQBRSA-N; UNII 89243S03TE; CAS 86168-78-7; CHEMBL428135
- PubChem resolved the name form `sermorelin`
- FDA substance display name: SERMORELIN
- EMA: no medicine matches any name form
- Health Canada DPD: no active-ingredient row matches any name form
- Europe PMC: 814 records, 76 typed Clinical Trial or Randomized Controlled Trial
  - top 5: PMID 42395176; PMID 41075421; PMID 42456877; PMID 42465868; DOI 10.20944/preprints202604.1748.v1
- PubMed: 561 records, 71 under `clinical trial[pt]` (PMIDs 16061831, 15538933, 11572326, 10803472, 10754477)
- ClinicalTrials.gov v2 intervention-name counts: `sermorelin` 27, `Geref` 2, `sermorelin acetate` 1, `GHRH 1-29` 1
  - NCT ids seen: NCT00850564 (INTERVENTIONAL, COMPLETED), NCT00000380 (INTERVENTIONAL, COMPLETED), NCT06554717 (INTERVENTIONAL, RECRUITING), NCT02196831 (INTERVENTIONAL, COMPLETED), NCT00791843 (INTERVENTIONAL, COMPLETED), NCT00638287 (OBSERVATIONAL, WITHDRAWN), NCT00507104 (OBSERVATIONAL, COMPLETED), NCT03031535 (INTERVENTIONAL, COMPLETED)
- Avenues logged: 32

### ketamine

- Identity: CID 3821; YQEZLKZALYSWHR-UHFFFAOYSA-N; UNII 690G0D6V8H; CAS 6740-88-1; CHEMBL742; ChEMBL max_phase 4.0; Open Targets stage APPROVAL; DrugBank DB01221
- PubChem resolved the name form `ketamine`
- ChEMBL preferred name: KETAMINE
- FDA substance display name: KETAMINE
- EMA: Spravato (Authorised, EMEA/H/C/004535)
- Health Canada DPD: KETAMINE (KETAMINE HYDROCHLORIDE) [allfiles]; ESKETAMINE (ESKETAMINE HYDROCHLORIDE) [allfiles]
- Europe PMC: 196900 records, 5031 typed Clinical Trial or Randomized Controlled Trial
  - top 5: PMC13329323; PMID 42605203; PMID 42689364; PMID 42671282; PMC13329156
- PubMed: 30280 records, 3109 under `clinical trial[pt]` (PMIDs 42683438, 42673143, 42668967, 42654340, 42633440)
- ClinicalTrials.gov v2 intervention-name counts: `ketamine` 1884, `Ketalar` 412, `esketamine` 353, `ketamine hydrochloride` 274
  - NCT ids seen: NCT06399185 (INTERVENTIONAL, RECRUITING), NCT07247968 (INTERVENTIONAL, RECRUITING), NCT03640468 (INTERVENTIONAL, UNKNOWN), NCT04933149 (INTERVENTIONAL, ENROLLING_BY_INVITATION), NCT05468047 (INTERVENTIONAL, UNKNOWN), NCT05313659 (INTERVENTIONAL, COMPLETED), NCT07340008 (INTERVENTIONAL, RECRUITING), NCT06355180 (INTERVENTIONAL, COMPLETED)
- Avenues logged: 31

## Avenues that were refused or unavailable, not merely empty

| Avenue | Status in this pass |
| --- | --- |
| TGA (ARTG) | Gate not passed; `legal-gate.json` records robots.txt as unretrievable to our client. No request made. |
| PMDA | Gate not passed; no licence statement, English content is per-product PDFs. No request made. |
| WHO INN | Gate not passed; CC BY-NC-SA 3.0 IGO, PDF notices, account-gated search. No request made. |
| Google Patents | Gate not passed; robots.txt `Disallow: /*` plus terms. No request made. |
| Examine.com | Gated in this pass and failed. `https://examine.com/robots.txt` answered HTTP 429 with a 32,183-byte Vercel Security Checkpoint interstitial, so no crawl rules could be read; no terms page was fetched and no compound page was requested. Gate entry written as `legal-gate.json` → `sources.examine_com`; response saved at `data/corpus-20k/legal/robots/examine.com.txt.err`. |
| DrugBank Open vocabulary (CC0) | Not available. The download answered with a 403 login page, on disk at `data/corpus-20k/raw/drugbank-open/drugbank-vocabulary.DENIED-403-login.html`. DrugBank ids were taken instead from the Open Targets CC0 cross-references where present. |
| ChEMBL web API | Degraded throughout the pass: HTTP 500 on molecule reads and connection timeouts on the InChIKey filter. Replaced by the ChEMBL 37 bulk structure file already on disk, which is the authoritative source for the identifiers reported here. |
| NIA ITP (JAX MPD mirror) | Searched on disk. no NIA ITP lifespan cohort tested this compound (90 distinct treatment groups searched across the cohort files on disk) |

## What this pass does not establish

- Australian and Japanese regulatory status stays UNKNOWN for all 20. Those registers were never queried.
- A ClinicalTrials.gov intervention count above zero means human studies are registered under that name. It is not a
  result. No results were read.
- Europe PMC and PubMed figures are metadata counts. No abstract or full text was stored.
- Where no ChEMBL identifier is recorded the absence comes from the ChEMBL 37 bulk structure file, not from the
  failing web API, so it is a real negative: ChEMBL 37 holds no structure with that exact standard InChIKey.
- `maximumClinicalStage` and `max_phase` are ChEMBL-derived assertions carried under Open Targets' CC0
  redistribution. Three of them conflict with the register evidence found here and are flagged above.
