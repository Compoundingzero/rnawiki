/**
 * The concept prerequisite graph (docs/dossier-v4-information-architecture.md, "Learning").
 *
 * A dossier may name at most four prerequisite concepts in the default journey, chosen by a
 * deterministic walk from the concepts a page actually uses back through their prerequisites. No
 * model ranks them. A later model may reorder the queue, but the walk here is the baseline and
 * stays the fallback.
 *
 * These entries teach general science vocabulary. None of them is a claim about any substance, and
 * none carries a medicine source, so each is marked as teaching text rather than reviewed content.
 * A concept a reader marks as understood is stored in that reader's own browser and nowhere else;
 * marking one never hides a safety sentence.
 */

export type ConceptVisual =
  | 'container'
  | 'lock_and_key'
  | 'scissors'
  | 'blueprint'
  | 'messenger'
  | 'folded_chain'
  | 'signal'
  | 'gauge'
  | 'two_groups'
  | 'coin'
  | 'range_bar'
  | 'decay_curve'
  | 'capsule'
  | 'door'
  | 'warning'
  | 'two_arrows'

export interface Concept {
  id: string
  term: string
  /** One short sentence a person with no biology can read. */
  beginner: string
  /** A named diagram the component draws. Every one has a text equivalent. */
  visual: ConceptVisual
  analogy: string
  /** Where the analogy stops being true. Required: an analogy without a limit is a lie. */
  analogyLimit: string
  prerequisites: string[]
  examples: string[]
  misunderstanding: string
  technical: string
}

