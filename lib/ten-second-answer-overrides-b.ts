import type { TenSecondAnswerCopy } from '@/lib/ten-second-answer-contract'

/**
 * Hand-reviewed first-read copy for the latter half of the legacy seed corpus.
 * Exact measurements, study names, and technical detail remain available in the dossier below it.
 */
export const TEN_SECOND_ANSWER_OVERRIDES_B: Readonly<Record<string, TenSecondAnswerCopy>> = {
  aflibercept: {
    usedFor: 'Leaking eye blood vessels caused by macular degeneration or diabetes.',
    whatStudiesFound:
      'In 2,419 people, injections every two months preserved vision as well as a monthly alternative injection.',
    biggestLimit: 'Catching extra growth signals has not itself been shown to improve vision.',
  },
  netarsudil: {
    usedFor: 'High pressure inside the eye, treated at the eye’s main drain.',
    whatStudiesFound:
      'Over one year, it lowered moderately raised eye pressure about as well as a commonly used older eye drop.',
    biggestLimit:
      'It costs far more than a cheap standard eye drop that appears to lower pressure more.',
    criticalSafety:
      'Eye redness affected about half. Small deposits in the clear front of the eye affected about one quarter.',
  },
  alendronate: {
    usedFor: 'Fragile bones that break more easily than they should.',
    whatStudiesFound:
      'Among women with a previous spinal fracture, new spinal fractures fell from 15 in 100 to 8 in 100.',
    biggestLimit:
      'Women without a previous spinal fracture did not have a clear reduction in fractures causing symptoms.',
  },
  risedronate: {
    usedFor: 'Fragile bones that break more easily than they should.',
    whatStudiesFound:
      'Hip fractures fell from about 3 in 100 to 2 in 100 among women aged 70 to 79 with weak bones.',
    biggestLimit:
      'No clear benefit appeared in women over 80 selected for fall risk rather than weak bones.',
  },
  'zoledronic-acid': {
    usedFor: 'Fragile bones and bone damage caused by some cancers.',
    whatStudiesFound:
      'A yearly infusion cut spine fractures from about 11 in 100 to 3 and also reduced hip fractures.',
    biggestLimit: 'The reported fall in deaths was mostly unexplained by the fractures prevented.',
    criticalSafety: 'Serious irregular heart rhythm was more common in the treatment group.',
  },
  raloxifene: {
    usedFor: 'Fragile bones after menopause and reducing the chance of one type of breast cancer.',
    whatStudiesFound:
      'New spinal fractures fell from about 10 in 100 to 7, but fractures elsewhere did not clearly fall.',
    biggestLimit:
      'It has never clearly reduced hip fractures or other fractures outside the spine.',
    criticalSafety:
      'It can cause dangerous blood clots and may raise the risk of dying from stroke.',
  },
  teriparatide: {
    usedFor: 'Severe bone thinning when the aim is to build new bone.',
    whatStudiesFound:
      'New spinal fractures fell from 14 in 100 to 5, and fractures elsewhere fell by half.',
    biggestLimit: 'Human follow-up found no bone cancers, but it was smaller than planned.',
  },
  romosozumab: {
    usedFor: 'Severe bone thinning in women at high risk of a fracture.',
    whatStudiesFound:
      'One year of treatment cut new spine fractures and prevented more hip fractures than alendronate.',
    biggestLimit: 'Evidence in men measured bone scans, not whether fewer bones broke.',
    criticalSafety:
      'Serious heart and circulation problems were more common than with alendronate.',
  },
  calcitriol: {
    usedFor:
      'Low calcium or overactive parathyroid glands caused by kidney or parathyroid disease.',
    whatStudiesFound:
      'Across 76 studies in kidney disease, it did not reduce deaths, bone pain or calcium deposits in blood vessels.',
    biggestLimit:
      'Lowering a blood-test number has not been shown to extend life, prevent fractures or improve symptoms.',
    criticalSafety:
      'High blood or urine calcium was common in studies of absent parathyroid hormone.',
  },
  cinacalcet: {
    usedFor: 'Overactive parathyroid glands or high blood calcium caused by a parathyroid tumour.',
    whatStudiesFound:
      'A large study did not clearly reduce major heart problems or fractures before researchers adjusted the analysis.',
    biggestLimit:
      'The apparent fracture benefit emerged only after researchers adjusted the original analysis.',
    criticalSafety: 'Calcium can fall dangerously low, causing seizures, heart problems or death.',
  },
  'calcium-carbonate': {
    usedFor: 'Heartburn, indigestion and increasing dietary calcium.',
    whatStudiesFound:
      'With vitamin D, it slightly increased hip bone density but did not clearly prevent hip fractures.',
    biggestLimit: 'A small bone-density change did not translate into fewer hip fractures.',
    criticalSafety: 'Kidney stones were slightly more common.',
  },
  'vitamin-d2': {
    usedFor: 'Vitamin D deficiency and rare disorders affecting calcium or phosphate.',
    whatStudiesFound:
      'Large-dose vitamin D2 did not prevent fractures. Injected yearly doses were linked to more hip fractures.',
    biggestLimit:
      'Vitamin D2 and D3 behave similarly with daily use but differently after a very large dose.',
  },
  'amlodipine-valsartan': {
    usedFor: 'High blood pressure that one medicine has not controlled.',
    whatStudiesFound:
      'The strongest combination lowered blood pressure more than either medicine alone and caused less ankle swelling than amlodipine alone.',
    biggestLimit:
      'No controlled study has shown that this combination prevents heart attacks or strokes.',
  },
  carvedilol: {
    usedFor: 'A weakened heart and the months after a heart attack.',
    whatStudiesFound:
      'Among people with severe heart failure, carvedilol reduced deaths by about one third.',
    biggestLimit:
      'Its metoprolol comparison used a shorter-acting form at a much lower daily dose than modern treatment.',
  },
  bisoprolol: {
    usedFor: 'High blood pressure and, in many countries, a weakened heart.',
    whatStudiesFound:
      'Among people with severe heart failure, deaths fell from about one in six to one in eight.',
    biggestLimit:
      'Its United States approval covers high blood pressure, although guidelines also recommend it for heart failure.',
  },
  nebivolol: {
    usedFor: 'High blood pressure.',
    whatStudiesFound:
      'In older people with heart failure, combined deaths or heart admissions fell slightly, but deaths alone did not.',
    biggestLimit:
      'Its claimed artery-relaxing action is not established in its official prescribing information.',
  },
  diltiazem: {
    usedFor: 'Chest pain, high blood pressure and some fast or irregular heart rhythms.',
    whatStudiesFound:
      'After a heart attack, benefit appeared only in people without lung congestion. Those with congestion had more heart problems.',
    biggestLimit:
      'For stable chest pain, it improves exercise time but has not been shown to prevent heart attacks.',
  },
  verapamil: {
    usedFor: 'Chest pain, high blood pressure and some fast or irregular heart rhythms.',
    whatStudiesFound:
      'A verapamil-based plan prevented death, heart attack and stroke about as well as a beta-blocker-based plan.',
    biggestLimit:
      'A small diabetes study preserved insulin production but did not clearly improve blood sugar control.',
  },
  'isosorbide-mononitrate': {
    usedFor: 'Preventing chest pain from narrowed heart arteries.',
    whatStudiesFound:
      'Continuous treatment lost its chest-pain benefit within a day, and raising the dose did not restore it.',
    biggestLimit: 'It did not clearly reduce deaths after a heart attack.',
  },
  ranolazine: {
    usedFor: 'Chest pain that continues despite usual medicines.',
    whatStudiesFound:
      'It added about 24 seconds of exercise and roughly half a chest-pain episode fewer each week.',
    biggestLimit: 'Large studies did not show that it prevents major heart problems.',
  },
  ivabradine: {
    usedFor: 'A weakened heart that keeps beating too fast.',
    whatStudiesFound:
      'It reduced heart-failure admissions in people with a weak, fast-beating heart, but did not reduce deaths.',
    biggestLimit:
      'Many study participants were not taking the highest beta-blocker dose they could tolerate.',
  },
  sacubitril: {
    usedFor: 'A weakened heart, to reduce deaths and hospital stays.',
    whatStudiesFound:
      'Compared with an older standard treatment, it reduced heart-related deaths or hospital stays and also reduced deaths overall.',
    biggestLimit: 'Participants entered only after showing they could tolerate both treatments.',
  },
  lidocaine: {
    usedFor: 'Numbing part of the body or treating a dangerously fast heart rhythm.',
    whatStudiesFound:
      'A cardiac-arrest study found no clear survival improvement over an inactive injection.',
    biggestLimit:
      'Its local-numbing use became established before modern comparisons of outcomes patients experience.',
  },
  bupivacaine: {
    usedFor: 'Numbing an area for hours during surgery, childbirth or a nerve block.',
    whatStudiesFound:
      'Its slow release from heart sodium channels explains both longer numbness and dangerous effects after accidental injection.',
    biggestLimit:
      'Evidence for slow-release bupivacaine injected into wounds was too inconsistent and small for a clear answer.',
    criticalSafety:
      'An accidental injection into a blood vessel can cause cardiac arrest that is hard to reverse.',
  },
  ropivacaine: {
    usedFor: 'Numbing an area for surgery or childbirth when a large dose may be needed.',
    whatStudiesFound:
      'Volunteers tolerated about twice as much active ropivacaine in their blood before warning symptoms. It also provided weaker pain relief.',
    biggestLimit:
      'Equal-milligram comparisons flatter ropivacaine because more is needed for the same numbness.',
  },
  propofol: {
    usedFor: 'Starting or maintaining sleep for surgery, or sedation on a ventilator.',
    whatStudiesFound:
      'In heart bypass surgery, deaths after propofol and inhaled anaesthesia were nearly identical.',
    biggestLimit:
      'Clinicians cannot directly measure its brain concentration, so dosing relies on models and observed response.',
  },
  sevoflurane: {
    usedFor: 'A breathed-in gas that starts and maintains sleep for surgery.',
    whatStudiesFound:
      'About one hour of exposure in infancy did not measurably change intelligence at age five.',
    biggestLimit:
      'Possible harm from exposures longer than three hours comes from animals. Its importance in children remains unclear.',
  },
  rocuronium: {
    usedFor: 'Paralysing muscles for a breathing tube or an operation.',
    whatStudiesFound:
      'Across 50 studies, rocuronium produced ideal breathing-tube conditions less often than succinylcholine.',
    biggestLimit:
      'Paralysis removes movement that might otherwise warn clinicians that anaesthesia is too light.',
    criticalSafety:
      'Severe allergic reactions under anaesthesia are often linked to muscle-paralysing medicines.',
  },
  succinylcholine: {
    usedFor: 'Briefly paralysing muscles so a breathing tube can be placed quickly.',
    whatStudiesFound:
      'Across 50 studies, it produced better conditions for inserting a breathing tube than rocuronium.',
    biggestLimit:
      'Studies measured the tube-insertion view, not the rare disasters that drive safety choices.',
    criticalSafety:
      'Children with hidden muscle disease can develop fatal high potassium and cardiac arrest.',
  },
  sugammadex: {
    usedFor: 'Quickly reversing muscle paralysis at the end of an operation.',
    whatStudiesFound:
      'It reverses deep rocuronium paralysis within minutes, but studies disagree on whether it prevents lung complications.',
    biggestLimit: 'The studies reporting lung outcomes did not assign treatments by chance.',
  },
  dexmedetomidine: {
    usedFor: 'Keeping someone calm and drowsy without usually stopping their breathing.',
    whatStudiesFound:
      'Deaths in ventilated patients matched usual sedation. Low heart rate and low blood pressure were more common.',
    biggestLimit:
      'It has not consistently prevented sudden confusion during serious illness compared with other sedatives.',
  },
  midazolam: {
    usedFor: 'Sedation and amnesia during procedures, or stopping an ongoing seizure.',
    whatStudiesFound:
      'Injected midazolam stopped ongoing seizures before hospital arrival more often than the usual intravenous emergency treatment.',
    biggestLimit:
      'Because it causes amnesia, patients may be unable to report distress experienced during sedation.',
  },
  etomidate: {
    usedFor: 'Starting sleep for surgery when low blood pressure is a concern.',
    whatStudiesFound:
      'During emergency breathing-tube placement, organ failure was similar to another anaesthetic. A temporary drop in stress hormones was much more common.',
    biggestLimit:
      'No sufficiently large study has shown whether this temporary drop in stress hormones harms patients.',
  },
  levocetirizine: {
    usedFor: 'Hay fever, year-round nasal allergies and long-running hives.',
    whatStudiesFound:
      'One hay-fever study found a small symptom improvement. Another similar study found none.',
    biggestLimit: 'It has not been shown to work better than older, cheaper cetirizine.',
  },
  fexofenadine: {
    usedFor: 'Hay fever and long-running hives.',
    whatStudiesFound:
      'It improved allergy symptoms without measurably reaching the brain receptors that cause drowsiness.',
    biggestLimit: 'Key studies excluded blocked nose, the symptom this drug class helps least.',
  },
  diphenhydramine: {
    usedFor: 'Allergic reactions, itching, motion sickness and short-term sleep problems.',
    whatStudiesFound:
      'In a driving simulator, it impaired driving more than alcohol near the legal limit.',
    biggestLimit:
      'Long-term dementia findings come from population associations and do not prove this drug caused dementia.',
    criticalSafety: 'Drowsiness can seriously impair driving.',
  },
  pseudoephedrine: {
    usedFor: 'A blocked nose and sinus pressure.',
    whatStudiesFound:
      'Repeated doses gave a small improvement in blocked-nose symptoms. Reviewers could not tell if patients would notice.',
    biggestLimit:
      'Fourteen of fifteen studies enrolled adults only, leaving effectiveness and safety in children uncertain.',
    criticalSafety: 'It slightly raised blood pressure and heart rate across studies.',
  },
  guaifenesin: {
    usedFor: 'A chesty cough with mucus that is hard to clear.',
    whatStudiesFound:
      'A larger study found no change in mucus amount, thickness or other measured properties after one week.',
    biggestLimit:
      'Adult cough studies were few, inconsistent and too poorly reported for a firm answer.',
  },
  benzonatate: {
    usedFor: 'Suppressing a cough.',
    whatStudiesFound:
      'Modern evidence for cough relief is weak, while accidental ingestion has killed young children within an hour.',
    biggestLimit: 'Its claimed numbing action in human airways has never been directly measured.',
    criticalSafety: 'Accidental ingestion can kill a child under ten within an hour.',
  },
  azelastine: {
    usedFor: 'Hay fever and a runny nose triggered by weather, smells or temperature.',
    whatStudiesFound:
      'The spray improved nasal symptoms, although a steroid spray worked better. Combining both worked best.',
    biggestLimit:
      'A small single-centre prevention finding based on 20 infections needs independent confirmation.',
    criticalSafety: 'About one in five tasted bitterness, and about one in nine became drowsy.',
  },
  olopatadine: {
    usedFor: 'Itchy, red or watering eyes caused by allergies.',
    whatStudiesFound:
      'The strongest eye drop reduced itching within minutes and still worked when tested a day after dosing.',
    biggestLimit:
      'Studies placed allergen directly into the eye in a clinic, which differs from living through pollen season.',
  },
  cromolyn: {
    usedFor:
      'Preventing asthma or allergy symptoms before they start, and treating mast-cell disease in the gut.',
    whatStudiesFound:
      'Across 23 studies in children, it did not clearly increase days without asthma symptoms.',
    biggestLimit: 'Its exact biological action remains uncertain after nearly sixty years.',
  },
  loratadine: {
    usedFor: 'Hay fever and itchy hives.',
    whatStudiesFound:
      'It improved allergy-related quality of life, but the measured improvement was about half that seen with cetirizine.',
    biggestLimit:
      'A large study combining it with another allergy medicine has never published its results.',
    criticalSafety: 'Taking more than directed can cause drowsiness.',
  },
  prednisolone: {
    usedFor: 'Inflammation and overactive immune responses across many conditions.',
    whatStudiesFound:
      'For sudden facial paralysis, full recovery by three months rose from about 64 in 100 to 83 in 100.',
    biggestLimit:
      'Common steroid dose-conversion charts were not validated against patient outcomes or longer-term harms.',
    criticalSafety:
      'In severe alcoholic liver inflammation, it did not clearly reduce deaths and doubled serious infections.',
  },
  dexamethasone: {
    usedFor:
      'Severe inflammation, swelling and some cancers, including severe COVID-19 needing oxygen.',
    whatStudiesFound:
      'Among ventilated COVID-19 patients, deaths fell from about 41 in 100 to 29 in 100.',
    biggestLimit: 'It did not help hospital patients who did not need oxygen.',
  },
  hydrocortisone: {
    usedFor: 'Replacing missing cortisol, or treating inflammation and allergy at higher doses.',
    whatStudiesFound:
      'Cortisol replacement transformed adrenal failure from almost uniformly fatal to treatable.',
    biggestLimit:
      'Modern Swedish follow-up still found more than twice the expected number of deaths.',
  },
  methylprednisolone: {
    usedFor:
      'Severe inflammation, immune flares and allergic reactions needing rapid high-dose treatment.',
    whatStudiesFound:
      'For a multiple-sclerosis flare, high doses by mouth and by drip sped recovery equally well.',
    biggestLimit: 'It has not been shown to reduce long-term disability from multiple sclerosis.',
    criticalSafety: 'High-dose treatment after serious head injury increased deaths.',
  },
  azathioprine: {
    usedFor: 'Preventing kidney-transplant rejection and treating severe rheumatoid arthritis.',
    whatStudiesFound:
      'It prevents transplant rejection, but did not clearly improve newly diagnosed Crohn’s disease over inactive treatment.',
    biggestLimit:
      'The diseases it treats also raise cancer risk, making the drug’s contribution difficult to separate.',
    criticalSafety: 'Long-term use carries warnings for lymphoma and other cancers.',
  },
  mycophenolate: {
    usedFor: 'Preventing rejection of a transplanted kidney.',
    whatStudiesFound:
      'It prevented rejection about as well as the older formulation but did not clearly improve upper-gut tolerability.',
    biggestLimit:
      'Most lupus evidence comes from the older formulation, which the label says is not interchangeable.',
  },
  tacrolimus: {
    usedFor: 'Preventing organ-transplant rejection and treating severe eczema.',
    whatStudiesFound:
      'After liver transplant, resistant rejection occurred about half as often as with cyclosporine, while one-year survival was the same.',
    biggestLimit:
      'The cancer warning for eczema ointment rests on uncertain human evidence and very small event numbers.',
    criticalSafety:
      'New diabetes or raised fasting blood sugar was more common than with cyclosporine.',
  },
  cyclosporine: {
    usedFor:
      'Preventing transplant rejection and treating severe immune disease or chronic dry eye.',
    whatStudiesFound:
      'It raised one-year kidney-transplant survival from about 64 in 100 to 80 in 100 and transformed transplantation.',
    biggestLimit:
      'Dry-eye studies improved dye and tear-strip tests more consistently than symptoms patients actually felt.',
  },
  sulfasalazine: {
    usedFor: 'Ulcerative colitis and rheumatoid arthritis.',
    whatStudiesFound:
      'One part of the medicine treated bowel inflammation. For arthritis, a cheap three-drug combination worked about as well as an expensive injected medicine.',
    biggestLimit: 'Performing within a preset margin does not prove the treatments are identical.',
  },
  leflunomide: {
    usedFor: 'Active rheumatoid arthritis.',
    whatStudiesFound:
      'About half improved, compared with one quarter given an inactive tablet. It worked about as well as methotrexate.',
    biggestLimit: 'It did not beat methotrexate and caused more abnormal liver tests.',
    criticalSafety: 'It can severely injure the liver and harm an unborn baby.',
  },
  clavulanate: {
    usedFor: 'Bacterial infections of the ear, sinuses, chest, skin or urinary tract.',
    whatStudiesFound:
      'In young children with ear infection, treatment failure fell from about 45 in 100 to 19 in 100.',
    biggestLimit:
      'The added ingredient may not help when the infecting bacterium lacks the enzyme it blocks.',
    criticalSafety:
      'Diarrhoea was common, and this combination is a leading cause of drug-related liver injury.',
  },
  cephalexin: {
    usedFor: 'Susceptible bacterial infections of the skin, throat, ear, bone or urinary tract.',
    whatStudiesFound:
      'Adding broader resistant-bacteria coverage did not clearly improve uncomplicated skin infection.',
    biggestLimit: 'The result was imprecise enough that a useful added benefit remained possible.',
  },
  ceftriaxone: {
    usedFor: 'Serious bacterial infections treated by injection.',
    whatStudiesFound: 'About nine in ten evaluated hospital patients with pneumonia were cured.',
    biggestLimit:
      'Rising laboratory resistance in gonorrhoea is measured more often than whether treatment still cures people.',
    criticalSafety:
      'One large inactive-comparison study found liver or gallbladder problems in 62 in 100 people.',
  },
  cefepime: {
    usedFor:
      'Serious hospital infections, including pneumonia and infection during very low white-cell counts.',
    whatStudiesFound:
      'Kidney harm matched another common hospital antibiotic. Patients spent more time confused or unconscious.',
    biggestLimit:
      'Earlier database studies could not separate kidney risk from differences between the patients receiving each drug.',
  },
  meropenem: {
    usedFor:
      'Severe hospital infections, including abdominal, skin, bloodstream and brain-lining infections.',
    whatStudiesFound:
      'For resistant bloodstream infection, deaths were about 4 in 100 versus 12 in 100 with piperacillin-tazobactam.',
    biggestLimit:
      'Comparative studies did not measure how using it contributes to antibiotic resistance.',
  },
  'piperacillin-tazobactam': {
    usedFor: 'Severe hospital infections of the abdomen, skin, lungs or pelvis.',
    whatStudiesFound:
      'Kidney harm matched cefepime, but it performed worse than meropenem for one resistant bloodstream infection.',
    biggestLimit:
      'Evidence conflicts on whether giving it slowly instead of in short infusions saves lives.',
  },
  vancomycin: {
    usedFor: 'Serious infections caused by bacteria resistant to common antibiotics.',
    whatStudiesFound:
      'For resistant hospital pneumonia, linezolid produced more cures and less kidney injury, while deaths were unchanged.',
    biggestLimit:
      'The blood-level target used worldwide came from looking back at treatment records, not a direct comparison.',
  },
  linezolid: {
    usedFor: 'Serious infections caused by bacteria resistant to common antibiotics.',
    whatStudiesFound:
      'For resistant hospital pneumonia, about 58 in 100 were cured, versus 47 with a standard antibiotic. Deaths were unchanged.',
    biggestLimit: 'A higher cure count did not establish that the drug saves more lives.',
    criticalSafety: 'Long treatment can damage nerves and suppress production of blood cells.',
  },
  daptomycin: {
    usedFor:
      'Serious skin or bloodstream infections caused by resistant bacteria, but not pneumonia.',
    whatStudiesFound:
      'It matched older treatment for bloodstream infection and caused less than half as much serious kidney trouble.',
    biggestLimit: 'It cannot treat pneumonia because substances in the lungs switch it off.',
  },
  nitrofurantoin: {
    usedFor: 'Bladder infections caused by susceptible bacteria.',
    whatStudiesFound:
      'Five days of treatment cleared symptoms in 70 in 100 women, versus 58 in 100 after single-dose fosfomycin.',
    biggestLimit:
      'Its handling is poorly studied in older people, children, pregnancy and liver disease.',
    criticalSafety:
      'Long use has been linked to permanent lung scarring, especially in older women.',
  },
  omeprazole: {
    usedFor: 'Heartburn, acid reflux and stomach or upper-bowel ulcers.',
    whatStudiesFound:
      'It healed severe acid damage in about 84 in 100 and reduced upper-gut bleeding in people taking two blood thinners.',
    biggestLimit:
      'Most feared long-term harms came from database studies and were not confirmed over three years.',
  },
  pantoprazole: {
    usedFor: 'Severe reflux and rare conditions causing extreme stomach-acid production.',
    whatStudiesFound:
      'Over three years, feared major harms did not increase. Gut infections rose slightly.',
    biggestLimit:
      'Starting it before an internal examination improved ulcer appearance but not deaths, repeat bleeding or surgery.',
  },
  esomeprazole: {
    usedFor: 'Reflux, heartburn and preventing ulcers caused by anti-inflammatory painkillers.',
    whatStudiesFound:
      'In people with a precancerous gullet condition, long-term high-dose treatment delayed death, cancer or severe cell changes.',
    biggestLimit:
      'The study claiming superiority over omeprazole compared twice as much esomeprazole.',
  },
  lansoprazole: {
    usedFor:
      'Reflux and ulcers, including ulcers caused by infection or anti-inflammatory painkillers.',
    whatStudiesFound:
      'For infected ulcers, adding two antibiotics raised bacterial clearance from 2 in 100 to 94 in 100.',
    biggestLimit:
      'Its long-term safety evidence is weaker than pantoprazole’s, and child studies found more respiratory infections.',
  },
  famotidine: {
    usedFor: 'Heartburn, acid indigestion and stomach or upper-bowel ulcers.',
    whatStudiesFound:
      'It healed acid damage in about half of patients, versus about five in six with stronger acid-blocking medicines.',
    biggestLimit:
      'Long-term reassurance comes from decades of use, not a large study designed to detect harms.',
  },
  sucralfate: {
    usedFor: 'Healing upper-bowel ulcers and helping prevent their return.',
    whatStudiesFound:
      'It healed acid damage in about 39 in 100, versus 28 without it and 84 with stronger acid suppression.',
    biggestLimit:
      'Many uses outside upper-bowel ulcers extend a laboratory theory to conditions where it was never approved.',
  },
  mesalamine: {
    usedFor: 'Inflammation and ulceration of the large bowel.',
    whatStudiesFound:
      'Within a year, bowel inflammation returned in about 37 in 100 taking it versus 55 in 100 without it.',
    biggestLimit: 'It has not shown the same benefit in Crohn’s disease.',
  },
  loperamide: {
    usedFor: 'Short-term diarrhoea, by slowing the bowel.',
    whatStudiesFound:
      'In children it shortened diarrhoea by less than one day, with serious harms concentrated under age three.',
    biggestLimit:
      'Only one medicine has been directly tested for the interaction that can let loperamide reach the brain.',
    criticalSafety: 'Very high doses can stop breathing, disturb heart rhythm and kill.',
  },
  'polyethylene-glycol-3350': {
    usedFor: 'Constipation, by keeping water in the bowel to soften stool.',
    whatStudiesFound:
      'Children had about two and a half more bowel movements each week, but the supporting evidence was small and weak.',
    biggestLimit:
      'The label covers seven days, while children often take it for months or years with little long-term study.',
  },
  'insulin-aspart': {
    usedFor: 'Fast-acting insulin taken around meals for diabetes.',
    whatStudiesFound:
      'Average long-term blood sugar improved only slightly. Severe episodes of dangerously low blood sugar did not clearly fall.',
    biggestLimit: 'Reviewers rated the comparative evidence as low quality.',
  },
  'insulin-detemir': {
    usedFor: 'Background insulin for diabetes throughout the day.',
    whatStudiesFound:
      'It controlled average blood sugar as well as older insulin, with fewer low-sugar episodes and less weight gain.',
    biggestLimit:
      'More than half needed twice-daily injections and substantially more insulin than once-daily users.',
  },
  'insulin-degludec': {
    usedFor: 'Once-daily background insulin for diabetes.',
    whatStudiesFound:
      'It matched glargine on average blood sugar and heart outcomes, while severe low-sugar episodes were 40% less frequent.',
    biggestLimit: 'It did not improve average blood sugar more than glargine.',
  },
  glipizide: {
    usedFor: 'Type 2 diabetes, by making the pancreas release more insulin.',
    whatStudiesFound:
      'Tighter treatment reduced eye and kidney damage, but did not clearly reduce heart attacks or deaths.',
    biggestLimit:
      'Its long-term blood-sugar action remains unclear in its official prescribing information.',
  },
  glyburide: {
    usedFor: 'Type 2 diabetes, by making the pancreas release more insulin.',
    whatStudiesFound:
      'It caused about half again as many low-sugar episodes as similar medicines and nearly twice as many as its closest class.',
    biggestLimit: 'No conclusive evidence shows that it prevents heart attacks or strokes.',
    criticalSafety: 'Low blood sugar is more common than with other medicines in its class.',
  },
  glimepiride: {
    usedFor: 'Type 2 diabetes, by making the pancreas release more insulin.',
    whatStudiesFound:
      'It matched a newer diabetes tablet on major heart outcomes, but caused low blood sugar much more often.',
    biggestLimit:
      'Matching another active medicine does not establish that either medicine carries no heart risk.',
  },
  pioglitazone: {
    usedFor: 'Type 2 diabetes, by helping the body respond to its own insulin.',
    whatStudiesFound:
      'After a stroke or mini-stroke, it reduced later strokes or heart attacks and halved new diabetes.',
    biggestLimit: 'Its large diabetes study missed its main planned measure of heart benefit.',
    criticalSafety:
      'It can cause fluid retention, weight gain, fractures and worsening heart failure.',
  },
  acarbose: {
    usedFor: 'Type 2 diabetes, by slowing starch digestion in the gut.',
    whatStudiesFound:
      'Progression to diabetes fell from 42 in 100 to 32 in 100, and from 16 to 13 in a larger study.',
    biggestLimit:
      'High dropout and a rebound after stopping complicate whether it prevents diabetes or only delays detection.',
  },
  repaglinide: {
    usedFor: 'Type 2 diabetes, using a fast tablet taken with meals.',
    whatStudiesFound:
      'It lowers average long-term blood sugar, but no study has shown whether it changes illness or death.',
    biggestLimit:
      'The available comparisons measured blood sugar rather than whether people stayed healthier or lived longer.',
    criticalSafety:
      'One common cholesterol medicine raises repaglinide levels eightfold. The label says never take them together.',
  },
  saxagliptin: {
    usedFor: 'Type 2 diabetes, by making the body’s meal-time hormone signal last longer.',
    whatStudiesFound:
      'It did not change heart attacks, strokes or heart-related deaths, and heart-failure admissions rose by 27%.',
    biggestLimit:
      'Kidney function strongly changes exposure because both the drug and its active breakdown product leave through the kidneys.',
    criticalSafety: 'Heart-failure admissions were more common.',
  },
  alogliptin: {
    usedFor: 'Type 2 diabetes, using a once-daily tablet.',
    whatStudiesFound:
      'Average long-term blood sugar improved slightly. Major heart problems did not.',
    biggestLimit:
      'The large study showed blood-sugar lowering, but no other clear clinical benefit.',
  },
  nateglinide: {
    usedFor: 'Type 2 diabetes, using a fast, short-acting meal-time tablet.',
    whatStudiesFound:
      'Average long-term blood sugar improved modestly. Measures of heart health and diabetes prevention did not.',
    biggestLimit:
      'Laboratory claims of safer insulin release did not translate into fewer low-sugar episodes or heart benefit.',
  },
  budesonide: {
    usedFor:
      'Preventing asthma, or treating inflammatory bowel disease and hay fever in other forms.',
    whatStudiesFound: 'Daily low-dose treatment cut severe asthma attacks by 44% over three years.',
    biggestLimit:
      'A home COVID-19 study shortened recovery but did not clearly reduce hospital admissions.',
    criticalSafety: 'Children in long follow-up were about 1.2 centimetres shorter as adults.',
  },
  formoterol: {
    usedFor:
      'Keeping airways relaxed in chronic lung disease, or asthma when paired with a steroid.',
    whatStudiesFound:
      'Adding it to a steroid inhaler reduced severe asthma attacks by about one quarter. Using both treatments worked best.',
    biggestLimit:
      'Using the combination only when needed performed worse on the study’s main measure than daily treatment.',
  },
  salmeterol: {
    usedFor: 'Keeping airway muscles relaxed for about twelve hours.',
    whatStudiesFound:
      'Used alone for asthma, it caused 13 asthma deaths versus 3 without it. Paired with a steroid, serious events did not rise.',
    biggestLimit: 'It has not been shown to extend life in chronic lung disease.',
    criticalSafety: 'For asthma, it must not be used without an inhaled steroid.',
  },
  tiotropium: {
    usedFor: 'Long-term airway relaxation with a once-daily inhaler.',
    whatStudiesFound:
      'Compared with salmeterol, it delayed the next lung flare-up by about six weeks and reduced flare-up risk by 17%.',
    biggestLimit: 'It did not slow the long-term loss of lung function.',
  },
  umeclidinium: {
    usedFor: 'Long-term treatment of chronic lung disease with a once-daily inhaler.',
    whatStudiesFound:
      'It modestly improved a breathing test for up to 24 weeks. Its own studies did not count flare-ups.',
    biggestLimit:
      'The flare-up claim comes from a three-medicine inhaler, so umeclidinium’s individual contribution is unclear.',
  },
  'vilanterol-trifenatate': {
    usedFor:
      'The airway-relaxing part of once-daily combination inhalers. It is not prescribed alone.',
    whatStudiesFound: 'Used alone, it did not reduce deaths or slow the loss of lung function.',
    biggestLimit:
      'The combination did not clearly improve survival, so its other reported findings need caution.',
  },
  ipratropium: {
    usedFor: 'Short-term airway relaxation, or a nasal spray for a runny nose.',
    whatStudiesFound:
      'Added during a child’s asthma attack, it cut hospital admission from 23 in 100 to 17 in 100.',
    biggestLimit:
      'Its strongest evidence is for acute childhood asthma, which the United States inhaler label does not cover.',
  },
  roflumilast: {
    usedFor:
      'Reducing flare-ups in severe chronic lung disease, or treating psoriasis and eczema as a cream.',
    whatStudiesFound:
      'It modestly reduced lung flare-ups and improved a breathing test by about half the change people usually notice.',
    biggestLimit: 'Two larger later studies did not meet their main planned measure.',
    criticalSafety: 'Weight loss and psychiatric problems were more common.',
  },
  theophylline: {
    usedFor: 'Opening airways with an oral medicine whose helpful and dangerous doses are close.',
    whatStudiesFound:
      'Adding a low dose to inhaled steroids did not reduce lung flare-ups in 1,578 people.',
    biggestLimit:
      'Its airway and anti-inflammatory actions remain uncertain in official prescribing information.',
  },
  mometasone: {
    usedFor: 'Asthma, hay fever or inflamed skin, in inhaled, nasal or skin forms.',
    whatStudiesFound:
      'A year of nasal spray did not slow growth or suppress adrenal function in 98 children.',
    biggestLimit:
      'Laboratory claims that it binds more strongly than other steroids have unknown importance for patients.',
  },
  fluticasone: {
    usedFor: 'Preventing asthma, treating hay fever or reducing skin inflammation.',
    whatStudiesFound:
      'Adding salmeterol reduced severe asthma attacks by 21% without increasing serious asthma events.',
    biggestLimit:
      'Laboratory claims that it binds especially strongly have unknown importance for patients.',
    criticalSafety: 'A national survey linked it to 30 of 33 adrenal crises, including one death.',
  },
  beclomethasone: {
    usedFor: 'Preventing asthma or treating hay fever with a nasal spray.',
    whatStudiesFound:
      'Over one year, children using the nasal spray grew 5.0 centimetres versus 5.9 without it.',
    biggestLimit:
      'Laboratory binding-strength claims have unknown importance for patient benefit or harm.',
  },
  tamsulosin: {
    usedFor: 'Urinary symptoms caused by an enlarged prostate.',
    whatStudiesFound:
      'Symptoms improved modestly, but over four years it did not prevent urine retention or surgery as well as dutasteride.',
    biggestLimit: 'Large database studies disagree on whether it is associated with dementia.',
  },
  dutasteride: {
    usedFor: 'Shrinking an enlarged prostate to improve urination and prevent blockage.',
    whatStudiesFound:
      'Over two years, it cut complete urine blockage by 57% and prostate surgery by 48%.',
    biggestLimit:
      'The cancer-prevention study counted scheduled tissue-sample findings, not deaths or whether detected cancers would cause illness.',
    criticalSafety: 'Later years of one study found more high-grade prostate cancers.',
  },
  solifenacin: {
    usedFor: 'Sudden urinary urgency, frequent urination and leakage from an overactive bladder.',
    whatStudiesFound:
      'The lower dose prevented less than one extra toilet trip and less than half an extra leak each day.',
    biggestLimit: 'Adding a second medicine offered little over the higher solifenacin dose alone.',
    criticalSafety:
      'Dry mouth affected about one in ten at the lower dose and one in four at the higher dose.',
  },
  mirabegron: {
    usedFor: 'Sudden urinary urgency, frequent urination and leakage from an overactive bladder.',
    whatStudiesFound:
      'It prevented roughly one quarter to one half of an extra leakage episode each day.',
    biggestLimit:
      'Claims about raising metabolism used four times the licensed dose in only twelve healthy men.',
  },
  oxybutynin: {
    usedFor: 'Sudden urinary urgency, frequent urination and leakage from an overactive bladder.',
    whatStudiesFound:
      'The once-daily form reduced weekly urge leaks, while causing about half as much dry mouth as the immediate-release form.',
    biggestLimit:
      'The dementia concern comes from long-term population associations, not proof that oxybutynin causes dementia.',
    criticalSafety: 'Immediate-release treatment caused dry mouth in about seven in ten people.',
  },
  tolterodine: {
    usedFor: 'Sudden urinary urgency, frequent urination and leakage from an overactive bladder.',
    whatStudiesFound:
      'Manufacturer-run studies found only about 0.12 to 0.15 fewer leakage episodes each day.',
    biggestLimit:
      'No direct study has tested cognition, despite population links between this medicine class and dementia.',
  },
  alfuzosin: {
    usedFor: 'Urinary symptoms caused by an enlarged prostate.',
    whatStudiesFound:
      'Symptoms improved by about two points more than with a dummy pill, but complete urine blockage did not fall.',
    biggestLimit:
      '“Urinary selective” describes dosing and formulation, not a drug that acts only in the bladder.',
  },
  silodosin: {
    usedFor: 'Urinary symptoms caused by an enlarged prostate.',
    whatStudiesFound:
      'Symptoms improved modestly, while more than one man in four stopped releasing semen during orgasm.',
    biggestLimit:
      'The overall study did not show that it helps ureter stones. The positive result came from a smaller subgroup.',
  },
  darifenacin: {
    usedFor: 'Sudden urinary urgency, frequent urination and leakage from an overactive bladder.',
    whatStudiesFound:
      'In older healthy volunteers, it did not impair memory over three weeks, while oxybutynin did.',
    biggestLimit:
      'Its claimed bladder selectivity over the memory-related brain target is only ninefold.',
  },
  trospium: {
    usedFor: 'Sudden urinary urgency, frequent urination and leakage from an overactive bladder.',
    whatStudiesFound:
      'Short studies reported improvement but did not publish the size of that improvement in their summaries.',
    biggestLimit:
      'The claim that it spares the brain rests partly on headache reports, not direct cognitive testing.',
    practicalNote: 'A fatty meal can reduce absorption by roughly two thirds.',
  },
  finasteride: {
    usedFor: 'Shrinking an enlarged prostate to improve urination and prevent blockage.',
    whatStudiesFound:
      'Over four years, complete urine blockage fell from 7 in 100 to 3, and surgery from 10 to 5.',
    biggestLimit:
      'Its symptom improvement was small even though blockage and surgery were nearly halved.',
  },
  tadalafil: {
    usedFor: 'Urinary symptoms from an enlarged prostate and erectile dysfunction.',
    whatStudiesFound:
      'Urinary symptoms and erectile function improved modestly. More than half given a dummy pill also had meaningful symptom improvement.',
    biggestLimit:
      'Researchers still do not know exactly why it relieves enlarged-prostate symptoms.',
  },
  quetiapine: {
    usedFor: 'Schizophrenia and the depressed or high phases of bipolar disorder.',
    whatStudiesFound:
      'For bipolar depression, about 58 in 100 had a major improvement versus 36 in 100 without it.',
    biggestLimit: 'Its widespread use as a sleep aid has never been approved in any country.',
  },
  olanzapine: {
    usedFor: 'Schizophrenia and high or mixed phases of bipolar disorder.',
    whatStudiesFound:
      'It ranked among the most effective antipsychotics but caused the most weight gain.',
    biggestLimit:
      'A combination designed to reduce weight gain made it smaller, but did not prevent it.',
  },
  risperidone: {
    usedFor:
      'Schizophrenia, bipolar mania and severe irritability or aggression in autistic children.',
    whatStudiesFound:
      'In autistic children, severe irritability fell by 57% versus 14% without it.',
    biggestLimit:
      'Its main active breakdown product is sold separately but has not proved more effective.',
    criticalSafety:
      'Hormone changes were linked to a fourfold rise in breast enlargement among young males.',
  },
  aripiprazole: {
    usedFor:
      'Schizophrenia, bipolar disorder, some resistant depression, autism-related irritability and Tourette disorder.',
    whatStudiesFound:
      'It caused less weight gain and fewer hormone effects than many antipsychotics, but ranked ninth of fifteen for symptom improvement.',
    biggestLimit:
      'When added for depression, people stopped nearly four times as often because of side effects.',
    criticalSafety: 'It can trigger uncontrollable urges to gamble, shop, eat or have sex.',
  },
  lurasidone: {
    usedFor: 'Schizophrenia and bipolar depression.',
    whatStudiesFound:
      'It had the most favourable heart-rhythm signal but among the smallest symptom improvements in a fifteen-drug comparison.',
    biggestLimit:
      'Lower weight and blood-sugar effects have not been shown to prevent heart attacks or extend life.',
  },
  ziprasidone: {
    usedFor: 'Schizophrenia and mania caused by bipolar disorder.',
    whatStudiesFound:
      'It caused little weight gain but less symptom improvement, and deaths matched olanzapine over one year.',
    biggestLimit:
      'The large comparison was not designed to detect the rare dangerous rhythm behind its heart warning.',
  },
  paliperidone: {
    usedFor: 'Schizophrenia and schizoaffective disorder.',
    whatStudiesFound:
      'It performed almost identically to long-acting risperidone, while causing the largest hormone increase among fifteen antipsychotics.',
    biggestLimit:
      'Longer-acting forms were compared with shorter forms of the same drug, not with alternatives.',
  },
  haloperidol: {
    usedFor: 'Psychosis and the tics of Tourette disorder.',
    whatStudiesFound:
      'It ranked seventh of fifteen for symptom relief and caused the most movement problems. It did not improve severe confusion in intensive care.',
    biggestLimit: 'Some child uses in its label reflect outdated language and evidence standards.',
  },
  'lithium-carbonate': {
    usedFor: 'Treating mania and preventing further episodes of bipolar disorder.',
    whatStudiesFound:
      'Over two years, lithium prevented relapse better than valproate. A separate study found no reduction in suicide-related events versus a dummy pill.',
    biggestLimit: 'Much of its “gold standard” claim rests on one open two-year comparison.',
    criticalSafety: 'The toxic blood level begins only slightly above the treatment range.',
  },
  cariprazine: {
    usedFor:
      'Schizophrenia, bipolar disorder and depression not helped enough by an antidepressant.',
    whatStudiesFound:
      'It modestly improved persistent low-motivation symptoms over risperidone. Only two of five tested depression doses succeeded.',
    biggestLimit:
      'Its claimed advantage at specific brain targets has not established how the medicine works in patients.',
  },
  brexpiprazole: {
    usedFor: 'Schizophrenia, resistant depression and agitation in Alzheimer disease.',
    whatStudiesFound:
      'Agitation improved only about four to five points beyond a large improvement without the drug. Another study failed.',
    biggestLimit:
      'It has never been directly compared with aripiprazole, the medicine it was designed to improve.',
    criticalSafety: 'Like similar medicines, it can increase deaths in older people with dementia.',
  },
  chlorpromazine: {
    usedFor:
      'Psychosis, schizophrenia, severe nausea, persistent hiccups and several older approved uses.',
    whatStudiesFound:
      'Across 55 studies it improved psychosis symptoms, but reviewers rated the evidence very low quality.',
    biggestLimit:
      'Its dopamine-blocking action was discovered after its benefit and does not prove dopamine causes psychosis.',
  },
  amisulpride: {
    usedFor: 'Post-operation nausea in America and schizophrenia in many other countries.',
    whatStudiesFound:
      'It ranked first among 32 antipsychotics for reducing hallucinations and delusions, and was among the least sedating.',
    biggestLimit:
      'European schizophrenia studies and American single-dose nausea studies cannot answer questions about each other’s use.',
  },
  levetiracetam: {
    usedFor: 'Several forms of epilepsy.',
    whatStudiesFound:
      'Added to existing treatment, about 33 to 40 in 100 halved their seizures versus 11 in 100 without it.',
    biggestLimit:
      'As a first treatment, it did not match older, cheaper medicines in two large studies.',
  },
  lamotrigine: {
    usedFor: 'Several forms of epilepsy and long-term prevention of bipolar episodes.',
    whatStudiesFound:
      'People with focal epilepsy stayed on lamotrigine longer than several alternatives, although carbamazepine reached seizure freedom slightly sooner.',
    biggestLimit: 'Staying on treatment longer does not necessarily mean seizures stopped sooner.',
    criticalSafety: 'A serious rash occurs in roughly 3 adults and 8 children per 1,000.',
  },
  valproate: {
    usedFor: 'Several forms of epilepsy, bipolar mania and migraine prevention.',
    whatStudiesFound:
      'It outperformed lamotrigine and topiramate for generalised epilepsy and remains unmatched by newer medicines.',
    biggestLimit: 'None of its several proposed biological actions has been established.',
    criticalSafety:
      'Pregnancy exposure was linked to major birth defects and lower childhood intelligence.',
  },
  carbamazepine: {
    usedFor: 'Epilepsy, facial nerve pain and bipolar mania.',
    whatStudiesFound:
      'It matched or beat older seizure medicines, but people stopped it sooner than lamotrigine.',
    biggestLimit: 'Its official label still says its biological action remains unknown.',
    criticalSafety:
      'Genetic screening prevented a rare, life-threatening skin reaction in a high-risk Taiwanese population.',
  },
  oxcarbazepine: {
    usedFor: 'Seizures that start in one part of the brain.',
    whatStudiesFound:
      'The highest dose halved seizure frequency, but more than 65 in 100 stopped taking that dose.',
    biggestLimit:
      'Key stand-alone studies compared a high dose with a low dose, not with another treatment.',
  },
  topiramate: {
    usedFor: 'Several forms of epilepsy and preventing migraine attacks.',
    whatStudiesFound:
      'At the recommended dose, it prevented about one extra migraine each month but underperformed older seizure medicines.',
    biggestLimit:
      'Its stand-alone seizure study compared a high dose with a low dose, not an alternative medicine.',
    criticalSafety:
      'Thinking-related side effects affected more than half at the seizure-study doses.',
  },
  zonisamide: {
    usedFor: 'Seizures that start in one part of the brain, added to other medicines.',
    whatStudiesFound:
      'Median seizure frequency fell about 41% versus 9% without it, but one analysis did not match lamotrigine.',
    biggestLimit:
      'Some apparent benefit grew because untreated groups worsened, and one people-based comparison was inconclusive.',
    criticalSafety: 'Rare severe skin reactions and kidney stones have been reported.',
  },
  lacosamide: {
    usedFor: 'Focal epilepsy and added treatment for generalised convulsive seizures.',
    whatStudiesFound:
      'Six-month seizure freedom was 90 in 100 versus 91 with carbamazepine. It also delayed another generalised seizure.',
    biggestLimit:
      'Its original stand-alone approval relied partly on earlier patients given a deliberately ineffective comparator dose.',
  },
  phenytoin: {
    usedFor: 'Several forms of epilepsy and prolonged seizures in hospital.',
    whatStudiesFound:
      'It tied with carbamazepine for the best overall result among four older seizure medicines.',
    biggestLimit:
      'The usual blood test can look normal while active drug is toxic in kidney, liver or low-protein conditions.',
    criticalSafety: 'A dose increase of 10% can sometimes push the blood level into toxicity.',
  },
  clobazam: {
    usedFor: 'Drop attacks and other seizures in Lennox-Gastaut syndrome.',
    whatStudiesFound: 'At the highest dose, weekly drop attacks fell 68% versus 12% without it.',
    biggestLimit:
      'At the lowest dose, the share of people who halved their seizures was not clearly different.',
    criticalSafety:
      'Combining it with opioids can suppress breathing. Dependence and misuse are also possible.',
  },
  brivaracetam: {
    usedFor: 'Seizures that start in one part of the brain.',
    whatStudiesFound:
      'The main dose reduced seizures by about 25% beyond inactive treatment, but adding it to levetiracetam brought no extra benefit.',
    biggestLimit:
      'It has not been directly compared with another medicine or studied as first treatment.',
  },
  perampanel: {
    usedFor: 'Focal epilepsy and added treatment for generalised convulsive seizures.',
    whatStudiesFound: 'Generalised convulsive seizures fell by a median 76% versus 38% without it.',
    biggestLimit:
      'Some favourable analyses excluded Latin American participants after unusually large improvements without treatment.',
    criticalSafety: 'It can cause severe aggression, hostility and thoughts of killing someone.',
  },
  ethosuximide: {
    usedFor: 'The brief blank spells of childhood absence epilepsy.',
    whatStudiesFound:
      'It controlled absence seizures about as well as valproate and better than lamotrigine, with fewer attention problems than valproate.',
    biggestLimit:
      'Its first-choice position comes from better attention, not better seizure control than valproate.',
  },
  'aminocaproic-acid': {
    usedFor: 'Bleeding caused by the body dissolving clots too quickly.',
    whatStudiesFound:
      'It reduced blood-transfusion needs by about 19% and cut repeat bleeding into the eye by roughly two thirds.',
    biggestLimit:
      'No adequately sized study has shown that it saves lives or preserves final vision.',
  },
  'tranexamic-acid': {
    usedFor: 'Heavy bleeding after injury, childbirth, surgery or during periods.',
    whatStudiesFound: 'Given after major trauma, deaths fell from 16 in 100 to about 15 in 100.',
    biggestLimit:
      'Other heavily promoted uses missed their main measure or relied on favourable smaller subgroups.',
  },
  desmopressin: {
    usedFor:
      'Excessive urination from missing hormone, or bleeding in some mild inherited disorders.',
    whatStudiesFound:
      'It reliably concentrates urine and raises a missing clotting protein three- to fourfold within two hours.',
    biggestLimit:
      'For inherited bleeding disorders, studies measured clotting protein rather than whether people bled less.',
    criticalSafety:
      'Dangerously low blood sodium has led several nasal products to leave the market.',
  },
  'vitamin-k': {
    usedFor: 'Preventing or treating bleeding caused by insufficient vitamin K or warfarin.',
    whatStudiesFound:
      'Countries giving newborn injections report about one fiftieth as much late vitamin-K bleeding as countries that do not.',
    biggestLimit:
      'For active emergency bleeding, it takes hours to restart clotting-protein production.',
    criticalSafety: 'Injection into a vein can rarely cause a fatal allergic-like reaction.',
  },
  protamine: {
    usedFor: 'Reversing heparin after an operation or an excessive dose.',
    whatStudiesFound:
      'After a heart-valve procedure, successful bleeding control rose from about 92 in 100 to 98 in 100.',
    biggestLimit:
      'Its commonest use after heart-lung bypass has never had an inactive-treatment comparison.',
    criticalSafety: 'Too much protamine can increase bleeding instead of stopping it.',
  },
  idarucizumab: {
    usedFor: 'Emergency reversal of dabigatran during serious bleeding or urgent surgery.',
    whatStudiesFound:
      'It completely reversed the blood-test effect in the typical patient within four hours.',
    biggestLimit:
      'Everyone received the medicine, so the study cannot show what would have happened without it.',
  },
  'andexanet-alfa': {
    usedFor: 'Emergency reversal of apixaban or rivaroxaban during uncontrolled bleeding.',
    whatStudiesFound:
      'It controlled brain bleeding more often than usual care, but did not improve disability or death at 30 days.',
    biggestLimit: 'Better bleeding control did not translate into better recovery or survival.',
    criticalSafety: 'Blood clots doubled and strokes were about four times as common.',
  },
  'recombinant-factor-viia': {
    usedFor:
      'Stopping bleeding in haemophilia when replacement clotting factor is destroyed by the immune system.',
    whatStudiesFound:
      'It helps that haemophilia bleeding, but in brain haemorrhage it reduced scan growth without improving survival or function.',
    biggestLimit:
      'Three brain-bleed studies improved scans, but none improved outcomes patients experienced.',
  },
  'prothrombin-complex-concentrate': {
    usedFor:
      'Rapidly replacing clotting proteins during severe warfarin bleeding or urgent surgery.',
    whatStudiesFound:
      'It corrected the blood test about six times as often as plasma and controlled bleeding about as well.',
    biggestLimit: 'No study has shown that its faster correction saves more lives than plasma.',
  },
  'fibrinogen-human': {
    usedFor: 'Replacing the protein that forms clots in people born without enough.',
    whatStudiesFound:
      'During heart surgery it worked about as well as a donated-blood clotting product. Other studies found no survival benefit and sometimes more donated blood was needed.',
    biggestLimit:
      'Approval relied on 36 people and a laboratory test, not whether bleeding stopped faster.',
  },
  eltrombopag: {
    usedFor: 'Raising dangerously low levels of the blood cells that help form clots.',
    whatStudiesFound:
      'About four in five reached a safer clot-forming-cell level versus one in four without it, with fewer serious bleeds.',
    biggestLimit:
      'In liver disease, a higher platelet count did not reduce bleeding and caused vein clots.',
    criticalSafety: 'Other disease studies found more deaths and faster progression to leukaemia.',
  },
  romiplostim: {
    usedFor:
      'Raising dangerously low levels of blood cells that help form clots, or improving survival after severe radiation exposure.',
    whatStudiesFound:
      'Weekly injections kept these clot-forming blood cells at the target level and reduced the need to remove the spleen.',
    biggestLimit:
      'The radiation-survival use rests entirely on 80 irradiated monkeys because a human study cannot be done.',
  },
  emicizumab: {
    usedFor: 'Preventing joint and muscle bleeding in haemophilia A.',
    whatStudiesFound:
      'Yearly treated bleeds fell from about 23 to 3 in people whose immune system blocked usual replacement.',
    biggestLimit:
      'Studies lasted about a year, while disabling joint damage accumulates over decades.',
    criticalSafety:
      'Combining it with one older bypass medicine can cause dangerous widespread clotting.',
  },
  'caplacizumab-yhdp': {
    usedFor:
      'Stopping dangerous small-vessel clots in acquired thrombotic thrombocytopenic purpura.',
    whatStudiesFound:
      'Disease-related death, return of disease or clots fell from 49 in 100 to 12 in 100.',
    biggestLimit: 'Its main planned measure improved by only about four and a half hours.',
    criticalSafety: 'Skin and mucosal bleeding rose from 48 in 100 to 65 in 100.',
  },
  sofosbuvir: {
    usedFor: 'Long-standing hepatitis C infection.',
    whatStudiesFound: 'Modern combinations cured about 8 to 9 in 10 treated people.',
    biggestLimit:
      'Studies measured virus clearance, not deaths, liver cancer or transplants over long follow-up.',
  },
  ledipasvir: {
    usedFor: 'Long-standing hepatitis C infection, mainly its most common genetic form.',
    whatStudiesFound:
      'Combined with sofosbuvir, it cured about 99 in 100 previously untreated people. Eight weeks often worked as well as twelve.',
    biggestLimit:
      'It has little useful activity against two other common genetic forms and was quickly displaced by broader treatment.',
  },
  velpatasvir: {
    usedFor: 'Long-standing hepatitis C infection across all six genetic forms.',
    whatStudiesFound:
      'Combined with sofosbuvir, it cured 622 of 624 people and outperformed an older combination in a harder-to-treat form.',
    biggestLimit:
      'One cirrhosis subgroup with a resistance change had a 40% treatment failure rate.',
  },
  glecaprevir: {
    usedFor: 'Long-standing hepatitis C infection across all six genetic forms.',
    whatStudiesFound:
      'Paired with pibrentasvir, eight weeks cured about 99 in 100 people with the most common form.',
    biggestLimit: 'The shortened course for one harder-to-treat form was not assigned by chance.',
    criticalSafety: 'It must not be used in moderate or severe liver failure.',
  },
  pibrentasvir: {
    usedFor: 'Long-standing hepatitis C infection across all six genetic forms.',
    whatStudiesFound:
      'In a fixed combination, it cured about 98 to 100 in 100 people across major studied groups.',
    biggestLimit:
      'It was never tested alone in an approval study, so its individual contribution is inferred.',
  },
  ribavirin: {
    usedFor: 'An older antiviral now used mainly as an add-on for hepatitis C.',
    whatStudiesFound:
      'Adding it roughly tripled hepatitis C cure with older interferon treatment and improved later interferon combinations.',
    biggestLimit: 'Five biological explanations exist, and none has been established.',
    criticalSafety: 'It can cause severe anaemia, heart attacks and birth defects.',
  },
  entecavir: {
    usedFor: 'Long-standing hepatitis B infection.',
    whatStudiesFound:
      'It suppressed virus and reduced liver inflammation more than lamivudine, with very little resistance over five years.',
    biggestLimit:
      'In people with failing livers, better virus clearance did not produce better liver-function scores.',
  },
  'peginterferon-alfa-2a': {
    usedFor: 'Long-standing hepatitis B or C, by stimulating the immune system.',
    whatStudiesFound:
      'Weekly long-acting injections improved hepatitis cure or immune response compared with older treatments.',
    biggestLimit:
      'Studies measured virus and liver tests, not deaths, liver cancer or transplants.',
    criticalSafety:
      'It can cause fatal or life-threatening psychiatric, immune, circulation and infection problems.',
  },
  elbasvir: {
    usedFor: 'Long-standing hepatitis C infection in two genetic forms.',
    whatStudiesFound:
      'Combined with grazoprevir, it cured about 95 in 100 untreated people and 99 in 100 with severe kidney disease.',
    biggestLimit:
      'Natural resistance changes cut cure sharply, so a resistance test is needed before treatment.',
  },
  grazoprevir: {
    usedFor: 'Long-standing hepatitis C infection in two genetic forms.',
    whatStudiesFound:
      'Combined with elbasvir, it cured about 95 to 99 in 100 across major studied groups.',
    biggestLimit:
      'Laboratory potency numbers were far stronger than the amount needed inside living cells.',
    criticalSafety:
      'Severe liver disease can raise exposure twelvefold, so use there is forbidden.',
  },
  daclatasvir: {
    usedFor: 'Long-standing hepatitis C infection in two genetic forms.',
    whatStudiesFound:
      'Combined with sofosbuvir, it cured 96 in 100 without cirrhosis but only 63 in 100 with cirrhosis.',
    biggestLimit:
      'It was never tested alone for approval, so its individual share of the cure is inferred.',
  },
  simeprevir: {
    usedFor: 'A discontinued United States treatment for two genetic forms of hepatitis C.',
    whatStudiesFound: 'Adding it to older treatment raised cure from about 50 in 100 to 80 in 100.',
    biggestLimit:
      'A common natural virus change weakened it substantially and helped make the medicine obsolete.',
  },
  'adefovir-dipivoxil': {
    usedFor: 'Long-standing hepatitis B infection.',
    whatStudiesFound:
      'Liver inflammation improved in 53 in 100 versus 25 without treatment, but only 21 in 100 fully suppressed the virus.',
    biggestLimit:
      'Studies examined liver samples after one year, not deaths, liver cancer or transplants.',
    criticalSafety: 'Kidney injury was common at the higher dose previously tested for HIV.',
  },
  telbivudine: {
    usedFor: 'A discontinued United States treatment for long-standing hepatitis B.',
    whatStudiesFound:
      'It outperformed lamivudine after one year, but one quarter developed resistance within two years.',
    biggestLimit:
      'It was compared with an older weak treatment, never with the stronger medicine already available.',
    criticalSafety: 'A combination study stopped after nerve damage appeared in 7 of 50 people.',
  },
  dolutegravir: {
    usedFor: 'HIV treatment as part of a combination.',
    whatStudiesFound:
      'It suppressed HIV in 88 in 100 previously untreated people versus 81 with the earlier standard, without new resistance.',
    biggestLimit:
      'People gain more weight, but studies have not tested whether this raises diabetes, heart attack or stroke.',
  },
  emtricitabine: {
    usedFor: 'HIV treatment as part of a combination.',
    whatStudiesFound:
      'It controlled HIV in 76 in 100 people, compared with 54 using an earlier treatment. Fewer stopped because of side effects.',
    biggestLimit:
      'Prevention worked where people took the tablets. Inconsistent use leaves other explanations difficult to exclude.',
  },
  'tenofovir-alafenamide': {
    usedFor: 'HIV treatment, HIV prevention and long-standing hepatitis B.',
    whatStudiesFound:
      'A much smaller dose matched the older form on virus control and improved bone-density and kidney-test results.',
    biggestLimit:
      'No large study has shown whether the better tests prevent fractures or kidney failure.',
  },
  'tenofovir-disoproxil': {
    usedFor: 'HIV treatment, HIV prevention and long-standing hepatitis B.',
    whatStudiesFound:
      'It improved HIV control over an older combination, reversed cirrhosis in many with hepatitis B and prevented HIV when taken.',
    biggestLimit:
      'In prevention studies, benefit disappeared where blood tests showed that many participants did not take it.',
    criticalSafety:
      'Kidney-tubule injury can occur, although average kidney change was small in healthy prevention users.',
  },
  efavirenz: {
    usedFor: 'HIV treatment as part of a combination.',
    whatStudiesFound:
      'It suppressed HIV better than older treatment, and two thirds of the registered dose later worked as well with fewer side effects.',
    biggestLimit:
      'Strong study and ordinary-care evidence disagree on whether it doubles suicidal thoughts or acts.',
  },
  rilpivirine: {
    usedFor: 'HIV treatment for lower starting virus levels, or long-acting maintenance treatment.',
    whatStudiesFound:
      'It matched efavirenz on overall virus control, with fewer side effects but about twice as many treatment failures.',
    biggestLimit:
      'Long-acting injections can leave months of low drug after failure, allowing resistance and delaying diagnosis.',
  },
  darunavir: {
    usedFor: 'HIV treatment as part of a combination, especially after other medicines fail.',
    whatStudiesFound:
      'It suppressed HIV in 61 in 100 heavily treated people versus 15 with investigator-chosen alternatives.',
    biggestLimit:
      'Longer exposure was linked to more heart attacks and strokes in a large population study, which cannot prove cause.',
  },
  raltegravir: {
    usedFor: 'HIV treatment as part of a combination.',
    whatStudiesFound:
      'In people resistant to three medicine classes, adding it suppressed HIV in 62 in 100 versus 33 without it.',
    biggestLimit:
      'It needs twice-daily dosing in its original form and resistance develops more easily than with newer medicines in its class.',
  },
  abacavir: {
    usedFor: 'HIV treatment as part of a combination.',
    whatStudiesFound:
      'A genetic test reduced confirmed severe allergic reactions from 2.7 in 100 to none.',
    biggestLimit:
      'Evidence has disagreed for eighteen years on whether it raises heart attack risk.',
    practicalNote:
      'The genetic test works across ancestry groups, although the main study was mostly white.',
  },
  lamivudine: {
    usedFor: 'HIV treatment and long-standing hepatitis B.',
    whatStudiesFound:
      'Added to older HIV treatment, it cut progression to AIDS or death from 20 in 100 to 9 and improved survival.',
    biggestLimit: 'The two-drug comparison excluded people with the highest starting virus levels.',
    criticalSafety: 'Hepatitis B resistance reached 65 in 100 after five years.',
  },
  cabotegravir: {
    usedFor: 'HIV prevention and long-acting maintenance treatment.',
    whatStudiesFound:
      'Injections every eight weeks prevented more HIV infections than daily prevention tablets in both men and women.',
    biggestLimit:
      'The comparison partly measured reliable injections against tablets that many participants did not take consistently.',
    criticalSafety: 'Breakthrough infections sometimes brought resistance and delayed diagnosis.',
  },
  doravirine: {
    usedFor: 'HIV treatment as part of a combination.',
    whatStudiesFound:
      'It matched two older treatments on virus control while causing much less dizziness and fewer sleep problems than efavirenz.',
    biggestLimit:
      'It has never been directly compared with the newer medicines clinicians now usually choose.',
  },
  bictegravir: {
    usedFor: 'HIV treatment in a single tablet containing three medicines.',
    whatStudiesFound:
      'About 92 in 100 previously untreated adults suppressed HIV, with no treatment resistance detected.',
    biggestLimit:
      'Every comparison tested whether it was no worse than another treatment. None showed it was better.',
  },
  'dabigatran-etexilate': {
    usedFor:
      'Preventing stroke from an irregular heartbeat and treating clots in the legs or lungs.',
    whatStudiesFound:
      'Yearly strokes or travelling clots fell from 1.69 to 1.11 per 100 people compared with the standard treatment. Major bleeding was unchanged.',
    biggestLimit:
      'The main study was corrected after publication when previously unreported events were found.',
  },
  edoxaban: {
    usedFor:
      'Preventing stroke from an irregular heartbeat and treating clots in the legs or lungs.',
    whatStudiesFound:
      'It prevented strokes about as well as warfarin and caused less major bleeding.',
    biggestLimit:
      'The apparent stroke advantage disappeared when everyone assigned to treatment was counted.',
    criticalSafety:
      'People with the best kidney function should not use it for irregular-heartbeat stroke prevention.',
  },
  enoxaparin: {
    usedFor: 'Preventing or treating clots in the legs, lungs or during a heart attack.',
    whatStudiesFound:
      'After heart attack, deaths or repeat attacks fell from 12 in 100 to 10, mainly through fewer repeat attacks.',
    biggestLimit: 'Deaths alone did not clearly fall.',
    criticalSafety: 'Major bleeding rose from 1.4 in 100 to 2.1.',
  },
  fondaparinux: {
    usedFor: 'Preventing or treating clots in the legs or lungs with a once-daily injection.',
    whatStudiesFound:
      'After major joint surgery, scan-detected clots fell from about 14 in 100 to 7 versus enoxaparin.',
    biggestLimit:
      'Its common use after an immune reaction to heparin is unapproved and supported only by small studies.',
    criticalSafety: 'It caused catheter clots during procedures to open heart arteries.',
  },
  argatroban: {
    usedFor: 'Preventing or treating clots after a dangerous immune reaction to heparin.',
    whatStudiesFound:
      'Compared with earlier patient records, it reduced new clots but did not reduce death or amputation.',
    biggestLimit:
      'Its approval comparisons used earlier patient records rather than assigning current patients by chance.',
    criticalSafety:
      'In its only inactive-treatment comparison, 90-day deaths rose from 8 in 100 to 24.',
  },
  bivalirudin: {
    usedFor: 'Preventing clots during a procedure to open a blocked heart artery.',
    whatStudiesFound:
      'It caused less bleeding than heparin plus another powerful platelet medicine, but lost to heparin alone in one study.',
    biggestLimit: 'Its strongest wins used a comparison combination that is now uncommon.',
  },
  dalteparin: {
    usedFor:
      'Preventing or treating blood clots, including long-term treatment in people with cancer.',
    whatStudiesFound:
      'In people with cancer, repeat clots fell from about 16 in 100 to 8 without increasing serious bleeding.',
    biggestLimit: 'A separate study found no clear improvement in cancer survival.',
  },
  prasugrel: {
    usedFor: 'Preventing clots after a heart-artery stent for heart attack or unstable chest pain.',
    whatStudiesFound:
      'It prevented more repeat heart attacks and stent clots than clopidogrel, while deaths overall did not change.',
    biggestLimit: 'The fall in heart problems was offset partly by more fatal bleeding.',
    criticalSafety:
      'People with a previous stroke had about five times as many strokes and must not use it.',
  },
  ticagrelor: {
    usedFor:
      'Preventing heart attacks, strokes and stent clots after a heart attack or unstable chest pain.',
    whatStudiesFound:
      'It prevented more heart attacks, strokes and deaths than clopidogrel in 18,624 people.',
    biggestLimit:
      'The North American group did worse, and the popular aspirin-dose explanation came from an unplanned analysis.',
  },
  cangrelor: {
    usedFor: 'Preventing clots during a stent procedure before an oral platelet medicine can work.',
    whatStudiesFound:
      'It works within two minutes and wears off within an hour, but two large studies missed their main measure.',
    biggestLimit:
      'The successful study mainly prevented blood-test-only heart attacks after the procedure and did not reduce deaths.',
  },
  tirofiban: {
    usedFor: 'Preventing clots during unstable chest pain and some heart attacks.',
    whatStudiesFound:
      'Added to heparin and aspirin, it reduced early heart problems, but one later study’s benefit disappeared within a month.',
    biggestLimit: 'The dose used today was not the dose tested in the key studies.',
    criticalSafety: 'Used without heparin, it raised early deaths and that study arm stopped.',
  },
  ostarine: {
    usedFor:
      'An abandoned investigational treatment for muscle wasting, now sold in unapproved products.',
    whatStudiesFound:
      'It repeatedly increased lean mass but failed both large studies’ planned tests of physical function.',
    biggestLimit:
      'More lean tissue on a scan did not establish that people became stronger or functioned better.',
  },
  ligandrol: {
    usedFor: 'An abandoned investigational treatment for muscle loss after hip fracture.',
    whatStudiesFound:
      'It increased lean tissue over twelve weeks, with larger gains at higher doses.',
    biggestLimit:
      'The study did not test walking, recovery or falls, and development stopped afterwards.',
  },
  testolone: {
    usedFor: 'An unapproved research compound with no human muscle study.',
    whatStudiesFound:
      'Its entire human record is a dose-finding study in 20 women with breast cancer.',
    biggestLimit: 'No controlled human evidence supports muscle gain or athletic use.',
    criticalSafety:
      'Published reports describe severe liver injury and heart inflammation, including after one dose.',
  },
  cardarine: {
    usedFor: 'An abandoned metabolic medicine now sold without approval as a fat burner.',
    whatStudiesFound:
      'Short human studies improved cholesterol and fat handling, but development was discontinued.',
    biggestLimit: 'A genuine metabolic effect does not establish that taking it is safe.',
    criticalSafety: 'Published animal studies found faster tumour growth.',
  },
  ibutamoren: {
    usedFor:
      'An abandoned investigational treatment for age-related muscle loss and fracture recovery.',
    whatStudiesFound:
      'It raised growth signals and added lean mass, but did not improve strength, function or thinking.',
    biggestLimit: 'Hitting the biological target did not show that patients benefited.',
    criticalSafety: 'A hip-fracture study stopped early because of heart failure.',
  },
  'yk-11': {
    usedFor: 'An unapproved research compound never tested in a person.',
    whatStudiesFound:
      'Three cell studies found partial activation of an androgen signal and one muscle-related protein change.',
    biggestLimit:
      'The muscle-growth claim comes from mouse cells in a dish, not animals or people.',
  },
  's-23': {
    usedFor: 'A rat male-contraception candidate never tested in people.',
    whatStudiesFound:
      'It eliminated sperm from the testes of four of six treated rats and also increased lean mass.',
    biggestLimit: 'Rat findings cannot show whether it causes or avoids infertility in men.',
  },
  trenbolone: {
    usedFor: 'A cattle growth implant with no approved human use.',
    whatStudiesFound:
      'Low doses preserved muscle and bone in rats, while a steroid-user survey linked it to the worst mental and heart profile.',
    biggestLimit: 'The apparent prostate sparing disappeared at high rat doses.',
  },
  oxandrolone: {
    usedFor:
      'An anabolic steroid formerly marketed for weight gain after severe illness, injury or burns.',
    whatStudiesFound:
      'Burn-care studies found fewer operations, shorter stays and more lean mass, but no reduction in deaths or infections.',
    biggestLimit: 'Weak masculinising effects do not mean weak liver or heart effects.',
    criticalSafety: 'Liver-enzyme rises affected 19 in 100 adults versus 5 without it.',
  },
  stanozolol: {
    usedFor: 'A discontinued anabolic steroid formerly used for inherited swelling and anaemia.',
    whatStudiesFound:
      'A forward-looking series documented a distinctive severe liver injury pattern in 18 young men.',
    biggestLimit:
      'Lacking oestrogen effects says nothing about safety for the liver, cholesterol or heart.',
  },
  'nandrolone-decanoate': {
    usedFor: 'A discontinued anabolic steroid formerly used for anaemia in kidney failure.',
    whatStudiesFound:
      'Seven small studies in women found fewer fractures, more muscle and less pain, alongside facial hair, acne and voice changes.',
    biggestLimit: 'A lower prostate effect does not establish safety for the heart.',
  },
  '2-4-dinitrophenol': {
    usedFor: 'An unapproved weight-loss chemical whose fat-burning action can also kill.',
    whatStudiesFound:
      'It forces stored energy to become heat instead of useful cell energy, causing weight loss and dangerous overheating.',
    biggestLimit:
      'No modern study has found a safe dose, and fatal exposures overlap with reportedly ordinary doses.',
    criticalSafety: 'Fatal overheating has no antidote, and the cell effect can last for days.',
  },
  'melanotan-ii': {
    usedFor: 'Unapproved tanning injections.',
    whatStudiesFound:
      'It darkens skin, but no study has shown how much sun protection that provides.',
    biggestLimit:
      'Users often also use sunbeds, making reported skin-cancer cases difficult to interpret.',
    criticalSafety:
      'Reports include melanoma, kidney injury, prolonged erection, muscle breakdown and brain swelling.',
  },
  boldenone: {
    usedFor: 'A veterinary horse steroid with no approved human use.',
    whatStudiesFound:
      'Its breakdown product acted like testosterone in rats and also enlarged the liver.',
    biggestLimit:
      'No published human study has measured its claimed lower conversion to oestrogen.',
  },
  'testosterone-enanthate': {
    usedFor: 'Replacing testosterone in men whose testes or pituitary gland do not make enough.',
    whatStudiesFound:
      'A very high weekly dose increased muscle and strength even without exercise. Combining it with training added more.',
    biggestLimit: 'Heart-safety evidence studied replacement gel, not high-dose weekly injections.',
    criticalSafety:
      'Weekly injections suppressed sperm production completely in a male contraception study.',
  },
  clomiphene: {
    usedFor: 'Inducing ovulation, or raising men’s testosterone outside its approved use.',
    whatStudiesFound:
      'In men, it raised testosterone substantially. In women, another fertility medicine produced more live births.',
    biggestLimit: 'No study has tested its common use after a course of anabolic steroids.',
  },
  anastrozole: {
    usedFor: 'Breast cancer, or unapproved use in men to lower oestrogen and raise testosterone.',
    whatStudiesFound:
      'It raised testosterone in older men, but did not improve quality of life or erections and reduced spine bone density.',
    biggestLimit:
      'Hormone and sperm improvements from baseline did not outperform the medicines usually used for comparison.',
  },
  clenbuterol: {
    usedFor: 'A horse asthma medicine taken without approval for fat loss.',
    whatStudiesFound: 'The only controlled human study found more lean mass but worse endurance.',
    biggestLimit: 'No controlled human study has tested fat loss at the doses people use.',
  },
  'tb-500': {
    usedFor: 'An unapproved fragment sold for injury repair.',
    whatStudiesFound:
      'A purchased product contained a seven-part fragment, not the full natural protein. The parent treatment failed its large study.',
    biggestLimit: 'No human study has tested it for tendon, ligament or muscle healing.',
  },
  'cjc-1295': {
    usedFor: 'An unapproved injection intended to raise growth hormone for about a week.',
    whatStudiesFound:
      'One injection raised growth hormone for at least six days and a related growth signal for up to eleven.',
    biggestLimit:
      'No human study measured fat, muscle, strength, sleep, recovery or another patient outcome.',
  },
  ipamorelin: {
    usedFor:
      'An unapproved growth-hormone releaser designed to avoid raising the stress hormone cortisol.',
    whatStudiesFound:
      'In pigs it raised growth hormone without raising cortisol, even at very high doses.',
    biggestLimit:
      'Human studies measured only drug handling, and no study tested the combinations commonly sold.',
  },
  sermorelin: {
    usedFor: 'A discontinued childhood growth medicine now compounded for unapproved adult uses.',
    whatStudiesFound:
      'In growth-hormone-deficient children, yearly growth nearly doubled at six months but remained below growth-hormone treatment.',
    biggestLimit:
      'It never established final adult height or the sleep, body-composition and anti-ageing claims now marketed.',
  },
  epitalon: {
    usedFor: 'An unapproved four-part peptide marketed for anti-ageing.',
    whatStudiesFound:
      'It lengthened chromosome end-caps in human cells in two laboratories, including in cancer cell lines.',
    biggestLimit:
      'Longer chromosome end-caps have not been shown to help people live longer or better.',
  },
  'follistatin-344': {
    usedFor:
      'An experimental gene treatment for muscle disease, also sold online as an untested injection.',
    whatStudiesFound:
      'In one gene-treatment study, four of six men walked farther after a year and two barely changed.',
    biggestLimit:
      'No study has injected the online protein product, which may not contain the claimed full molecule.',
  },
  modafinil: {
    usedFor: 'Excessive sleepiness, or unapproved use to improve thinking.',
    whatStudiesFound:
      'In well-rested adults, pooled testing found only a very small average improvement in thinking.',
    biggestLimit:
      'Simple tests were inconsistent, and some evidence suggested worse creative thinking.',
    criticalSafety:
      'Serious rash led children to stop treatment and included one possible life-threatening case.',
  },
  adrafinil: {
    usedFor: 'An unscheduled supplement that the body converts into modafinil.',
    whatStudiesFound:
      'Older French use produced inconsistent results, and a volunteer study confirmed conversion into modafinil.',
    biggestLimit: 'No modern controlled study has tested wakefulness, thinking or another benefit.',
  },
  piracetam: {
    usedFor: 'A rare jerking movement disorder, or unapproved use as a thinking supplement.',
    whatStudiesFound:
      'In 21 people with severe jerking, ten needed rescue without it and none needed rescue while taking it.',
    biggestLimit:
      'Dementia studies improved general impressions but not any specific thinking ability, and no molecular target is confirmed.',
  },
  phenylpiracetam: {
    usedFor:
      'A Russian prescription thinking drug sold elsewhere as a supplement and banned in sport.',
    whatStudiesFound:
      'Laboratory screening found the dopamine transporter as its only significant brain target.',
    biggestLimit:
      'Human studies are largely inaccessible outside Russian journals and have not been repeated independently.',
  },
  noopept: {
    usedFor: 'A Russian thinking drug sold elsewhere as a supplement, often at excessive doses.',
    whatStudiesFound:
      'Laboratory tests found one low-oxygen response switch activated, while supplement testing found about four times the usual dose.',
    biggestLimit: 'The main human comparison came from the institute that invented the medicine.',
  },
  semax: {
    usedFor: 'A Russian stroke and thinking peptide sold elsewhere without approval.',
    whatStudiesFound:
      'Rat stroke studies found broad changes in immune, inflammation and brain-signal genes.',
    biggestLimit:
      'Human stroke reports are largely in Russian journals and were not registered in advance.',
  },
  selank: {
    usedFor: 'A Russian anti-anxiety drug sold elsewhere without approval.',
    whatStudiesFound:
      'Laboratory work found changes in a brain calming system. The published human study measured brain connections, not anxiety.',
    biggestLimit:
      'Its immune effects complicate the simple anti-anxiety story and remain poorly addressed.',
  },
  bromantane: {
    usedFor: 'A Russian anti-fatigue medicine also prohibited in sport.',
    whatStudiesFound:
      'In rats, moderate doses increased activity while very high doses suppressed it and most doses lowered body temperature.',
    biggestLimit:
      'Human reports are in Russian journals, were not registered and have not been independently repeated.',
  },
  stenabolic: {
    usedFor: 'An “exercise pill” research chemical never tested in a person.',
    whatStudiesFound: 'It improved running and reduced fat in mice.',
    biggestLimit:
      'It also changed cells engineered without its supposed target, undermining the claimed explanation.',
  },
  'methylene-blue': {
    usedFor: 'An approved antidote taken without approval in tiny doses to improve thinking.',
    whatStudiesFound:
      'In 26 healthy adults, one low dose improved correct memory answers by 7%. A large Alzheimer study failed.',
    biggestLimit:
      'Popular doses are informal, and products may be made to dye rather than medicine standards.',
  },
  boron: {
    usedFor: 'A trace-element supplement marketed to raise testosterone.',
    whatStudiesFound:
      'Long animal feeding studies found testicular damage, while the testosterone claim rests on twelve deficient women.',
    biggestLimit: 'Broad chemical binding shows possible actions, not a useful function in people.',
  },
  lsd: {
    usedFor: 'An unapproved psychedelic being studied for generalised anxiety.',
    whatStudiesFound:
      'One dose reduced anxiety a month later at the two highest doses. Two lower doses did nothing.',
    biggestLimit:
      'Every person receiving the highest dose knew it, so expectations could influence the result.',
  },
  psilocybin: {
    usedFor: 'An unapproved psychedelic studied for depression and cancer-related distress.',
    whatStudiesFound:
      'One high dose improved resistant depression at three weeks. A middle dose failed, and it did not clearly beat a standard antidepressant.',
    biggestLimit:
      'A short-lived flushing comparison could not convincingly hide a six-hour psychedelic experience.',
  },
  mdma: {
    usedFor: 'An unapproved drug studied with psychotherapy for post-traumatic stress disorder.',
    whatStudiesFound:
      'Adding it to identical therapy improved trauma symptoms by about ten more points in the first large study.',
    biggestLimit:
      'The design tested the combined package, not how much benefit came from the drug itself.',
  },
  ketamine: {
    usedFor:
      'Anaesthesia and sedation, or unapproved short-course treatment for resistant depression.',
    whatStudiesFound:
      'For resistant depression without psychosis, it matched electrical seizure treatment and caused much less memory harm.',
    biggestLimit:
      'Controlled evidence covers short courses, not maintenance infusions lasting months or years.',
    criticalSafety: 'Heavy repeated recreational use can permanently destroy the bladder.',
  },
  cannabis: {
    usedFor:
      'An unapproved plant used for pain, nausea and muscle stiffness under state programmes.',
    whatStudiesFound:
      'Standardised cannabinoids produced small improvements in pain and muscle stiffness, but only four of 79 studies had low bias risk.',
    biggestLimit:
      'Defined cannabinoid medicines with known doses are not the same as smoked flower of unknown strength.',
    criticalSafety:
      'Higher use was repeatedly associated with more psychotic disorder, but association does not prove cause.',
  },
  tetrahydrocannabinol: {
    usedFor:
      'Chemotherapy sickness not controlled by other medicines and severe appetite loss in AIDS.',
    whatStudiesFound:
      'Injected pure THC briefly produced psychosis-like symptoms plus memory and attention problems in healthy volunteers.',
    biggestLimit:
      'Swallowed and inhaled THC reach the brain at very different speeds and in different chemical forms.',
  },
  cannabidiol: {
    usedFor: 'Seizures in three rare, severe childhood epilepsies.',
    whatStudiesFound:
      'Monthly convulsive seizures fell from about 12 to 6, while the comparison group barely changed.',
    biggestLimit:
      'Retail products use far smaller doses and are sold for anxiety, sleep and pain without approved evidence.',
    criticalSafety: 'It can interact with medicines and injure the liver.',
  },
  heroin: {
    usedFor:
      'Severe pain in the United Kingdom, or supervised treatment for otherwise resistant opioid dependence.',
    whatStudiesFound:
      'Supervised medical heroin stopped street-heroin use in 72 in 100 long-term users versus 27 with optimised methadone.',
    biggestLimit:
      'Today’s illicit North American supply often contains fentanyl, nitazenes or xylazine instead, making older heroin risk estimates misleading.',
  },
  cocaine: {
    usedFor: 'Numbing the inside of the nose during procedures or surgery.',
    whatStudiesFound:
      'Heart-attack risk was about 24 times the person’s usual risk during the hour after use.',
    biggestLimit:
      'No approved treatment for cocaine dependence has emerged after four decades of studies.',
    criticalSafety: 'Faster delivery to the brain greatly increases addiction risk.',
  },
  methamphetamine: {
    usedFor: 'A rarely used childhood attention-disorder medicine with high misuse risk.',
    whatStudiesFound:
      'Heavy users had fewer dopamine transporters on brain scans, with partial recovery after more than a year without use.',
    biggestLimit:
      'Evidence from small daily tablets cannot be applied directly to repeated large smoked or injected doses.',
    criticalSafety: 'The label warns that misuse can cause sudden death.',
  },
  dmt: {
    usedFor:
      'An unapproved short-acting psychedelic studied in ayahuasca for resistant depression.',
    whatStudiesFound:
      'In 29 people, one dose improved depression for a week. Sixty-four in 100 responded versus 27 without it.',
    biggestLimit:
      'The study used one preparation, while ayahuasca batches vary greatly and require a second plant to activate DMT.',
  },
  mescaline: {
    usedFor: 'An unapproved classic psychedelic with no modern controlled study.',
    whatStudiesFound:
      'An online survey found many self-reported improvements in depression or anxiety, but no modern controlled result exists.',
    biggestLimit:
      'Participants chose both to take mescaline and to answer the survey, creating strong selection bias.',
  },
  ibogaine: {
    usedFor: 'An unapproved treatment offered abroad for opioid withdrawal.',
    whatStudiesFound:
      'In an uncontrolled group of 30, withdrawal scores fell and half reported no opioid use the next month.',
    biggestLimit:
      'No comparison group shows how much improvement came from ibogaine rather than other factors.',
    criticalSafety:
      'At least 19 deaths soon after ingestion have been catalogued, and dangerous heart-rhythm effects occur.',
  },
  '5-meo-dmt': {
    usedFor: 'An unapproved short-acting psychedelic studied for resistant depression.',
    whatStudiesFound:
      'One day of inhaled doses put more than half into remission within a week. Nobody without active drug remitted.',
    biggestLimit:
      'The zero response without active drug suggests participants knew their group. The sponsor designed and analysed the study.',
  },
  'salvinorin-a': {
    usedFor: 'An unapproved research and recreational drug with state-dependent legal status.',
    whatStudiesFound:
      'Laboratory screening found one opioid-related target, and inhaled effects peaked within two minutes and ended within twenty.',
    biggestLimit:
      'No euphoria in ten people does not establish low addiction risk or absence of dependence.',
  },
  ghb: {
    usedFor: 'A tightly controlled nightly treatment for narcolepsy and severe daytime sleepiness.',
    whatStudiesFound:
      'The highest nightly dose reduced sudden muscle weakness and daytime sleepiness. Lower doses did not clearly work.',
    biggestLimit:
      'The body also makes GHB, and it disappears quickly, so low or delayed blood tests cannot prove exposure.',
  },
  'nitrous-oxide': {
    usedFor: 'Fast-on, fast-off pain relief or anaesthesia in surgery, dentistry and childbirth.',
    whatStudiesFound:
      'Adding it to anaesthesia did not increase deaths or heart problems in 7,112 people.',
    biggestLimit: 'Depression studies could not hide who inhaled the active gas.',
    criticalSafety:
      'Repeated recreational inhalation disables vitamin B12 and can cause permanent spinal-cord and nerve damage.',
  },
  dextromethorphan: {
    usedFor: 'Suppressing cough, or paired with bupropion as a prescription antidepressant.',
    whatStudiesFound:
      'The antidepressant combination improved depression by just under four points beyond inactive treatment over six weeks.',
    biggestLimit:
      'The key study did not compare the combination with bupropion alone, so dextromethorphan’s contribution is unclear.',
  },
  kratom: {
    usedFor: 'An unapproved plant product used for pain, energy or opioid withdrawal.',
    whatStudiesFound:
      'Laboratory and rat work found that a liver-made breakdown product, not the main leaf compound, produced opioid-like pain relief.',
    biggestLimit:
      'Long experience with chewed leaf cannot establish safety of concentrated tablets containing hundreds of milligrams of active breakdown product.',
  },
  tianeptine: {
    usedFor: 'A prescription antidepressant abroad, sold without approval in the United States.',
    whatStudiesFound: 'United States poison-centre calls rose from 5 in 2014 to 81 in 2017.',
    biggestLimit: 'Mouse studies missed the tolerance and withdrawal clearly reported in people.',
    criticalSafety:
      'It affects the brain in the same way as opioids and can cause dependence and withdrawal.',
  },
  phenibut: {
    usedFor:
      'A prescription anxiety and sleep medicine abroad, sold as a supplement in the United States.',
    whatStudiesFound:
      'Poison centres received 1,320 reports. Eight in 100 were life-threatening, 80 people fell into a coma and three died.',
    biggestLimit:
      'Part of the reported rise after 2015 reflects poison centres gaining a specific code for phenibut.',
  },
  'delta-8-thc': {
    usedFor: 'An unapproved intoxicating hemp product sold in many states.',
    whatStudiesFound:
      'Poison centres received 5,022 reports in two years. Nearly one third involved children under six.',
    biggestLimit:
      'A weaker effect on the brain does not predict a gummy’s strength because manufacturers choose the amount per serving.',
    criticalSafety: 'More than one third of reported exposures had a serious medical outcome.',
  },
  'jwh-018': {
    usedFor: 'Unapproved laboratory chemicals sold as synthetic cannabis products.',
    whatStudiesFound:
      'They stimulate the cannabis system more fully than the plant’s main intoxicating chemical and have caused mass poisonings.',
    biggestLimit:
      'Cannabis safety evidence does not transfer to stronger, rapidly changing synthetic chemicals.',
    criticalSafety:
      'Contamination with long-acting rat poison caused severe bleeding and one documented death.',
  },
  isotonitazene: {
    usedFor: 'An abandoned painkiller candidate now found in the illicit opioid supply.',
    whatStudiesFound:
      'All 15 related chemicals strongly affected the same brain system as opioids. Several matched or exceeded fentanyl in laboratory strength.',
    biggestLimit:
      'Claims such as “twenty times stronger” change with the laboratory method and animal species.',
    criticalSafety:
      'At least 200 deaths across Europe and North America have involved isotonitazene.',
  },
  xylazine: {
    usedFor: 'A veterinary tranquilliser increasingly mixed into illicit fentanyl.',
    whatStudiesFound:
      'Across 21 areas, its share of fentanyl-related deaths rose from under 3 in 100 to nearly 11.',
    biggestLimit:
      'Regional comparisons are distorted because many places do not routinely test for xylazine.',
    criticalSafety:
      'Naloxone does not reverse xylazine, but still give it because fentanyl is almost always present.',
  },
  fentanyl: {
    usedFor: 'Hospital anaesthesia and severe chronic pain, with a separate deadly illicit supply.',
    whatStudiesFound:
      'In one year, synthetic opioids led by illicit fentanyl were involved in 64 in 100 United States overdose deaths.',
    biggestLimit:
      'A carefully measured hospital dose and an unknown street dose are not comparable exposures.',
    criticalSafety:
      'Give naloxone for suspected fentanyl overdose. Rigid chest muscles may also require emergency breathing support.',
  },
  phencyclidine: {
    usedFor: 'An abandoned anaesthetic now used mainly as a research model and recreational drug.',
    whatStudiesFound:
      'Blood levels causing psychosis-like effects matched those blocking one key brain signalling channel.',
    biggestLimit:
      'Reproducing schizophrenia-like symptoms does not prove that schizophrenia has the same underlying cause.',
  },
  '2c-b': {
    usedFor: 'An unapproved psychedelic now entering controlled brain-imaging research.',
    whatStudiesFound:
      'In 22 healthy volunteers, it changed brain connections differently from psilocybin.',
    biggestLimit:
      'Claims of less distress than psilocybin still come from user reports, not direct measurement.',
  },
  mephedrone: {
    usedFor: 'An unapproved synthetic stimulant formerly sold legally in the United Kingdom.',
    whatStudiesFound:
      'In rats it raised body temperature but, unlike MDMA, did not cause lasting loss of measured brain signalling chemicals.',
    biggestLimit: 'A rat brain finding does not establish safety during repeated human use.',
  },
  psilocin: {
    usedFor: 'The active molecule produced when the body processes psilocybin.',
    whatStudiesFound:
      'In eight volunteers, blood level, brain-target binding and felt intensity rose together.',
    biggestLimit:
      'Showing one central target does not explain every later psychological or clinical effect.',
  },
  'morning-glory': {
    usedFor: 'Unapproved psychoactive garden seeds containing a federally uncontrolled chemical.',
    whatStudiesFound:
      'A four-person study stopped after three developed heart instability or a psychosis-like state.',
    biggestLimit:
      'Being related to a famous psychedelic does not make it equivalent. It is far weaker, more sedating and more likely to tighten blood vessels.',
  },
  muscimol: {
    usedFor: 'Unapproved fly-agaric mushroom products sold as gummies or chocolate.',
    whatStudiesFound:
      'Two products labelled as fly agaric contained neither expected active compound and contained psilocin instead.',
    biggestLimit:
      'Drying or boiling can change the compounds, but no method has established reliably complete conversion.',
  },
}
