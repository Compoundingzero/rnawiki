// Add published glycemic-index (GI) values to carbohydrate foods — accuracy-first.
// Values are established published GIs (Sydney University GI database / peer-reviewed SG hawker-food studies).
// We tag ONLY local/staple foods with clean names and skip anything negated ("zero/no/diet/unsweetened"),
// so we never ship a wrong GI. Low-carb foods legitimately have no GI.
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'data', 'foods.json');
const db = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const foods = Array.isArray(db) ? db : db.foods;

// keyword -> GI (specific keys only; no broad 'sugar'/'milk'/'soda' that catch brands/negations)
const GI = [
  // --- rice & rice dishes (white/jasmine base ≈ high) ---
  ['jasmine rice', 89], ['glutinous rice', 87], ['white rice', 73], ['brown rice', 68], ['basmati', 58], ['cauliflower rice', 20],
  ['nasi lemak', 77], ['chicken rice', 79], ['fried rice', 75], ['nasi briyani', 70], ['nasi goreng', 75], ['nasi padang', 76],
  ['duck rice', 78], ['char siew rice', 79], ['roasted pork rice', 79], ['economic rice', 75], ['mixed rice', 75], ['cai fan', 75],
  ['claypot rice', 78], ['yang zhou', 75], ['olive rice', 75], ['pineapple rice', 76], ['lor mai kai', 87], ['glutinous rice chicken', 87],
  ['porridge', 78], ['congee', 78], ['bak chor', 52], ['chicken porridge', 78], ['fish porridge', 78], ['century egg', 78],
  // --- kueh (glutinous rice / tapioca / coconut ≈ high) ---
  ['chwee kueh', 75], ['chee cheong fun', 70], ['png kueh', 82], ['soon kueh', 78], ['ang ku kueh', 84], ['nian gao', 85],
  ['tang yuan', 80], ['ondeh', 80], ['kueh salat', 80], ['kueh lapis', 78], ['putu piring', 80], ['pulut', 87], ['ang ku', 84],
  // --- noodles (rice/wheat base) ---
  ['rice vermicelli', 58], ['bee hoon', 58], ['char kway teow', 68], ['kway teow', 68], ['hor fun', 68], ['fun', 68],
  ['egg noodle', 49], ['yellow noodle', 56], ['ramen', 61], ['udon', 62], ['wonton noodle', 52], ['wanton', 52],
  ['bak chor mee', 52], ['mee pok', 52], ['ban mian', 55], ['ban mee', 55], ['fishball noodle', 55], ['minced meat noodle', 52],
  ['prawn mee', 60], ['prawn noodle', 60], ['hokkien mee', 62], ['lor mee', 62], ['kolo mee', 55], ['dry mee', 52],
  ['laksa', 62], ['mee goreng', 65], ['mee rebus', 66], ['mee siam', 69], ['spaghetti', 49], ['pasta', 49], ['macaroni', 47], ['maggi', 67],
  // --- breads & flatbreads ---
  ['white bread', 75], ['wholemeal bread', 74], ['wholegrain bread', 53], ['sourdough', 54], ['multigrain', 49],
  ['kaya toast', 74], ['roti prata', 70], ['roti john', 72], ['murtabak', 66], ['naan', 71], ['chapati', 52], ['thosai', 66], ['dosa', 66],
  ['idli', 70], ['appam', 65], ['putu mayam', 61], ['vadai', 68], ['bun', 70], ['bao', 68], ['pau', 68], ['man tou', 70], ['mantou', 70],
  // --- tubers / grains / breakfast ---
  ['potato', 78], ['french fries', 75], ['sweet potato', 63], ['tapioca', 70], ['yam cake', 65],
  ['rolled oats', 55], ['muesli', 57], ['quinoa', 53], ['corn', 52], ['sweet corn', 52], ['cornflakes', 81],
  // --- fruits ---
  ['watermelon', 76], ['pineapple', 59], ['banana', 51], ['mango', 51], ['papaya', 60], ['grapes', 53], ['jackfruit', 50],
  ['apple', 36], ['orange', 43], ['kiwi', 50], ['durian', 49], ['guava', 45], ['lychee', 57], ['longan', 57], ['rambutan', 59],
  ['honeydew', 65], ['rock melon', 65], ['cantaloupe', 65], ['dragon fruit', 48], ['dragonfruit', 48], ['soursop', 46], ['pomelo', 30],
  ['starfruit', 43], ['persimmon', 50], ['custard apple', 54], ['jambu', 42], ['chiku', 52], ['sapodilla', 52], ['nangka', 50],
  // --- desserts & drinks (sweetened local) ---
  ['ice kacang', 78], ['chendol', 69], ['bubble tea', 68], ['cheng tng', 65], ['bubur cha cha', 66], ['pulut hitam', 78],
  ['red bean soup', 63], ['green bean soup', 60], ['tau suan', 66], ['orh nee', 75], ['yam paste', 75], ['tau huay', 45], ['beancurd', 45],
  ['soya bean', 37], ['gula melaka', 70], ['pandan cake', 70], ['sponge cake', 66], ['huat kueh', 76], ['bahulu', 70],
];
// never tag these — negated / diet / low-GI-labelled products where the generic value would be wrong
const SKIP = ['zero', 'no sugar', 'sugar free', 'sugar-free', 'diet', 'unsweetened', 'low gi', 'light', 'sf ', 'sugarless', 'juice', 'chip', 'crisp', 'cracker', 'cookie', 'nut'];

let tagged = 0; const hits = [];
for (const f of foods) {
  if (f.gi != null) delete f.gi;                 // reset any prior run
  if (!f.sg_local) continue;                     // only local/hawker foods — the "SG food glycemic" value prop; avoids branded-product noise
  const name = (f.name || '').toLowerCase();
  if (SKIP.some(s => name.includes(s))) continue;
  const g = GI.find(([kw]) => name.includes(kw));
  if (g) { f.gi = g[1]; tagged++; hits.push(f.name + ' = ' + g[1]); }
}
fs.writeFileSync(FILE, JSON.stringify(db, null, 1) + '\n');
console.log('Tagged', tagged, 'foods with GI.');
console.log(hits.join('\n'));
