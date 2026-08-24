import type { TenSecondAnswerCopy } from '@/lib/ten-second-answer-contract'

/**
 * Hand-written first-read answers for the first half of the curated flagship dossiers.
 *
 * These sentences deliberately stay separate from the exact research wording. They may explain
 * or omit specialist detail, but they must not change the direction of a stored finding.
 */
export const TEN_SECOND_ANSWER_OVERRIDES_A = {
  inclisiran: {
    usedFor: 'Used with diet and exercise to lower LDL, often called “bad” cholesterol.',
    whatStudiesFound:
      'After about 17 months, two large studies found that LDL fell by about half on average compared with look-alike injections containing no inclisiran.',
    biggestLimit:
      'Completed studies have not yet shown whether inclisiran prevents heart attacks or strokes.',
  },
  patisiran: {
    usedFor: 'Used for inherited protein buildup that damages nerves.',
    whatStudiesFound:
      'Nerve symptoms improved slightly with patisiran but became substantially worse with a dummy treatment over 18 months.',
    biggestLimit:
      'It slows new protein buildup but does not remove damage that has already accumulated.',
  },
  vutrisiran: {
    usedFor: 'Used for inherited protein buildup that damages the nerves or heart.',
    whatStudiesFound:
      'Among 655 people with heart disease, treatment lowered the risk of death or a heart-related problem.',
    biggestLimit:
      'The nerve-disease comparison used people from an earlier study, which makes that result less certain.',
  },
  givosiran: {
    usedFor: 'Used to prevent severe pain attacks caused by acute porphyria.',
    whatStudiesFound:
      'People taking givosiran had about one quarter as many attacks needing hospital or urgent care.',
    biggestLimit:
      'The six-month study did not show its long-term effects on kidneys, nerves or liver cancer risk.',
  },
  lumasiran: {
    usedFor: 'Used for an inherited disorder that causes kidney stones and kidney failure.',
    whatStudiesFound:
      'The waste chemical that causes the disease fell by about two thirds after six months.',
    biggestLimit:
      'The study did not show whether lumasiran prevents kidney stones or kidney failure.',
  },
  nedosiran: {
    usedFor: 'Used for one inherited disorder that causes kidney stones and kidney failure.',
    whatStudiesFound:
      'Half of treated people reached normal or near-normal levels of the waste chemical that causes the disease.',
    biggestLimit:
      'The study measured a urine result, not kidney stones, kidney damage or survival.',
  },
  fitusiran: {
    usedFor: 'Used to prevent bleeding in haemophilia A or B.',
    whatStudiesFound:
      'Monthly treatment cut bleeding roughly tenfold, and two thirds of participants had no treated bleeds.',
    biggestLimit:
      'It was compared with treating bleeds as they happened, not with the usual preventive treatments.',
    criticalSafety: 'The medicine can cause dangerous blood clots.',
  },
  olpasiran: {
    usedFor: 'Studied for very high inherited levels of a harmful blood fat.',
    whatStudiesFound:
      'Higher doses reduced that blood fat to almost nothing in people who started with very high levels.',
    biggestLimit: 'No medicine has yet shown that lowering this blood fat prevents heart attacks.',
  },
  zilebesiran: {
    usedFor: 'Studied as a twice-yearly injection for high blood pressure.',
    whatStudiesFound:
      'One injection lowered the top blood-pressure number by about 15 points more after three months.',
    biggestLimit:
      'Studies have measured blood pressure, not whether treatment prevents strokes or heart attacks.',
    criticalSafety: 'One dose cannot be switched off for about six months.',
  },
  nusinersen: {
    usedFor: 'Used for spinal muscular atrophy, an inherited disease that weakens muscles.',
    whatStudiesFound:
      'Thirty-seven of 73 treated babies gained a movement milestone, while none of the 37 untreated babies did.',
    biggestLimit: 'It cannot bring back nerve cells that have already died.',
  },
  eteplirsen: {
    usedFor: 'Used for one genetic form of Duchenne muscular dystrophy.',
    whatStudiesFound:
      'After three and a half years, treated boys made less than 1% of the muscle protein found in a healthy person.',
    biggestLimit: 'It has not been shown to help boys walk or function better.',
  },
  golodirsen: {
    usedFor: 'Used for one genetic form of Duchenne muscular dystrophy.',
    whatStudiesFound:
      'In 25 boys, the missing muscle protein rose from about 0.1% to 1% of a normal level.',
    biggestLimit:
      'Researchers do not know whether that small protein increase is enough to protect muscles.',
  },
  casimersen: {
    usedFor: 'Used for one genetic form of Duchenne muscular dystrophy.',
    whatStudiesFound:
      'In 27 boys, the missing muscle protein rose from 0.93% to 1.74% of the normal level.',
    biggestLimit:
      'A later study did not show that the protein increase improved physical abilities.',
  },
  viltolarsen: {
    usedFor: 'Used for one genetic form of Duchenne muscular dystrophy.',
    whatStudiesFound:
      'In eight boys, the missing muscle protein rose from 0.6% to 5.9% of a normal level.',
    biggestLimit:
      'A later study with a comparison group did not show that the medicine improved the time needed to stand.',
  },
  inotersen: {
    usedFor: 'Used for inherited protein buildup that damages nerves.',
    whatStudiesFound:
      'Over 66 weeks, nerve symptoms stayed nearly stable with treatment but became substantially worse with a dummy treatment.',
    biggestLimit: 'The study measured nerve disease, not whether the heart also benefits.',
    criticalSafety:
      'It can dangerously reduce the blood cells needed for clotting and cause serious bleeding.',
  },
  eplontersen: {
    usedFor: 'Used for inherited protein buildup that damages nerves.',
    whatStudiesFound:
      'Treatment reduced the harmful protein in the blood by more than four fifths.',
    biggestLimit:
      'The comparison group came from an older study, so the symptom result is less certain.',
  },
  tofersen: {
    usedFor: 'Used for a rare inherited form of the muscle-wasting disease ALS.',
    whatStudiesFound:
      'A blood sign of nerve damage fell by more than half, but physical abilities did not clearly improve.',
    biggestLimit:
      'A better blood result does not show that people will keep walking, swallowing or breathing longer.',
  },
  mipomersen: {
    usedFor: 'Formerly used for an extremely severe inherited form of high cholesterol.',
    whatStudiesFound:
      'In 51 people, LDL, often called “bad” cholesterol, fell by about one quarter over 26 weeks.',
    biggestLimit: 'No study showed that mipomersen prevented heart attacks.',
    criticalSafety: 'Its United States approval was withdrawn after sales stopped.',
  },
  volanesorsen: {
    usedFor: 'Used in Europe for an inherited disorder causing extremely high blood fats.',
    whatStudiesFound: 'Blood-fat levels fell by more than three quarters over three months.',
    biggestLimit:
      'The study did not show whether treatment prevents the painful pancreas attacks the disorder can cause.',
    criticalSafety: 'It can dangerously reduce the blood cells needed for clotting.',
  },
  tozinameran: {
    usedFor: 'Used to prevent COVID-19, especially in older or higher-risk people.',
    whatStudiesFound:
      'Eight vaccinated people developed symptomatic COVID-19, compared with 162 people given a dummy injection.',
    biggestLimit:
      'The early study could not show how well vaccination stopped symptom-free infection or transmission.',
  },
  elasomeran: {
    usedFor: 'Used to prevent COVID-19, especially in older or higher-risk people.',
    whatStudiesFound:
      'Eleven vaccinated people developed symptomatic COVID-19, compared with 185 people given a dummy injection.',
    biggestLimit: 'Only one person died of COVID-19, too few to prove a survival benefit.',
  },
  'mrna-1345': {
    usedFor: 'Used to prevent serious lung infection from a respiratory virus in older adults.',
    whatStudiesFound:
      'One dose cut infections affecting the lungs by about five sixths during roughly four months of follow-up.',
    biggestLimit: 'The first result did not show protection through a second winter.',
  },
  'exagamglogene-autotemcel': {
    usedFor:
      'Used for severe sickle cell disease or a blood disorder needing regular transfusions.',
    whatStudiesFound:
      'Twenty-nine of 30 evaluated people with sickle cell disease had no severe pain crisis for at least a year.',
    biggestLimit:
      'The study had no untreated comparison group and did not measure lifetime benefit.',
    criticalSafety:
      'Treatment requires intensive chemotherapy before the edited cells are returned.',
  },
  'lovotibeglogene-autotemcel': {
    usedFor: 'Used for sickle cell disease with repeated severe pain crises.',
    whatStudiesFound:
      'All 25 people followed long enough stopped having severe pain crises during the measured period.',
    biggestLimit:
      'The result came from an early, unfinished study with no untreated comparison group.',
    criticalSafety: 'The label warns that treatment can cause blood cancer.',
  },
  'onasemnogene-abeparvovec': {
    usedFor: 'Used for spinal muscular atrophy in children under age two.',
    whatStudiesFound:
      'Thirteen of 22 treated babies sat without support, while none of 23 babies in an earlier untreated group did.',
    biggestLimit:
      'Children were compared with older records, not assigned to treatment or no treatment.',
    criticalSafety: 'The label warns of severe and sometimes fatal liver injury.',
  },
  'voretigene-neparvovec': {
    usedFor: 'Used for an inherited childhood eye disease caused by two faulty genes.',
    whatStudiesFound:
      'Treated people navigated a dim obstacle course better than untreated people.',
    biggestLimit: 'Standard eye-chart vision did not improve clearly.',
  },
  'etranacogene-dezaparvovec': {
    usedFor: 'Used as a one-time treatment for adults with haemophilia B.',
    whatStudiesFound: 'After one infusion, bleeding fell by roughly two thirds.',
    biggestLimit:
      'Everyone was compared with their own earlier bleeding rate, not with an untreated group.',
  },
  semaglutide: {
    usedFor: 'Used for type 2 diabetes, obesity, and related heart or kidney risk.',
    whatStudiesFound:
      'In 1,961 adults, average weight fell about 15%, compared with about 2% after a dummy treatment.',
    biggestLimit:
      'After stopping treatment, people regained about two thirds of the lost weight within a year.',
  },
  tirzepatide: {
    usedFor: 'Used for type 2 diabetes, obesity and obesity-related sleep apnoea.',
    whatStudiesFound:
      'At the highest dose, adults without diabetes lost about one fifth of their body weight on average.',
    biggestLimit:
      'It has not yet been shown to prevent more heart-related problems than an older weekly medicine.',
  },
  liraglutide: {
    usedFor: 'Used for type 2 diabetes and long-term weight management.',
    whatStudiesFound:
      'Among 9,340 high-risk people, serious heart-related problems fell from about 15 in 100 to 13 in 100.',
    biggestLimit:
      'Benefits shown for liraglutide do not automatically apply to other medicines in the same family.',
  },
  dulaglutide: {
    usedFor: 'Used for type 2 diabetes, including before a first heart attack.',
    whatStudiesFound:
      'Serious heart-related problems occurred in 12 of 100 treated people and 13.4 of 100 given a dummy treatment.',
    biggestLimit: 'The study did not show that dulaglutide helped people live longer.',
  },
  exenatide: {
    usedFor: 'Used for type 2 diabetes, though United States brands have been discontinued.',
    whatStudiesFound:
      'A large study found no clear reduction in heart attacks, strokes or heart-related deaths.',
    biggestLimit:
      'It was not better than a dummy treatment for heart-related problems, and United States brands are discontinued.',
  },
  retatrutide: {
    usedFor: 'Studied for obesity and type 2 diabetes, but not yet approved.',
    whatStudiesFound:
      'In a 338-person study, the highest-dose group lost nearly one quarter of body weight on average in under a year.',
    biggestLimit: 'The larger obesity study has not yet published its results.',
  },
  survodutide: {
    usedFor: 'Studied for obesity and fatty liver disease, but not yet approved.',
    whatStudiesFound:
      'In a 387-person study, the highest-dose group lost about 15% of body weight on average, versus about 3% with a dummy treatment.',
    biggestLimit:
      'Only 60% completed the weight study, and improvement in liver scarring was less clear.',
  },
  adalimumab: {
    usedFor: 'Used for rheumatoid arthritis and several other long-term inflammatory diseases.',
    whatStudiesFound:
      'In rheumatoid arthritis still active despite standard treatment, adding adalimumab raised meaningful six-month improvement from 15 in 100 people to 67 in 100.',
    biggestLimit: 'Quieter disease is not the same as the disease being cured.',
  },
  pembrolizumab: {
    usedFor: 'Used for many advanced cancers by helping immune cells attack tumours.',
    whatStudiesFound:
      'In advanced melanoma, about 47% had no worsening at six months, compared with about 27% on the older treatment.',
    biggestLimit:
      'A tumour test can raise the chance of benefit, but it cannot predict who will respond.',
  },
  nivolumab: {
    usedFor: 'Used for several advanced cancers by helping immune cells attack tumours.',
    whatStudiesFound:
      'In untreated advanced melanoma, half the group taking both medicines went 11.5 months before worsening, versus 2.9 months with ipilimumab alone.',
    biggestLimit:
      'The combination causes far more severe side effects, and many people stop treatment.',
  },
  trastuzumab: {
    usedFor: 'Used for breast and stomach cancers driven by too much of one growth signal.',
    whatStudiesFound:
      'In 469 women with advanced breast cancer driven by that signal, half the combination group went 7.4 months before worsening, versus 4.6 with chemotherapy alone.',
    biggestLimit:
      'Different tests and cutoffs can disagree about whether a tumour is suitable for treatment.',
  },
  rituximab: {
    usedFor: 'Used for lymphomas and immune diseases involving a type of white blood cell.',
    whatStudiesFound:
      'Just under half of 166 people with returning low-grade lymphoma responded to four weekly infusions.',
    biggestLimit: 'It does not work for every disease involving these white blood cells.',
  },
  bevacizumab: {
    usedFor: 'Used with other treatments for several advanced cancers.',
    whatStudiesFound:
      'In 813 people with untreated advanced bowel cancer, half the group given bevacizumab with chemotherapy lived 20.3 months, versus 15.6 with chemotherapy alone.',
    biggestLimit: 'Slower tumour growth on a scan does not always mean that people live longer.',
  },
  dupilumab: {
    usedFor: 'Used for eczema, asthma and several related allergic conditions.',
    whatStudiesFound:
      'In two large eczema studies, skin, itching, mood and quality of life all improved after 16 weeks.',
    biggestLimit:
      'It does not work for every inflammatory condition that looks biologically similar.',
  },
  ustekinumab: {
    usedFor: 'Used for psoriasis, psoriatic arthritis and inflammatory bowel disease.',
    whatStudiesFound:
      'About two thirds had a major skin improvement after 12 weeks, compared with three or four in 100 given a dummy treatment.',
    biggestLimit:
      'Some people flare before the next scheduled dose because the interval was not tailored to individuals.',
  },
  secukinumab: {
    usedFor: 'Used for psoriasis, psoriatic arthritis and inflammatory spine disease.',
    whatStudiesFound:
      'At the higher dose, about four in five had a major skin improvement, compared with fewer than one in 20 given a dummy treatment.',
    biggestLimit:
      'It can worsen Crohn disease, and studies did not show whether improvement lasts after stopping.',
  },
  evolocumab: {
    usedFor: 'Used when cholesterol remains very high despite standard cholesterol medicines.',
    whatStudiesFound:
      'Added to standard treatment, evolocumab lowered LDL, often called “bad” cholesterol, by 59% and modestly reduced heart-related problems.',
    biggestLimit: 'The study did not show that evolocumab helped people live longer.',
  },
  alirocumab: {
    usedFor:
      'Used when cholesterol stays high after a recent heart problem despite standard medicines.',
    whatStudiesFound:
      'Serious heart-related problems fell from 11.1 in 100 people to 9.5 in 100 over nearly three years.',
    biggestLimit: 'The study could not firmly prove that alirocumab reduced deaths.',
  },
  lecanemab: {
    usedFor: 'Used for early Alzheimer disease confirmed by a brain scan or spinal-fluid test.',
    whatStudiesFound:
      'Over 18 months, decline was 1.21 points with lecanemab and 1.66 with a dummy treatment on an 18-point scale.',
    biggestLimit: 'It is uncertain whether the 0.45-point difference is noticeable to families.',
    criticalSafety: 'It can cause brain swelling or small brain bleeds.',
  },
  donanemab: {
    usedFor: 'Used for early Alzheimer disease with confirmed brain plaque.',
    whatStudiesFound:
      'Across all 1,736 participants, donanemab modestly slowed worsening over 76 weeks.',
    biggestLimit:
      'The larger benefit often quoted came from a selected group, not everyone in the study.',
    criticalSafety: 'Brain swelling occurred in about one quarter of treated people.',
  },
  'insulin-glargine': {
    usedFor: 'Used once daily as background insulin for type 1 or type 2 diabetes.',
    whatStudiesFound:
      'It controlled average blood sugar about as well as older insulin, with fewer night-time low readings.',
    biggestLimit:
      'A large real-world comparison found no clear advantage in emergency visits or blood-sugar control.',
  },
  'insulin-lispro': {
    usedFor: 'Used as fast-acting insulin around meals for type 1 or type 2 diabetes.',
    whatStudiesFound:
      'It starts about 15 minutes faster than ordinary human insulin, but the blood-sugar advantage was small.',
    biggestLimit:
      'Studies gave very weak evidence that it prevents more severe low-sugar episodes.',
  },
  'epoetin-alfa': {
    usedFor: 'Used for too few red blood cells caused by kidney failure or some treatments.',
    whatStudiesFound:
      'In an early study, all 12 people who had needed regular blood transfusions stopped needing them.',
    biggestLimit:
      'Pushing blood counts toward normal increased deaths, strokes and heart failure in later large studies.',
  },
  filgrastim: {
    usedFor: 'Used to rebuild infection-fighting white blood cells after chemotherapy.',
    whatStudiesFound:
      'It nearly halved episodes of fever with a dangerously low white-cell count during chemotherapy.',
    biggestLimit: 'Studies did not show whether people lived longer overall.',
  },
  pegfilgrastim: {
    usedFor: 'Used to rebuild white blood cells with one injection per chemotherapy cycle.',
    whatStudiesFound:
      'One injection per cycle cut fever with low white cells from about one in six people to one in 100.',
    biggestLimit: 'It has not been shown to extend life more than daily filgrastim.',
  },
  somatropin: {
    usedFor: 'Used for growth problems in children and growth-hormone deficiency in adults.',
    whatStudiesFound:
      'In healthy but very short children, treatment added about 3.7 centimetres to adult height.',
    biggestLimit: 'Studies did not show that the extra height made children happier.',
  },
  etanercept: {
    usedFor: 'Used for rheumatoid arthritis, psoriasis and related inflammatory diseases.',
    whatStudiesFound:
      'About six in ten people with rheumatoid arthritis improved, compared with about one in ten given a dummy treatment.',
    biggestLimit: 'It does not work for every disease driven by the same inflammatory signal.',
  },
  alteplase: {
    usedFor:
      'Used in emergencies to dissolve clots causing stroke, heart attack or a blocked lung artery.',
    whatStudiesFound:
      'After stroke, alteplase improved the chance of less disability but sharply increased dangerous brain bleeding.',
    biggestLimit: 'The major stroke study did not show fewer deaths.',
  },
  metformin: {
    usedFor: 'Used to lower blood sugar in type 2 diabetes.',
    whatStudiesFound:
      'In one long study of overweight people, metformin reduced deaths compared with diet advice alone.',
    biggestLimit:
      'That survival result has not been directly repeated and does not prove that metformin slows ageing.',
  },
  'magnesium-glycinate': {
    usedFor: 'Sold for sleep, cramps and stress.',
    whatStudiesFound:
      'Magnesium supplements lowered the top blood-pressure number by about two points across 34 studies.',
    biggestLimit:
      'There is no solid evidence that the glycinate form absorbs better than cheaper forms.',
  },
  zinc: {
    usedFor: 'Taken after a cold starts, or daily for immune support.',
    whatStudiesFound: 'Zinc may shorten a cold by about two days but did not prevent colds.',
    biggestLimit: 'Long-term high doses can cause copper deficiency, anaemia and nerve damage.',
  },
  atorvastatin: {
    usedFor: 'Used to lower cholesterol and prevent heart attacks or strokes.',
    whatStudiesFound:
      'A large study stopped early after atorvastatin reduced heart attacks and coronary deaths by about one third.',
    biggestLimit:
      'Studies have not separated cholesterol lowering from atorvastatin’s other possible effects.',
  },
  'vitamin-c': {
    usedFor: 'Taken to prevent or shorten colds and support immunity.',
    whatStudiesFound:
      'Across 11,306 people, daily vitamin C did not reduce how often adults caught colds.',
    biggestLimit:
      'A long study that tracked rather than assigned supplements linked vitamin C with about twice as many kidney stones in men.',
  },
  lisinopril: {
    usedFor: 'Used for high blood pressure, heart failure and after a heart attack.',
    whatStudiesFound:
      'After a heart attack, adding lisinopril modestly reduced deaths during the first six weeks.',
    biggestLimit:
      'The early benefit was small and must be weighed against low blood pressure and kidney problems.',
  },
  amlodipine: {
    usedFor: 'Used for high blood pressure and chest pain from narrowed heart arteries.',
    whatStudiesFound:
      'An amlodipine-based plan caused fewer strokes, total heart-related problems and deaths than an older treatment plan.',
    biggestLimit: 'The study’s main prechosen heart result did not clearly differ.',
  },
  melatonin: {
    usedFor: 'Used to fall asleep sooner or reset sleep timing after travel.',
    whatStudiesFound:
      'Across many studies, melatonin shortened the time needed to fall asleep by only a few minutes on average.',
    biggestLimit: 'Supplement labels often contain much more or less melatonin than they claim.',
  },
  losartan: {
    usedFor: 'Used for high blood pressure and some heart or kidney problems.',
    whatStudiesFound:
      'With equal blood-pressure lowering, losartan prevented more combined heart-related problems than atenolol, mainly through fewer strokes.',
    biggestLimit: 'Heart attacks and heart-related deaths did not clearly fall on their own.',
  },
  caffeine: {
    usedFor: 'Used for alertness and to improve exercise performance.',
    whatStudiesFound:
      'Reviews found improvements in endurance, strength, power, jumping and speed across many studies.',
    biggestLimit:
      'Stopping regular caffeine causes withdrawal, and about half of habitual users develop a headache.',
  },
  metoprolol: {
    usedFor: 'Used for high blood pressure, chest pain, heart failure and after a heart attack.',
    whatStudiesFound:
      'In heart failure, the long-acting form reduced deaths enough that a large study stopped early.',
    biggestLimit:
      'That survival evidence applies to the long-acting form, not every metoprolol product.',
  },
  'whey-protein': {
    usedFor: 'Used to meet daily protein needs and support muscle gain during training.',
    whatStudiesFound:
      'Across 49 studies, added protein produced a small extra gain in muscle and strength during resistance training.',
    biggestLimit: 'Extra benefit disappeared once total protein intake was already high enough.',
  },
  rosuvastatin: {
    usedFor: 'Used to lower cholesterol and prevent heart attacks or strokes.',
    whatStudiesFound:
      'In people without known heart disease, rosuvastatin reduced heart-related problems enough that one study stopped early.',
    biggestLimit:
      'It lowered both cholesterol and inflammation, so the study cannot show which change caused the benefit.',
  },
  levothyroxine: {
    usedFor: 'Used to replace thyroid hormone when the thyroid is underactive.',
    whatStudiesFound: 'It is effective replacement for clear thyroid-hormone deficiency.',
    biggestLimit:
      'In older people with only mildly abnormal tests, normalising the test did not improve symptoms or tiredness.',
  },
  empagliflozin: {
    usedFor: 'Used for heart failure, kidney disease and type 2 diabetes with added risk.',
    whatStudiesFound:
      'In weakened hearts, heart-related deaths and hospital admissions for heart failure fell by about one quarter.',
    biggestLimit: 'Heart attacks and strokes did not clearly fall.',
  },
  dapagliflozin: {
    usedFor: 'Used for heart failure, kidney disease and type 2 diabetes with added risk.',
    whatStudiesFound:
      'In weakened hearts, worsening heart failure and heart-related death fell by about one quarter.',
    biggestLimit:
      'A study begun after heart attacks did not clearly reduce death or heart-failure admission.',
  },
  sitagliptin: {
    usedFor: 'Used to lower blood sugar in type 2 diabetes.',
    whatStudiesFound:
      'In nearly 15,000 high-risk people, heart-related problems were no more common than with a dummy treatment.',
    biggestLimit: 'That result shows heart safety, not that sitagliptin protects the heart.',
  },
  warfarin: {
    usedFor: 'Used to prevent or treat blood clots, including stroke from an irregular heartbeat.',
    whatStudiesFound:
      'Across studies with comparison groups, warfarin reduced strokes from an irregular heartbeat by about two thirds.',
    biggestLimit:
      'Dose-guiding genetic tests improved a blood reading in some studies but did not clearly prevent bleeding or strokes.',
  },
  ezetimibe: {
    usedFor: 'Used with a statin cholesterol medicine when cholesterol remains too high.',
    whatStudiesFound:
      'After a heart attack, adding ezetimibe prevented about two serious heart-related problems per 100 people over seven years.',
    biggestLimit: 'The benefit is real but small in absolute terms.',
  },
  clopidogrel: {
    usedFor: 'Used to prevent clots after a heart attack, stent or stroke.',
    whatStudiesFound:
      'Added to aspirin, it prevented about two events and caused about one extra major bleed per 100 people.',
    biggestLimit: 'Genetic or blood-test guided dosing has not clearly improved outcomes.',
  },
  apixaban: {
    usedFor: 'Used to prevent stroke and to treat or prevent blood clots.',
    whatStudiesFound:
      'Compared with warfarin, apixaban caused fewer strokes, less major bleeding and fewer deaths.',
    biggestLimit:
      'Most of the stroke difference came from fewer brain bleeds, not fewer clot-caused strokes.',
  },
  colchicine: {
    usedFor: 'Used for gout attacks and, in some people, to reduce heart-related risk.',
    whatStudiesFound:
      'After a heart attack, colchicine modestly reduced combined heart-related problems over about two years.',
    biggestLimit: 'A later large study found no reduction in heart-related problems.',
  },
  spironolactone: {
    usedFor: 'Used for heart failure, fluid retention and hard-to-control high blood pressure.',
    whatStudiesFound:
      'In severe heart failure, adding low-dose spironolactone reduced deaths by about 30%.',
    biggestLimit:
      'A later heart-failure study produced sharply different results across regions, making its overall result hard to interpret.',
  },
  hydrochlorothiazide: {
    usedFor: 'Used for high blood pressure and fluid retention.',
    whatStudiesFound:
      'A large direct comparison found no heart-outcome advantage for the similar drug often claimed to be better.',
    biggestLimit:
      'Most major outcome evidence comes from a related medicine, not hydrochlorothiazide itself.',
  },
  furosemide: {
    usedFor: 'Used to remove excess fluid caused by heart, liver or kidney disease.',
    whatStudiesFound:
      'Different furosemide dosing strategies relieved fluid overload without a clear winner.',
    biggestLimit:
      'Evidence that it reduces deaths compared with no water-removing medicine comes from only 202 people.',
  },
  rivaroxaban: {
    usedFor: 'Used to prevent stroke and to treat or prevent blood clots.',
    whatStudiesFound:
      'In irregular heartbeat, rivaroxaban prevented strokes about as well as carefully managed warfarin.',
    biggestLimit: 'A recalled testing device may have made the warfarin comparison less reliable.',
  },
  'bempedoic-acid': {
    usedFor: 'Used for high cholesterol when a statin cholesterol medicine cannot be tolerated.',
    whatStudiesFound:
      'Over three years, combined heart-related problems fell from 13.3 in 100 people to 11.7 in 100.',
    biggestLimit: 'Strokes and deaths did not clearly fall.',
  },
  finerenone: {
    usedFor: 'Used for diabetic kidney disease and one form of heart failure.',
    whatStudiesFound:
      'Added to standard treatment, finerenone modestly reduced worsening kidney disease and heart-failure admissions.',
    biggestLimit: 'No large study has shown that finerenone helps people live longer.',
  },
  resmetirom: {
    usedFor: 'Used for fatty liver disease with inflammation and moderate or advanced scarring.',
    whatStudiesFound:
      'After one year, liver inflammation or scarring improved more often with resmetirom than with a dummy treatment.',
    biggestLimit: 'The study did not measure liver failure, cancer, transplant or death.',
  },
  sertraline: {
    usedFor: 'Used for depression, anxiety disorders and obsessive-compulsive disorder.',
    whatStudiesFound:
      'Across many studies, sertraline worked better than a dummy pill and people were relatively likely to keep taking it.',
    biggestLimit: 'Average benefit is smaller in people whose depression is not very severe.',
  },
  escitalopram: {
    usedFor: 'Used for depression and generalised anxiety.',
    whatStudiesFound:
      'In the largest antidepressant comparison, escitalopram combined better-than-average results with fewer people stopping treatment.',
    biggestLimit:
      'Higher doses increased side-effect dropouts without clearly adding more benefit.',
  },
  bupropion: {
    usedFor: 'Used for depression and to help people stop smoking.',
    whatStudiesFound:
      'Across 45 studies, bupropion raised long-term smoking quit rates by about two thirds.',
    biggestLimit:
      'Its lower rate of sexual side effects is plausible, but has less direct evidence than the quit-smoking benefit.',
    criticalSafety: 'Higher doses raise the risk of seizures.',
  },
  gabapentin: {
    usedFor: 'Used for nerve pain after shingles and as added treatment for some seizures.',
    whatStudiesFound:
      'About one in three people with pain after shingles had their pain halved, compared with one in six given a dummy pill.',
    biggestLimit: 'It has little or no good evidence for ordinary low-back pain.',
  },
  pregabalin: {
    usedFor: 'Used for some nerve pain, fibromyalgia and as added treatment for seizures.',
    whatStudiesFound:
      'For nerve pain after shingles, pregabalin roughly doubled or tripled the chance of having pain cut in half.',
    biggestLimit:
      'Benefits were smaller for diabetic nerve pain, and a direct study found no benefit for sciatica.',
  },
  esketamine: {
    usedFor: 'Used for depression that has not improved with at least two other antidepressants.',
    whatStudiesFound:
      'The successful short study improved depression by four points more than a dummy spray on a 60-point scale.',
    biggestLimit:
      'Its obvious out-of-body effects make it hard to keep patients and raters unaware of who received it.',
  },
  naltrexone: {
    usedFor: 'Used for alcohol use disorder and to prevent return to opioid use.',
    whatStudiesFound:
      'For alcohol problems, adding naltrexone reduced the chance of a heavy-drinking day by about one quarter.',
    biggestLimit:
      'For opioid problems, a person must first stop opioids long enough to avoid sudden severe withdrawal.',
  },
  buprenorphine: {
    usedFor: 'Used for opioid use disorder and, separately, severe long-term pain.',
    whatStudiesFound:
      'Across 31 studies, buprenorphine kept more people in treatment, while higher doses also reduced illicit opioid use.',
    biggestLimit:
      'Starting it too soon after a potent synthetic opioid can trigger sudden severe withdrawal.',
  },
  amoxicillin: {
    usedFor: 'Used for certain bacterial infections of the ears, throat, sinuses, chest or urine.',
    whatStudiesFound:
      'In strictly diagnosed childhood ear infections, persistent infection fell from about one half to about one sixth.',
    biggestLimit: 'It does not help ordinary coughs when pneumonia is not suspected.',
  },
  azithromycin: {
    usedFor:
      'Used for certain bacterial infections, including some chest, skin and sexually transmitted infections.',
    whatStudiesFound:
      'Across communities in three African countries, twice-yearly treatment reduced preschool deaths by about one seventh overall, with results differing by country.',
    biggestLimit: 'Bacterial resistance rose about fourfold in the treated communities.',
  },
  doxycycline: {
    usedFor: 'Used for several bacterial infections, acne and malaria prevention.',
    whatStudiesFound:
      'After condomless sex, one dose cut the combined rate of three sexually transmitted infections by about two thirds in selected groups.',
    biggestLimit:
      'That benefit did not repeat in Kenyan women, and resistant gonorrhoea was more common with treatment.',
  },
  ciprofloxacin: {
    usedFor: 'Used for certain serious bacterial infections and after exposure to anthrax.',
    whatStudiesFound:
      'For kidney infection in women, seven days cured more infections than fourteen days of an older antibiotic combination.',
    biggestLimit:
      'Serious side effects mean it is not the first choice when safer antibiotics are suitable.',
  },
  metronidazole: {
    usedFor: 'Used for certain parasite infections and bacteria that grow without oxygen.',
    whatStudiesFound:
      'For one common sexually transmitted infection, seven days of tablets cured more women than one large dose.',
    biggestLimit:
      'The familiar alcohol warning was not supported by a small human experiment, but evidence remains limited.',
  },
  fluconazole: {
    usedFor: 'Used for thrush, other yeast infections and some serious fungal infections.',
    whatStudiesFound:
      'In African adults with HIV-related fungal meningitis, fluconazole plus another tablet matched two weeks of medicine given into a vein on early deaths.',
    biggestLimit:
      'One tablet can treat simple vaginal thrush, while serious fungal disease needs longer, combined treatment.',
  },
  valacyclovir: {
    usedFor: 'Used for shingles, cold sores and genital herpes.',
    whatStudiesFound:
      'Daily treatment cut symptomatic genital-herpes transmission to an uninfected partner by three quarters over eight months.',
    biggestLimit:
      'Lower virus shedding did not translate into benefit for several other diseases where it was tested.',
  },
  oseltamivir: {
    usedFor: 'Used for flu when started within two days of the first symptom.',
    whatStudiesFound: 'It shortened adult flu symptoms by about 17 hours on average.',
    biggestLimit: 'Full study reports did not show a clear reduction in hospital admission.',
  },
  'nirmatrelvir-ritonavir': {
    usedFor: 'Used early in COVID-19 for adults at high risk of serious illness.',
    whatStudiesFound:
      'In unvaccinated high-risk adults, hospital admission or death fell from 27 of 385 people to 3 of 389.',
    biggestLimit:
      'A later study did not show faster symptom relief in vaccinated or standard-risk adults.',
  },
  'creatine-monohydrate': {
    usedFor: 'Used to improve strength and power during short, hard efforts.',
    whatStudiesFound:
      'Studies over several decades show that creatine can improve power during repeated short, hard efforts.',
    biggestLimit:
      'Two large studies found no evidence that creatine slowed Parkinson’s or Huntington’s disease.',
  },
  'vitamin-d3': {
    usedFor: 'Used to prevent or treat vitamin D deficiency and support bone health.',
    whatStudiesFound:
      'Vitamin D with calcium nearly halved hip fractures in very frail older women who started with low vitamin D.',
    biggestLimit:
      'Large studies in the wider population found no clear prevention of cancer, heart disease or fractures.',
  },
  'omega-3-epa-dha': {
    usedFor: 'Used for heart health and to lower very high blood fats.',
    whatStudiesFound:
      'A high-dose prescription form reduced combined heart-related problems by about one quarter over five years.',
    biggestLimit:
      'Ordinary one-gram fish-oil supplements have not prevented heart-related problems in large studies.',
  },
  'collagen-peptides': {
    usedFor: 'Sold for skin, joints, hair and nails.',
    whatStudiesFound:
      'Small collagen fragments reach the blood after a dose, and studies combined together report modest skin improvements.',
    biggestLimit:
      'Collagen is an incomplete protein, and the studies do not show that swallowed collagen travels directly to skin or joints.',
  },
  'psyllium-husk': {
    usedFor: 'Used for constipation and to lower cholesterol.',
    whatStudiesFound:
      'Across 28 studies, psyllium modestly lowered LDL, often called “bad” cholesterol, and also softened stool.',
    biggestLimit: 'It did not improve blood sugar in people whose level was already normal.',
  },
  inulin: {
    usedFor: 'Used to feed gut bacteria and increase bowel movements.',
    whatStudiesFound:
      'European reviewers accepted evidence that chicory inulin increases stool frequency.',
    biggestLimit: 'A rise in one type of gut bacterium is not itself proof of better health.',
    practicalNote: 'Gas and bloating increase with the dose.',
  },
  glycine: {
    usedFor: 'Sold for sleep quality and as a source of protein-building material.',
    whatStudiesFound: 'Small studies reported better sleep after glycine taken before bed.',
    biggestLimit:
      'The sleep claim rests on two small studies from the same group at an amino-acid manufacturer.',
  },
  taurine: {
    usedFor: 'Used in energy drinks and sold for exercise or healthy ageing.',
    whatStudiesFound:
      'Human exercise studies suggest a small endurance benefit, while taurine clearly treats deficiency in cats.',
    biggestLimit:
      'New human data contradicted the claim that taurine levels normally fall with age.',
  },
  'beta-alanine': {
    usedFor: 'Used to support hard exercise lasting roughly one to four minutes.',
    whatStudiesFound:
      'Across 40 studies, performance improved by a small amount, mainly in efforts lasting one to four minutes.',
    biggestLimit: 'The average benefit was reliably detected but small.',
    practicalNote: 'Tingling is common and can be reduced by splitting the dose.',
  },
  'citrulline-malate': {
    usedFor: 'Used before lifting for more repetitions, muscle “pump” and less soreness.',
    whatStudiesFound:
      'Across eight small studies, people completed about three extra repetitions on average.',
    biggestLimit: 'No study has shown whether the added malate contributes anything.',
  },
  selenium: {
    usedFor: 'Used to prevent deficiency and sold for thyroid, immune or antioxidant support.',
    whatStudiesFound:
      'In selenium-poor regions, supplements prevented a fatal deficiency-related heart disease.',
    biggestLimit:
      'Two large studies found no cancer-prevention benefit and raised possible harm signals.',
  },
  'coenzyme-q10': {
    usedFor:
      'Sold for heart health, energy and muscle aches blamed on statin cholesterol medicines.',
    whatStudiesFound:
      'In 420 people with heart failure, adding CoQ10 reduced serious heart-related problems and deaths over two years.',
    biggestLimit:
      'Studies have not clearly shown that replacing lower CoQ10 levels relieves muscle pain blamed on statin cholesterol medicines.',
  },
  'alpha-lipoic-acid': {
    usedFor: 'Used for diabetic nerve pain, blood sugar and antioxidant support.',
    whatStudiesFound:
      'After five weeks, diabetic nerve-pain scores fell by about half, compared with one third after a dummy treatment.',
    biggestLimit:
      'A four-year study did not clearly slow nerve damage and found more serious side effects.',
  },
  'lutein-zeaxanthin': {
    usedFor: 'Used for eye health, especially age-related damage to central vision.',
    whatStudiesFound:
      'The main study did not clearly slow advanced eye disease, but these nutrients lacked the lung-cancer signal seen with beta-carotene.',
    biggestLimit:
      'A possible long-term benefit came from follow-up analysis, not the study’s main result.',
  },
  folate: {
    usedFor: 'Used before and early in pregnancy to prevent serious brain and spine defects.',
    whatStudiesFound:
      'In women with an earlier affected pregnancy, folic acid cut another brain or spine defect by nearly three quarters.',
    biggestLimit: 'High folate can hide or worsen problems in people who are low in vitamin B12.',
  },
  'vitamin-k2-mk7': {
    usedFor: 'Sold with vitamin D for bones and to reduce calcium buildup in arteries.',
    whatStudiesFound:
      'It improved a blood sign linked to controlling calcium, and two small long studies reported changes in bones or arteries.',
    biggestLimit:
      'Several direct imaging studies found no clear slowing of calcium buildup in arteries or heart valves.',
  },
  iodine: {
    usedFor: 'Used to prevent iodine deficiency and support normal thyroid function.',
    whatStudiesFound:
      'Correcting severe deficiency improved thyroid health and thinking ability in affected children.',
    biggestLimit: 'Too much iodine can trigger underactive thyroid and autoimmune thyroid disease.',
  },
  berberine: {
    usedFor: 'Sold for blood sugar, cholesterol and weight loss, but not approved for these uses.',
    whatStudiesFound:
      'A small study found three months of berberine lowered long-term blood sugar about as much as metformin.',
    biggestLimit: 'Across weight studies, the average difference was less than one kilogram.',
  },
  curcumin: {
    usedFor: 'Sold for inflammation and joint pain, but not approved as a medicine.',
    whatStudiesFound:
      'People with knee arthritis reported less pain after turmeric extract, but joint damage on scans did not improve.',
    biggestLimit: 'Most products produce very little curcumin in the blood.',
    criticalSafety: 'Concentrated extracts have been linked to liver injury.',
  },
  ashwagandha: {
    usedFor: 'Sold for stress and sleep.',
    whatStudiesFound:
      'Across nine studies, people reported less stress and anxiety, and a stress hormone in blood also fell.',
    biggestLimit: 'Claims about testosterone and muscle rely on fewer, weaker studies.',
    criticalSafety: 'Published cases link ashwagandha to liver injury.',
  },
  'rhodiola-rosea': {
    usedFor: 'Sold for fatigue and mental performance under stress.',
    whatStudiesFound:
      'Eleven controlled studies reported benefits for physical or mental performance.',
    biggestLimit:
      'Not one positive finding had been independently repeated in the research review.',
  },
  'l-theanine': {
    usedFor: 'Sold for calm alertness.',
    whatStudiesFound:
      'Combined with caffeine, L-theanine improved attention more than caffeine alone.',
    biggestLimit:
      'Studies of stress or sleep are still too few and too small for firm conclusions.',
  },
  resveratrol: {
    usedFor: 'Sold for longevity and heart health, but not approved for either.',
    whatStudiesFound: 'Independent human studies have repeatedly found no clear health benefit.',
    biggestLimit:
      'The proposed biological target was not directly engaged, and influential laboratory work was later found unreliable.',
  },
  quercetin: {
    usedFor: 'Sold for allergy, immunity and healthy ageing.',
    whatStudiesFound:
      'Across controlled studies, quercetin lowered blood pressure by about three points on the top number.',
    biggestLimit: 'The measured exercise benefit was between trivial and small.',
  },
  'saffron-extract': {
    usedFor: 'Sold for mood and anxiety.',
    whatStudiesFound:
      'Across 34 studies, people taking saffron reported better depression and anxiety scores.',
    biggestLimit:
      'Doctors’ ratings did not improve, and most studies came from one region with signs that negative results were missing.',
  },
  'st-johns-wort': {
    usedFor: 'Used for mild to moderate depression.',
    whatStudiesFound:
      'Across 29 studies, it worked about as well as standard antidepressants for mild to moderate depression.',
    biggestLimit: 'Two large studies found no benefit for severe depression.',
    criticalSafety:
      'It can dangerously weaken many medicines, including medicines that prevent transplant rejection.',
  },
  'valerian-root': {
    usedFor: 'Sold as a sleep aid.',
    whatStudiesFound:
      'Some combined study results found better self-reported sleep, but the strongest recent studies found no effect.',
    biggestLimit:
      'Products, doses and study lengths differed widely, and missing negative studies may exaggerate benefit.',
  },
  rofecoxib: {
    usedFor:
      'Formerly used for arthritis and pain with less stomach injury than older painkillers.',
    whatStudiesFound:
      'Serious stomach or bowel problems occurred half as often as with naproxen, but heart attacks occurred five times as often.',
    biggestLimit:
      'The heart-attack difference was wrongly blamed on naproxen being protective, but later evidence could not explain the gap.',
    criticalSafety: 'It was withdrawn because it increased heart-related risk.',
  },
  sibutramine: {
    usedFor: 'Formerly used as a prescription appetite suppressant for obesity.',
    whatStudiesFound:
      'It helped people maintain modest weight loss but increased serious heart-related problems by about one sixth.',
    biggestLimit:
      'Weight loss did not translate into heart protection, and the only direct study found the opposite.',
    criticalSafety: 'It was withdrawn because of heart-related harm.',
  },
  cerivastatin: {
    usedFor: 'Formerly used to lower cholesterol.',
    whatStudiesFound:
      'Hospital-treated muscle breakdown occurred about twelve times as often as with three competing cholesterol medicines.',
    biggestLimit: 'It was never shown to prevent heart attacks before leaving the market.',
    criticalSafety: 'It was withdrawn because of severe muscle breakdown.',
  },
  troglitazone: {
    usedFor: 'Formerly used to lower blood sugar in type 2 diabetes.',
    whatStudiesFound:
      'In a diabetes-prevention study, new diabetes occurred at about one quarter of the rate seen with a dummy treatment.',
    biggestLimit: 'Reported liver failure led to withdrawal despite the blood-sugar benefit.',
    criticalSafety: 'It was withdrawn after reports of severe liver failure.',
  },
  rimonabant: {
    usedFor: 'Formerly used in Europe as a weight-loss tablet.',
    whatStudiesFound:
      'Average weight loss was about 4.7 kilograms greater than with a dummy treatment after one year.',
    biggestLimit:
      'A large study found no reduction in heart attacks or strokes and more serious mood problems.',
    criticalSafety: 'It was withdrawn after depression and suicide concerns.',
  },
  fenfluramine: {
    usedFor:
      'Used for seizures in two severe childhood epilepsies, and formerly sold for weight loss.',
    whatStudiesFound:
      'For one childhood epilepsy, convulsive seizures fell about 75%, compared with about 19% after a dummy treatment.',
    biggestLimit:
      'Its earlier weight-loss use damaged heart valves, so current treatment requires regular heart scans.',
  },
  phentermine: {
    usedFor: 'Used for short-term appetite suppression in obesity.',
    whatStudiesFound:
      'A population study found no heart-valve disease among people who took phentermine alone.',
    biggestLimit:
      'Long-term use is common, but supporting evidence comes from health records rather than controlled studies.',
  },
  thalidomide: {
    usedFor: 'Used for multiple myeloma and a painful complication of leprosy.',
    whatStudiesFound:
      'Among people with returning myeloma and few options, about one third responded.',
    biggestLimit:
      'The original explanation that it worked by starving tumours of blood vessels was not supported by measurements.',
    criticalSafety: 'Exposure during pregnancy can cause severe birth defects.',
  },
  diethylstilbestrol: {
    usedFor: 'Formerly given during pregnancy to prevent miscarriage.',
    whatStudiesFound:
      'It did not prevent miscarriage and later caused rare cancers and reproductive problems in exposed children.',
    biggestLimit:
      'Millions received it before a controlled study showed the intended benefit was absent.',
    criticalSafety: 'It is a cancer-causing medicine that crosses from mother to fetus.',
  },
  cisapride: {
    usedFor: 'Formerly used for night-time heartburn and slow stomach emptying.',
    whatStudiesFound:
      'Laboratory tests showed extremely strong blockage of a heart-rhythm channel, and regulators later received 341 serious rhythm reports.',
    biggestLimit:
      'Reports cannot reveal the risk per patient because the number of users is unknown.',
    criticalSafety: 'It was withdrawn after dangerous heart rhythms and reported deaths.',
  },
  terfenadine: {
    usedFor: 'Formerly used for hay fever without causing drowsiness.',
    whatStudiesFound:
      'A common antifungal made the drug accumulate and changed heart readings in all six healthy volunteers tested.',
    biggestLimit: 'Other newer allergy medicines did not show the same heart-channel effect.',
    criticalSafety: 'It was withdrawn because interactions could cause dangerous heart rhythms.',
  },
  astemizole: {
    usedFor: 'Formerly used as a once-daily, non-drowsy hay-fever tablet.',
    whatStudiesFound:
      'Laboratory tests showed potent blockage of a heart-rhythm channel, unlike safer allergy medicines in the same comparison.',
    biggestLimit:
      'A reassuring interaction study tested only one dose, not the usual repeated daily use.',
    criticalSafety: 'It was withdrawn because dangerous heart rhythms could last for days.',
  },
  valdecoxib: {
    usedFor: 'Formerly used for arthritis and period pain.',
    whatStudiesFound:
      'Severe skin reactions were reported about 25 times as often as the background rate.',
    biggestLimit:
      'The main heart-risk study involved people just after heart surgery, so its exact risk does not transfer to everyone.',
    criticalSafety: 'It was withdrawn for serious skin and heart-related harm.',
  },
  pergolide: {
    usedFor: 'Formerly added to levodopa treatment for Parkinson’s disease.',
    whatStudiesFound:
      'New heart-valve leakage was about seven times as likely among current pergolide users.',
    biggestLimit: 'The harm varied by valve and cannot be reduced to one class-wide risk number.',
    criticalSafety: 'It was withdrawn because it damaged heart valves.',
  },
  tegaserod: {
    usedFor:
      'Used under restrictions for constipation-predominant irritable bowel syndrome in selected women.',
    whatStudiesFound:
      'Across studies, heart or stroke problems occurred in 13 treated people and one person given a dummy treatment.',
    biggestLimit: 'The events were rare, so the size of any added risk remains very uncertain.',
  },
  efalizumab: {
    usedFor: 'Formerly used as a weekly injection for severe plaque psoriasis.',
    whatStudiesFound:
      'About one quarter of treated people had a major skin improvement, compared with one in twenty given a dummy treatment.',
    biggestLimit:
      'Four fatal brain infections were reported, but the risk per long-term user could not be calculated.',
    criticalSafety: 'It was withdrawn after fatal brain infections.',
  },
  natalizumab: {
    usedFor: 'Used as a monthly infusion for relapsing multiple sclerosis under strict monitoring.',
    whatStudiesFound:
      'Relapses fell by about two thirds, and lasting disability worsened less often over two years.',
    biggestLimit:
      'A negative virus blood test means lower risk of a rare brain infection, not zero risk.',
    criticalSafety: 'It can cause a rare, often fatal brain infection.',
  },
  'aducanumab-avwa': {
    usedFor: 'Formerly approved for early Alzheimer disease based on reduced brain plaque.',
    whatStudiesFound:
      'Brain scans clearly showed less plaque, but two matching symptom studies disagreed.',
    biggestLimit:
      'It was never firmly shown to slow symptoms, and its follow-up study was unfinished.',
  },
  propoxyphene: {
    usedFor: 'Formerly used as an opioid painkiller for mild to moderate pain.',
    whatStudiesFound:
      'Laboratory tests showed its breakdown product could build up a dangerous block in the heart’s electrical system.',
    biggestLimit:
      'Its fatal heart effect came from a breakdown product, not simply from its opioid action.',
    criticalSafety: 'It was withdrawn because of dangerous heart effects.',
  },
  phenylpropanolamine: {
    usedFor: 'Formerly sold as a decongestant and non-prescription diet pill.',
    whatStudiesFound:
      'A case-control study linked diet-pill use in women with bleeding in the brain.',
    biggestLimit: 'The estimated risk ranged from a modest increase to an extremely large one.',
    criticalSafety: 'It was removed from the United States market because of stroke risk.',
  },
  ranitidine: {
    usedFor: 'Formerly used for heartburn and ulcers.',
    whatStudiesFound:
      'Ranitidine can break down inside its container into a probable cancer-causing chemical, especially after crystal damage during manufacturing.',
    biggestLimit:
      'Some early tests created extra contamination by heating the samples, so headline numbers are not directly comparable.',
    criticalSafety: 'It was withdrawn worldwide because of contamination that increases over time.',
  },
  rosiglitazone: {
    usedFor: 'Used to lower blood sugar in type 2 diabetes.',
    whatStudiesFound:
      'A review of 42 studies found a concerning rise in heart attacks, but the size of that rise was uncertain.',
    biggestLimit:
      'A later overall heart-safety study could not settle the heart-attack question specifically.',
    criticalSafety: 'It also increases heart-failure admission and fractures in women.',
  },
  lorcaserin: {
    usedFor: 'Formerly used as a twice-daily weight-loss tablet.',
    whatStudiesFound:
      'About four in ten people lost at least 5% of body weight, compared with fewer than two in ten given a dummy treatment.',
    biggestLimit:
      'A small cancer imbalance was uncertain but serious enough for regulators to request withdrawal.',
    criticalSafety: 'It was withdrawn in the United States because of a possible cancer risk.',
  },
  'hydroxyprogesterone-caproate': {
    usedFor: 'Formerly used during pregnancy to prevent another premature birth.',
    whatStudiesFound:
      'An early small study suggested fewer premature births, but a later study of 1,708 women found no benefit.',
    biggestLimit: 'The larger follow-up study failed to confirm the result that led to approval.',
    criticalSafety: 'United States approval was withdrawn in 2023.',
  },
  clioquinol: {
    usedFor: 'Formerly taken for diarrhoea and amoebic dysentery.',
    whatStudiesFound:
      'Doctors linked it to a distinctive injury causing rising numbness, weakness and sometimes loss of vision.',
    biggestLimit:
      'The exact biological cause of the nerve injury was still being studied decades later.',
    criticalSafety: 'Its oral use was banned in Japan after a large nerve-disease outbreak.',
  },
  benfluorex: {
    usedFor: 'Formerly sold in France for blood fats and weight in diabetes.',
    whatStudiesFound:
      'Among 27 people with unexplained heart-valve leakage, 19 had taken benfluorex, compared with 3 of 54 controls.',
    biggestLimit:
      'It was licensed for blood fats but was chemically and practically used as an appetite suppressant.',
    criticalSafety: 'It was withdrawn because it damaged heart valves.',
  },
  rapacuronium: {
    usedFor: 'Formerly used during anaesthesia to relax muscles for placement of a breathing tube.',
    whatStudiesFound:
      'Laboratory studies showed it removed a nerve brake on airway tightening at the amounts patients received.',
    biggestLimit: 'The airway reaction was neither an allergy nor a histamine reaction.',
    criticalSafety: 'It was withdrawn after fatal airway tightening.',
  },
  alosetron: {
    usedFor:
      'Used under strict restrictions for severe diarrhoea-predominant irritable bowel syndrome in women.',
    whatStudiesFound:
      'Across studies, bowel injury from reduced blood flow occurred in about 1.5 per 1,000 treated people and none given a dummy treatment.',
    biggestLimit:
      'Researchers do not know whether the drug or the severe constipation it causes cuts blood flow.',
  },
  isotretinoin: {
    usedFor: 'Used for severe acne under strict pregnancy-prevention controls.',
    whatStudiesFound:
      'In 154 exposed pregnancies, 21 babies had a distinctive pattern of major birth defects.',
    biggestLimit:
      'Average studies found no rise in depression, but cannot rule out rare severe reactions in individuals.',
    criticalSafety: 'Pregnancy exposure can cause severe birth defects.',
  },
  clozapine: {
    usedFor: 'Used for schizophrenia after other antipsychotics fail, and to reduce suicide risk.',
    whatStudiesFound:
      'Among people who had repeatedly not improved, 30% responded to clozapine and 4% to chlorpromazine.',
    biggestLimit:
      'Blood monitoring addresses one danger but not heart inflammation, pneumonia or severe constipation.',
  },
  thioridazine: {
    usedFor: 'Formerly used as an antipsychotic and now largely withdrawn.',
    whatStudiesFound:
      'It was one of the strongest predictors of a dangerously prolonged heart reading among 495 psychiatric patients.',
    biggestLimit: 'The abnormal reading predicts risk but is not itself a dangerous rhythm.',
    criticalSafety: 'It was restricted and largely withdrawn because of heart-rhythm risk.',
  },
  droperidol: {
    usedFor: 'Used by injection for severe nausea, agitation or migraine.',
    whatStudiesFound:
      'One dangerous rhythm occurred among more than 16,000 emergency-department doses, in a person with several other risks.',
    biggestLimit:
      'Evidence from one small emergency dose cannot settle the risk of larger psychiatric doses.',
  },
  levofloxacin: {
    usedFor: 'Used for certain serious bacterial infections and exposure to anthrax or plague.',
    whatStudiesFound:
      'A five-day high-dose course cured pneumonia about as often as a standard ten-day course.',
    biggestLimit:
      'Serious side effects mean it should be reserved when safer antibiotics are unsuitable for common infections.',
  },
  sulfamethoxazole: {
    usedFor:
      'Used with trimethoprim for certain bacterial infections and a pneumonia in people with weak immunity.',
    whatStudiesFound:
      'Preventive treatment cut that pneumonia by 91% in people with weakened immune systems.',
    biggestLimit: 'Deaths from all causes did not clearly fall.',
  },
  acyclovir: {
    usedFor: 'Used for shingles, genital herpes, chickenpox and severe herpes infections.',
    whatStudiesFound:
      'For herpes infection of the brain, deaths fell from 54% with the older treatment to 28% with acyclovir.',
    biggestLimit: 'It did not clearly prevent long-lasting pain after shingles.',
  },
  methotrexate: {
    usedFor: 'Used for rheumatoid arthritis, severe psoriasis and some cancers.',
    whatStudiesFound:
      'For rheumatoid arthritis, adding two cheap tablets worked about as well as adding an expensive injected medicine.',
    biggestLimit: 'Its exact anti-inflammatory action in arthritis remains unknown.',
  },
  hydroxychloroquine: {
    usedFor: 'Used for lupus, rheumatoid arthritis and malaria in places where it still works.',
    whatStudiesFound:
      'In stable lupus, stopping hydroxychloroquine made disease flare about two and a half times as often.',
    biggestLimit: 'Its exact action in lupus is not fully known.',
    criticalSafety:
      'Long-term use can permanently damage the light-sensitive tissue at the back of the eye.',
  },
  tamoxifen: {
    usedFor: 'Used to treat or prevent breast cancer that grows in response to oestrogen.',
    whatStudiesFound:
      'Five years of treatment roughly halved early recurrence and cut breast-cancer deaths by about one third.',
    biggestLimit:
      'For healthy high-risk women, studies show fewer cancers, not fewer breast-cancer deaths.',
  },
  cefdinir: {
    usedFor: 'Used for certain childhood ear, throat, chest, sinus and skin infections.',
    whatStudiesFound:
      'It cleared strep throat bacteria more often than penicillin in children, but has not been shown to prevent rheumatic fever.',
    biggestLimit:
      'For common chest bacteria, its label covers only strains that cheaper penicillin already treats.',
  },
  'penicillin-v': {
    usedFor: 'Used for strep throat and to prevent rheumatic fever from returning.',
    whatStudiesFound:
      'Across older studies, antibiotics cut rheumatic fever after a sore throat by about two thirds.',
    biggestLimit: 'Most evidence came from the 1950s, when rheumatic fever was far more common.',
  },
  simvastatin: {
    usedFor: 'Used to lower cholesterol and prevent heart attacks or strokes.',
    whatStudiesFound:
      'Among 4,444 people with heart disease, deaths fell from 12 in 100 to 8 in 100 over five and a half years.',
    biggestLimit:
      'The highest dose caused far more muscle injury without clearly preventing more events.',
  },
  pravastatin: {
    usedFor: 'Used to lower cholesterol and prevent heart attacks, strokes or heart-related death.',
    whatStudiesFound:
      'Among 9,014 people with prior heart problems, deaths fell from 14% to 11% over six years.',
    biggestLimit: 'A separate large study against usual care found no survival benefit.',
  },
  lovastatin: {
    usedFor: 'Used to lower cholesterol and prevent a first heart attack in selected people.',
    whatStudiesFound:
      'First major heart-related problems fell from 5.5% to 3.5% over about five years.',
    biggestLimit: 'The study did not show fewer deaths.',
  },
  fluvastatin: {
    usedFor:
      'Used to lower cholesterol and reduce repeat artery-opening procedures after coronary disease.',
    whatStudiesFound:
      'After a first artery-opening procedure, major heart-related problems fell from 26.7% to 21.4% over four years.',
    biggestLimit: 'It has not been shown to prevent heart attacks or extend life.',
  },
  pitavastatin: {
    usedFor: 'Used to lower high cholesterol.',
    whatStudiesFound:
      'Among nearly 8,000 people with HIV, major heart-related problems fell by about one third.',
    biggestLimit:
      'That heart-protection result is not yet reflected in the United States approved use.',
  },
  digoxin: {
    usedFor: 'Used for heart-failure symptoms and to slow some fast irregular heartbeats.',
    whatStudiesFound:
      'It reduced heart-failure hospital admissions but did not help people live longer.',
    biggestLimit:
      'The useful dose range is narrow, and kidney function, age and body chemistry can change it.',
  },
  'isosorbide-dinitrate': {
    usedFor: 'Used to prevent chest pain caused by narrowed heart arteries.',
    whatStudiesFound:
      'Continuous nitrate treatment loses effect quickly, so labels advise a daily medicine-free interval.',
    biggestLimit:
      'A survival benefit was shown only when combined with hydralazine, not with this medicine alone.',
  },
  nitroglycerin: {
    usedFor: 'Used to stop or prevent expected chest pain from narrowed heart arteries.',
    whatStudiesFound: 'It reliably relieves an angina attack within minutes.',
    biggestLimit:
      'Large studies after heart attacks found no survival benefit from routine continuous use.',
  },
  clonidine: {
    usedFor:
      'Used for high blood pressure and, in another form, attention deficit hyperactivity disorder.',
    whatStudiesFound:
      'Before surgery, clonidine did not prevent death or heart attack and caused substantially more low blood pressure.',
    biggestLimit: 'No controlled study has shown that it prevents strokes or heart attacks.',
  },
  hydralazine: {
    usedFor: 'Used for high blood pressure and, with another medicine, heart failure.',
    whatStudiesFound:
      'Combined with a nitrate in advanced heart failure, deaths fell from about 10% to about 6%.',
    biggestLimit:
      'Its precise action remains unclear, and the survival result applies to the combination.',
  },
  albuterol: {
    usedFor: 'Used as a rescue inhaler for sudden wheeze and chest tightness.',
    whatStudiesFound:
      'Among people whose lungs responded, breathing improved within about six minutes and the effect lasted roughly four hours.',
    biggestLimit:
      'Frequent rescue-inhaler use marks dangerous asthma, but studies cannot show how much the inhaler itself contributes.',
  },
  montelukast: {
    usedFor: 'Used daily to prevent asthma symptoms and, when other options fail, hay fever.',
    whatStudiesFound:
      'In the approval study, lung function improved 13%, compared with 4% after a dummy treatment.',
    biggestLimit: 'For hay fever, other allergy medicines worked better in direct studies.',
    criticalSafety:
      'The label warns about serious mood and behaviour changes, including suicidal thoughts.',
  },
  cetirizine: {
    usedFor: 'Used for hay fever, allergic itching and long-running hives.',
    whatStudiesFound:
      'For long-running hives, complete clearing occurred about 2.7 times as often as with a dummy treatment.',
    biggestLimit: 'Despite “non-drowsy” marketing, its package warns that drowsiness may occur.',
  },
  prednisone: {
    usedFor:
      'Used for short treatment of asthma attacks, severe allergy or inflammatory flare-ups.',
    whatStudiesFound:
      'After an asthma attack, a short course more than halved the chance of returning for care.',
    biggestLimit: 'Many older approved uses have little modern controlled evidence.',
    criticalSafety: 'Even short courses are linked to infection, blood clots and fractures.',
  },
  levalbuterol: {
    usedFor: 'Used as a rescue inhaler for wheeze and chest tightness.',
    whatStudiesFound:
      'Across seven studies, levalbuterol did not improve breathing more than ordinary albuterol.',
    biggestLimit: 'Its proposed advantage over ordinary albuterol has not been demonstrated.',
  },
  chlorpheniramine: {
    usedFor: 'Used for sneezing, runny nose and itchy eyes caused by allergy.',
    whatStudiesFound:
      'A standard dose occupied more than half of tested brain histamine receptors, explaining why it causes drowsiness.',
    biggestLimit: 'It reached the market before modern effectiveness studies were required.',
  },
  hydroxyzine: {
    usedFor: 'Used for allergic itching, anxiety and sedation before anaesthesia.',
    whatStudiesFound:
      'Across five studies, hydroxyzine helped anxiety more than a dummy tablet and about as much as two alternatives.',
    biggestLimit:
      'The studies were few and poorly conducted, and controlled evidence beyond four months is absent.',
    criticalSafety: 'It can dangerously prolong the heart’s electrical reset time.',
  },
  zileuton: {
    usedFor: 'Used for long-term asthma control when easier options are unsuitable.',
    whatStudiesFound:
      'Steroid-requiring asthma attacks fell from about 16 in 100 people to 6 in 100 over three months.',
    biggestLimit: 'The medicine requires liver monitoring and four tablets a day.',
  },
  acetylcysteine: {
    usedFor: 'Used as the antidote for paracetamol overdose and to loosen thick mucus.',
    whatStudiesFound:
      'Liver injury occurred in 6% treated within ten hours and 26% treated between ten and 24 hours.',
    biggestLimit:
      'The overdose evidence used older untreated rates because withholding the antidote later became unethical.',
  },
  epinephrine: {
    usedFor: 'Used immediately for a severe allergic reaction.',
    whatStudiesFound:
      'It is the only medicine known to reverse both airway blockage and circulatory collapse during a severe allergic reaction.',
    biggestLimit:
      'No controlled study with an untreated group exists because withholding emergency treatment would be unethical.',
    practicalNote: 'Inject into the outer thigh and seek emergency help.',
  },
  fluoxetine: {
    usedFor: 'Used for depression, obsessive-compulsive disorder, bulimia and panic disorder.',
    whatStudiesFound:
      'Among teenagers with depression, 61% responded to fluoxetine and 35% to a dummy pill over 12 weeks.',
    biggestLimit: 'Its exact action in depression remains unknown.',
    criticalSafety:
      'In younger people, antidepressants can increase suicidal thoughts or behaviour.',
  },
  citalopram: {
    usedFor: 'Used for depression.',
    whatStudiesFound:
      'In a large real-world study, depression improved enough to meet the study’s recovery cutoff in 28% of 2,876 people.',
    biggestLimit:
      'The average final dose in that study now exceeds the allowed maximum for many patients.',
    criticalSafety: 'Higher doses can dangerously alter the heart’s electrical timing.',
  },
  paroxetine: {
    usedFor: 'Used for depression and several anxiety disorders.',
    whatStudiesFound:
      'Large comparisons support benefit in adults, but three studies in adolescents did not show that it worked.',
    biggestLimit:
      'It strongly blocks activation of tamoxifen and was linked to more breast-cancer deaths when the medicines overlapped.',
  },
  venlafaxine: {
    usedFor: 'Used for depression and, in an extended-release form, several anxiety disorders.',
    whatStudiesFound:
      'A drug-company analysis reported recovery in 45% on venlafaxine, 35% on other antidepressants and 25% on a dummy pill.',
    biggestLimit:
      'That claimed advantage drew several published critiques and is not firmly settled.',
    criticalSafety: 'Sustained high blood pressure becomes more common as the dose rises.',
  },
  duloxetine: {
    usedFor: 'Used for depression, anxiety and several forms of nerve or long-term pain.',
    whatStudiesFound:
      'Across depression studies, scores improved about two to five points more than with a dummy treatment on a 17-item scale.',
    biggestLimit: 'Several studies in fibromyalgia, back pain or arthritis did not show benefit.',
  },
  trazodone: {
    usedFor: 'Approved for depression and commonly used without approval as a sleep aid.',
    whatStudiesFound:
      'In a large antidepressant comparison, trazodone was among the least effective and among those people stopped most often.',
    biggestLimit:
      'Sleep guidelines advise against it because direct evidence for insomnia is weak.',
  },
  mirtazapine: {
    usedFor: 'Used for depression and often chosen when sleep or appetite is also a concern.',
    whatStudiesFound:
      'Drowsiness affected 54% versus 18% with a dummy pill, and substantial weight gain affected 7.5% versus none.',
    biggestLimit:
      'Those are side effects, not proof that it treats insomnia or illness-related appetite loss.',
  },
  amitriptyline: {
    usedFor:
      'Approved for depression and commonly used at lower doses for nerve pain or migraine prevention.',
    whatStudiesFound:
      'It had the largest average depression benefit among 21 antidepressants, but also one of the highest dropout rates.',
    biggestLimit: 'For nerve pain, reviewers found no high-quality evidence despite common use.',
  },
  nortriptyline: {
    usedFor:
      'Approved for depression and also used for nerve pain, migraine prevention or help stopping smoking.',
    whatStudiesFound:
      'Evidence for nerve pain was very weak, while separate studies found it roughly doubled smoking quit rates.',
    biggestLimit:
      'Its recommended blood-level range comes from one 1971 study of only 29 hospital patients.',
  },
  buspirone: {
    usedFor: 'Used for anxiety.',
    whatStudiesFound:
      'Across 36 studies, treating about four to five people produced one extra person who improved.',
    biggestLimit:
      'Controlled studies have not shown that benefit continues beyond three to four weeks.',
  },
  oxycodone: {
    usedFor: 'Used for severe pain when non-opioid treatments are inadequate.',
    whatStudiesFound:
      'Over 12 months, an opioid strategy did not improve pain-related function more than non-opioid medicines.',
    biggestLimit:
      'The famous claim that addiction is rare came from a short letter about hospital inpatients, not long-term users.',
  },
  morphine: {
    usedFor: 'Used for severe pain, including cancer pain.',
    whatStudiesFound:
      'Where individual results were reported, 96% of people with cancer pain reached pain no worse than mild.',
    biggestLimit:
      'Reviewers judged the controlled evidence surprisingly small and generally poor for such an important medicine.',
  },
  hydrocodone: {
    usedFor: 'Used for severe pain, often combined with paracetamol.',
    whatStudiesFound:
      'For acute limb pain, hydrocodone with paracetamol did not work better than ibuprofen with paracetamol.',
    biggestLimit:
      'Its stronger breakdown product forms only a small share in blood, so codeine-like explanations are misleading.',
    criticalSafety: 'Combination tablets can cause liver failure if too much paracetamol is taken.',
  },
  codeine: {
    usedFor: 'Used for mild to moderate pain when non-opioid treatments are inadequate.',
    whatStudiesFound:
      'After surgery, 26% had pain cut at least in half, compared with 17% given a dummy treatment.',
    biggestLimit:
      'People convert codeine to morphine at very different rates, which makes benefit and danger unpredictable.',
    criticalSafety: 'Some children who converted it unusually fast died after tonsil surgery.',
  },
  hydromorphone: {
    usedFor: 'Used for severe pain requiring an opioid.',
    whatStudiesFound:
      'Across eight cancer-pain studies, it did not clearly differ from morphine, oxycodone or fentanyl in pain or side effects.',
    biggestLimit:
      'Reviewers rated every comparison at high risk of bias and the evidence very uncertain.',
  },
  methadone: {
    usedFor: 'Used for opioid dependence and, separately, severe long-term pain.',
    whatStudiesFound:
      'Across 11 controlled studies, methadone kept more people in treatment and reduced heroin use.',
    biggestLimit:
      'Lower death rates seen in health records may partly reflect differences between people in and out of treatment.',
    criticalSafety:
      'Its long and unpredictable duration can cause delayed overdose and dangerous heart rhythms.',
  },
  tapentadol: {
    usedFor:
      'Used for severe pain, including diabetic nerve pain, when other options are inadequate.',
    whatStudiesFound:
      'Across four studies, pain improved only 0.56 points more than with a dummy treatment on an 11-point scale.',
    biggestLimit:
      'Its claimed two-part action comes mainly from early laboratory evidence, and the clinical importance is unclear.',
  },
  oxymorphone: {
    usedFor: 'Formerly used for severe long-term pain.',
    whatStudiesFound:
      'A crush-resistant version shifted misuse toward injection and was linked to an outbreak that infected 181 people with HIV.',
    biggestLimit: 'The reformulation changed the route of misuse rather than preventing it.',
    criticalSafety: 'It was withdrawn because public-health harms outweighed its benefits.',
  },
  naloxone: {
    usedFor: 'Used in an emergency to reverse opioid overdose and restore breathing.',
    whatStudiesFound:
      'More than 90% of untrained people correctly used the nasal device in a usability study.',
    biggestLimit:
      'The nasal product was not tested against no treatment during real overdoses because doing so would be unethical.',
    practicalNote:
      'Breathing can stop again after naloxone fades, so emergency monitoring is essential.',
  },
  ibuprofen: {
    usedFor: 'Used for pain, fever and inflammation.',
    whatStudiesFound:
      'After surgery, 52% had pain cut at least in half after one 400 mg dose, compared with 7% given a dummy treatment.',
    biggestLimit:
      'High arthritis doses more than doubled major heart problems and nearly quadrupled serious stomach bleeding.',
  },
  naproxen: {
    usedFor: 'Used for pain, fever and inflammation when a longer effect is useful.',
    whatStudiesFound:
      'One analysis combining many studies found no clear rise in major artery problems, but that does not prove heart safety.',
    biggestLimit:
      'Regulators concluded that evidence does not support calling naproxen heart-safe.',
  },
  acetaminophen: {
    usedFor: 'Used for pain and fever.',
    whatStudiesFound:
      'It did not speed recovery from acute low-back pain and produced only a tiny average improvement in arthritis pain.',
    biggestLimit: 'Its exact pain-relieving action remains unknown.',
    criticalSafety: 'Paracetamol overdose is a leading cause of sudden liver failure.',
  },
  aspirin: {
    usedFor: 'Used for pain or fever and, at low dose, to prevent repeat artery clots.',
    whatStudiesFound:
      'After a heart attack or stroke, serious artery problems fell from 8.2% a year to 6.7%.',
    biggestLimit:
      'For healthy people, any heart benefit is offset by bleeding and has not improved survival.',
  },
  diclofenac: {
    usedFor: 'Used for arthritis pain and inflammation.',
    whatStudiesFound:
      'It ranked among the most effective arthritis painkillers, but major artery problems rose by about 41% in controlled studies.',
    biggestLimit:
      'Topical gel produces much lower blood levels, but no study has tested whether it prevents heart or stomach harm.',
  },
  celecoxib: {
    usedFor: 'Used for arthritis pain and inflammation, with less stomach damage at usual doses.',
    whatStudiesFound:
      'At an average 209 mg daily, it was no worse for heart events and caused fewer stomach and kidney problems than two alternatives.',
    biggestLimit: 'Much higher doses tripled heart-related problems, so safety depends on dose.',
  },
  meloxicam: {
    usedFor: 'Used once daily for arthritis pain and inflammation.',
    whatStudiesFound:
      'Health-record studies linked meloxicam with about 25% higher heart-attack risk and substantial stomach harm.',
    biggestLimit:
      'Its label does not support the common claim that it is gentler or selectively safer.',
  },
  indomethacin: {
    usedFor: 'Used for severe arthritis, gout attacks and inflamed shoulders.',
    whatStudiesFound:
      'Its label records unusually broad brain, eye, stomach and heart warnings and says it is not for long-term treatment.',
    biggestLimit:
      'Suppositories caused similar upper-stomach side effects and more lower-gut side effects than capsules.',
  },
  ketorolac: {
    usedFor: 'Used for severe short-term pain, usually after surgery or in hospital.',
    whatStudiesFound:
      'In 240 emergency patients, 10 mg, 15 mg and 30 mg injections relieved pain equally.',
    biggestLimit: 'Claims that it is as powerful as morphine overstate what its label says.',
    criticalSafety:
      'Use is limited to five days because stomach, kidney and bleeding risks rise sharply.',
  },
  tramadol: {
    usedFor: 'Used as an opioid for moderate to severe pain.',
    whatStudiesFound:
      'Across arthritis studies, only about four extra people in every 100 had meaningful pain improvement.',
    biggestLimit:
      'People convert it into a much stronger substance at very different rates, making effects unpredictable.',
    criticalSafety: 'Children who converted it unusually fast have died.',
  },
  oxymetazoline: {
    usedFor:
      'Used briefly for a blocked nose and, in other products, facial redness or a drooping eyelid.',
    whatStudiesFound:
      'After one month of nasal use, healthy volunteers developed thicker, more reactive nasal linings.',
    biggestLimit:
      'The three-day use limit is a safety margin, not a directly measured rebound threshold.',
  },
  mepolizumab: {
    usedFor: 'Used for severe asthma driven by high levels of a certain white blood cell.',
    whatStudiesFound:
      'In 576 people with severe asthma, attacks fell by about half and emergency visits or admissions by 61%.',
    biggestLimit:
      'The average asthma-control improvement was smaller than the study’s own threshold for something patients notice.',
  },
  benralizumab: {
    usedFor: 'Used for severe asthma driven by high levels of a certain white blood cell.',
    whatStudiesFound:
      'Two matching studies found asthma attacks fell by 51% in one and 28% in the other.',
    biggestLimit: 'Three studies found no clear benefit for chronic obstructive lung disease.',
  },
  reslizumab: {
    usedFor: 'Used for severe asthma in adults with high levels of a certain white blood cell.',
    whatStudiesFound: 'Two year-long studies found asthma attacks fell by about one half.',
    biggestLimit:
      'It did not improve lung function in people who were not selected using that blood count.',
    criticalSafety: 'The label warns about life-threatening allergic reactions.',
  },
  zafirlukast: {
    usedFor: 'Used every day to prevent asthma symptoms.',
    whatStudiesFound:
      'In a direct study, a low-dose steroid inhaler improved breathing and symptom-free days about twice as much.',
    biggestLimit: 'It can strongly increase warfarin levels, an easy-to-miss medicine interaction.',
    criticalSafety: 'The label warns about severe liver injury, transplant and death.',
  },
  nedocromil: {
    usedFor: 'Formerly used to prevent asthma and treat itchy allergic eyes.',
    whatStudiesFound:
      'Over four to six years, it did not improve the main breathing result but reduced urgent visits and steroid courses.',
    biggestLimit: 'Its commonly repeated biological explanation remains an unconfirmed hypothesis.',
    practicalNote:
      'It left the United States market because of its propellant, not because of harm.',
  },
  omalizumab: {
    usedFor:
      'Used for allergic asthma, nasal polyps, chronic hives and accidental food-allergy reactions.',
    whatStudiesFound:
      'In asthma, attacks fell from 26 in 100 people to 16 in 100 and hospital admissions from 3 to 0.5.',
    biggestLimit:
      'Asthma dosing excludes people whose allergy-test level is above the medicine’s fixed grid.',
    criticalSafety: 'A severe allergic reaction can occur after the first dose or after a year.',
  },
  tezepelumab: {
    usedFor: 'Used for severe asthma without requiring a specific blood-test result.',
    whatStudiesFound: 'In 1,061 people, yearly asthma attacks fell from 2.10 to 0.93 on average.',
    biggestLimit:
      'It did not clearly reduce steroid need, and benefit without high white-cell counts is less certain than marketing suggests.',
  },
  ciclesonide: {
    usedFor: 'Used every day to prevent asthma and treat nasal allergy symptoms.',
    whatStudiesFound:
      'In 691 people, twice-daily treatment improved the amount of air blown out by about 0.24 litres.',
    biggestLimit:
      'Once-daily use worked about half as well, despite having the same total daily dose.',
  },
  olodaterol: {
    usedFor: 'Used once daily to hold airways open in long-term obstructive lung disease.',
    whatStudiesFound:
      'Approval studies showed improved breathing-test numbers across 3,533 people.',
    biggestLimit: 'Those studies did not measure flare-ups, hospital admissions or deaths.',
    criticalSafety: 'It must not be used to treat asthma.',
  },
  ondansetron: {
    usedFor: 'Used to prevent nausea and vomiting after chemotherapy, radiotherapy or surgery.',
    whatStudiesFound:
      'Before one chemotherapy regimen, 70% given ondansetron did not vomit and everyone given a dummy injection did.',
    biggestLimit:
      'For the hardest chemotherapy, approval studies used earlier patients rather than a simultaneous untreated group.',
  },
  metoclopramide: {
    usedFor: 'Used for slow stomach emptying and short-term treatment of some nausea or reflux.',
    whatStudiesFound:
      'For diabetic slow stomach emptying, a nasal form did not improve symptoms overall, although women improved and men did not.',
    biggestLimit:
      'For unexplained nausea in emergency care, it relieved symptoms no better than salt water.',
    criticalSafety: 'Long use can cause an irreversible movement disorder.',
  },
  prochlorperazine: {
    usedFor: 'Used for severe nausea and vomiting and, separately, schizophrenia.',
    whatStudiesFound:
      'Nearly half of people given one dose into a vein developed intense restlessness, compared with none in the control group.',
    biggestLimit: 'Its nausea use was approved before modern proof of effectiveness was required.',
  },
  aprepitant: {
    usedFor: 'Used to prevent nausea and vomiting caused by chemotherapy or surgery.',
    whatStudiesFound:
      'Adding aprepitant raised the share who neither vomited nor needed rescue medicine from about one half to about three quarters.',
    biggestLimit:
      'It prevents vomiting but has not been studied to stop symptoms already underway.',
  },
  bisacodyl: {
    usedFor: 'Used for occasional constipation.',
    whatStudiesFound:
      'Over four weeks, complete bowel movements rose from about one to five weekly, compared with about two after a dummy treatment.',
    biggestLimit: 'The four-week study lasted far longer than the one week allowed by its label.',
  },
  'docusate-sodium': {
    usedFor: 'Sold as a stool softener for occasional constipation.',
    whatStudiesFound:
      'It barely changed stool water and added no benefit to senna in a small hospice study.',
    biggestLimit: 'The claimed stool-softening action has never been demonstrated inside a person.',
  },
  lactulose: {
    usedFor: 'Used for chronic constipation and confusion caused by advanced liver disease.',
    whatStudiesFound:
      'After an earlier confusion episode, another occurred in 20% taking lactulose and 47% receiving no treatment.',
    biggestLimit: 'The difference in deaths was too uncertain to establish a survival benefit.',
  },
  dicyclomine: {
    usedFor: 'Used for cramping and spasm in irritable bowel syndrome.',
    whatStudiesFound:
      'At a high daily dose, 82% had a favourable response compared with 55% given a dummy treatment.',
    biggestLimit:
      'Side effects forced many people to lower the dose, and the lower dose has no effectiveness data.',
  },
  simethicone: {
    usedFor: 'Used for bloating, pressure and fullness commonly called gas.',
    whatStudiesFound:
      'For diarrhoea with gas pain, the combination with loperamide worked better than either medicine alone.',
    biggestLimit: 'Studies have not shown that simethicone changes the amount of gas.',
  },
  linaclotide: {
    usedFor: 'Used for long-term constipation, including constipation with abdominal pain.',
    whatStudiesFound:
      'In one study, complete bowel-movement relief occurred in 20% with linaclotide and 3% with a dummy treatment.',
    biggestLimit:
      'Diarrhoea affected 20%, and no direct study has compared it with much cheaper laxatives.',
  },
  tretinoin: {
    usedFor: 'Applied to treat acne or soften fine facial lines caused by sun damage.',
    whatStudiesFound:
      'All 30 people who finished one sun-damage study improved on the treated arm and not on the plain-cream arm.',
    biggestLimit: 'Its label says it does not reverse ageing or repair sun-damaged skin.',
  },
  adapalene: {
    usedFor: 'Applied to treat acne.',
    whatStudiesFound:
      'After 12 weeks, 21% were clear or almost clear with the stronger gel and 9% with plain gel.',
    biggestLimit: 'Four in five people were still not clear after 12 weeks.',
  },
  'benzoyl-peroxide': {
    usedFor: 'Applied to treat acne and some rosacea bumps.',
    whatStudiesFound:
      'Across six studies, clinicians rated acne as improved more often than with a dummy treatment.',
    biggestLimit:
      'Reviewers rated the evidence very uncertain, and patients’ own ratings did not clearly improve.',
    criticalSafety: 'Some products can form benzene during warm storage.',
  },
  clindamycin: {
    usedFor: 'Applied for acne or given internally for serious bacterial infections.',
    whatStudiesFound:
      'A three-medicine acne gel worked better than each two-medicine combination and a plain gel.',
    biggestLimit:
      'Clindamycin alone worked about as well as benzoyl peroxide while sharply increasing resistant skin bacteria.',
  },
  calcipotriene: {
    usedFor: 'Applied to treat raised, red, scaly patches of plaque psoriasis.',
    whatStudiesFound:
      'Across a large review, vitamin D creams improved body psoriasis more than a plain cream.',
    biggestLimit: 'Strong steroid creams worked better on the scalp and caused less irritation.',
  },
  terbinafine: {
    usedFor: 'Used for fungal nail infection, athlete’s foot and ringworm.',
    whatStudiesFound:
      'Across eight high-quality studies, clinical cure was six times as likely as with a dummy treatment.',
    biggestLimit:
      'Good evidence on preventing nail-infection recurrence comes from only 35 people.',
  },
  ketoconazole: {
    usedFor: 'Applied for dandruff, seborrhoeic dermatitis and some fungal skin patches.',
    whatStudiesFound:
      'Across eight studies, unresolved rash was about one third less common than with a dummy shampoo.',
    biggestLimit:
      'Evidence quality was low, studies disagreed, and none measured whether patients felt better.',
  },
  permethrin: {
    usedFor: 'Applied to treat scabies or head lice.',
    whatStudiesFound:
      'For scabies, it cleared people faster than ivermectin at one week, but both exceeded 85% clearance by four weeks.',
    biggestLimit: 'Most studies came from a few regions, and resistance has increased over time.',
  },
  mupirocin: {
    usedFor:
      'Applied for impetigo, small infected wounds or clearing staph from the nose before surgery.',
    whatStudiesFound:
      'Testing and treating only staph carriers before surgery cut infections from 7.7% to 3.4%.',
    biggestLimit:
      'The key study had no resistant strains, a condition that no longer holds in many places.',
  },
  latanoprost: {
    usedFor: 'Used to lower pressure inside the eye and protect against glaucoma damage.',
    whatStudiesFound:
      'In 516 people, latanoprost delayed worsening of blind spots over two years compared with a dummy drop.',
    biggestLimit: 'Studies have not directly counted how many people avoid blindness.',
    criticalSafety: 'It can permanently darken the coloured part of the eye.',
  },
  timolol: {
    usedFor: 'Used to lower pressure inside the eye.',
    whatStudiesFound: 'Across 114 studies, pressure fell by about 3.7 points after three months.',
    biggestLimit:
      'Pressure lowering has not been directly tied to fewer cases of blindness for this drop.',
    criticalSafety: 'Enough can enter the body to cause serious heart or breathing problems.',
  },
  dorzolamide: {
    usedFor: 'Used to lower pressure inside the eye.',
    whatStudiesFound: 'Across 114 studies, pressure fell by about 2.5 points after three months.',
    biggestLimit:
      'Claims that it protects the eye nerve beyond lowering pressure have not been demonstrated.',
    criticalSafety: 'Rare corneal damage has required transplant.',
  },
  brinzolamide: {
    usedFor: 'Used to lower pressure inside the eye.',
    whatStudiesFound:
      'It lowered pressure about as much as dorzolamide and caused far less burning when applied.',
    biggestLimit:
      'Greater comfort was shown, but better long-term use and preserved vision were not.',
  },
  bimatoprost: {
    usedFor: 'Used to lower eye pressure and, in another product, grow eyelashes.',
    whatStudiesFound:
      'Across 114 studies, bimatoprost lowered eye pressure more than any other single drop.',
    biggestLimit:
      'Direct evidence that pressure lowering preserves vision comes from a different medicine.',
  },
  travoprost: {
    usedFor: 'Used to lower pressure inside the eye and protect against glaucoma damage.',
    whatStudiesFound:
      'It lowered eye pressure by about 4.8 points, essentially the same as latanoprost.',
    biggestLimit:
      'A greater response reported in Black patients remains unexplained and may instead reflect iris colour.',
  },
  ranibizumab: {
    usedFor: 'Injected into the eye for leaking blood vessels at the back of the eye.',
    whatStudiesFound:
      'Nineteen in 20 treated people kept most of their vision, compared with about six in 10 given dummy injections.',
    biggestLimit:
      'The success definition still allowed a large 14-letter loss, and a far cheaper medicine worked as well.',
  },
} as const satisfies Readonly<Record<string, TenSecondAnswerCopy>>
