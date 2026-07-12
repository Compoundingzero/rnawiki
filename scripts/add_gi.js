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
  ['jasmine rice', 89], ['glutinous rice', 87], ['white rice', 73], ['brown rice', 68], ['basmati', 58],
  ['nasi lemak', 77], ['chicken rice', 79], ['fried rice', 75], ['nasi briyani', 70], ['nasi goreng', 75],
  ['porridge', 78], ['congee', 78], ['chwee kueh', 75], ['chee cheong fun', 70],
  ['rice vermicelli', 58], ['bee hoon', 58], ['char kway teow', 68], ['kway teow', 68], ['hor fun', 68],
  ['egg noodle', 49], ['yellow noodle', 56], ['ramen', 61], ['udon', 62], ['wonton noodle', 52],
  ['laksa', 62], ['mee goreng', 65], ['mee rebus', 66], ['mee siam', 69], ['spaghetti', 49], ['pasta', 49],
  ['white bread', 75], ['wholemeal bread', 74], ['wholegrain bread', 53], ['sourdough', 54],
  ['kaya toast', 74], ['roti prata', 70], ['naan', 71], ['chapati', 52], ['thosai', 66], ['idli', 70],
  ['potato', 78], ['french fries', 75], ['sweet potato', 63], ['tapioca', 70],
  ['rolled oats', 55], ['muesli', 57], ['quinoa', 53], ['barley', 28],
  ['watermelon', 76], ['pineapple', 59], ['banana', 51], ['mango', 51], ['papaya', 60], ['grapes', 53],
  ['apple', 36], ['orange', 43], ['kiwi', 50], ['durian', 49], ['guava', 45], ['lychee', 57],
  ['ice kacang', 78], ['chendol', 69], ['bubble tea', 68],
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
