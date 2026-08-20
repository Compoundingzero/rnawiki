import { runFullDeterministicSweep } from '@/lib/rna-intelligence'
import type { DrugModality } from '@/lib/types'

const cases: Array<[string, string, DrugModality]> = [
  ['ostarine', 'C[C@](COC1=CC=C(C=C1)C#N)(C(=O)NC2=CC(=C(C=C2)C#N)C(F)(F)F)O', 'Small Molecule'],
  ['ligandrol', 'C1C[C@@H](N(C1)C2=CC(=C(C=C2)C#N)C(F)(F)F)[C@H](C(F)(F)F)O', 'Small Molecule'],
  [
    'testolone',
    'CC1=C(C=CC(=C1Cl)C#N)N[C@@H](C2=NN=C(O2)C3=CC=C(C=C3)C#N)[C@H](C)O',
    'Small Molecule',
  ],
  ['cardarine', 'CC1=C(C=CC(=C1)SCC2=C(N=C(S2)C3=CC=C(C=C3)C(F)(F)F)C)OCC(=O)O', 'Small Molecule'],
  [
    'ibutamoren',
    'CC(C)(C(=O)N[C@H](COCC1=CC=CC=C1)C(=O)N2CCC3(CC2)CN(C4=CC=CC=C34)S(=O)(=O)C)N',
    'Small Molecule',
  ],
  [
    'yk11',
    'C[C@]12CC[C@H]3[C@H]([C@@H]1CC[C@@]24/C(=C\\C(=O)OC)/OC(O4)(C)OC)CCC5=CC(=O)CC[C@H]35',
    'Small Molecule',
  ],
  ['s23', 'C[C@](COC1=CC(=C(C=C1)Cl)F)(C(=O)NC2=CC(=C(C=C2)C#N)C(F)(F)F)O', 'Small Molecule'],
  ['trenbolone', 'C[C@]12C=CC3=C4CCC(=O)C=C4CC[C@H]3[C@@H]1CC[C@@H]2O', 'Small Molecule'],
  [
    'oxandrolone',
    'C[C@]12CC[C@H]3[C@H]([C@@H]1CC[C@]2(C)O)CC[C@@H]4[C@@]3(COC(=O)C4)C',
    'Small Molecule',
  ],
  [
    'stanozolol',
    'C[C@]12CC[C@H]3[C@H]([C@@H]1CC[C@]2(C)O)CC[C@@H]4[C@@]3(CC5=C(C4)NN=C5)C',
    'Small Molecule',
  ],
  ['nandrolone', 'C[C@]12CC[C@H]3[C@H]([C@@H]1CC[C@@H]2O)CCC4=CC(=O)CC[C@H]34', 'Small Molecule'],
  ['boldenone', 'C[C@]12CC[C@H]3[C@H]([C@@H]1CC[C@@H]2O)CCC4=CC(=O)C=C[C@]34C', 'Small Molecule'],
  [
    'test-enanthate',
    'CCCCCCC(=O)O[C@H]1CC[C@@H]2[C@@]1(CC[C@H]3[C@H]2CCC4=CC(=O)CC[C@]34C)C',
    'Small Molecule',
  ],
  ['clomifene', 'CCN(CC)CCOC1=CC=C(C=C1)/C(=C(/C2=CC=CC=C2)\\Cl)/C3=CC=CC=C3', 'Small Molecule'],
  ['anastrozole', 'CC(C)(C#N)C1=CC(=CC(=C1)CN2C=NC=N2)C(C)(C)C#N', 'Small Molecule'],
  ['clenbuterol', 'CC(C)(C)NCC(C1=CC(=C(C(=C1)Cl)N)Cl)O', 'Small Molecule'],
  ['dnp', 'C1=CC(=C(C=C1[N+](=O)[O-])[N+](=O)[O-])O', 'Small Molecule'],
  ['modafinil', 'C1=CC=C(C=C1)C(C2=CC=CC=C2)S(=O)CC(=O)N', 'Small Molecule'],
  ['adrafinil', 'C1=CC=C(C=C1)C(C2=CC=CC=C2)S(=O)CC(=O)NO', 'Small Molecule'],
  ['noopept', 'CCOC(=O)CNC(=O)[C@@H]1CCCN1C(=O)CC2=CC=CC=C2', 'Small Molecule'],
  ['phenylpiracetam', 'C1C(CN(C1=O)CC(=O)N)C2=CC=CC=C2', 'Small Molecule'],
  ['piracetam', 'C1CC(=O)N(C1)CC(=O)N', 'Small Molecule'],
  ['bromantane', 'C1C2CC3CC1CC(C2)C3NC4=CC=C(C=C4)Br', 'Small Molecule'],
  ['9mebc', 'CN1C2=CC=CC=C2C3=C1C=NC=C3', 'Small Molecule'],
  ['methylene-blue', 'CN(C)C1=CC2=C(C=C1)N=C3C=CC(=[N+](C)C)C=C3S2.[Cl-]', 'Small Molecule'],
  ['mt2-peptide', '(Ac)(Nle)DH(D-)FRWK(NH2; lactam Asp1-Lys6)', 'Peptide / GLP-1 Agonist'],
  ['epitalon-peptide', 'AEDG', 'Peptide / GLP-1 Agonist'],
  ['semax-peptide', 'MEHFPGP', 'Peptide / GLP-1 Agonist'],
  ['selank-peptide', 'TKPRPGP', 'Peptide / GLP-1 Agonist'],
  ['tb4-peptide', 'SDKPDMAEIEKFDKSKLKKTETQEKNPLPSKETIEQEKQAGES', 'Peptide / GLP-1 Agonist'],
  ['sermorelin-peptide', 'YADAIFTNSYRKVLGQLSARKLLQDIMSR(NH2)', 'Peptide / GLP-1 Agonist'],
  [
    'cjc1295-peptide',
    'Y(D-Ala)DAIFT(Gln8)SYRKVL(Ala15)QLSARKLLQDIL(Leu27)SR(Lys30-maleimidopropionyl DAC)',
    'Peptide / GLP-1 Agonist',
  ],
  ['ipamorelin-peptide', '(Aib)H(D-2-Nal)(D-)FK(NH2)', 'Peptide / GLP-1 Agonist'],
]

for (const [name, structure, modality] of cases) {
  const report = runFullDeterministicSweep({ structureString: structure, modality, workflow: [] })
  const formula = report.layer1.chemicalFormula ?? '-'
  const mass = String(report.layer1.molecularWeightEstimate ?? '-')
  const errs = report.errors.map((e) => e.code).join(',')
  console.log(
    `${report.overallPassed ? 'PASS' : 'FAIL'}  ${name.padEnd(20)} ${String(formula).padEnd(20)} ${String(mass).padEnd(12)} ${errs}`,
  )
}
