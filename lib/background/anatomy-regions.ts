/**
 * The controlled anatomy vocabulary for the systemic target map.
 *
 * Drawing coordinates are a property of this fixed vocabulary, never of a medicine record. An
 * author records only a region code with its sourced action; the figure position comes from here.
 * This is what makes the body map honest: nobody ever guesses a point on a decorative human
 * figure from free text (see `bodyMapModule`'s original refusal in lib/dossier-dynamic-modules).
 *
 * Coordinates target the shared 200×280 editorial line figure (head centred at 100,40; torso
 * between y≈70 and y≈170). Bilateral organs use one representative point.
 */

export const ANATOMY_REGIONS = {
  brain: { label: 'Brain', x: 100, y: 36 },
  brainstem: { label: 'Brainstem', x: 100, y: 56 },
  eye: { label: 'Eyes', x: 88, y: 38 },
  'nasal-airway': { label: 'Nose and upper airway', x: 100, y: 46 },
  thyroid: { label: 'Thyroid', x: 100, y: 66 },
  lungs: { label: 'Lungs and airways', x: 86, y: 95 },
  heart: { label: 'Heart', x: 106, y: 98 },
  'blood-vessels': { label: 'Blood and vessels', x: 118, y: 108 },
  liver: { label: 'Liver', x: 112, y: 118 },
  stomach: { label: 'Stomach', x: 90, y: 118 },
  pancreas: { label: 'Pancreas', x: 102, y: 126 },
  kidneys: { label: 'Kidneys', x: 116, y: 132 },
  adrenal: { label: 'Adrenal glands', x: 84, y: 128 },
  intestines: { label: 'Intestines', x: 100, y: 144 },
  bladder: { label: 'Bladder and urinary tract', x: 100, y: 160 },
  'pelvic-organs': { label: 'Pelvic and reproductive organs', x: 100, y: 168 },
  'bone-marrow': { label: 'Bone and bone marrow', x: 76, y: 150 },
  joints: { label: 'Joints', x: 124, y: 150 },
  muscle: { label: 'Muscle', x: 70, y: 110 },
  skin: { label: 'Skin', x: 130, y: 90 },
  'immune-lymph': { label: 'Immune and lymphatic system', x: 92, y: 80 },
  'mouth-throat': { label: 'Mouth and throat', x: 100, y: 52 },
} as const

export type AnatomyRegionCode = keyof typeof ANATOMY_REGIONS

export const ANATOMY_REGION_CODES = Object.keys(ANATOMY_REGIONS) as AnatomyRegionCode[]

export function isAnatomyRegionCode(value: string): value is AnatomyRegionCode {
  return Object.prototype.hasOwnProperty.call(ANATOMY_REGIONS, value)
}
