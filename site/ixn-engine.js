/* RNAwiki — THE interaction matcher. ONE definition, three readers. (W7, 2026-08-09)
 *
 * build/parse.js already recorded what a third copy would cost, in its own comment above the
 * pathway-sibling block: "there are already two hand-synced copies of tagsOf (this one and
 * app.js's compoundTags) and the comment above says what a third would cost." Save-time safety for
 * user-built protocols (studio-safety.js) needs the matcher in a THIRD place, on the server. Three
 * hand-synced copies of the predicate that decides "is this pair dangerous" is not a risk, it is a
 * scheduled defect. So the matcher lives here and site/app.js, build/parse.js and studio-safety.js
 * all READ it. assertOneInteractionMatcher() in build/parse.js fails the build if any of them
 * defines its own copy again — prove it by pasting compoundTags() back into site/app.js.
 *
 * DUAL-LOADED. In a browser this assigns window.RNAWIKI_IXN_ENGINE and nothing else. Under node it
 * also sets module.exports. It reads no files, opens no sockets, holds no clock and touches no
 * database: init() is handed the corpus the caller has already loaded, so there is no second copy
 * of the corpus either.
 *
 * EVERY FUNCTION BELOW WAS MOVED VERBATIM out of site/app.js:3155-3284 (git a7479a0), not retyped.
 * Each one carries an invariant that was paid for with a defect that reached readers, and the
 * comments that record those defects moved with the code:
 *   · compoundTags     — tags by compound ID, never by name substring ("myoSTATIN").
 *   · sameSubstance    — two PAGES of one molecule are not two substances.
 *   · distinctCarriers — a `need` count is a count of substances, not of pages.
 *   · stackInteractions— the solo-rule drop, the duplicate replacement row, the notIf stand-down.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.RNAWIKI_IXN_ENGINE = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';

  let D = null, RXN = null, RULE_TAGS = new Set(), DUPE_OF = {}, STAMP = '', PAIRV = {};

  // init(data, interactions) — both already loaded by the caller.
  //   browser : init(window.RNAWIKI_DATA, window.RNAWIKI_INTERACTIONS)
  //   node    : the same two objects, out of build/parse.js's vm sandbox or server.js's.
  // Returns the api so `const IXN = ENGINE.init(D, RXN)` is one line at every call site.
  // STAMP identifies WHICH corpus a verdict was computed against, so a stored studio_protocols
  // .safety row can say what it was checked with as well as when.
  function init(data, interactions) {
    D = data || { compounds: [] };
    RXN = interactions || { catTags: {}, nameTags: [], rules: [], synergies: [], duplicates: [] };
    // ---- W3 (2026-08-01): the panel must know what it CANNOT check ------------------------------
    // The set of tags some rule actually consumes. A compound whose tags miss this set entirely can
    // never produce a flag, so "nothing flagged" about it is an absence of data, not a clearance.
    // MEASURED hydrated at 390x844 on /stack (out/w3i/before.json): 171 compounds, 77 of them carry
    // no tag any rule consumes — 35 of those prescription, controlled or unapproved — and a stack of
    // five such compounds rendered "Interaction check ✅ No dangerous interactions flagged" with zero
    // rows. That is a negative safety claim issued from an empty knowledge base.
    // W3.5 (2026-08-02): only rules that CAN FIRE against this corpus count as coverage. `double_5ar`
    // needs two distinct carriers of `5ar_inhibitor`; the corpus carries it exactly once (the bundled
    // "Finasteride / Dutasteride" page), so that rule can never produce a flag — yet its tag made this
    // panel count the compound as checked. MEASURED hydrated at 390x844 before the change:
    // /stack?ids=c39,c120 rendered "✅ Nothing flagged between the 2 of 2 I have pharmacology for".
    // It is 1 of 2, and the honest render is the ❔ state naming the compound.
    // This is the same arithmetic as coverage.reachable in site/interactions.js, which
    // assertInteractionCoverage() in build/parse.js recomputes and gates — keep the two definitions
    // identical or the number the build publishes stops matching what the panel tells the reader.
    // The rule is NOT deleted: it becomes firable the moment the corpus carries a second
    // 5-alpha-reductase inhibitor. What changes is that its single carrier stops counting as covered.
    RULE_TAGS = (function () {
      const carriers = {};
      (D.compounds || []).forEach(c => compoundTags(c).forEach(t => { carriers[t] = (carriers[t] || 0) + 1; }));
      const s = new Set();
      (RXN.rules || []).forEach(r => {
        if (!(r.need || []).every(n => (carriers[n[0]] || 0) >= n[1])) return;
        (r.need || []).forEach(n => s.add(n[0]));
      });
      return s;
    })();
    // ---- W4.5 (2026-08-02): A `need` COUNT IS A COUNT OF SUBSTANCES, NOT OF PAGES ---------------
    // Some molecules have two pages here because they are written for two different readers, and
    // this function counted the second page as a second drug. Measured hydrated at 390x844:
    //   /stack?ids=c1,c24    "☠️ Stacked stimulants — cardiovascular strain · Caffeine + Caffeine
    //                         (thermogenic) · Each drives the same fight-or-flight system."
    //   /stack?ids=c132,c133 "☠️ Additive low-blood-sugar risk · Insulin (prescribed) + Insulin
    //                         (anabolic misuse)" — the most dangerous pair on the site, fabricated.
    // The groups live in site/interactions.js `duplicates` and are build-gated there.
    // A COMPOUND IN MORE THAN ONE GROUP IS NEVER COLLAPSED: c148 is a bundle page supplying both
    // calcium AND iron, so Ca-AKG + c148 is a real calcium-against-iron competition and keeps its
    // row. Collapsing it would delete a true warning to satisfy a rule about duplicates.
    DUPE_OF = (function () {
      const m = {};
      (RXN.duplicates || []).forEach(g => (g.ids || []).forEach(id => (m[id] = m[id] || []).push(g)));
      return m;
    })();
    // ---- PAIR VERDICTS (2026-08-13) ------------------------------------------------------------
    // The rules above can only describe a PROBLEM: danger, blunt, timing. There was no way to say
    // "somebody examined this exact combination and there is nothing to do about it", so a pair no
    // rule reached rendered to readers as "not checked yet" — 243 of 257 pairings across the 52
    // protocols, including magnesium with fish oil. That made a genuinely unstudied pair
    // indistinguishable from an ordinary one, on the page where somebody decides what to take.
    //
    // A pair verdict is keyed on the EXACT PAIR OF COMPOUND IDS, not on tags, because that is what
    // "this combination was examined" means. `clear` is the highest bar in this file: it asserts
    // that a source looked at the two TOGETHER, which is why assertPairVerdicts() in build/parse.js
    // refuses to build a `clear` without one. Absence of evidence is still not a clearance.
    PAIRV = (function () {
      const m = {};
      (RXN.pairVerdicts || []).forEach(function (v) {
        const ids = (v.ids || []).slice().sort();
        if (ids.length === 2) m[ids[0] + '|' + ids[1]] = v;
      });
      return m;
    })();
    STAMP = 'compounds:' + ((D.compounds || []).length) + ' rules:' + ((RXN.rules || []).length)
      + ' pairs:' + Object.keys(PAIRV).length
      + ' dupes:' + ((RXN.duplicates || []).length) + ' firable-tags:' + RULE_TAGS.size;
    return api;
  }

  function stamp() { return STAMP; }

  function compoundTags(c) {
    // W3.6 (2026-08-02): TAGS ARE ASSIGNED BY COMPOUND ID, NEVER BY NAME SUBSTRING.
    // `nm.indexOf(r.m)` asserted a mechanism for every current AND FUTURE compound whose name
    // happened to contain the letters — the catTags fabrication engine one level down. It was
    // live seven times; measured hydrated at 390x844 on /stack, "myoSTATIN" put a ☠️ "Double
    // statin" row on Follistatin / Myostatin inhibitors, "NIACINamide" put ☠️ "Statin + high-dose
    // niacin" on a page that says "Choose niacinamide, NOT niacin/nicotinic acid", and "provIRON"
    // put "⏰ Minerals compete" on mesterolone. `r.m` survives in site/interactions.js only as the
    // tripwire assertNameTagAllowlist() runs at build time; nothing at runtime reads it.
    // ONE DEFINITION as of W7 — build/parse.js's tagsOf() is now a spread of this call, not a
    // second copy, so the published coverage number cannot drift from what the panel prints.
    const s = new Set((RXN.catTags || {})[c.category] || []);
    (RXN.nameTags || []).forEach(r => { if ((r.ids || []).indexOf(c.id) >= 0) r.t.forEach(t => s.add(t)); });
    return s;
  }

  function sameSubstance(a, b) {
    const ga = DUPE_OF[a.id] || [], gb = DUPE_OF[b.id] || [];
    return ga.length === 1 && gb.length === 1 && ga[0] === gb[0];
  }

  // "n DISTINCT substances carry this tag". Exact for n ≤ 2, which is the largest count any rule
  // needs — for 2 it asks whether some pair of carriers is not two pages of one substance.
  function distinctCarriers(cs, n) {
    if (cs.length < n) return false;
    if (n <= 1) return cs.length >= 1;
    for (let i = 0; i < cs.length; i++) for (let j = i + 1; j < cs.length; j++) if (!sameSubstance(cs[i], cs[j])) return true;
    return false;
  }

  // The authored verdict for one exact pair, or null.
  function pairVerdict(a, b) {
    const ids = [a.id, b.id].sort();
    return PAIRV[ids[0] + '|' + ids[1]] || null;
  }

  function stackInteractions(list) {
    const byTag = {};
    list.forEach(c => compoundTags(c).forEach(t => (byTag[t] = byTag[t] || []).push(c)));
    const fired = [], collapsed = [];
    (RXN.rules || []).forEach(rule => {
      if (!rule.need.every(n => (byTag[n[0]] || []).length >= n[1])) return;
      const inv = [];
      rule.need.forEach(n => (byTag[n[0]] || []).forEach(c => { if (inv.indexOf(c) < 0) inv.push(c); }));
      // W5.5 (2026-08-02): A COMPOUND CANNOT INTERACT WITH ITSELF. Each `need` is counted on its own,
      // so a rule with two needs is satisfied by ONE compound carrying both tags — and the row then
      // names that single compound as the whole interaction ("Bergamot may raise statin levels ·
      // Citrus Bergamot", against every other compound in the corpus). A rule with one `need` may
      // legitimately involve one compound (dnp, zinc_copper), so only multi-need rules are held to
      // this. Same invariant as the gate in build/parse.js; both exist because the SPA and the build
      // must not disagree about what a row is.
      if ((rule.need || []).length >= 2 && inv.length < 2) return;
      // src / srcLabel / srcQuote / conf / plain ADDED 2026-08-13. This object is hand-copied field
      // by field rather than spread, so a field added to the rule data reaches nobody until it is
      // named here — which is exactly what happened: all 25 rules gained a citation and every
      // consumer still saw `src: undefined`. The founder's rule is that every warning cites its
      // source, and this row IS the warning, in all three readers.
      // `plain` is the one-sentence, no-jargon version of `why`, per the site-wide jargon rule.
      const row = { id: rule.id, notIf: rule.notIf, tier: rule.tier, title: rule.title, why: rule.why, action: rule.action, pathway: rule.pathway, src: rule.src || '', srcLabel: rule.srcLabel || '', srcQuote: rule.srcQuote || '', conf: rule.conf || 'none', plain: rule.plain || '', involved: inv.map(c => c.name), members: inv };
      // Satisfied by pages but not by substances: the rule does not get to claim an interaction,
      // and the honest row about what actually happened is built below.
      (rule.need.every(n => distinctCarriers(byTag[n[0]] || [], n[1])) ? fired : collapsed).push(row);
    });
    // `notIf` — a broad rule stands down when the specific rule for the same physiology already
    // fired, so one interaction is never counted twice. Added 2026-08-01 with the hypotensive
    // rules: beetroot + a PDE-5 inhibitor is ONE blood-pressure interaction, and the verdict line
    // counts danger rows, so without this it would have read "2 dangerous combinations" for it.
    const firedIds = {}; fired.forEach(f => { firedIds[f.id] = 1; });
    // W4.5: the honest replacement row. It is NOT silence — a reader who has two pages of one
    // molecule in a stack is doing something worth naming, they are just not doing what the rule
    // said. Tier is inherited from the strongest rule the duplication collapsed, so
    // /stack?ids=c132,c133 stays a ☠️ danger row and the verdict still counts it; only the
    // sentence changes, from "two glucose-lowering agents" to "the same one, counted twice".
    // The text is authored per group in site/interactions.js and quotable against those pages.
    const dupeRows = (RXN.duplicates || []).map(g => {
      const members = list.filter(c => (g.ids || []).indexOf(c.id) >= 0 && (DUPE_OF[c.id] || []).length === 1);
      if (members.length < 2) return null;
      const ids = {}; members.forEach(c => { ids[c.id] = 1; });
      const from = collapsed.filter(r => r.members.every(c => ids[c.id]));
      const tier = from.some(r => r.tier === 'danger') ? 'danger' : from.some(r => r.tier === 'blunt') ? 'blunt' : 'timing';
      // A duplicate row is this site's own arithmetic about its own pages — "these two entries are
      // the same molecule" — not a claim from the literature, so it carries no external citation and
      // says so rather than borrowing one from the rule it collapsed. `plain` is still required:
      // the jargon rule applies to every sentence a reader meets, whatever its provenance.
      return { id: 'dupe:' + g.substance, tier, title: g.title, why: g.why, action: g.action, src: '', srcLabel: '', srcQuote: '', conf: 'internal', plain: g.plain || ('These are two pages for the same substance, so this counts once, not twice.'), involved: members.map(c => c.name), members };
    }).filter(Boolean);
    const flags = dupeRows.concat(fired.filter(f => !(f.notIf || []).some(id => firedIds[id])));
    const syn = [];
    (RXN.synergies || []).forEach(g => {
      // W3.6 (2026-08-02): id allowlists here too. Substring matching on a SYNERGY is worse than
      // on a rule, because the output is a green "works well together". Measured hydrated at
      // 390x844 on /stack: c63+c11 printed "✅ Statin + CoQ10 — Statins deplete CoQ10" for a
      // myostatin inhibitor, directly above "❔ I hold no interaction pharmacology for CoQ10";
      // c134+c120 printed "✅ Iron + Vitamin C" for Proviron; c14+c9 printed "✅ Glycine + NAC"
      // for Betaine (trimethylGLYCINE). The same change also fixes a MISS: `find` matched both
      // "collagen" and "vitamin c" to c109, so the A !== B guard dropped this site's own authored
      // Collagen + Vitamin C pairing on the one stack where it matters.
      const A = list.find(c => (g.aIds || []).indexOf(c.id) >= 0);
      const B = list.find(c => (g.bIds || []).indexOf(c.id) >= 0);
      if (A && B && A !== B) syn.push({ title: g.title, why: g.why, involved: [A.name, B.name], members: [A, B] });
    });
    // Pair verdicts for every exact pair present. `clear` rows go in their own bucket: a flag means
    // "something to act on", and a clearance is the opposite of that. timing/blunt/danger verdicts
    // join the flags, because those DO need acting on and a reader should not have to know which
    // mechanism happened to be expressible as a tag rule.
    const cleared = [], pairFlags = [];
    for (let i = 0; i < list.length; i += 1) {
      for (let j = i + 1; j < list.length; j += 1) {
        const v = pairVerdict(list[i], list[j]);
        if (!v) continue;
        const row = { id: 'pair:' + [list[i].id, list[j].id].sort().join('-'), tier: v.tier,
          title: v.title, why: v.plain, action: v.action || '', src: v.src || '',
          srcLabel: v.srcLabel || '', srcQuote: v.srcQuote || '', conf: v.src ? 'high' : 'none',
          plain: v.plain || '', involved: [list[i].name, list[j].name], members: [list[i], list[j]] };
        (v.tier === 'clear' ? cleared : pairFlags).push(row);
      }
    }
    return { flags: flags.concat(pairFlags), synergies: syn, cleared };
  }

  // The compounds in `list` that some FIRABLE rule can actually reach. Everything else is the ❔
  // state: an absence of data, never a clearance. Moved here from the body of interactionPanel()
  // in site/app.js so the save-time engine reports coverage with the identical arithmetic — an
  // empty `warn` over 0 checked compounds is not a pass, and this is the function that says so.
  function covered(list) {
    return (list || []).filter(function (c) {
      let ok = false; compoundTags(c).forEach(function (t) { if (RULE_TAGS.has(t)) ok = true; }); return ok;
    });
  }

  // Coverage is a property of an exact PAIR, not of two individually tagged compounds. The old
  // `covered(list)` count could call caffeine + magnesium "2 of 2 covered" even though no authored
  // rule described that combination. This enumerates every pair and counts it only when a rule row
  // explicitly involves both members. Positive synergy copy is not safety coverage: it can explain
  // complementary intent, but it cannot rule out an interaction.
  function pairCoverage(list) {
    const xs = list || [], pairs = [];
    for (let i = 0; i < xs.length; i += 1) {
      for (let j = i + 1; j < xs.length; j += 1) {
        const a = xs[i], b = xs[j];
        const result = stackInteractions([a, b]);
        const rules = (result.flags || []).filter(function (row) {
          const members = row.members || [];
          return members.some(function (c) { return c.id === a.id; })
            && members.some(function (c) { return c.id === b.id; });
        });
        // COVERED means "somebody examined this exact combination", which an authored pair verdict
        // is by definition — including a clearance. Before pair verdicts existed, the only way to be
        // covered was to have a PROBLEM, so an ordinary safe combination could never be anything but
        // unknown, and 95% of this site's pairings sat in that state.
        const pv = pairVerdict(a, b);
        pairs.push({
          ids: [a.id, b.id],
          names: [a.name, b.name],
          covered: rules.length > 0 || !!pv,
          verdict: pv ? pv.tier : null,
          ruleIds: rules.map(function (row) { return row.id; }),
        });
      }
    }
    const authored = pairs.filter(function (p) { return p.covered; }).length;
    const total = pairs.length;
    return {
      authored,
      total,
      unknown: total - authored,
      state: total === 0 ? 'not_applicable' : authored === total ? 'complete' : authored === 0 ? 'none' : 'partial',
      pairs,
    };
  }

  const api = {
    init, stamp, compoundTags, sameSubstance, distinctCarriers, stackInteractions, covered, pairCoverage, pairVerdict,
    get ruleTags() { return RULE_TAGS; },
  };
  return api;
});
