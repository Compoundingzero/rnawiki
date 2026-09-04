# Worked examples — identity resolution (R1)

Computed 2026-09-04T05:51:45Z by `scripts/corpus-20k/identity/resolve.py` from the joined Phase 0a/0b
sources. Every row is real output: keys are the ones the executor stored, and a name absent
from every source is said to be absent rather than guessed.

| Class | Names in play | Keys computed | Decision | Rule id | Resulting page(s) |
| --- | --- | --- | --- | --- | --- |
| 3.1 Salts | metformin / metformin hydrochloride | `K1:9100L32L2N` | merge | `K1-UNII-PARENT` · relations `isotopologue-of` | Metformin (existing `metformin`) |
| 3.1 Salts | sertraline / sertraline hydrochloride | `K1:QUC7NX6WMB` | merge | `K1-UNII-PARENT` | Sertraline (existing `sertraline`) |
| 3.1 Salts | bupropion / bupropion hydrochloride | `K1:01ZG3TPX31` | merge | `K1-UNII-PARENT` | Bupropion (existing `bupropion`) |
| 3.1 Salts | naltrexone / naltrexone hydrochloride | `K1:5S6W795CQM` | merge | `K1-UNII-PARENT` | Naltrexone (existing `naltrexone`) |
| 3.1 Salts | lithium carbonate vs lithium citrate | `K1:2BMD2GNA4V`<br>`K1:5Z6E9K79YV` | split | `K1-UNII-PARENT` | Lithium Carbonate (existing `lithium-carbonate`)<br>Lithium (existing `lithium`) |
| 3.2 Esters | testosterone / enanthate / cypionate / undecanoate | `K1:3XMK78S47O`<br>`K1:7Z6522T8N9`<br>`K1:H16A5VCT9C`<br>`K1:M0XW1UBI14` | split | `K1-UNII-PARENT` · relations `ester-of` | Testosterone (existing `testosterone`)<br>Testosterone enanthate (existing `testosterone-enanthate`)<br>Testosterone Undecanoate (existing `testosterone-undecanoate`)<br>Testosterone Cypionate (existing `testosterone-cypionate`) |
| 3.2 Prodrugs | valaciclovir / aciclovir | `K1:MZ1IW7Q79D`<br>`K1:X4HES1O11F` | split | `K1-UNII-PARENT` | Valaciclovir (existing `valacyclovir`)<br>Aciclovir (existing `acyclovir`) |
| 3.2 Prodrugs | prednisone / prednisolone | `K1:9PHQ9Y1OLM`<br>`K1:VB0R961HZT` | split | `K1-UNII-PARENT` | Prednisolone (existing `prednisolone`)<br>Prednisone (existing `prednisone`) |
| 3.2 Esters | nandrolone / nandrolone decanoate | `K1:6PG9VR430D`<br>`K1:H45187T098` | split | `K1-UNII-PARENT` · relations `ester-of` | Nandrolone (new)<br>Nandrolone Decanoate (existing `nandrolone-decanoate`) |
| 3.3 INN/USAN | paracetamol / acetaminophen | `K1:362O9ITL9D` | merge | `K1-UNII-PARENT` | Paracetamol (existing `acetaminophen`) |
| 3.3 INN/USAN | adrenaline / epinephrine | `K1:NA71GR3TNV`<br>`K1:YKH834O4BH` | split | `K1-UNII-PARENT` · relations `racemate-of` | Adrenaline (existing `epinephrine`)<br>Epinephrine (existing `adrenal`) |
| 3.3 INN/USAN | salbutamol / albuterol | `K1:QF8SVZ843E` | merge | `K1-UNII-PARENT` · relations `stereoisomer-of` | Salbutamol (existing `albuterol`) |
| 3.3 INN/USAN | ciclosporin / cyclosporine | `K1:83HN0GTJ6D` | merge | `K1-UNII-PARENT` | Ciclosporin (existing `cyclosporine`) |
| 3.3b Brand | Glucophage | `K1:9100L32L2N` | merge | `K1-UNII-PARENT` · relations `isotopologue-of` | Metformin (existing `metformin`) |
| 3.3b Brand / 3.9 | Ozempic / Wegovy / Rybelsus | `K1:53AXN4NNHX` | merge | `K1-UNII-PARENT` | Semaglutide (existing `semaglutide`) |
| 3.3b Brand / 3.7 | Januvia vs Janumet · not found: janumet | `K1:QFP0P1DV7Z` | merge | `K1-UNII-PARENT` | Sitagliptin (existing `sitagliptin`) |
| 3.5 Codes | MK-677 / ibutamoren / L-163,191 · not found: mk677, l 163191 | `K1:GJ0EGN38UL` | merge | `K1-UNII-PARENT` | Ibutamoren (existing `ibutamoren`) |
| 3.5 Codes | GW501516 / cardarine · not found: endurobol | `K1:7I2HA1NU22` | merge | `K1-UNII-PARENT` | Cardarine (existing `cardarine`) |
| 3.5 Codes | SR9009 / stenabolic | `K1:X5DCA09N30` | merge | `K1-UNII-PARENT` | Stenabolic (SR9009) (existing `stenabolic`) |
| 3.5 Codes | LGD-4033 / ligandrol · not found: lgd4033 | `K1:1EJT54415A` | merge | `K1-UNII-PARENT` | Ligandrol (existing `ligandrol`) |
| 3.5 Codes | RAD-140 / testolone | `K1:4O87Q44KNC` | merge | `K1-UNII-PARENT` | Vosilasarm (existing `testolone`) |
| 3.5 Codes | BPC-157 · not found: bpc157, pentadecapeptide bpc 157 | `K2:HEEWEZGQMLZMFE-RKGINYAYSA-N` | merge | `K2-INCHIKEY-PARENT` | BPC-157 (new) |
| 3.4 Stereo | lipoic acid R / S / racemic · not found: r lipoic acid, s lipoic acid | `K1:73Y7P0K73Y`<br>`K1:J2Y905FQ57`<br>`K1:VLL71EBS9Z` | split | `K1-UNII-PARENT` · relations `racemate-of` | Alpha-lipoic acid (existing `alpha-lipoic-acid`)<br>Lipoic Acid (existing `lipoic-acid`)<br>THIOCTIC ACID (new) |
| 3.4 Stereo | citalopram / escitalopram | `K1:0DHU5B8D6V`<br>`K1:4O4S742ANY` | split | `K1-UNII-PARENT` · relations `racemate-of` | Citalopram (existing `citalopram`)<br>Escitalopram (existing `escitalopram`) |
| 3.4 Stereo | omeprazole / esomeprazole | `K1:KG60484QX9`<br>`K1:N3PA6559FT` | split | `K1-UNII-PARENT` · relations `racemate-of` | Omeprazole (existing `omeprazole`)<br>Esomeprazole (existing `esomeprazole`) |
| 3.4 Stereo | modafinil / armodafinil | `K1:R3UK8X3U3D`<br>`K1:V63XWA605I` | split | `K1-UNII-PARENT` · relations `racemate-of` | Modafinil (existing `modafinil`)<br>Armodafinil (existing `armodafinil`) |
| 3.6 Biosimilars | adalimumab and its suffixed products | `K1:FYS6T7F842`<br>`K1:FYS6T7F842#adaz`<br>`K1:FYS6T7F842#adbm`<br>`K1:FYS6T7F842#atto`<br>`K1:FYS6T7F842#bwwd` | split | `K1-UNII-PARENT`, `S-BIOSIMILAR` · relations `biosimilar-of` | Adalimumab (existing `adalimumab`)<br>Adalimumab-Adaz (existing `adalimumab-adaz`)<br>Adalimumab-Adbm (existing `adalimumab-adbm`)<br>Adalimumab-Atto (existing `adalimumab-atto`)<br>Adalimumab-Bwwd (existing `adalimumab-bwwd`) |
| 3.6 Biosimilars | insulin glargine / -yfgn | `K1:2ZM8CX04RZ`<br>`K1:2ZM8CX04RZ#yfgn` | split | `K1-UNII-PARENT`, `S-BIOSIMILAR` · relations `biosimilar-of` | Insulin glargine (existing `insulin`)<br>Insulin Glargine-Yfgn (existing `insulin-glargine-yfgn`) |
| 3.6 Biosimilars | filgrastim / -sndz | `K1:PVI5M0M1GW`<br>`K1:PVI5M0M1GW#sndz` | split | `K1-UNII-PARENT`, `S-BIOSIMILAR` · relations `biosimilar-of` | Filgrastim (existing `filgrastim`)<br>Filgrastim-Sndz (existing `filgrastim-sndz`) |
| 3.7 Combination | amoxicillin + clavulanate · not found: co amoxiclav | `K1:23521W1S24`<br>`K1:9EM05410Q9` | split | `K1-UNII-PARENT` | Clavulanic acid (existing `clavulanate`)<br>Amoxicillin (existing `amoxicillin`) |
| 3.7 Combination | carbidopa + levodopa | `COMBO:{K1:46627O600J,K1:KR87B45RGH}`<br>`K1:46627O600J`<br>`K1:KR87B45RGH` | split | `K1-UNII-PARENT`, `S-COMBO` · relations `contains`, `stereoisomer-of` | Carbidopa, Levodopa (existing `carbidopa-levodopa`)<br>Levodopa (existing `l-dopa`)<br>Carbidopa (existing `carbidopa`) |
| 3.7 Combination | metformin + sitagliptin | `COMBO:{K1:9100L32L2N,K1:QFP0P1DV7Z}`<br>`K1:9100L32L2N`<br>`K1:QFP0P1DV7Z` | split | `K1-UNII-PARENT`, `S-COMBO` · relations `contains`, `isotopologue-of` | Metformin Hydrochloride, Sitagliptin (existing `metformin-hydrochloride-sitagliptin`)<br>Metformin (existing `metformin`)<br>Sitagliptin (existing `sitagliptin`) |
| 3.8 Isotope | deutetrabenazine / tetrabenazine | `K2:MKJIEFSOBYUXJB-LIJFRPJRSA-N`<br>`K2:MKJIEFSOBYUXJB-UHFFFAOYSA-N` | split | `K2-INCHIKEY-PARENT` · relations `isotopologue-of` | Deutetrabenazine (new)<br>Tetrabenazine (new) |

The rendered-overlap check (§5.3) is not in this table: it runs in Phase 2 against the data
each record would render, using the R3 MinHash/LSH harness described in
`docs/specs/overlap-harness.md`.