export const CONCEPTS: readonly Concept[] = [
  {
    id: 'cell',
    term: 'Cell',
    beginner: 'A cell is the smallest living unit your body is built from.',
    visual: 'container',
    analogy: 'A cell is like a tiny walled workshop.',
    analogyLimit: 'A workshop has one door and one job. A cell has thousands of both.',
    prerequisites: [],
    examples: ['A muscle cell', 'A liver cell'],
    misunderstanding:
      'People picture cells as simple bags. Most of the work happens on structures inside.',
    technical:
      'The smallest self-maintaining unit of an organism, bounded by a membrane and containing the machinery for its own metabolism.',
  },
  {
    id: 'organ',
    term: 'Organ',
    beginner: 'An organ is a group of cells doing one big job together.',
    visual: 'container',
    analogy: 'An organ is like a department in a company.',
    analogyLimit: 'Departments can be closed and reopened. Organs cannot.',
    prerequisites: ['cell'],
    examples: ['The liver', 'A muscle'],
    misunderstanding:
      'An organ is often treated as one thing. Most contain several cell types that behave differently.',
    technical:
      'A structure of several tissue types that performs a defined physiological function.',
  },
  {
    id: 'protein',
    term: 'Protein',
    beginner: 'A protein is a folded chain your body builds to do a specific job.',
    visual: 'folded_chain',
    analogy: 'A protein is like a tool bent into one shape for one task.',
    analogyLimit: 'A tool keeps its shape. A protein can change shape and stop working.',
    prerequisites: ['cell'],
    examples: ['The protein that carries oxygen in blood'],
    misunderstanding:
      'Protein in food and a protein in the body are related but not the same thing.',
    technical:
      'A polymer of amino acids folded into a defined structure that determines its function.',
  },
  {
    id: 'gene',
    term: 'Gene',
    beginner: 'A gene is a stretch of instructions for building one protein.',
    visual: 'blueprint',
    analogy: 'A gene is like one page of a building plan.',
    analogyLimit: 'A page is read the same way every time. A gene can be read more or less often.',
    prerequisites: ['protein'],
    examples: ['The gene for the protein that clears cholesterol from blood'],
    misunderstanding:
      'Having a gene is often read as having a trait. Whether it is used matters as much.',
    technical: 'A segment of DNA that encodes a functional product, usually a protein.',
  },
  {
    id: 'messenger_rna',
    term: 'Messenger RNA',
    beginner: 'Messenger RNA is a working copy of one gene, carried to where proteins are built.',
    visual: 'messenger',
    analogy: 'It is like a photocopy of one plan page, taken to the workshop.',
    analogyLimit: 'A photocopy lasts. This copy is destroyed soon after use, on purpose.',
    prerequisites: ['gene', 'protein'],
    examples: ['The copy a cell makes before building a protein'],
    misunderstanding:
      'It is often thought to change the gene. It is a copy, and it does not alter the original.',
    technical: 'A single-stranded transcript of a gene that ribosomes translate into a protein.',
  },
  {
    id: 'small_interfering_rna',
    term: 'Small interfering RNA',
    beginner:
      'A small interfering RNA is a short piece that makes a cell destroy one working copy.',
    visual: 'scissors',
    analogy: 'It is like a note telling the workshop to shred one plan page.',
    analogyLimit: 'A note is read once. This keeps working for months after one injection.',
    prerequisites: ['messenger_rna'],
    examples: ['A medicine that lowers one protein by stopping its copies'],
    misunderstanding: 'It is often described as gene editing. It leaves the gene untouched.',
    technical:
      'A short double-stranded RNA that directs the RNA-induced silencing complex to cleave a complementary transcript.',
  },
  {
    id: 'receptor',
    term: 'Receptor',
    beginner: 'A receptor is a part of a cell that a signal fits into.',
    visual: 'lock_and_key',
    analogy: 'A receptor is like a lock waiting for one key.',
    analogyLimit: 'A lock either opens or does not. A receptor can be half-triggered, or worn out.',
    prerequisites: ['protein'],
    examples: ['The receptor a hunger signal fits into'],
    misunderstanding:
      'Fitting a receptor is read as causing a benefit. It causes a step, and nothing more.',
    technical:
      'A protein that binds a specific ligand and converts that binding into a cellular response.',
  },
  {
    id: 'enzyme',
    term: 'Enzyme',
    beginner: 'An enzyme is a protein that speeds up one chemical change.',
    visual: 'scissors',
    analogy: 'An enzyme is like a machine on a production line doing one cut.',
    analogyLimit:
      'A machine is switched on and off by a person. Enzymes are controlled by the cell.',
    prerequisites: ['protein'],
    examples: ['An enzyme in the liver that breaks down a medicine'],
    misunderstanding: 'Enzymes are thought to be used up. They are not; they work again and again.',
    technical: 'A catalytic protein that lowers the activation energy of a specific reaction.',
  },
  {
    id: 'hormone',
    term: 'Hormone',
    beginner: 'A hormone is a signal one part of the body sends to another through the blood.',
    visual: 'signal',
    analogy: 'A hormone is like a message sent to everyone, which only some can read.',
    analogyLimit:
      'A message means one thing. A hormone can mean different things in different tissues.',
    prerequisites: ['receptor'],
    examples: ['The hormone that tells the body to store sugar'],
    misunderstanding: 'More hormone is read as more effect. Receptors can stop responding.',
    technical:
      'A signalling molecule released into circulation that acts on receptors in distant tissues.',
  },
  {
    id: 'neurotransmitter',
    term: 'Neurotransmitter',
    beginner: 'A neurotransmitter is a signal passed across a tiny gap between nerve cells.',
    visual: 'signal',
    analogy: 'It is like a word passed across a gap between two people.',
    analogyLimit:
      'A word carries meaning on its own. This one means whatever the receiving cell does with it.',
    prerequisites: ['receptor'],
    examples: ['The signal involved in alertness'],
    misunderstanding: 'A single one is often blamed for a whole mood. None of them works alone.',
    technical: 'A molecule released at a synapse that binds receptors on the postsynaptic cell.',
  },
  {
    id: 'pathway',
    term: 'Pathway',
    beginner: 'A pathway is a chain of steps inside a cell, each one setting off the next.',
    visual: 'two_arrows',
    analogy: 'A pathway is like a row of dominoes.',
    analogyLimit: 'Dominoes fall one way. Pathways loop back and can switch themselves off.',
    prerequisites: ['enzyme', 'receptor'],
    examples: ['The chain a cell runs when it is short of energy'],
    misunderstanding:
      'Changing one step is read as changing the outcome. Other steps often absorb it.',
    technical: 'An ordered series of molecular interactions producing a defined cellular change.',
  },
  {
    id: 'biomarker',
    term: 'Biomarker',
    beginner: 'A biomarker is a number from a test that stands in for something about health.',
    visual: 'gauge',
    analogy: 'A biomarker is like a fuel gauge.',
    analogyLimit: 'A gauge is wired to the tank. Many biomarkers are only loosely tied to health.',
    prerequisites: [],
    examples: ['Cholesterol in blood', 'Blood sugar over three months'],
    misunderstanding:
      'A better number is read as a better life. Several medicines improved a number and helped nobody.',
    technical: 'A measurable indicator used as a substitute for a clinical outcome of interest.',
  },
  {
    id: 'surrogate_outcome',
    term: 'Stand-in result',
    beginner: 'A stand-in result is a number measured because the real result takes too long.',
    visual: 'gauge',
    analogy: 'It is like judging a journey by the speedometer rather than by arriving.',
    analogyLimit: 'Speed does predict arrival. Many stand-in results do not predict the real one.',
    prerequisites: ['biomarker'],
    examples: ['Measuring cholesterol instead of waiting for heart attacks'],
    misunderstanding: 'A stand-in result is often reported as the result itself.',
    technical:
      'A surrogate endpoint substituted for a clinical endpoint, valid only where the substitution has been shown to hold.',
  },
  {
    id: 'placebo',
    term: 'Placebo',
    beginner: 'A placebo is a dummy treatment given so the real one can be compared with it.',
    visual: 'two_groups',
    analogy: 'A placebo is like a blank control in an experiment.',
    analogyLimit: 'A blank does nothing. People given a placebo often do get better.',
    prerequisites: [],
    examples: ['A capsule with no active substance'],
    misunderstanding:
      'A placebo effect is read as imaginary. The improvement is measured and real.',
    technical:
      'An inactive intervention matched in appearance to the test intervention, used to control for non-specific effects.',
  },
  {
    id: 'comparator',
    term: 'Comparator',
    beginner: 'A comparator is whatever the treatment was measured against.',
    visual: 'two_groups',
    analogy: 'It is like the other runner in a race.',
    analogyLimit: 'A race has one winner. A study can show both arms improved.',
    prerequisites: ['placebo'],
    examples: ['A placebo', 'The usual treatment', 'Nothing at all'],
    misunderstanding:
      'Results are read without asking what the other group got. Beating nothing is not beating a treatment.',
    technical: 'The control condition against which the experimental intervention is assessed.',
  },
  {
    id: 'randomization',
    term: 'Randomisation',
    beginner: 'Randomisation means chance decides who gets which treatment.',
    visual: 'coin',
    analogy: 'It is like a coin toss deciding the groups.',
    analogyLimit: 'A coin toss is fair once. Fairness here comes from doing it for everyone.',
    prerequisites: ['comparator'],
    examples: ['A computer assigning each person at random'],
    misunderstanding:
      'It is thought to make groups identical. It makes them similar on average, including on things nobody measured.',
    technical:
      'Allocation of participants to arms by a chance process, so that unmeasured factors are balanced in expectation.',
  },
  {
    id: 'absolute_risk',
    term: 'Absolute difference',
    beginner: 'An absolute difference is how many more people in a hundred were affected.',
    visual: 'range_bar',
    analogy: 'It is like counting heads in two rooms of a hundred.',
    analogyLimit: 'Heads are easy to count. Study results carry a margin of error too.',
    prerequisites: [],
    examples: ['Two in a hundred instead of three in a hundred'],
    misunderstanding: 'It is confused with a percentage change, which can look far larger.',
    technical: 'The arithmetic difference in event rates between arms.',
  },
  {
    id: 'relative_risk',
    term: 'Relative difference',
    beginner:
      'A relative difference is how much the chance changed compared with where it started.',
    visual: 'range_bar',
    analogy: 'It is like saying a price fell by a third, without saying the price.',
    analogyLimit: 'A price is one number. A risk starts different for every person.',
    prerequisites: ['absolute_risk'],
    examples: ['A third fewer events, which may be one person in a thousand'],
    misunderstanding:
      'A large relative change is read as a large benefit. It can be tiny in absolute terms.',
    technical: 'The ratio of event rates between arms, meaningless without the baseline rate.',
  },
  {
    id: 'confidence_interval',
    term: 'Confidence interval',
    beginner: 'A confidence interval is the range the true answer is likely to sit in.',
    visual: 'range_bar',
    analogy: 'It is like a weather forecast giving a range rather than one number.',
    analogyLimit: 'A forecast range covers tomorrow. This one covers what the study could resolve.',
    prerequisites: ['absolute_risk'],
    examples: ['Somewhere between a small gain and a small loss'],
    misunderstanding:
      'The middle number is read as the answer. A range crossing zero means no change is still possible.',
    technical:
      'An interval estimate that would contain the true parameter in a stated proportion of repeated studies.',
  },
  {
    id: 'half_life',
    term: 'Half-life',
    beginner: 'A half-life is how long the body takes to clear half of what is there.',
    visual: 'decay_curve',
    analogy: 'It is like a puddle drying, halving each hour.',
    analogyLimit: 'A puddle disappears. Some substances build up faster than they clear.',
    prerequisites: [],
    examples: ['A medicine halved in the blood every twelve hours'],
    misunderstanding: 'It is read as how long an effect lasts. The two often differ a great deal.',
    technical: 'The time for plasma concentration to fall by half during elimination.',
  },
  {
    id: 'formulation',
    term: 'Formulation',
    beginner: 'A formulation is the exact made-up form a substance comes in.',
    visual: 'capsule',
    analogy: 'It is like the difference between a whole bean and instant coffee.',
    analogyLimit: 'Coffee tastes different. A formulation can change how much reaches the blood.',
    prerequisites: [],
    examples: ['A powder', 'A slow-release tablet', 'An injection'],
    misunderstanding:
      'Two products with the same name are assumed to behave the same. They often do not.',
    technical:
      'The specific composition and physical form of a product, including salt, excipients and release profile.',
  },
  {
    id: 'route',
    term: 'Route',
    beginner: 'A route is the way a substance gets into the body.',
    visual: 'door',
    analogy: 'It is like choosing which door to enter a building by.',
    analogyLimit:
      'Any door reaches the same room. Routes reach the blood in very different amounts.',
    prerequisites: ['formulation'],
    examples: ['Swallowed', 'Injected under the skin', 'Inhaled'],
    misunderstanding:
      'A swallowed dose is assumed to arrive whole. The gut and liver remove much of it.',
    technical: 'The anatomical path of administration, which determines bioavailability.',
  },
  {
    id: 'adverse_event',
    term: 'Adverse event',
    beginner: 'An adverse event is anything bad that happened while someone was taking it.',
    visual: 'warning',
    analogy: 'It is like noting every breakdown during a car test.',
    analogyLimit: 'A breakdown is the car. Some events would have happened anyway.',
    prerequisites: [],
    examples: ['A headache during a trial', 'A hospital visit during a trial'],
    misunderstanding:
      'Recording an event is read as the substance causing it. Causing is a separate question.',
    technical:
      'Any untoward medical occurrence in a participant, whether or not it is attributed to the intervention.',
  },
  {
    id: 'interaction',
    term: 'Interaction',
    beginner: 'An interaction is when two substances change what each other does.',
    visual: 'two_arrows',
    analogy: 'It is like two people pushing a door from opposite sides.',
    analogyLimit: 'People can be seen. Interactions are often found only after harm.',
    prerequisites: ['enzyme'],
    examples: ['One substance slowing the removal of another'],
    misunderstanding:
      'No listed interaction is read as no interaction. Most pairs were never studied.',
    technical: 'A pharmacokinetic or pharmacodynamic modification of one agent effect by another.',
  },
] as const

