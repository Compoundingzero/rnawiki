"""Focused cases for the openFDA label CYP and transporter role extractor.

Every case is a sentence taken from or modelled on SPL text, paired with the
exact (enzyme, role, strength) set the extractor must return for it. The cases
that expect an empty result are the ones the extractor must refuse: a negated
statement, a role that belongs to a co-administered drug, and a role phrase
that a relative clause or a preposition has re-targeted.

    .venv-corpus/bin/python scripts/revamp/test_openfda_label_cyp.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from openfda_label_cyp import extract

CASES = [
 ("Ibuprofen is a substrate of CYP2C9.", ["Ibuprofen"], [("CYP2C9","substrate",None)]),
 ("Ritonavir is a strong inhibitor of CYP3A4 and also inhibits P-glycoprotein.", ["Ritonavir"], [("CYP3A4","inhibitor","strong"),("P-gp","inhibitor",None)]),
 ("Fluconazole is a moderate CYP3A4 inhibitor.", ["Fluconazole"], [("CYP3A4","inhibitor","moderate")]),
 ("Erythromycin is a strong mechanism-based CYP3A4 inhibitor.", ["Erythromycin"], [("CYP3A4","inhibitor","strong")]),
 ("Naltrexone is not an inhibitor of CYP3A4 and CYP1A2.", ["Naltrexone"], []),
 ("Sitagliptin is not an inhibitor of CYP isozymes CYP3A4, 2C8, 2C9.", ["Sitagliptin"], []),
 ("Therefore, the potential exists for interaction between carbamazepine and any agent that inhibits CYP3A4.", ["carbamazepine"], []),
 ("Carbamazepine is metabolized by CYP3A4.", ["Carbamazepine"], [("CYP3A4","substrate",None)]),
 ("Sirolimus is a substrate for both CYP3A4 and P-gp.", ["Sirolimus"], [("CYP3A4","substrate",None),("P-gp","substrate",None)]),
 ("Coadministration of apixaban with strong inhibitors of CYP3A4 and P-gp increased apixaban AUC.", ["apixaban"], [("CYP3A4","substrate",None),("P-gp","substrate",None)]),
 ("Digoxin is a substrate for P-glycoprotein.", ["Digoxin"], [("P-gp","substrate",None)]),
 ("Rifampin is a potent inducer of CYP3A4.", ["Rifampin"], [("CYP3A4","inducer",None)]),
 ("Ketoconazole, a strong CYP3A4 inhibitor, increased midazolam AUC.", ["Midazolam"], []),
 ("Metformin is transported by OCT2 and MATE1.", ["Metformin"], [("MATE1","substrate",None),("OCT2","substrate",None)]),
 ("Warfarin is extensively metabolized by CYP2C9.", ["Warfarin"], [("CYP2C9","substrate",None)]),
 ("Atorvastatin is a substrate of OATP1B1 and BCRP.", ["Atorvastatin"], [("BCRP","substrate",None),("OATP1B1","substrate",None)]),
 ("Concomitant use of strong CYP3A4 inducers decreased ibrutinib exposure.", ["ibrutinib"], [("CYP3A4","substrate",None)]),
 ("Fluoxetine inhibits CYP2D6 and CYP2C19.", ["Fluoxetine"], [("CYP2C19","inhibitor",None),("CYP2D6","inhibitor",None)]),
 ("In vitro, clopidogrel showed no inhibition of CYP2C9.", ["clopidogrel"], []),
 ("Effects of Other Drugs on Ramelteon Fluvoxamine (strong CYP1A2 inhibitor) increased ramelteon AUC.", ["Ramelteon","ramelteon"], []),
 ("Concomitant use of Loperamide Hydrochloride Capsules with inhibitors of P-glycoprotein (e.g., quinidine) can increase exposure to loperamide.", ["Loperamide Hydrochloride Capsules","loperamide"], [("P-gp","substrate",None)]),
 ("Agents with Decreased Levels in the Presence of Carbamazepine due to Induction of Cytochrome P450 3A4 include felodipine.", ["Carbamazepine"], []),
 ("Sirolimus is metabolized by CYP3A4 and is also transported by P-gp.", ["Sirolimus"], [("CYP3A4","substrate",None),("P-gp","substrate",None)]),
 ("There was no significant interaction between oral risperidone and erythromycin, a moderate CYP3A4 inhibitor.", ["risperidone"], []),
 ("Carbamazepine is a potent inducer of hepatic CYP3A4 and is also known to be an inducer of CYP1A2.", ["Carbamazepine"], [("CYP3A4","inducer",None),("CYP1A2","inducer",None)]),
 ("In vitro studies indicate that risperidone is a relatively weak inhibitor of CYP2D6.", ["risperidone"], [("CYP2D6","inhibitor","weak")]),
]


def main() -> int:
    failures = 0
    for sentence, names, expected in CASES:
        entries, _ = extract({"pharmacokinetics": [sentence]}, names)
        got = sorted((e["enzyme"], e["role"], e["strength"]) for e in entries)
        if got != sorted(expected):
            failures += 1
            print(f"FAIL {sentence[:70]}\n  got  {got}\n  want {sorted(expected)}")
    print(f"{len(CASES)} cases, {failures} failures")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
