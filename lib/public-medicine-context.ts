/**
 * One reader-facing explanation of a technical medicine or study term.
 *
 * `plainMeaning` is deliberately separate from `definition`: the first is the short wording used
 * in the page, while the second supplies a little more context only when the reader asks for it.
 */
export interface PublicMedicineContextItem {
  key: string
  plainMeaning: string
  technicalTerm: string
  definition: string
}

function item(
  key: string,
  plainMeaning: string,
  technicalTerm: string,
  definition: string,
): PublicMedicineContextItem {
  return { key, plainMeaning, technicalTerm, definition }
}

export const COMMON_PUBLIC_MEDICINE_CONTEXT = {
  percentage: item(
    'percentage',
    'A result written as parts out of 100',
    'Percentage (%)',
    'A percentage can mean a share, a change over time, or a difference between two groups. For example, 50% of people means 50 out of every 100 people; 50% lower describes the size of a change, not how many people improved.',
  ),
  percentageVersusPlacebo: item(
    'percentage-versus-placebo',
    'How the named measurement changed compared with the inactive comparison treatment',
    'Percentage change versus placebo',
    'This is the extra change seen with the medicine after allowing for what happened in the comparison group. About 50% lower means the measurement fell by roughly half more with the medicine. It does not mean half of the people were cured or helped.',
  ),
  percentagePointsVersusPlacebo: item(
    'percentage-points-versus-placebo',
    'How the average percentage change differed between the treatment groups',
    'Percentage-point difference versus placebo',
    'A percentage point is the gap between two percentage values. For example, if a measurement changes by 50% in one group and 0% in the other, the gap is 50 percentage points. It does not mean 50% of people improved.',
  ),
  placebo: item(
    'placebo',
    'A comparison with an inactive look-alike treatment',
    'Placebo',
    'A placebo is a dummy treatment made to look like the real one but without the active medicine. It helps researchers compare what happened with and without the medicine being tested.',
  ),
  studyIdentifier: item(
    'study-identifier',
    'The study’s public registry number',
    'NCT number',
    'ClinicalTrials.gov gives every registered study a number beginning with NCT. It works like a library catalogue number: it helps you find the exact study, but it does not describe the result.',
  ),
  rna: item(
    'rna',
    'A molecule cells use to carry or control genetic instructions',
    'RNA',
    'Cells keep long-term instructions in DNA. RNA is a short-lived working note copied from those instructions. Cells read some RNA notes to make proteins; some medicines are designed to block one chosen note.',
  ),
} as const satisfies Readonly<
  Record<
    | 'percentage'
    | 'percentageVersusPlacebo'
    | 'percentagePointsVersusPlacebo'
    | 'placebo'
    | 'studyIdentifier'
    | 'rna',
    PublicMedicineContextItem
  >
>

