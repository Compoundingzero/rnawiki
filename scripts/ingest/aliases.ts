import { newId } from '@/lib/ids'

/**
 * The names a reader types that are not the name the FDA files a substance under.
 *
 * These are real INN/USAN/BAN divergences — two official names for one molecule, adopted by
 * different regulators — not typos or nicknames. Roughly half the English-speaking world learned
 * the side the FDA does not use, so without this table a search for "paracetamol" returns nothing
 * on a site that has 10,000 medicines in it.
 *
 * Each pair is [alias, the moiety as openFDA spells it].
 */
export const INTERNATIONAL_NAME_ALIASES: ReadonlyArray<readonly [alias: string, moiety: string]> = [
  // INN (rest of world) -> USAN (United States)
  ['Paracetamol', 'ACETAMINOPHEN'],
  ['Adrenaline', 'EPINEPHRINE'],
  ['Noradrenaline', 'NOREPINEPHRINE'],
  ['Salbutamol', 'ALBUTEROL'],
  ['Ciclosporin', 'CYCLOSPORINE'],
  ['Rifampicin', 'RIFAMPIN'],
  ['Amoxycillin', 'AMOXICILLIN'],
  ['Frusemide', 'FUROSEMIDE'],
  ['Lignocaine', 'LIDOCAINE'],
  ['Pethidine', 'MEPERIDINE'],
  ['Glibenclamide', 'GLYBURIDE'],
  ['Glyceryl trinitrate', 'NITROGLYCERIN'],
  ['Isoprenaline', 'ISOPROTERENOL'],
  ['Bendroflumethiazide', 'BENDROFLUMETHIAZIDE'],
  ['Beclometasone', 'BECLOMETHASONE'],
  ['Dexamfetamine', 'DEXTROAMPHETAMINE'],
  ['Amfetamine', 'AMPHETAMINE'],
  ['Ceftazidime', 'CEFTAZIDIME'],
  ['Cefalexin', 'CEPHALEXIN'],
  ['Cefradine', 'CEPHRADINE'],
  ['Colecalciferol', 'CHOLECALCIFEROL'],
  ['Ergocalciferol', 'ERGOCALCIFEROL'],
  ['Thiopentone', 'THIOPENTAL'],
  ['Methylthioninium chloride', 'METHYLENE BLUE'],
  ['Trimethoprim-sulfamethoxazole', 'SULFAMETHOXAZOLE'],
  ['Co-trimoxazole', 'SULFAMETHOXAZOLE'],
  ['Sodium valproate', 'VALPROATE'],
  ['Hyoscine', 'SCOPOLAMINE'],
  ['Oestradiol', 'ESTRADIOL'],
  ['Oestrogen', 'ESTROGENS'],
  ['Phenobarbitone', 'PHENOBARBITAL'],
  ['Chlorphenamine', 'CHLORPHENIRAMINE'],
  ['Dothiepin', 'DOSULEPIN'],
  ['Indometacin', 'INDOMETHACIN'],
  ['Ranitidine', 'RANITIDINE'],
  ['Tetracaine', 'TETRACAINE'],
  ['Levothyroxine sodium', 'LEVOTHYROXINE'],
  ['Vitamin B3', 'NIACIN'],
  ['Nicotinic acid', 'NIACIN'],
  ['Vitamin B1', 'THIAMINE'],
  ['Vitamin B2', 'RIBOFLAVIN'],
  ['Vitamin B6', 'PYRIDOXINE'],
  ['Vitamin B9', 'FOLIC ACID'],
  ['Vitamin B12', 'CYANOCOBALAMIN'],
  ['Vitamin C', 'ASCORBIC ACID'],
  ['Vitamin A', 'RETINOL'],
  ['Vitamin E', 'TOCOPHEROL'],
  ['Vitamin K', 'PHYTONADIONE'],
  ['Vitamin H', 'BIOTIN'],
  ['CoQ10', 'UBIDECARENONE'],
  ['Coenzyme Q10', 'UBIDECARENONE'],
  ['Ubiquinol', 'UBIDECARENONE'],
  ['Fish oil', 'OMEGA-3 ACID ETHYL ESTERS'],
  ['Omega-3', 'OMEGA-3 ACID ETHYL ESTERS'],
  ['ASA', 'ASPIRIN'],
  ['Acetylsalicylic acid', 'ASPIRIN'],
  ['Tylenol', 'ACETAMINOPHEN'],
  ['NAC', 'ACETYLCYSTEINE'],
  ['N-acetylcysteine', 'ACETYLCYSTEINE'],
  ['HCQ', 'HYDROXYCHLOROQUINE'],
  ['THC', 'DRONABINOL'],
  ['GLP-1', 'SEMAGLUTIDE'],
  ['Ozempic', 'SEMAGLUTIDE'],
  ['Wegovy', 'SEMAGLUTIDE'],
  ['Mounjaro', 'TIRZEPATIDE'],
  ['Zepbound', 'TIRZEPATIDE'],
  ['Rapamycin', 'SIROLIMUS'],
  ['Vitamin D3', 'CHOLECALCIFEROL'],
  ['Vitamin D2', 'ERGOCALCIFEROL'],
] as const

export interface AliasRow {
  id: string
  drugId: string
  alias: string
  kind: 'inn' | 'usan' | 'ban' | 'brand' | 'salt_form' | 'common_name' | 'systematic'
  source: string
}

/**
 * Builds the alias rows for one drug: its international synonyms, the salt spellings that
 * normalised away, and its brand names.
 *
 * Aliases identical to the drug's own name are dropped — an alias table full of a substance's own
 * name is a slower way to do what the search vector already does.
 */
export function aliasRowsFor(args: {
  drugId: string
  name: string
  moiety: string
  saltForms: readonly string[]
  brands: readonly string[]
}): AliasRow[] {
  const rows: AliasRow[] = []
  const seen = new Set<string>([args.name.toLowerCase()])

  const push = (alias: string, kind: AliasRow['kind'], source: string): void => {
    const trimmed = alias.trim()
    if (!trimmed || trimmed.length > 300) return
    const key = trimmed.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    rows.push({ id: newId('alias'), drugId: args.drugId, alias: trimmed, kind, source })
  }

  for (const [alias, moiety] of INTERNATIONAL_NAME_ALIASES) {
    if (moiety === args.moiety.toUpperCase()) {
      push(alias, 'inn', 'INN/USAN synonym')
    }
  }

  for (const salt of args.saltForms) {
    push(salt, 'salt_form', 'openFDA active ingredient spelling')
  }

  for (const brand of args.brands.slice(0, 12)) {
    push(brand, 'brand', 'openFDA brand name')
  }

  return rows
}
