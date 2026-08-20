import { runFullDeterministicSweep } from '@/lib/rna-intelligence'
import type { LaboratoryProtocolStep } from '@/lib/types'

const wf: LaboratoryProtocolStep[] = [
  { id: 'a', stepNumber: 1, phase: 'QC', name: 'q', description: 'd', reagentsAndBuffer: 'r' },
  { id: 'b', stepNumber: 2, phase: 'Synthesis', name: 's', description: 'd', dependsOnStepId: 'a', reagentsAndBuffer: 'r' },
  { id: 'c', stepNumber: 3, phase: 'Purification', name: 'p', description: 'd', dependsOnStepId: 'b', reagentsAndBuffer: 'r' },
  { id: 'd', stepNumber: 4, phase: 'Assay_Quantification', name: 'a', description: 'd', dependsOnStepId: 'c', reagentsAndBuffer: 'r' },
]

const smiles: Record<string, string> = {
  remdesivir: 'CCC(CC)COC(=O)[C@H](C)N[P@](=O)(OC[C@@H]1[C@H]([C@H]([C@](O1)(C#N)C2=CC=C3N2N=CN=C3N)O)O)OC4=CC=CC=C4',
  molnupiravir: 'CC(C)C(=O)OC[C@@H]1[C@H]([C@H]([C@@H](O1)N2C=CC(=NC2=O)NO)O)O',
  hydroxychloroquine: 'CCN(CCCC(C)NC1=C2C=CC(=CC2=NC=C1)Cl)CCO',
  ivermectinB1a: 'CC[C@H](C)[C@@H]1[C@H](CC[C@@]2(O1)C[C@@H]3C[C@H](O2)C/C=C(/[C@H]([C@H](/C=C/C=C/4\\CO[C@H]5[C@@]4([C@@H](C=C([C@H]5O)C)C(=O)O3)O)C)O[C@H]6C[C@@H]([C@H]([C@@H](O6)C)O[C@H]7C[C@@H]([C@H]([C@@H](O7)C)O)OC)OC)\\C)C',
  methotrexate: 'CN(CC1=CN=C2C(=N1)C(=NC(=N2)N)N)C3=CC=C(C=C3)C(=O)N[C@@H](CCC(=O)O)C(=O)O',
  tamoxifen: 'CC/C(=C(\\C1=CC=CC=C1)/C2=CC=C(C=C2)OCCN(C)C)/C3=CC=CC=C3',
  anastrozole: 'CC(C)(C#N)C1=CC(=CC(=C1)CN2C=NC=N2)C(C)(C)C#N',
  imatinib: 'CC1=C(C=C(C=C1)NC(=O)C2=CC=C(C=C2)CN3CCN(CC3)C)NC4=NC=CC(=N4)C5=CN=CC=C5',
  osimertinib: 'CN1C=C(C2=CC=CC=C21)C3=NC(=NC=C3)NC4=C(C=C(C(=C4)NC(=O)C=C)N(C)CCN(C)C)OC',
  allopurinol: 'C1=C2C(=NC=NC2=O)NN1',
  sildenafil: 'CCCC1=NN(C2=C1N=C(NC2=O)C3=C(C=CC(=C3)S(=O)(=O)N4CCN(CC4)C)OCC)C',
  tadalafil: 'CN1CC(=O)N2[C@@H](C1=O)CC3=C([C@H]2C4=CC5=C(C=C4)OCO5)NC6=CC=CC=C36',
  finasteride: 'C[C@]12CC[C@H]3[C@H]([C@@H]1CC[C@@H]2C(=O)NC(C)(C)C)CC[C@@H]4[C@@]3(C=CC(=O)N4)C',
  isotretinoin: 'CC1=C(C(CCC1)(C)C)/C=C/C(=C/C=C/C(=C\\C(=O)O)/C)/C',
}

for (const [name, s] of Object.entries(smiles)) {
  const r = runFullDeterministicSweep({ structureString: s, modality: 'Small Molecule', workflow: wf })
  console.log(
    name.padEnd(20),
    r.overallPassed ? 'PASS' : 'FAIL',
    'logP=' + String(r.layer2.logP),
    r.errors.map((e) => e.code + ': ' + e.message).join(' | '),
  )
}