const OTHER_DETECTED_CONTEXT: ReadonlyArray<{
  pattern: RegExp
  context: PublicMedicineContextItem
}> = [
  {
    pattern: /\bpercentage points?\b/i,
    context: item(
      'percentage-points',
      'The gap between two percentages, not the percentage of people helped',
      'Percentage points',
      'Percentage points compare two percentage values. For example, the gap between 50% and 40% is 10 percentage points. This number describes the size of a difference; it does not say how many people improved.',
    ),
  },
  {
    pattern: /\bLDL(?:-C)?\b/i,
    context: item(
      'ldl-cholesterol',
      'A blood measurement often called “bad cholesterol”',
      'LDL cholesterol (LDL-C)',
      'LDL carries cholesterol in the blood and is often called “bad cholesterol.” When too much stays in the blood for years, fatty material can build up inside arteries.',
    ),
  },
  {
    pattern: /\bPCSK9\b/i,
    context: item(
      'pcsk9',
      'A protein that can leave the liver with fewer LDL-removing catchers',
      'PCSK9',
      'PCSK9 is a protein made mostly by the liver. It removes some of the liver’s LDL catchers. With fewer catchers, more LDL (“bad”) cholesterol stays in the blood.',
    ),
  },
  {
    pattern: /\bsiRNA\b/i,
    context: item(
      'sirna',
      'A short medicine that tells a cell to discard one chosen instruction',
      'siRNA (small interfering RNA)',
      'A cell uses temporary instruction notes when making proteins. This short medicine finds one chosen note and helps the cell break it down, so the cell makes less of that protein.',
    ),
  },
  {
    pattern: /\b(?:messenger RNA|mRNA)\b/i,
    context: item(
      'messenger-rna',
      'A temporary instruction a cell reads when making a protein',
      'Messenger RNA (mRNA)',
      'DNA stores the long-term instructions. Messenger RNA is a short-lived working copy of one instruction. A cell reads that copy when making a particular protein.',
    ),
  },
  {
    pattern: /\bGalNAc\b/i,
    context: item(
      'galnac',
      'A sugar tag used to help certain RNA medicines enter liver cells',
      'GalNAc',
      'GalNAc is a small sugar tag added to the medicine. Liver cells recognise the tag and pull the medicine inside. The tag helps with delivery; it is not the part that lowers cholesterol.',
    ),
  },
  {
    pattern: /\breceptor agonists?\b/i,
    context: item(
      'mechanism-receptor-agonist',
      'A substance that turns on a cell’s signal receiver',
      'Receptor agonist',
      'A receptor is like a receiver on or inside a cell. An agonist attaches to it and starts or strengthens a signal, often by copying a signal the body already uses. That explains an intended action, not whether the treatment helps people overall.',
    ),
  },
  {
    pattern: /\breceptor antagonists?\b/i,
    context: item(
      'mechanism-receptor-antagonist',
      'A substance that blocks a cell’s signal receiver',
      'Receptor antagonist',
      'A receptor receives a signal that can change what a cell does. An antagonist attaches without turning that signal on and blocks or weakens it. Blocking a signal can have useful and unwanted effects elsewhere in the body.',
    ),
  },
  {
    pattern: /\benzyme inhibitors?\b/i,
    context: item(
      'mechanism-enzyme-inhibitor',
      'A substance that slows a protein that runs a chemical reaction',
      'Enzyme inhibitor',
      'An enzyme speeds up a chemical reaction in the body. An inhibitor reduces that enzyme’s activity; it may slow the reaction without stopping it completely. The clinical result depends on which reaction changes and where.',
    ),
  },
  {
    pattern: /\bmonoclonal antibod(?:y|ies)\b/i,
    context: item(
      'mechanism-monoclonal-antibody',
      'A laboratory-made targeting protein',
      'Monoclonal antibody',
      'Antibodies recognise particular shapes, rather like a key fitting one lock. A monoclonal antibody medicine is made to attach to one chosen target. Reaching that target does not by itself prove a patient benefit.',
    ),
  },
  {
    pattern: /\bprodrugs?\b/i,
    context: item(
      'mechanism-prodrug',
      'A form designed to be changed by the body into the active medicine',
      'Prodrug',
      'A prodrug is given in a form that the body converts into the substance expected to produce the main effect. How reliably that conversion happens can affect the dose, timing, interactions, and response.',
    ),
  },
  {
    pattern: /\bactive metabolites?\b/i,
    context: item(
      'mechanism-active-metabolite',
      'A changed form of a substance that still produces an effect in the body',
      'Active metabolite',
      'The body can chemically change a medicine into another substance. An active metabolite still has a biological effect and may last for a different amount of time or have different benefits and harms from the original medicine.',
    ),
  },
  {
    pattern: /\bmetabolites?\b/i,
    context: item(
      'mechanism-metabolite',
      'A substance made when the body or another living system changes a chemical',
      'Metabolite',
      'A metabolite is a changed or broken-down form of another substance. It may be active, inactive, useful, or harmful; the surrounding sentence should say what was measured or what the metabolite does.',
    ),
  },
  {
    pattern: /\bpotassium channels?\b/i,
    context: item(
      'mechanism-potassium-channel',
      'A tiny cell gate that controls the movement of potassium',
      'Potassium channel',
      'Potassium carries electrical charge. These channels open and close to help control electrical signals in nerves, muscles, and the heart. Changing one channel can therefore have both intended and unwanted effects.',
    ),
  },
  {
    pattern: /\bsodium channels?\b/i,
    context: item(
      'mechanism-sodium-channel',
      'A tiny cell gate that controls the movement of sodium',
      'Sodium channel',
      'Sodium carries electrical charge. These channels help start and carry electrical signals in nerves, muscles, and the heart. Blocking or holding them open can change whether those cells fire normally.',
    ),
  },
  {
    pattern: /\breceptors?\b/i,
    context: item(
      'mechanism-receptor',
      'A signal receiver on or inside a cell',
      'Receptor',
      'A receptor recognises a particular chemical message and then changes what the cell does. Medicines can turn a receptor’s signal up, turn it down, or block it; the surrounding sentence should say which.',
    ),
  },
  {
    pattern: /\bagonists?\b/i,
    context: item(
      'mechanism-agonist',
      'A substance that switches on a cell signal',
      'Agonist',
      'An agonist attaches to a receptor and starts or strengthens its signal, often by copying a natural body signal. This describes how it acts at that target, not the size of its benefit or harms.',
    ),
  },
  {
    pattern: /\bantagonists?\b/i,
    context: item(
      'mechanism-antagonist',
      'A substance that blocks or weakens a cell signal',
      'Antagonist',
      'An antagonist attaches to a receptor without switching it on, preventing another signal from acting there. The effect can differ between tissues that use the same receptor.',
    ),
  },
  {
    pattern: /\binhibit(?:s|ed|ing|ion)\b|\binhibitors?\b/i,
    context: item(
      'mechanism-inhibitor',
      'Something that slows or blocks a named biological process',
      'Inhibitor or inhibition',
      'An inhibitor reduces the activity of a protein, enzyme, or process. It does not always stop that activity completely, and a molecular effect does not by itself show how much a patient will benefit.',
    ),
  },
  {
    pattern: /\benzymes?\b/i,
    context: item(
      'mechanism-enzyme',
      'A molecule that helps a chemical reaction happen faster',
      'Enzyme',
      'Most enzymes are proteins that speed up particular chemical reactions in the body without being used up. Changing one enzyme can affect several downstream substances or processes.',
    ),
  },
  {
    pattern: /\bantibod(?:y|ies)\b/i,
    context: item(
      'mechanism-antibody',
      'A targeting protein that recognises one particular shape',
      'Antibody',
      'The immune system makes antibodies to recognise targets. Antibody medicines are laboratory-made proteins designed to attach to a chosen target; attaching to it does not automatically mean the medicine improves a patient outcome.',
    ),
  },
  {
    pattern: /\bplacebo[- ]adjusted\b/i,
    context: item(
      'placebo-adjusted',
      'The difference after subtracting what happened in the inactive comparison group',
      'Placebo-adjusted result',
      'This is the difference between groups, not the medicine group’s raw change by itself and not the percentage of people who benefited.',
    ),
  },
  {
    pattern: /\bprimary endpoint\b/i,
    context: item(
      'endpoint-primary',
      'The study’s main planned result',
      'Primary endpoint',
      'Researchers choose this result before the study begins and use it as the main test of whether the treatment made a difference.',
    ),
  },
  {
    pattern: /\bsecondary endpoint\b/i,
    context: item(
      'endpoint-secondary',
      'An additional result planned before the study began',
      'Secondary endpoint',
      'This is another result the study planned to measure. It adds information but is not the study’s main planned test.',
    ),
  },
  {
    pattern: /\bexploratory endpoint\b/i,
    context: item(
      'endpoint-exploratory',
      'An early result used to look for patterns',
      'Exploratory endpoint',
      'Researchers use this result to find signals worth studying further. It usually carries less weight than a main planned result.',
    ),
  },
  {
    pattern: /\bsurrogate(?: marker| outcome| endpoint)?s?\b/i,
    context: item(
      'outcome-surrogate',
      'An indirect measurement used instead of a direct patient result',
      'Surrogate marker',
      'This may suggest benefit or harm, but it does not by itself show how people felt, functioned, or survived.',
    ),
  },
  {
    pattern: /\bbiomarkers?\b|\bbiomarker outcomes?\b/i,
    context: item(
      'outcome-biomarker',
      'A measurement from the body, such as a laboratory value',
      'Biomarker outcome',
      'This records a biological sign. It is not by itself a direct measure of how people felt, functioned, or survived.',
    ),
  },
  {
    pattern: /\brandomi[sz](?:ed|ation)\b|\brandomly assigned\b/i,
    context: item(
      'study-randomisation',
      'People were put into study groups by chance',
      'Randomisation',
      'A computer or another chance method decides who receives each treatment. This helps make the groups more comparable at the start, although chance can still leave differences in a small study.',
    ),
  },
  {
    pattern:
      /\b(?:single|double|triple)[- ](?:blind(?:ed)?|mask(?:ed|ing))\b|\bblind(?:ed|ing)\b|\bmasking\b|\bmasked\b(?=\s+(?:assessment|design|study|trial))\b/i,
    context: item(
      'study-blinding',
      'Treatment assignment was kept hidden from some or all participants and researchers',
      'Blinding',
      'Keeping treatment assignment hidden can reduce the chance that expectations change how results are reported or assessed.',
    ),
  },
  {
    pattern: /\bopen[- ]label\b/i,
    context: item(
      'study-open-label',
      'People and researchers knew which treatment was being given',
      'Open-label study',
      'There was no attempt to hide the treatment assignment from participants or researchers. Knowing the treatment can influence symptoms people report, care decisions, or how results are judged.',
    ),
  },
  {
    pattern: /\bsingle[- ]arm(?:ed)?\b/i,
    context: item(
      'study-single-arm',
      'Everyone in the study received the same treatment',
      'Single-arm study',
      'A single-arm study has no comparison group enrolled at the same time. Changes can be measured, but it is harder to know how much came from the treatment rather than time, usual care, or differences between people.',
    ),
  },
  {
    pattern: /\bcross[- ]?over\b/i,
    context: item(
      'study-crossover',
      'The same people received different treatments at different times',
      'Crossover study',
      'Each person can act as their own comparison, which can reduce differences between groups. The order of treatments and any effect left over from the first period still matter.',
    ),
  },
  {
    pattern: /\bnon[- ]inferior(?:ity)?\b/i,
    context: item(
      'study-non-inferiority',
      'A test of whether a new treatment is not unacceptably worse than the comparison',
      'Non-inferiority study',
      'Researchers choose the largest acceptable disadvantage before analysing the study. Passing this test does not show that the new treatment is better, identical, or equally safe in every way.',
    ),
  },
  {
    pattern: /\bmeta[- ]analys(?:is|es)\b/i,
    context: item(
      'evidence-meta-analysis',
      'A calculation that combines results from several studies',
      'Meta-analysis',
      'Combining compatible studies can give a clearer overall estimate than one study alone. The answer is still only as dependable as the included studies and the choices made when combining them.',
    ),
  },
  {
    pattern: /\bsystematic reviews?\b/i,
    context: item(
      'evidence-systematic-review',
      'A planned search for all studies that fit stated rules',
      'Systematic review',
      'Reviewers use a documented method to find and assess the relevant research. A systematic review may or may not combine the study numbers, and its conclusion still depends on the quality of the available studies.',
    ),
  },
  {
    pattern: /\bCochrane reviews?\b/i,
    context: item(
      'evidence-cochrane-review',
      'A structured review of the relevant studies published by Cochrane',
      'Cochrane review',
      'Cochrane reviews use stated methods to search for and assess research on a question. They may or may not combine the study numbers, and their conclusion still depends on the quality and completeness of the available studies.',
    ),
  },
  {
    pattern: /\bpooled analys(?:is|es)\b/i,
    context: item(
      'evidence-pooled-analysis',
      'One calculation made after putting results or data together',
      'Pooled analysis',
      'Researchers combine information from more than one study or group before calculating a result. This can improve precision, but important differences between the pooled studies or people can be hidden.',
    ),
  },
  {
    pattern: /\b(?:independent )?replicat(?:ed|es|ion|ions)\b|\bfailed to replicate\b/i,
    context: item(
      'evidence-replication',
      'Whether another study found a similar result',
      'Replication',
      'A result is more convincing when it appears again with new data. “Independent replication” is stronger because a separate team repeated the test; replication still does not mean every study or every person had the same result.',
    ),
  },
  {
    pattern:
      /\b(?:stopp(?:ed|ing)|halt(?:ed|ing)|terminat(?:ed|ing))\b[^.!?\n]{0,50}\bfutility\b|\bfutility\b/i,
    context: item(
      'study-futility',
      'The study was unlikely to show its planned benefit if it continued',
      'Stopped for futility',
      'Researchers used the results available partway through the study to judge that reaching the planned goal had become unlikely. This does not by itself mean the treatment caused harm.',
    ),
  },
  {
    pattern: /\bpivotal (?:clinical )?(?:stud(?:y|ies)|trials?)\b/i,
    context: item(
      'study-major-decision',
      'A major study used for an approval or other important decision',
      'Major decision study',
      'Regulators or researchers treat this as one of the main studies supporting a decision. This describes the study’s role, not whether the result was positive or free from limitations.',
    ),
  },
  {
    pattern: /\bconfirmatory (?:clinical )?(?:stud(?:y|ies)|trials?)\b/i,
    context: item(
      'study-confirmatory',
      'A later study meant to check an earlier finding or promise',
      'Confirmatory trial',
      'This study checks whether earlier evidence holds up, often in more people or with a more meaningful result. A confirmatory trial can support or overturn the earlier conclusion.',
    ),
  },
  {
    pattern:
      /\bconfidence intervals?\b|\b\d{1,2}(?:\.\d+)?%\s+(?:confidence\s+)?interval\b|\b\d{1,2}(?:\.\d+)?%\s*CI\b/i,
    context: item(
      'confidence-interval',
      'A range showing how uncertain the estimate is',
      'Confidence interval',
      'A wider range means the study result is less precise. It does not guarantee that the true value is inside the range.',
    ),
  },
  {
    pattern: /\bp[- ]?value\b|\bp\s*(?:=|<|>|≤|≥)\s*(?:\d+(?:\.\d+)?|\.\d+)\b/i,
    context: item(
      'p-value',
      'How surprising the study numbers would be if there were really no difference',
      'P-value',
      'This number does not say how large, useful, or important the effect is, and it is not proof that a treatment works.',
    ),
  },
  {
    pattern: /\bhazard ratios?\b/i,
    context: item(
      'statistics-hazard-ratio',
      'A comparison of how quickly an event happened in two groups',
      'Hazard ratio',
      'A value below 1 means the event happened more slowly in the first named group during the study period; the surrounding range shows uncertainty.',
    ),
  },
  {
    pattern: /\b(?:relative risks?|risk ratios?)\b/i,
    context: item(
      'statistics-relative-risk',
      'A comparison of how often an event happened in two groups',
      'Relative risk',
      'A value of 1 means the event occurred equally often in both groups. The number still needs the actual event rates for context.',
    ),
  },
  {
    pattern: /\bodds ratios?\b/i,
    context: item(
      'statistics-odds-ratio',
      'A comparison of the odds of an event in two groups',
      'Odds ratio',
      'A value of 1 means the event had the same odds in both groups. Odds are not the same as the everyday chance or percentage of people affected, so the actual event rates are still needed to understand the size of the difference.',
    ),
  },
  {
    pattern: /\bnumber needed to (?:treat|harm)\b/i,
    context: item(
      'statistics-number-needed',
      'How many people would need the treatment for one extra benefit or harm',
      'Number needed to treat or harm',
      'This compares the treatment with another group for one stated result and length of time. A smaller number means the extra event is more common, but the number changes with the people studied, the comparison, the outcome, and the follow-up period.',
    ),
  },
  {
    pattern:
      /\bmedian\b(?=\s+(?:of\b|\d|age\b|follow[- ]up\b|overall survival\b|progression[- ]free survival\b|survival\b|time\b|duration\b|value\b|score\b|change\b|difference\b|response\b|concentration\b|level\b))/i,
    context: item(
      'statistics-median',
      'The middle value after the results are put in order',
      'Median',
      'Half the recorded values are below the median and half are above it. It is not the same as the arithmetic average and does not show how widely individual results varied.',
    ),
  },
  {
    pattern: /\bpharmacokinetic(?:s)?\b/i,
    context: item(
      'pharmacokinetics',
      'How the body absorbs, moves, changes, and removes a medicine',
      'Pharmacokinetics',
      'These measurements describe what the body does to a medicine over time; they do not by themselves show whether it helps patients.',
    ),
  },
  {
    pattern: /\bhalf[- ](?:life|lives)\b/i,
    context: item(
      'half-life',
      'How long it takes the amount of a medicine in the body to fall by half',
      'Half-life',
      'Half-life helps describe how long a medicine remains in the body, but it is not the same as how long its clinical effect lasts.',
    ),
  },
  {
    pattern: /\bbioavailability\b/i,
    context: item(
      'bioavailability',
      'How much of a dose reaches the bloodstream in an active form',
      'Bioavailability',
      'This can differ by how a medicine is given and how the body absorbs it.',
    ),
  },
  {
    pattern: /\bcontraindicat(?:ed|ion|ions)\b/i,
    context: item(
      'contraindication',
      'A situation in which a medicine should not be used',
      'Contraindication',
      'The reason may be a known risk, another condition, or an interaction. The exact restriction comes from the cited medical or regulatory source.',
    ),
  },
  {
    pattern: /\badverse events?\b/i,
    context: item(
      'adverse-event',
      'A health problem reported during a study or treatment',
      'Adverse event',
      'The report records that the problem happened. It does not by itself prove that the medicine caused it.',
    ),
  },
  {
    pattern: /\bboxed warnings?\b/i,
    context: item(
      'safety-boxed-warning',
      'The FDA label’s most prominent warning about a serious risk',
      'Boxed warning',
      'A boxed warning calls attention to a serious or potentially life-threatening risk in United States prescribing information. It does not mean the medicine is never appropriate; the exact warning explains who is at risk and what precautions are required.',
    ),
  },
  {
    pattern: /\bFDA labels?\b/i,
    context: item(
      'regulatory-fda-label',
      'The official United States prescribing information for a medicine',
      'FDA label',
      'The FDA-approved label records what the medicine is approved for, how it should be used, and its known warnings and evidence at the time of the label. It is more than the sticker on the package and may be updated.',
    ),
  },
  {
    pattern: /\ball[- ]cause mortality\b/i,
    context: item(
      'outcome-all-cause-mortality',
      'Deaths from any cause during the stated period',
      'All-cause mortality',
      'This counts every death, whatever the cause, rather than only deaths assigned to one disease. A fair comparison between groups and the length of follow-up are still needed to judge whether a treatment changed that risk.',
    ),
  },
  {
    pattern: /\bmortality\b/i,
    context: item(
      'outcome-mortality',
      'Deaths during a stated period',
      'Mortality',
      'Mortality is a count or rate of deaths. The surrounding sentence should say whose deaths were counted, over what time, and whether the number was compared fairly with another group.',
    ),
  },
  {
    pattern: /\bmyocardial infarctions?\b/i,
    context: item(
      'medical-myocardial-infarction',
      'A heart attack',
      'Myocardial infarction',
      'Part of the heart muscle is injured because its blood supply is blocked. The term describes a heart attack; it does not by itself say how severe it was or whether a medicine caused or prevented it.',
    ),
  },
  {
    pattern: /\bcardiovascular\b/i,
    context: item(
      'medical-cardiovascular',
      'Related to the heart and blood vessels',
      'Cardiovascular',
      'This broad word can cover heart attacks, strokes, heart failure, blood-vessel disease, or a mixture of events. The surrounding sentence should name the exact outcome rather than treating them as interchangeable.',
    ),
  },
  {
    pattern: /\bHbA1c\b/i,
    context: item(
      'measurement-hba1c',
      'A blood test that reflects average blood sugar over the past few months',
      'HbA1c',
      'Sugar gradually attaches to haemoglobin in red blood cells. HbA1c estimates longer-term blood sugar exposure, but it does not show daily highs and lows or by itself tell how a person feels.',
    ),
  },
  {
    pattern: /\bmuscle biops(?:y|ies)\b/i,
    context: item(
      'measurement-muscle-biopsy',
      'A very small sample of muscle removed so it can be measured',
      'Muscle biopsy',
      'Researchers remove a small piece of muscle tissue and test it directly. The result describes that sample at that time; one sampled spot does not represent every muscle or prove a whole-body benefit.',
    ),
  },
  {
    pattern: /\bbiops(?:y|ies)\b/i,
    context: item(
      'measurement-biopsy',
      'A small tissue sample removed so it can be examined or measured',
      'Biopsy',
      'A biopsy lets researchers or clinicians inspect tissue directly. It describes the sampled place and time, so it may not represent the whole organ, every affected area, or a person’s overall health.',
    ),
  },
  {
    pattern: /\banaphylaxis\b/i,
    context: item(
      'anaphylaxis',
      'A severe allergic reaction that needs urgent medical care',
      'Anaphylaxis',
      'It can cause trouble breathing, swelling, a sudden fall in blood pressure, or collapse. Emergency treatment is needed.',
    ),
  },
  {
    pattern: /\bbaseline\b/i,
    context: item(
      'study-baseline',
      'The starting measurement before treatment',
      'Baseline',
      'Researchers compare later measurements with this starting value to see how much changed during the study.',
    ),
  },
  {
    pattern: /\bpercentage\s+points?\b/i,
    context: item(
      'percentage-points',
      'The direct distance between two percentage values',
      'Percentage points',
      'If one group changes by 10% and another by 50%, the direct difference is 40 percentage points. This is different from saying one value changed by 40 percent relative to the other.',
    ),
  },
  {
    pattern: /\bstatins?\b/i,
    context: item(
      'medicine-statin',
      'A common type of cholesterol-lowering medicine, usually taken as a tablet',
      'Statin',
      'Statins slow down cholesterol production in the liver. They have also been studied for their effects on heart attacks and strokes.',
    ),
  },
  {
    pattern: /\bezetimibe\b/i,
    context: item(
      'medicine-ezetimibe',
      'A tablet that reduces how much cholesterol the gut absorbs',
      'Ezetimibe',
      'Less cholesterol reaches the liver from the gut, which can help lower LDL cholesterol in the blood.',
    ),
  },
  {
    pattern:
      /\b(?:familial hypercholesterolaemia|familial hypercholesterolemia|heterozygous FH|homozygous FH|HeFH|HoFH)\b/i,
    context: item(
      'familial-hypercholesterolaemia',
      'Inherited high cholesterol that begins early in life',
      'Familial hypercholesterolaemia',
      'A gene change causes very high LDL cholesterol. One form leaves some LDL catchers working; the most severe form can leave few or none.',
    ),
  },
  {
    pattern: /\bcentral claim survives audit\b/i,
    context: item(
      'evidence-claim-survives-audit',
      'The main claim remained supported after the cited studies were checked',
      'Central claim survives audit',
      'Here, “audit” means checking the claim against the recorded studies and sources. It is not a financial audit, and support for this central claim does not automatically support every other claim about the product.',
    ),
  },
  {
    pattern: /\bmuscle creatine\b/i,
    context: item(
      'muscle-creatine',
      'The amount of creatine stored inside muscle tissue',
      'Muscle creatine',
      'This usually means total creatine measured inside muscle: free creatine plus phosphocreatine. A higher amount shows that more creatine is stored there; by itself, it does not show that a person is stronger or healthier.',
    ),
  },
  {
    pattern: /\bphosphocreatine resynthesis\b/i,
    context: item(
      'phosphocreatine-resynthesis',
      'How quickly a muscle refills one rapid energy store after hard effort',
      'Phosphocreatine resynthesis',
      'Phosphocreatine is a stored form of creatine that can rapidly help remake ATP, the cell’s immediate energy supply. Resynthesis means rebuilding that store during recovery. Faster refilling is a muscle measurement, not by itself proof of better performance or health.',
    ),
  },
  {
    pattern: /\bshort[- ]duration power\b/i,
    context: item(
      'exercise-short-duration-power',
      'How much work the body can produce quickly during a brief, hard effort',
      'Short-duration power',
      'In exercise studies, this usually means power measured over seconds, such as during a sprint or repeated lift. It does not describe endurance, everyday energy, or protection from disease.',
    ),
  },
  {
    pattern: /\bneuroprotection\b/i,
    context: item(
      'neuroprotection',
      'Preventing or slowing damage to nerve cells',
      'Neuroprotection',
      'A neuroprotection claim says that a treatment preserves the structure or function of nerve cells or slows a neurological disease. A laboratory mechanism alone does not establish that benefit in people; clinical studies must measure meaningful function or disease progression.',
    ),
  },
  {
    pattern:
      /(?:^|[\s(])phase\s+(?:1|I)(?:a|b)?\b(?=\s*(?:$|[,;:—–-]|(?:clinical\s+)?(?:trials?|stud(?:y|ies)|testing|development|programme|program)\b))/i,
    context: item(
      'study-phase-1',
      'Early testing in people, mainly to learn about dose and immediate safety',
      'Phase 1 study',
      'Phase 1 is usually the first stage of testing a treatment in people. Researchers study how the body handles it, what amount to use, and common short-term problems. This stage is generally too early to establish routine patient benefit.',
    ),
  },
  {
    pattern:
      /(?:^|[\s(])phase\s+(?:2|II)(?:a|b)?\b(?=\s*(?:$|[,;:—–-]|(?:clinical\s+)?(?:trials?|stud(?:y|ies)|testing|development|programme|program)\b))/i,
    context: item(
      'study-phase-2',
      'Mid-stage testing that asks whether a treatment appears to help',
      'Phase 2 study',
      'Phase 2 studies look for signs of benefit, continue safety checks, and often compare doses. They are usually smaller than the later studies used to confirm a result, so a promising Phase 2 result can still fail in Phase 3.',
    ),
  },
  {
    pattern:
      /(?:^|[\s(])phase\s+(?:3|III)(?:a|b)?\b(?=\s*(?:$|[,;:—–-]|(?:clinical\s+)?(?:trials?|stud(?:y|ies)|testing|development|programme|program)\b))/i,
    context: item(
      'study-phase-3',
      'Later-stage studies that usually include more people',
      'Phase 3 trials',
      'Phase 3 trials gather more information about a treatment’s safety and effectiveness, often in larger and more varied groups. “Phase 3” describes the stage of testing; it does not mean the result was positive or that the treatment was approved.',
    ),
  },
  {
    pattern:
      /(?:^|[\s(])phase\s+(?:4|IV)\b(?=\s*(?:$|[,;:—–-]|(?:clinical\s+)?(?:trials?|stud(?:y|ies)|testing|development|programme|program)\b))/i,
    context: item(
      'study-phase-4',
      'Research carried out after a treatment is approved',
      'Phase 4 study',
      'Phase 4 studies examine a treatment in wider or longer use after approval. They can find less common problems or answer questions left open earlier. Approval does not mean every later use or claim is already proven.',
    ),
  },
  {
    pattern: /\bfailed\s+two\s+phase\s+(?:3|III)\s+(?:clinical\s+)?trials\b/i,
    context: item(
      'evidence-failed-two-phase-3-trials',
      'Two later-stage studies did not show the planned patient benefit',
      'Failed two Phase 3 trials',
      'Phase 3 trials are later-stage studies that usually include more people. Here, “failed” describes the treatment result: the trials did not show the planned clinical benefit. It does not mean the studies were badly designed or carried out.',
    ),
  },
  {
    pattern:
      /\b(?:evidence|effects?|findings?|increas(?:e|ed)|improv(?:e|ed)|results?|rise|rose)\b[^.!?\n]{0,80}\breplicated across decades\b/i,
    context: item(
      'evidence-replicated-across-time',
      'Similar findings appeared again in studies using new groups of people',
      'Replicated across decades',
      'Replicated means that studies using new data found results consistent with earlier studies. It does not mean every study was independent or identical, and it does not guarantee that the finding applies to every person or every use.',
    ),
  },
  {
    pattern: /\bprior authori[sz]ation\b/i,
    context: item(
      'pricing-prior-authorisation',
      'An insurer’s approval required before it will cover a medicine',
      'Prior authorisation',
      'The prescriber may need to send clinical information to the insurer before the prescription is covered.',
    ),
  },
  {
    pattern: /\bformulary\b/i,
    context: item(
      'pricing-formulary',
      'An insurer’s list of covered medicines and coverage rules',
      'Formulary',
      'The list may place medicines in different cost levels or require certain steps before coverage.',
    ),
  },
  {
    pattern: /\bco[- ]?pay(?:ment)?\b/i,
    context: item(
      'pricing-copay',
      'The fixed amount a person pays for a covered prescription',
      'Copayment (copay)',
      'The amount depends on the insurance plan and can differ from the medicine’s listed price.',
    ),
  },
  {
    pattern: /\bdeductible\b/i,
    context: item(
      'pricing-deductible',
      'The amount a person pays before some insurance coverage begins',
      'Deductible',
      'Plan rules differ, so meeting a deductible does not always mean later prescriptions are free.',
    ),
  },
  {
    pattern: /\b(?:list price|wholesale acquisition cost|\bWAC\b)\b/i,
    context: item(
      'pricing-list-price',
      'A published price before insurance, rebates, or discounts',
      'List price',
      'This is not necessarily what a patient, insurer, pharmacy, or health system actually pays.',
    ),
  },
  {
    pattern: /\bSMILES\b/,
    context: item(
      'molecular-smiles',
      'A text code describing a molecule’s connected atoms',
      'SMILES',
      'This code is useful to chemistry software. It is not a dose, ingredient list, or statement about clinical effect.',
    ),
  },
  {
    pattern: /\bInChI(?:Key)?\b/,
    context: item(
      'molecular-inchi',
      'A standard text identifier for a chemical structure',
      'InChI',
      'This identifier helps distinguish chemical structures. It does not describe how the medicine works in people.',
    ),
  },
  {
    pattern: /\bsubcutaneous(?:ly)?\b/i,
    context: item(
      'route-subcutaneous',
      'Given as an injection under the skin',
      'Subcutaneous administration',
      'The medicine is placed in the tissue just beneath the skin rather than into a vein or muscle.',
    ),
  },
  {
    pattern: /\bintravenous(?:ly)?\b/i,
    context: item(
      'route-intravenous',
      'Given directly into a vein',
      'Intravenous administration',
      'The medicine enters the bloodstream through a vein, usually through an injection or infusion.',
    ),
  },
]

const COMMON_DETECTION: ReadonlyArray<{ pattern: RegExp; context: PublicMedicineContextItem }> = [
  {
    pattern:
      /(?:\d+(?:\.\d+)?\s*(?:%|per cent)|\bpercent(?:age)?\b|\b(?:about|roughly|nearly) half\b)/i,
    context: COMMON_PUBLIC_MEDICINE_CONTEXT.percentage,
  },
  {
    pattern: /\b(?:placebo(?:-controlled)?|dummy treatment|inactive treatment)\b/i,
    context: COMMON_PUBLIC_MEDICINE_CONTEXT.placebo,
  },
  { pattern: /\bNCT\d{8}\b/i, context: COMMON_PUBLIC_MEDICINE_CONTEXT.studyIdentifier },
  { pattern: /\b(?:RNAi|RNA)\b/i, context: COMMON_PUBLIC_MEDICINE_CONTEXT.rna },
]

function normalizedStoredCode(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_')
}

function readableStoredLabel(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return 'Recorded technical label'
  return trimmed
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/^./, (letter) => letter.toUpperCase())
}

function normalizedKeyPart(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return normalized || 'recorded'
}

export function endpointHierarchyContextItem(value: string): PublicMedicineContextItem {
  const normalized = normalizedStoredCode(value)
  if (normalized === 'PRIMARY' || normalized === 'PRIMARY_ENDPOINT') {
    return OTHER_DETECTED_CONTEXT.find(({ context }) => context.key === 'endpoint-primary')!.context
  }
  if (normalized === 'SECONDARY' || normalized === 'SECONDARY_ENDPOINT') {
    return OTHER_DETECTED_CONTEXT.find(({ context }) => context.key === 'endpoint-secondary')!
      .context
  }
  if (normalized === 'EXPLORATORY' || normalized === 'EXPLORATORY_ENDPOINT') {
    return OTHER_DETECTED_CONTEXT.find(({ context }) => context.key === 'endpoint-exploratory')!
      .context
  }
  const technicalTerm = readableStoredLabel(value)
  return item(
    `endpoint-${normalizedKeyPart(value)}`,
    'A recorded category showing where this result sits among the study’s planned outcomes',
    technicalTerm,
    'This is the study record’s own category. The source should explain whether it was planned as a main, additional, or early exploratory result.',
  )
}

export function outcomeTypeContextItem(value: string): PublicMedicineContextItem {
  const normalized = normalizedStoredCode(value)
  if (normalized === 'PATIENT_OUTCOME') {
    return item(
      'outcome-patient',
      'A result about how people felt, functioned, or survived',
      'Patient outcome',
      'This measures an effect that people experience directly rather than only a laboratory or body measurement.',
    )
  }
  if (normalized === 'SURROGATE' || normalized === 'SURROGATE_MARKER') {
    return OTHER_DETECTED_CONTEXT.find(({ context }) => context.key === 'outcome-surrogate')!
      .context
  }
  if (normalized === 'BIOMARKER') {
    return OTHER_DETECTED_CONTEXT.find(({ context }) => context.key === 'outcome-biomarker')!
      .context
  }
  if (normalized === 'SAFETY') {
    return item(
      'outcome-safety',
      'A result about harms or how well people tolerated treatment',
      'Safety outcome',
      'This records unwanted effects, health problems, or treatment stopping. It does not by itself establish what caused every reported problem.',
    )
  }
  if (normalized === 'OPERATIONAL') {
    return item(
      'outcome-operational',
      'A result about how the study ran',
      'Study-process outcome',
      'This describes recruitment, completion, adherence, or another part of running the study rather than a patient benefit.',
    )
  }
  const technicalTerm = readableStoredLabel(value)
  return item(
    `outcome-${normalizedKeyPart(value)}`,
    'Another recorded kind of study result',
    technicalTerm,
    'The study record uses this category, but it is not one of RNAWiki’s standard patient, body-measurement, safety, or study-process categories.',
  )
}

export function studyReviewContextItem(
  question: string,
  professionalTerm: string,
): PublicMedicineContextItem {
  const plainMeaning = question.trim() || 'A plain-language study-quality question'
  const technicalTerm = professionalTerm.trim() || 'Study-quality assessment'
  return item(
    `study-review-${normalizedKeyPart(technicalTerm)}`,
    plainMeaning,
    technicalTerm,
    `Reviewers use this question to judge whether the study design and the recorded result can support the answer shown on this page. Here they are asking: “${plainMeaning.replace(/[.?!]+$/, '')}?”`,
  )
}

export function dedupePublicMedicineContextItems(
  items: readonly (PublicMedicineContextItem | null | undefined)[],
  limit = Number.POSITIVE_INFINITY,
): PublicMedicineContextItem[] {
  const cappedLimit = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : items.length
  const seenKeys = new Set<string>()
  const seenTerms = new Set<string>()
  const result: PublicMedicineContextItem[] = []
  for (const context of items) {
    if (!context) continue
    const normalizedTerm = context.technicalTerm.toLocaleLowerCase('en').replace(/[^a-z0-9]+/g, '')
    if (seenKeys.has(context.key) || (normalizedTerm && seenTerms.has(normalizedTerm))) continue
    seenKeys.add(context.key)
    if (normalizedTerm) seenTerms.add(normalizedTerm)
    result.push(context)
    if (result.length >= cappedLimit) break
  }
  return result
}

/**
 * Classifies a number only from the sentence in which it appears. This prevents a comparison in
 * one result from changing the meaning of an unrelated safety rate elsewhere on the page.
 */
export function publicMedicinePercentageComparisonKind(
  text: string,
): 'percentage' | 'percentage-points' | null {
  const segments = text.split(/(?:\r?\n)+|(?<=[.!?])\s+/u)
  for (const segment of segments) {
    const hasInactiveComparison = /\b(?:placebo|dummy treatment|inactive treatment)\b/i.test(
      segment,
    )
    const hasComparisonLanguage =
      /\b(?:against|versus|vs\.?|compared with|relative to|than with)\b/i.test(segment)
    const hasChangeLanguage =
      /\b(?:change[sd]?|cut(?:ting)?|decreas(?:e|ed|ing)|differ(?:ed|ence)|drop(?:ped)?|fall(?:en|ing)?|fell|higher|increas(?:e|ed|ing)|lower(?:ed|ing)?|reduc(?:e|ed|ing|tion)|rose|risen)\b/i.test(
        segment,
      )
    if (!hasInactiveComparison || !hasComparisonLanguage || !hasChangeLanguage) continue

    if (
      /\b\d+(?:\.\d+)?(?:\s+(?:and|or)\s+\d+(?:\.\d+)?)?\s+percentage\s+points?\b/i.test(segment)
    ) {
      return 'percentage-points'
    }
    if (
      /(?:\d+(?:\.\d+)?\s*(?:%|per cent|percent(?:age)?)|\b(?:about|roughly|nearly) half\b)/i.test(
        segment,
      )
    ) {
      return 'percentage'
    }
  }

  if (
    /\bplacebo[- ](?:adjusted|corrected)\b[\s\S]{0,100}(?:\d+(?:\.\d+)?\s*(?:%|per cent)|\bpercent(?:age)?\b)/i.test(
      text,
    )
  ) {
    return 'percentage'
  }
  return null
}

export function publicMedicineStudyDayContextItems(
  text: string | null | undefined,
): PublicMedicineContextItem[] {
  if (!text?.trim()) return []
  const seenStudyDays = new Set<number>()

  return [...text.matchAll(/\b(?:day\s+(\d{1,5})|(\d{1,5})\s+days?)\b/giu)].flatMap((match) => {
    const day = Number(match[1] ?? match[2])
    if (!Number.isSafeInteger(day) || day < 1 || seenStudyDays.has(day)) return []
    seenStudyDays.add(day)
    const approximateMonths = Math.round(day / 30.44)
    const elapsed = `${day} ${day === 1 ? 'day' : 'days'}`
    return [
      item(
        `study-day-${day}`,
        `${elapsed} after the study started${approximateMonths > 1 ? ` — about ${approximateMonths} months` : ''}`,
        `Day ${day}`,
        `Studies often count time from the first study day. “Day ${day}” means this result was measured ${elapsed} later${approximateMonths > 1 ? `, which is about ${approximateMonths} months` : ''}.`,
      ),
    ]
  })
}

function detectedResultStudyDayContextItems(text: string): PublicMedicineContextItem[] {
  const contexts: PublicMedicineContextItem[] = []
  for (const match of text.matchAll(/\b(?:day\s+(\d{1,5})|(\d{1,5})\s+days?)\b/giu)) {
    const start = match.index
    const before = text.slice(Math.max(0, start - 90), start)
    const around = text.slice(Math.max(0, start - 90), start + match[0].length + 90)
    const isScheduledDose =
      /\b(?:administer(?:ed|ing)?|dos(?:e|ed|es|ing)|inject(?:ed|ion|ions)|received|schedule[ds]?)\b[^.!?]{0,45}(?:\bon\s*)$/iu.test(
        before,
      )
    const hasResultMeaning =
      /\b(?:change[sd]?|cut(?:ting)?|decreas(?:e|ed|ing)|differ(?:ed|ence)|drop(?:ped)?|fell|higher|increas(?:e|ed|ing)|lower(?:ed|ing)?|measur(?:e|ed|ement|ing)|result|reduc(?:e|ed|ing|tion))\b/iu.test(
        around,
      )
    if (isScheduledDose || !hasResultMeaning) continue
    contexts.push(...publicMedicineStudyDayContextItems(match[0]))
  }
  return dedupePublicMedicineContextItems(contexts)
}

/**
 * Explains a combined participant count only when the same sentence explicitly says that named
 * studies or trials total that number. A bare number followed by “patients” can instead be an event
 * count, subgroup, or result, so it is deliberately not classified here.
 */
function detectedCombinedStudyParticipantContextItems(text: string): PublicMedicineContextItem[] {
  const contexts: PublicMedicineContextItem[] = []
  const seenCounts = new Set<string>()

  for (const sentence of text.split(/(?:\r?\n)+|(?<=[.!?])\s+/u)) {
    for (const match of sentence.matchAll(
      /\b(?:trials?|studies?)\s+(?:total(?:l)?ing)\s+(\d{1,3}(?:,\d{3})+|\d+)\s+(patients|participants|people)\b/giu,
    )) {
      const count = match[1]
      const peopleWord = match[2]
      if (!count || !peopleWord) continue
      const normalizedCount = count.replaceAll(',', '')
      if (seenCounts.has(normalizedCount)) continue
      seenCounts.add(normalizedCount)
      const matchedPhrase = `${count} ${peopleWord}`
      contexts.push(
        item(
          `study-participant-total-${normalizedCount}`,
          'The combined number of people in the named studies',
          matchedPhrase,
          'Here, this is the total number of people included across the studies named in the sentence. It is not the number who benefited, were harmed, or completed the studies.',
        ),
      )
    }
  }

  return contexts
}

/** Conservatively find only terms for which RNAWiki has a reviewed plain-language definition. */
export function detectPublicMedicineContextItems(
  values: readonly (string | null | undefined)[],
): PublicMedicineContextItem[] {
  const text = values.filter((value): value is string => Boolean(value?.trim())).join('\n')
  if (!text) return []
  const studyDayItems = dedupePublicMedicineContextItems(
    text.split(/(?:\r?\n)+|(?<=[.!?])\s+/u).flatMap(detectedResultStudyDayContextItems),
  )
  const combinedStudyParticipantItems = dedupePublicMedicineContextItems(
    detectedCombinedStudyParticipantContextItems(text),
  )
  const percentageComparisonKind = publicMedicinePercentageComparisonKind(text)
  const percentageVersusPlacebo = percentageComparisonKind !== null
  const percentagePointsVersusPlacebo = percentageComparisonKind === 'percentage-points'
  const placeboAdjusted = /\bplacebo[- ]adjusted\b/i.test(text)
  const failedTwoPhase3Trials =
    /\bfailed\s+two\s+phase\s+(?:3|III)\s+(?:clinical\s+)?trials\b/i.test(text)
  const replicatedAcrossTime = /\breplicated across decades\b/i.test(text)
  const receptorAgonist = /\breceptor agonists?\b/i.test(text)
  const receptorAntagonist = /\breceptor antagonists?\b/i.test(text)
  const enzymeInhibitor = /\benzyme inhibitors?\b/i.test(text)
  const monoclonalAntibody = /\bmonoclonal antibod(?:y|ies)\b/i.test(text)
  const activeMetabolite = /\bactive metabolites?\b/i.test(text)
  const allCauseMortality = /\ball[- ]cause mortality\b/i.test(text)
  const muscleBiopsy = /\bmuscle biops(?:y|ies)\b/i.test(text)
  return dedupePublicMedicineContextItems(
    [
      ...(percentageVersusPlacebo
        ? [
            {
              pattern: /[\s\S]/,
              context: percentagePointsVersusPlacebo
                ? COMMON_PUBLIC_MEDICINE_CONTEXT.percentagePointsVersusPlacebo
                : COMMON_PUBLIC_MEDICINE_CONTEXT.percentageVersusPlacebo,
            },
          ]
        : []),
      ...COMMON_DETECTION.filter(
        ({ context }) =>
          !(percentageVersusPlacebo && context.key === 'percentage') &&
          !(placeboAdjusted && context.key === 'placebo'),
      ),
      ...OTHER_DETECTED_CONTEXT.filter(
        ({ context }) =>
          !(percentageVersusPlacebo && context.key === 'percentage-points') &&
          !(failedTwoPhase3Trials && context.key === 'study-phase-3') &&
          !(replicatedAcrossTime && context.key === 'evidence-replication') &&
          !(
            receptorAgonist &&
            (context.key === 'mechanism-receptor' || context.key === 'mechanism-agonist')
          ) &&
          !(
            receptorAntagonist &&
            (context.key === 'mechanism-receptor' || context.key === 'mechanism-antagonist')
          ) &&
          !(
            enzymeInhibitor &&
            (context.key === 'mechanism-enzyme' || context.key === 'mechanism-inhibitor')
          ) &&
          !(monoclonalAntibody && context.key === 'mechanism-antibody') &&
          !(activeMetabolite && context.key === 'mechanism-metabolite') &&
          !(allCauseMortality && context.key === 'outcome-mortality') &&
          !(muscleBiopsy && context.key === 'measurement-biopsy'),
      ),
      ...studyDayItems.map((context) => ({ pattern: /[\s\S]/, context })),
      ...combinedStudyParticipantItems.map((context) => ({ pattern: /[\s\S]/, context })),
    ]
      .filter(({ pattern }) => pattern.test(text))
      .map(({ context }) => context),
  )
}

/**
 * Collects stored string leaves for one dossier-wide terminology pass. This helper does not alter
 * or infer medicine content; it only lets the conservative detector see strings already selected
 * for the public view model.
 */
export function collectPublicMedicineText(value: unknown): string[] {
  const strings: string[] = []
  const visited = new WeakSet<object>()

  const visit = (candidate: unknown): void => {
    if (typeof candidate === 'string') {
      const normalized = candidate.trim()
      if (normalized) strings.push(normalized)
      return
    }
    if (!candidate || typeof candidate !== 'object') return
    if (visited.has(candidate)) return
    visited.add(candidate)
    if (Array.isArray(candidate)) {
      candidate.forEach(visit)
      return
    }
    Object.values(candidate as Record<string, unknown>).forEach(visit)
  }

  visit(value)
  return strings
}