const BY_ID = new Map(CONCEPTS.map((concept) => [concept.id, concept]))

export function concept(id: string): Concept | undefined {
  return BY_ID.get(id)
}

/**
 * Deterministic prerequisite traversal: expand each requested concept into itself plus everything
 * it depends on, depth-first, so a prerequisite always precedes what needs it. No score, no model.
 * A cycle would loop, so the visited set guards it.
 *
 * The cap is the part worth reading twice. A naive `slice(0, limit)` drops the concept the page
 * actually needs whenever its chain is deeper than the limit — asking for a small interfering RNA
 * returned cell, protein, gene and messenger RNA, and never the thing being explained. So the
 * requested concepts are kept first, and the remaining slots are filled with the prerequisites
 * nearest to them, working backwards. Deep background is what gets dropped, not the subject.
 */
export function prerequisiteWalk(wanted: readonly string[], limit = 4): Concept[] {
  const ordered: Concept[] = []
  const visited = new Set<string>()
  const visit = (id: string): void => {
    if (visited.has(id)) return
    visited.add(id)
    const node = BY_ID.get(id)
    if (!node) return
    for (const prerequisite of node.prerequisites) visit(prerequisite)
    ordered.push(node)
  }
  for (const id of wanted) visit(id)
  if (ordered.length <= limit) return ordered

  const roots = wanted.filter((id) => BY_ID.has(id))
  const keep = new Set<string>(roots.slice(0, limit))
  // Fill what is left with the most specific prerequisites, which sit nearest the end of the walk.
  for (let index = ordered.length - 1; index >= 0 && keep.size < limit; index -= 1) {
    const node = ordered[index]
    if (node) keep.add(node.id)
  }
  return ordered.filter((node) => keep.has(node.id))
}

/**
 * The concepts a dossier needs, decided from what the page actually shows. Nothing is inferred
 * from the reader. A page that shows a confidence interval teaches confidence intervals.
 */
export function conceptsForPage(signals: {
  showsBiomarker: boolean
  showsConfidenceInterval: boolean
  showsAnimalEvidence: boolean
  showsInteraction: boolean
  showsFormulationDifference: boolean
  isRnaMedicine: boolean
  showsRandomisedTrial: boolean
}): Concept[] {
  const wanted: string[] = []
  if (signals.isRnaMedicine) wanted.push('small_interfering_rna')
  if (signals.showsBiomarker) wanted.push('surrogate_outcome')
  if (signals.showsRandomisedTrial) wanted.push('randomization')
  if (signals.showsConfidenceInterval) wanted.push('confidence_interval')
  if (signals.showsFormulationDifference) wanted.push('formulation')
  if (signals.showsInteraction) wanted.push('interaction')
  if (signals.showsAnimalEvidence) wanted.push('pathway')
  if (wanted.length === 0) wanted.push('biomarker', 'comparator')
  return prerequisiteWalk(wanted, 4)
}
