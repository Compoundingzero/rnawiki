/* RNAwiki — Supplement interaction engine.  window.RNAWIKI_INTERACTIONS
 *
 * Exhaustive-by-RULE, not by pair: every compound is TAGGED with its interaction-relevant
 * pharmacology (via category defaults + name matches), then a bounded set of authored rules
 * fires when tags collide. Deterministic — no runtime AI.
 *
 * IT DOES NOT COVER EVERYTHING. This header used to claim "Covers all 170 compounds; ~20 tags +
 * ~20 rules", which was false on every count: the corpus is 171, and measured hydrated on /stack
 * before 2026-08-01, 94 of them carried a tag some rule consumed and 77 did not — 35 of those 77
 * prescription, controlled or unapproved. The `coverage` block below is the measured truth, it is
 * read by assertInteractionCoverage() in build/parse.js, which fails the build if it drifts from
 * what the corpus actually supports. (Corrected 2026-08-02: this header used to say the block was
 * "printed to the reader by interactionPanel()". It is not — `RXN.coverage` occurs 0 times in
 * site/app.js. The panel prints PER-STACK coverage, "the 2 of 2 I have pharmacology for",
 * computed live from RULE_TAGS. A false claim inside the honesty machinery is its own defect.)
 * Each danger/blunt/timing rule carries a plain-English WHY (educate, don't just warn) and,
 * where relevant, a pathway link. Synergies suggest what pairs WELL. Not medical advice.
 *
 * ANTI-SLOP: tags assigned only where confident; danger rules err toward established, textbook
 * interactions. AI drafted this; a pharmacist should review before it's treated as authoritative.
 */
window.RNAWIKI_INTERACTIONS = {
  // Coverage — MEASURED against the corpus, not asserted, and build-gated by
  // assertInteractionCoverage() in build/parse.js. app.js prints these proportions next to the
  // verdict, so they have to stay exact. `unreachable` is the number of compounds that carry no
  // tag any rule consumes and therefore CANNOT produce a flag, no matter what they are stacked
  // with. That number is not a target to game: the honest response to it is the "❔ Not enough to
  // check" state in the panel, not a tag invented to make the number look better.
  // 2026-08-01: 100 → 99 → 97 → 96. Four compounds lost a tag no page of theirs supported: EPO
  // (mis-filed as a SARM by a COMPENDIUM heading), Cardarine and Stenabolic (which inherited
  // `hpta_suppressive` from a category default that has now been deleted), and TB-500 (which the
  // bare substring "thymosin" pulled into an immune-stimulant rule while its own mechanism says it
  // REDUCES inflammation). The number goes DOWN on purpose: a lower honest figure beats a higher
  // false one, and those four now render "❔ I hold no interaction pharmacology for …" instead of
  // silently inheriting somebody else's mechanism.
  // 2026-08-02: 96 → 95. A rule that CANNOT FIRE against this corpus no longer counts its carrier
  // as covered. `double_5ar` needs two carriers of `5ar_inhibitor` and the corpus has exactly one
  // (the bundled "Finasteride / Dutasteride" page), so that compound could never produce a flag
  // while the panel counted it as checked — measured hydrated at 390x844, /stack?ids=c39,c120
  // rendered "✅ Nothing flagged between the 2 of 2 I have pharmacology for" when the truth was
  // 1 of 2. Exactly one rule is unfirable and exactly one compound moves.
  // 2026-08-02 (second): 95 → 90. `nameTags` matched an UNANCHORED SUBSTRING OF THE COMPOUND
  // NAME, which is the catTags fabrication engine one level down: a substring asserts a mechanism
  // for every current AND FUTURE compound whose name contains those letters. Seven assignments
  // were false and all seven were rendering. Measured hydrated at 390x844 on /stack:
  //   "myoSTATIN" gave Follistatin / Myostatin inhibitors a statin_like tag and a "Double statin"
  //   danger row (its record contains 0 standalone "statin" and 0 "HMG-CoA"); "NIACINamide" gave a
  //   page whose own bio.form.buy says "Choose niacinamide (nicotinamide), NOT niacin/nicotinic
  //   acid" a "Statin + high-dose niacin" row; "provIRON" gave mesterolone a mineral-competition
  //   row; the 50 mg cofactor in "Collagen Peptides (+ Vitamin C)" earned an antioxidant row that
  //   told the reader to keep it away from training, against that page's own "15 g + 50 mg vitamin
  //   C, 45–60 min pre-exercise" protocol; ketamine, an "NMDA-receptor (GRIN) antagonist", earned
  //   "Serotonin syndrome risk"; boron, whose page says it "travels as boric acid … without
  //   needing a transporter", earned "Minerals compete"; and PT-141, whose own biomarker block
  //   says each dose "transiently raises systolic BP by roughly 6 mmHg and LOWERS heart rate",
  //   earned "Stacked stimulants — cardiovascular strain".
  // Tags are now assigned by explicit compound id (`ids`), never by substring, and
  // assertNameTagAllowlist() in build/parse.js fails the build on any substring collision nobody
  // has acknowledged. Five compounds go dark and the number goes DOWN on purpose.
  // 2026-08-02 (W5): 90 → 94. FOUR COMPOUNDS THAT COULD NEVER PRODUCE A FLAG NOW CAN, and this is
  // the first time in this file's history the number has gone UP for a good reason rather than down
  // for an honest one. Every previous move (100→99→97→96→95→90) deleted a tag a page did not
  // support. This one adds tags seven pages DO support and that were simply never written down —
  // the inverse defect, and the more dangerous half: an over-tag prints a warning nobody needed, an
  // under-tag prints a green tick over a documented hazard. Three of the seven were already counted
  // through another tag — c49 (`hpta_suppressive`), c157 (`cns_depressant`) and c170
  // (`sedative_mild`) — so seven new hepatotoxic carriers move the number by four: c40 Tongkat Ali,
  // c53 Cardarine, c63 Follistatin / Myostatin inhibitors, c105 Ashwagandha. Two of those four are
  // unapproved, so unreachableRx goes 40 → 38. (The handed-over spec said c49 and c170 only; c157
  // was the third and is recorded here because a count nobody re-derived is how this file gets
  // wrong.) assertHazardTagCoverage() in build/parse.js is the gate that will not let the gap
  // reopen silently.
  coverage: { compounds: 171, reachable: 94, unreachable: 77, unreachableRx: 38 },

  // catTags MUST STAY EMPTY. It is kept as a field only so compoundTags() in site/app.js and its
  // copy in build/parse.js keep the same shape; assertInteractionCoverage() fails the build if
  // anything is put back here.
  //
  // Until 2026-08-01 this defaulted two whole categories to `hpta_suppressive`. A category default
  // asserts a mechanism for every current AND FUTURE member of that category — the only thing
  // between "file a compound under a heading" and "publish a named pharmacological claim about it"
  // is that nobody notices. It had already fired three times. Measured hydrated at 390x844:
  //   /stack?ids=c53,c54  → "🔻 Compounded testosterone shutdown · Cardarine (GW-501516) +
  //                          Stenabolic (SR9009)". Cardarine's own mechanism opens "Not a SARM —
  //                          a PPARδ (PPARD) agonist"; Stenabolic's is "REV-ERBα (NR1D1) agonist —
  //                          a circadian-clock nuclear receptor". Neither page mentions testosterone.
  //   /stack?ids=c135,c49 → "🔻 Compounded testosterone shutdown · EPO (Erythropoietin) +
  //                          Ostarine", fixed in the previous commit at its source.
  // The assignments that were TRUE are re-asserted per compound in nameTags below, each one
  // checkable against that compound's own page. Tag compounds, never categories.
  catTags: {},

  // name substring (lowercased) → tags. All matches apply; order irrelevant.
  nameTags: [
    // serotonergic → serotonin-syndrome risk
    { m: "5-htp", t: ["serotonergic"], ids: ["c108"] }, { m: "tryptophan", t: ["serotonergic"], ids: ["c108"] },
    { m: "ssri", t: ["serotonergic"], ids: ["c156"] }, { m: "sertraline", t: ["serotonergic"], ids: ["c156"] }, { m: "escitalopram", t: ["serotonergic"], ids: ["c156"] },
    { m: "sam-e", t: ["serotonergic"], ids: ["c168"] }, { m: "saffron", t: ["serotonergic"], ids: ["c107"] }, { m: "psilocybin", t: ["serotonergic"], ids: ["c158"] },
    { m: "ketamine", t: ["cns_depressant"], ids: ["c157"] },
    // stimulants → additive cardiovascular strain
    { m: "caffeine", t: ["stimulant"], ids: ["c1", "c24"] }, { m: "ephedrine", t: ["stimulant"], ids: ["c25"] }, { m: "yohimbine", t: ["stimulant"], ids: ["c26"] },
    { m: "clenbuterol", t: ["stimulant"], ids: ["c27"] }, { m: "synephrine", t: ["stimulant"], ids: ["c131"] }, { m: "higenamine", t: ["stimulant"], ids: ["c131"] },
    { m: "theacrine", t: ["stimulant"], ids: ["c127"] }, { m: "phentermine", t: ["stimulant"], ids: ["c32"] }, { m: "amphetamine", t: ["stimulant"], ids: ["c151"] },
    { m: "lisdexamfetamine", t: ["stimulant"], ids: ["c151"] }, { m: "methylphenidate", t: ["stimulant"], ids: ["c152"] }, { m: "modafinil", t: ["stimulant"], ids: ["c89"] },
    { m: "bromantane", t: ["stimulant"], ids: ["c100"] }, { m: "nicotine", t: ["stimulant"], ids: ["c98"] },
    // `pt-141` DELETED 2026-08-02. It matched exactly one compound and that compound's own page
    // refutes the tag: PT-141 is an "alpha-MSH-derived peptide activating central melanocortin
    // receptors MC3R/MC4R", and its own biomarker block says each dose "transiently raises
    // systolic BP by roughly 6 mmHg and LOWERS heart rate". The stim_stack rule it fed says
    // "Each drives the same fight-or-flight system. Stacked, HEART RATE and blood pressure
    // compound." Measured hydrated at 390x844, /stack with c115+c1 rendered "☠️ Stacked
    // stimulants — cardiovascular strain · PT-141 (Bremelanotide / Vyleesi) + Caffeine".
    // PT-141 now carries no tag and renders the honest "❔ I hold no interaction pharmacology"
    // state. Its real pressor caution belongs on its page, not in a stimulant rule.
    { m: "bupropion", t: ["stimulant"], ids: ["c31"] },
    // blood-thinning → additive bleeding
    { m: "nattokinase", t: ["blood_thinning"], ids: ["c113"] }, { m: "omega-3", t: ["blood_thinning"], ids: ["c3"] }, { m: "ginkgo", t: ["blood_thinning"], ids: ["c153"] },
    // `vitamin e` DELETED 2026-08-02: it matched 0 of 171 compound names. A rule that can never
    // match is dead data in a file whose whole job is to be true about what it covers.
    { m: "resveratrol", t: ["blood_thinning"], ids: ["c74"] },
    // strong CNS depressants → additive sedation / respiratory depression
    { m: "phenibut", t: ["cns_depressant"], ids: ["c101"] }, { m: "zolpidem", t: ["cns_depressant"], ids: ["c155"] }, { m: "z-drug", t: ["cns_depressant"], ids: ["c155"] },
    { m: "trazodone", t: ["cns_depressant"], ids: ["c155"] }, { m: "orexin", t: ["cns_depressant"], ids: ["c154"] }, { m: "suvorexant", t: ["cns_depressant"], ids: ["c154"] },
    { m: "lemborexant", t: ["cns_depressant"], ids: ["c154"] }, { m: "doxylamine", t: ["cns_depressant"], ids: ["c155"] },
    // mild sedatives → gentle stacking note only
    { m: "melatonin", t: ["sedative_mild"], ids: ["c103"] }, { m: "valerian", t: ["sedative_mild"], ids: ["c170"] }, { m: "apigenin", t: ["sedative_mild"], ids: ["c104"] },
    // glucose-lowering → additive hypoglycemia
    { m: "metformin", t: ["hypoglycemic"], ids: ["c71"] }, { m: "berberine", t: ["hypoglycemic"], ids: ["c29"] }, { m: "acarbose", t: ["hypoglycemic"], ids: ["c72"] },
    { m: "semaglutide", t: ["hypoglycemic", "glp1"], ids: ["c19"] }, { m: "tirzepatide", t: ["hypoglycemic", "glp1"], ids: ["c20"] }, { m: "retatrutide", t: ["hypoglycemic", "glp1"], ids: ["c21"] },
    { m: "liraglutide", t: ["hypoglycemic", "glp1"], ids: ["c22"] }, { m: "orforglipron", t: ["hypoglycemic", "glp1"], ids: ["c23"] }, { m: "cagrilintide", t: ["hypoglycemic"], ids: ["c128"] },
    { m: "sglt2", t: ["hypoglycemic"], ids: ["c82"] }, { m: "insulin", t: ["hypoglycemic"], ids: ["c132", "c133"] }, { m: "alpha-lipoic", t: ["hypoglycemic", "antioxidant_hd"], ids: ["c162"] },
    { m: "myo-inositol", t: ["hypoglycemic"], ids: ["c147"] },
    // blood-pressure lowering / nitrate / PDE-5
    { m: "beetroot", t: ["hypotensive", "nitrate"], ids: ["c114"] }, { m: "nitrate", t: ["hypotensive", "nitrate"], ids: ["c114"] },
    { m: "pde-5", t: ["hypotensive", "pde5"], ids: ["c116"] }, { m: "sildenafil", t: ["hypotensive", "pde5"], ids: ["c116"] }, { m: "tadalafil", t: ["hypotensive", "pde5"], ids: ["c116"] },
    { m: "citrulline", t: ["hypotensive"], ids: ["c13"] }, { m: "taurine", t: ["hypotensive"], ids: ["c8"] },
    // `agmatine` DELETED 2026-08-02. It matched exactly one compound and that compound's whole
    // authored record refutes the tag. c127's agmatine content is "arginine metabolite → NO
    // modulation + neuropathic pain", and its own foodFirst note says "Agmatine's NO/pump claims in
    // humans are weak and largely mechanistic". A recursive scan of the WHOLE c127 record for
    // /blood pressure|hypotens|lower.*pressure|vasodil|relax/i returns exactly ONE hit, and it
    // points the other way: bio.biomarkers[0].marker "**Resting heart rate & blood pressure**",
    // whose why reads "Theacrine is a caffeine-like stimulant; track these ... to catch excess
    // cardiovascular load". Zero BP-lowering assertions on the page.
    // Because c127 ALSO carries `stimulant`, the same page rendered two contradictory rows.
    // Measured hydrated at 390x844, 0 pageerrors:
    //   /stack?ids=c127,c8 → "⏰ Both of these lower blood pressure · Agmatine · Glycerol ·
    //                         Theacrine (brief) + Taurine ... Each relaxes blood vessels a little,
    //                         so the drop adds up."
    //   /stack?ids=c127,c1 → "☠️ Stacked stimulants — cardiovascular strain ... heart rate and
    //                         blood pressure compound."
    // Four rendered rows go: hypotensive_stack 6 → 3 firing 2-compound stacks, pde5_vasodilator
    // 3 → 2. c127 keeps `stimulant`, which its own contra block supports word for word, so it stays
    // reachable and coverage does not move: 90/171 before and after. A lower honest number beats a
    // higher false one.
    // hepatotoxic (liver strain) — oral AAS + a few others
    { m: "green tea", t: ["hepatotoxic"], ids: ["c30"] }, { m: "red yeast rice", t: ["statin_like", "hepatotoxic"], ids: ["c161"] },
    { m: "dnp", t: ["do_not_use", "hepatotoxic"], ids: ["c28"] }, { m: "dinitrophenol", t: ["do_not_use", "hepatotoxic"], ids: ["c28"] },
    { m: "tamoxifen", t: ["hepatotoxic"], ids: ["c37"] }, { m: "oxandrolone", t: ["hepatotoxic"], ids: ["c44"] }, { m: "stanozolol", t: ["hepatotoxic"], ids: ["c45"] },
    { m: "winstrol", t: ["hepatotoxic"], ids: ["c45"] }, { m: "dianabol", t: ["hepatotoxic"], ids: ["c47"] }, { m: "methandrostenolone", t: ["hepatotoxic"], ids: ["c47"] },
    { m: "anadrol", t: ["hepatotoxic"], ids: ["c48"] }, { m: "oxymetholone", t: ["hepatotoxic"], ids: ["c48"] }, { m: "trenbolone", t: ["hepatotoxic"], ids: ["c43"] },
    { m: "rad-140", t: ["hepatotoxic"], ids: ["c51"] }, { m: "lgd-4033", t: ["hepatotoxic"], ids: ["c50"] }, { m: "s-23", t: ["hepatotoxic"], ids: ["c52"] },
    // 2026-08-02 (W5): SIX MORE CARRIERS, from the under-tagging audit that assertHazardTagCoverage()
    // in build/parse.js now runs against all 171. The bar is stated once and applied the same way to
    // every compound: TAG when the compound's own SAFETY fields state liver injury as DOCUMENTED OR
    // REPORTED IN HUMANS for that compound; acknowledge (see hazardAudit.acknowledged) when it is
    // animal-only, above the page's own stated dose range, about a different substance, or a
    // monitoring precaution. Each quote below is verbatim from that compound's own record — if you
    // cannot quote the page, do not add the line.
    { m: "tongkat", t: ["hepatotoxic"], ids: ["c40"] },        // contra: "Existing liver disease or other hepatotoxic meds/supplements | Be cautious … given documented liver-injury case reports"
    { m: "ashwagandha", t: ["hepatotoxic"], ids: ["c105"] },   // contra: "Liver disease or other hepatotoxic drugs | Rare cases of ashwagandha-associated liver injury are documented"
    { m: "cardarine", t: ["hepatotoxic"], ids: ["c53"] },      // contra: "Avoid — liver injury is among the most reported human effects"; biomarker: "including a documented hepatotoxicity case"
    { m: "follistatin", t: ["hepatotoxic"], ids: ["c63"] },    // misuse: "carries documented hepatotoxicity"; contra: "YK-11's hepatotoxicity can precipitate serious liver injury"
    { m: "ketamine", t: ["hepatotoxic"], ids: ["c157"] },      // misuse: "biliary/liver injury"; biomarker: "Repeated ketamine use is linked to hepatotoxicity and biliary tract dilation/cholangiopathy"
    // c170's own contra names the exact interaction the `liver` rule renders, and the checker was
    // clearing it: measured hydrated at 390x844, /stack?ids=c170,c30 rendered `.ixn-verdict ok`
    // "✅ Nothing flagged between the 2 of 2 I have pharmacology for" with 0 rows.
    { m: "valeriana", t: ["hepatotoxic"], ids: ["c170"] },     // contra: "Liver disease or hepatotoxic medications | Rare **hepatotoxicity reports** (mostly multi-herb products)"
    // statin-like
    { m: "statin", t: ["statin_like"], ids: ["c159"], not: ["c63"] }, { m: "atorvastatin", t: ["statin_like"], ids: ["c159"] }, { m: "rosuvastatin", t: ["statin_like"], ids: ["c159"] },
    // niacin (myopathy risk with statins)
    { m: "niacin", t: ["niacin"], ids: ["c124"], not: ["c145"] },
    // grapefruit-type metabolism
    { m: "bergamot", t: ["cyp3a4"], ids: ["c112"] },
    // minerals that compete for absorption
    // `iron` deleted 2026-08-01: no rule consumed it, and everything it was there for is already
    // carried — competition with other minerals by `divalent_mineral`, the vitamin-C absorption
    // pairing by the name-matched synergy below. A tag no rule reads is dead data that reads as
    // coverage, so it goes rather than gets a rule invented for it.
    // 2026-08-02 (W5): c148 IS NOT A CALCIUM SOURCE and c165 IS NOT A COMPETING MINERAL. Both were
    // human allowlist decisions, and both are refuted by the pages they were asserted about.
    //   c148 "DIM / Calcium-D-Glucarate · Vitex · Iron (brief)": a recursive scan of the WHOLE
    //     record for mineral-competition language returns ZERO hits. The only thing calcium-D-
    //     glucarate is ever said to do is estrogen clearance — "**Calcium-D-glucarate** (inhibits
    //     β-glucuronidase, aids estrogen clearance — ⭐⭐)" — and the page's own timing advice is
    //     "split calcium-D-glucarate across the day", not space it from your minerals. The word
    //     "calcium" appears on the page only inside that molecule's name, which is the substring
    //     fabrication engine W3.6 deleted, surviving inside a hand-written allowlist.
    //     Measured hydrated at 390x844, 0 pageerrors, /stack?ids=c148,c122 rendered
    //     "⏰ Minerals compete — space them out · DIM / Calcium-D-Glucarate · Vitex · Iron (brief)
    //     + Iron" — iron on both sides of a competition row.
    //     c148 KEEPS `divalent_mineral` through the iron entry below, because its own raw text does
    //     name "**Iron** (menstrual loss — test ferritin)". Dropping only the calcium half is what
    //     lets the duplicates machinery finally collapse c122+c148 into the honest
    //     "same mineral from two sources — iron" row instead of a competition row.
    //   c165 "Zinc-Carnosine · Akkermansia · S. boulardii · DGL (brief)": its only competition
    //     statement is zinc↔copper — "Zinc competes with copper for absorption" — which the `zinc`
    //     tag and the `zinc_copper` rule already carry in full. Against the `mineral` rule's claim
    //     ("These compete for the same intestinal uptake") the page says the opposite in as many
    //     words: zinc-carnosine "works largely by adhering to inflamed mucosa RATHER THAN BY
    //     SYSTEMIC ZINC ABSORPTION, so the intact chelated complex matters more than elemental zinc
    //     content." Measured hydrated at 390x844: /stack?ids=c165,c150 → "⏰ Minerals compete —
    //     space them out · Zinc-Carnosine … + Strontium · Silica (brief)"; /stack?ids=c165,c130 →
    //     "⏰ Minerals block thyroid absorption". Those rows go; the zinc↔copper row and the
    //     same-substance row against c6 both stay, because both are supported by that page.
    { m: "calcium", t: ["divalent_mineral"], ids: ["c79", "c149"], not: ["c148"] }, { m: "iron", t: ["divalent_mineral"], ids: ["c122", "c148"], not: ["c134"] },
    { m: "zinc", t: ["zinc"], ids: ["c6", "c165"] }, { m: "zinc", t: ["divalent_mineral"], ids: ["c6"], not: ["c165"] },
    { m: "magnesium", t: ["divalent_mineral"], ids: ["c5"] }, { m: "strontium", t: ["divalent_mineral"], ids: ["c150"] },
    // `boron` DELETED 2026-08-02. Boron is a metalloid absorbed as boric acid, and the page says
    // so in as many words: "It's absorbed almost completely and travels as boric acid — a small,
    // water-loving molecule that spreads through your total body water WITHOUT NEEDING A
    // TRANSPORTER." The mineral rule it fed says the opposite: "Calcium, iron, zinc and magnesium
    // ride the same intestinal transporter and compete." Worse, Boron's own stacksWith line reads
    // "Vitamin D3 and magnesium (boron supports their metabolism)" while the rule told the reader
    // to "Take competing minerals about 2 hours apart". Measured hydrated at 390x844, /stack with
    // c7+c5 rendered "⏰ Minerals compete — space them out · Boron + Magnesium".
    // high-dose antioxidants (can blunt training adaptation)
    // `vitc` deleted 2026-08-01, same reason as `iron`: no rule read it, and vitamin C's two real
    // interactions here are already covered — antioxidant load by `antioxidant_hd`, the iron
    // pairing by the name-matched synergy below.
    { m: "n-acetylcysteine", t: ["antioxidant_hd"], ids: ["c9"] }, { m: "vitamin c", t: ["antioxidant_hd"], ids: ["c120"], not: ["c109"] },
    { m: "astaxanthin", t: ["antioxidant_hd"], ids: ["c83"] },
    // mTOR
    { m: "rapamycin", t: ["mtor_inhibitor", "immunosuppress"], ids: ["c70"] }, { m: "eaas", t: ["mtor_activator"], ids: ["c18"] }, { m: "bcaa", t: ["mtor_activator"], ids: ["c18"] },
    { m: "hmb", t: ["mtor_activator"], ids: ["c16"] }, { m: "igf-1", t: ["mtor_activator", "hypoglycemic"], ids: ["c62"] },
    // immune direction
    { m: "beta-glucan", t: ["immunostim"], ids: ["c140"] }, { m: "mushroom", t: ["immunostim"], ids: ["c141"] }, { m: "reishi", t: ["immunostim"], ids: ["c141"] },
    // "thymosin" narrowed to "thymosin alpha" 2026-08-01. A nameTag match is an UNANCHORED
    // SUBSTRING, and the bare string hit two different molecules that do opposite things.
    // Thymosin α-1 is an immunomodulator by its own mechanism ("activating Toll-like receptors
    // (TLR9/2) and T-cell maturation"). Thymosin β-4 is not: TB-500's own mechanism is "regulates
    // actin polymerisation to enable cell migration to wounds, promotes angiogenesis, and REDUCES
    // INFLAMMATION". Measured hydrated at 390x844: /stack?ids=c65,c70 rendered "🔻 Opposing immune
    // direction · TB-500 (Thymosin Beta-4 fragment) + Rapamycin (Sirolimus)", explained with
    // "Mushrooms / beta-glucans push the immune system up" — a sentence about neither compound in
    // the row. "thymosin alpha" hits exactly one compound in the 171-name corpus.
    { m: "andrographis", t: ["immunostim"], ids: ["c142"] }, { m: "ll-37", t: ["immunostim"], ids: ["c69"] }, { m: "thymosin alpha", t: ["immunostim"], ids: ["c68"] },
    // aromatase inhibitors (estrogen crash)
    { m: "anastrozole", t: ["aromatase_inhibitor"], ids: ["c36"] }, { m: "exemestane", t: ["aromatase_inhibitor"], ids: ["c36"] },
    { m: "letrozole", t: ["aromatase_inhibitor"], ids: ["c134"] }, { m: "aromatase", t: ["aromatase_inhibitor"], ids: ["c36"] },
    // 5-alpha-reductase inhibitors (redundant if doubled)
    { m: "finasteride", t: ["5ar_inhibitor"], ids: ["c39"] }, { m: "dutasteride", t: ["5ar_inhibitor"], ids: ["c39"] },
    // thyroid hormone (mineral-blocked absorption)
    { m: "t3 / t4", t: ["thyroid"], ids: ["c130"] }, { m: "levothyroxine", t: ["thyroid"], ids: ["c130"] }, { m: "liothyronine", t: ["thyroid"], ids: ["c130"] },
    // Exogenous androgens → HPTA suppression. ASSERTED PER COMPOUND, never by category (see the
    // catTags note above). Each match string was tested against all 171 lowercased compound names
    // and hits exactly one. The comment on each line is that compound's OWN authored support,
    // quoted from site/data.js — if you cannot quote the page, do not add the line.
    { m: "testosterone", t: ["hpta_suppressive"], ids: ["c33"] },        // watch: "Testicular shrinkage/infertility (suppresses LH/FSH)"
    { m: "nandrolone", t: ["hpta_suppressive"], ids: ["c42"] },          // watch: "prolonged HPTA suppression"
    { m: "oxandrolone", t: ["hpta_suppressive"], ids: ["c44"] },         // watch: "Lipid deterioration, HPTA suppression"
    { m: "oxymetholone", t: ["hpta_suppressive"], ids: ["c48"] },        // watch: "all suppress natural testosterone"
    // 2026-08-02 (W5): `hepatotoxic` ADDED. This compound produced the false green this wave was
    // opened on. Measured hydrated at 390x844, 0 pageerrors, /stack?ids=c49,c30 rendered
    // `<span class="ixn-verdict ok">✅ Nothing flagged between the 2 of 2 I have pharmacology for`
    // with zero rule rows — a clearance that explicitly claims pharmacology for BOTH compounds —
    // over Ostarine + Green Tea Extract, while c30 carries `hepatotoxic` and the `liver` rule needs
    // two carriers. The tag was never written down; nothing about c49's own page is ambiguous:
    //   contra:  "Existing liver disease or raised liver enzymes | Hepatotoxicity is the primary
    //             documented harm; layering it onto compromised liver function is dangerous."
    //   overdose:"higher or prolonged dosing drives drug-induced liver injury — cholestatic
    //             hepatitis with jaundice … reported even at recreational doses"
    //   watch:   "HPTA suppression, liver injury cases, positive drug tests."
    { m: "ostarine", t: ["hpta_suppressive", "hepatotoxic"], ids: ["c49"] }, // watch: "HPTA suppression, liver injury cases"; contra: "Hepatotoxicity is the primary documented harm"
    { m: "ligandrol", t: ["hpta_suppressive"], ids: ["c50"] },           // watch: "Marked suppression, hepatotoxicity"
    { m: "andarine", t: ["hpta_suppressive"], ids: ["c52"] },            // watch: "Minimal human data, strong suppression"
    // The four below are exogenous androgen-receptor agonists by their own authored MECHANISM;
    // their pages do not use the word "suppression". The tag rests on the mechanism the page
    // states, not on an inference about the molecule's class — which is the line this file now
    // holds everywhere. If Felix would rather these carried the tag only when the page says so,
    // the honest fix is one authored sentence on each page, not a quieter tag.
    { m: "trenbolone", t: ["hpta_suppressive"], ids: ["c43"] },          // mech: "19-nor with extreme AR binding affinity (higher than testosterone)"
    { m: "stanozolol", t: ["hpta_suppressive"], ids: ["c45"] },          // mech: "DHT-derived, 17α-alkylated, non-aromatising"
    { m: "boldenone", t: ["hpta_suppressive"], ids: ["c46"] },           // mech: "Testosterone with a 1,2 double bond"
    { m: "methandrostenolone", t: ["hpta_suppressive"], ids: ["c47"] },  // mech: "Oral 17α-alkylated, aromatises readily"
    { m: "testolone", t: ["hpta_suppressive"], ids: ["c51"] }            // mech: "Potent AR agonist designed to mimic testosterone's anabolism"
  ],

  // ---- W4.5 (2026-08-02): TWO PAGES FOR ONE SUBSTANCE ARE NOT TWO COMPOUNDS ------------------
  // Every `need` count in the rules below is a count of DISTINCT SUBSTANCES, and until this block
  // existed it was a count of pages. Some molecules have two pages here because they are written
  // for two different readers, and the checker treated the second page as a second drug. Measured
  // hydrated at 390x844, 0 pageerrors:
  //   /stack?ids=c1,c24   → "☠️ Stacked stimulants — cardiovascular strain · Caffeine +
  //                          Caffeine (thermogenic) · Each drives the same fight-or-flight system."
  //   /stack?ids=c132,c133→ "☠️ Additive low-blood-sugar risk · Insulin (prescribed) + Insulin
  //                          (anabolic misuse) · Two or more glucose-lowering agents together…"
  //   /stack?ids=c6,c165  → "⏰ Minerals compete — space them out · Zinc + Zinc-Carnosine…"
  //   /stack?ids=c79,c149 → "⏰ Minerals compete — space them out · Ca-AKG + Calcium (+ D3 + K2)"
  // A danger row that says two things interact when they are one thing is a fabricated interaction,
  // and it is worse than a missing one: it is the row a reader is most likely to act on.
  //
  // A COMPOUND IN MORE THAN ONE GROUP IS NEVER COLLAPSED. c148 is a four-substance bundle page —
  // "DIM / Calcium-D-Glucarate · Vitex · Iron (brief)" — and its own raw text names BOTH
  // "**Calcium-D-glucarate**" and "**Iron** (menstrual loss — test ferritin)". So it was listed in
  // the calcium group AND the iron group, and the reasoning was that Ca-AKG + c148 really is
  // calcium against iron.
  // CORRECTED 2026-08-02 (W5): the second half of that was built on a calcium assertion the page
  // does not support. c148's whole record contains zero mineral-competition language, and the only
  // thing calcium-D-glucarate is ever said to do there is estrogen clearance. c148 no longer carries
  // `divalent_mineral` FROM CALCIUM (it keeps it from its iron, which the page does name), it is now
  // in the iron group only, and c122+c148 collapses into "the same mineral from two sources — iron"
  // instead of a competition row that had iron on both sides. Its rows against c79 and c149 survive
  // and are still true — that is c148's iron against their calcium.
  //
  // Each group's why/action is authored for that group and quotable against its pages — the same
  // standard assertRuleTextRowTruth holds the rules to. assertDuplicateSubstances() in
  // build/parse.js fails the build if any within-group pair still fires a rule that needs two
  // distinct carriers, if a group's members share no tag (an inert group is dead data), or if a
  // nameTag matches two compound ids that no group covers — which is the tripwire that would have
  // caught all four of these the day the second page was written.
  duplicates: [
    { substance: "caffeine", ids: ["c1", "c24"],
      title: "Same substance twice — caffeine",
      why: "These are two pages about caffeine, written for two different uses. It is one molecule, so this is one dose split over two lines, not two stimulants adding up.",
      action: "Count them as one and add the two amounts together. The stimulant total that matters is the one you get from both." },
    { substance: "insulin", ids: ["c132", "c133"],
      title: "Same substance twice — insulin",
      why: "These are two pages about insulin — one written for prescribed use, one about its misuse for muscle gain. It is one drug, so this is not two glucose-lowering agents stacking; it is the same one counted twice.",
      action: "Count them as one. Insulin dosing comes from your own clinician, and the low-blood-sugar danger both pages describe is the danger of that single drug." },
    // 2026-08-02 (W5): c148 REMOVED. The W4.5 note above this block reasoned that c148 must stay in
    // BOTH the calcium and the iron group because it supplies both, and that its three mineral rows
    // were therefore true. Half of that is right and half was built on the calcium assertion the
    // nameTag above has now withdrawn: c148's record contains zero mineral-competition language and
    // names calcium only inside "calcium-D-glucarate", whose stated job is estrogen clearance. With
    // c148 in one group instead of two, sameSubstance() finally collapses c122+c148 — measured by
    // replaying the shipped predicate, /stack?ids=c148,c122 stops rendering "⏰ Minerals compete —
    // space them out · … Iron (brief) + Iron" and renders "⏰ The same mineral from two sources —
    // iron" instead. c148 vs c79 and c148 vs c149 still fire `mineral`, and they should: that is
    // c148's iron against their calcium, which is a real competition.
    { substance: "calcium", ids: ["c79", "c149"],
      title: "The same mineral from two sources — calcium",
      why: "Both of these deliver calcium. Minerals compete with each other for absorption; a mineral does not compete with itself, so this is one calcium intake arriving in two products rather than a timing conflict.",
      action: "Add up the elemental calcium from both and treat that as your dose. Space it away from your other minerals, not from itself." },
    { substance: "iron", ids: ["c122", "c148"],
      title: "The same mineral from two sources — iron",
      why: "Both of these supply iron. Minerals compete with each other for absorption; iron does not compete with itself, so this is one iron intake arriving in two products rather than a timing conflict.",
      action: "Add up the elemental iron from both and treat that as your dose. Iron has an upper limit, so two sources is worth totalling rather than spacing out." },
    { substance: "zinc", ids: ["c6", "c165"],
      title: "The same mineral from two sources — zinc",
      why: "Both of these supply zinc. Minerals compete with each other for absorption; zinc does not compete with itself. The zinc-carnosine page's own dosing note says the studied twice-daily regimen already delivers about 34 mg of elemental zinc a day, which exceeds typical upper limits before a second source is added.",
      action: "Add up the elemental zinc from both. The long-term copper caution applies to that combined amount, not to either page on its own." }
  ],

  // Rules: fire when every `need` [tag, minDistinctCompounds] is satisfied by the stack.
  // tier: danger | blunt | timing.  Each has a plain-English why + action; optional pathway.
  rules: [
    { id: "serotonin", tier: "danger", need: [["serotonergic", 2]],
      title: "Serotonin syndrome risk",
      why: "Each of these raises serotonin signalling — by supplying the raw material, by slowing its reuptake, or by acting on the receptor directly. Stacked, serotonin can build up faster than the body clears it and overstimulate receptors.",
      // exemplars (W4.5): CONDITIONAL ADVICE, not a description of the row. The sentence is
      // addressed to a reader who is already on a prescribed antidepressant and tells them what to
      // keep away from it; that is useful on all 10 rows, including the 6 where 5-HTP and SAM-e are
      // not the two compounds shown. Named on purpose, so assertRuleTextRowTruth is told so.
      exemplars: ["c108", "c168"],
      action: "Don't combine serotonin-raisers. If you take a prescribed antidepressant, treat 5-HTP / SAM-e / St John's Wort as off-limits without a doctor.", pathway: "/pathway/7" },
    { id: "bleeding", tier: "danger", need: [["blood_thinning", 2]],
      title: "Additive bleeding risk",
      why: "Each of these independently slows clotting (dissolving fibrin or making platelets less sticky). Stacked, the effects add up.",
      action: "Avoid stacking blood-thinners; if you're on a prescribed anticoagulant (warfarin, a DOAC, aspirin), don't add these without medical advice." },
    { id: "nitrate_pde5", tier: "danger", need: [["nitrate", 1], ["pde5", 1]],
      title: "Nitrate + PDE-5 = blood-pressure crash",
      why: "Nitrates (like beetroot) and PDE-5 drugs (sildenafil / tadalafil) both widen blood vessels through the same NO→cGMP route. Together, blood pressure can drop dangerously.",
      action: "Never combine a nitrate source with a PDE-5 inhibitor.", pathway: "/pathway/4" },
    // Wired 2026-08-01. `hypotensive` was assigned to 8 compounds and read by no rule, so the
    // checker cleared L-Citrulline + PDE-5 Inhibitors with a green tick while this site's own
    // compendium entry for citrulline says the opposite: "Stacking strong blood-flow agents —
    // citrulline + beetroot + ED drugs (PDE-5) + nitrates together can drop blood pressure
    // dangerously" (content/COMPENDIUM.md:233). This rule wires up what was already written down.
    // `notIf` keeps it from double-counting the nitrate case, which has its own rule above.
    { id: "pde5_vasodilator", tier: "danger", need: [["pde5", 1], ["hypotensive", 2]], notIf: ["nitrate_pde5"],
      title: "PDE-5 inhibitor plus another blood-flow agent",
      // The `why` must be about the compounds in the ROW. Until 2026-08-01 this sentence named
      // "Citrulline, beetroot and agmatine" — three of the five hypotensive carriers — no matter
      // which pair actually fired it. Measured hydrated at 390x844: /stack?ids=c116,c8 rendered the
      // header "PDE-5 Inhibitors (Sildenafil / Tadalafil) + Taurine" directly above an explanation
      // about three compounds, none of them in the stack. The row now describes the mechanism both
      // halves share instead of guessing which compound filled the second slot. The warning is
      // unchanged in strength — only the false specificity is gone.
      why: "A PDE-5 drug already widens blood vessels through the NO→cGMP route, and the other blood-flow agent in this stack pushes that same route from the other end. Pushing one lever twice can drop blood pressure far enough to make you faint.",
      action: "Don't stack blood-flow agents on top of a PDE-5 inhibitor — pick one. If you take any blood-pressure medication, this needs a doctor, not a supplement plan.", pathway: "/pathway/4" },
    // W4.5 (2026-08-02): both strings rewritten so they are true of EVERY row this rule renders.
    // cns_depressant has 4 carriers — c101 Phenibut, c154 Orexin antagonists, c155 Z-drugs /
    // Trazodone / Doxylamine, c157 Ketamine — so it renders 6 two-compound rows.
    //   ACTION: "never combine phenibut with alcohol" printed on 3 of those 6 with PHENIBUT ABSENT.
    //   Measured hydrated at 390x844, /stack?ids=c154,c155 rendered it under the header "Orexin
    //   Antagonists (Suvorexant, Lemborexant) + Z-drugs (Zolpidem/Ambien) · Trazodone · Doxylamine
    //   (brief)". The advice is now stated for whatever is in the row; alcohol is named as a class,
    //   which every one of the four pages warns about in its own words (c101 whenToUse.items.3,
    //   c154 bio.contra[3].flag, c155 bio.contra[1].flag, c157 bio.contra[1].flag).
    //   WHY: "that is the mechanism behind the reported overdoses in this class" is refuted by
    //   c154's own bio.overdose.line, which says its toxicity "is dominated by heavy, prolonged
    //   drowsiness and next-day sedation". What all four DO assert is the COMBINATION risk —
    //   c154 "Additive sedation and breathing suppression"; c101 "additive CNS and respiratory
    //   depression can cause blackout, coma, or death"; c155 "Combined sedation and respiratory
    //   depression can be fatal"; c157 "Combination sharply raises the risk of respiratory
    //   depression". The row now says exactly that, at the same strength. Only the false
    //   attribution and the false specificity are gone.
    { id: "sedation", tier: "danger", need: [["cns_depressant", 2]],
      title: "Additive sedation / breathing risk",
      why: "Each of these slows the brain's arousal system by a different route, and each one's own page carries the same warning about the combination: stacked with another sedative, the sedation deepens and breathing can be suppressed.",
      action: "Don't layer strong sedatives. Alcohol counts as one of them — it goes with none of these." },
    { id: "double_statin", tier: "danger", need: [["statin_like", 2]],
      title: "Double statin — muscle-damage risk",
      why: "Red yeast rice *is* a natural statin. Taking it alongside a prescription statin is effectively a double dose, which raises the risk of muscle breakdown (rhabdomyolysis).",
      action: "Pick one. Never combine red yeast rice with a prescribed statin." },
    { id: "statin_niacin", tier: "danger", need: [["statin_like", 1], ["niacin", 1]],
      title: "Statin + high-dose niacin — myopathy risk",
      why: "High-dose niacin adds to a statin's small risk of muscle injury.",
      // exemplars (W4.5): "a statin" here is the DRUG CLASS, and it happens to be the name of a
      // page. The rule's other statin_like carrier is c161 Red Yeast Rice, whose own page opens by
      // saying it IS a natural statin — so on the one row where c159 is absent, the class noun is
      // still true of the compound in the row.
      exemplars: ["c159"],
      action: "Only combine under medical supervision; watch for muscle aches." },
    { id: "stim_stack", tier: "danger", need: [["stimulant", 2]],
      title: "Stacked stimulants — cardiovascular strain",
      why: "Each drives the same fight-or-flight system. Stacked, heart rate and blood pressure compound — the classic ephedrine + caffeine combo is the cautionary example.",
      // exemplars (W4.5): an EXPLICITLY LABELLED illustration. "the classic ephedrine + caffeine
      // combo is the cautionary example" tells the reader it is an example, not what is in front of
      // them, on all 91 rows. Deleting it to satisfy a name check would remove the one line that
      // makes the mechanism concrete.
      exemplars: ["c1", "c24", "c25"],
      action: "Use one stimulant at a time; don't layer them." },
    { id: "hypoglycemia", tier: "danger", need: [["hypoglycemic", 2]],
      title: "Additive low-blood-sugar risk",
      why: "Two or more glucose-lowering agents together can drop blood sugar too far — shakiness, confusion, and in severe cases worse. Insulin plus anything else is especially risky.",
      // exemplars (W4.5): conditional, and the single most consequential sentence in the file.
      // "Insulin plus anything else is especially risky" / "never self-stack with insulin" is
      // advice for a reader who takes insulin, and it holds on all 104 rows whether or not one of
      // the two insulin pages is the compound shown. Kept as written. (Re-measured 2026-08-02: the
      // row count is 104, not the 105 written here — 15 carriers, C(15,2)=105, minus the one
      // collapsed insulin pair. The advice is unchanged; the number was not re-derived.)
      exemplars: ["c132", "c133"],
      // 2026-08-02 (W5): "glucose-loweres" → "glucose-lowering agents". The typo rendered on ALL 104
      // rows this rule can produce, measured hydrated at 390x844 on /stack?ids=c71,c29 under the
      // header "☠️ Additive low-blood-sugar risk · Metformin + Berberine". The replacement is not a
      // guess at the intended word: it is the phrase this rule's own `why` already uses one line
      // above ("Two or more glucose-lowering agents together"), so the row now says the same thing
      // twice instead of two different things. assertRuleProse() in build/parse.js is the gate.
      action: "Combine glucose-lowering agents only under medical supervision; never self-stack with insulin." },
    { id: "liver", tier: "danger", need: [["hepatotoxic", 2]],
      title: "Stacked liver strain",
      why: "The liver clears these and takes strain doing it. Two together (e.g. an oral steroid plus high-dose green-tea extract) stack the load.",
      // exemplars (W4.5): the "e.g." is doing the work — the sentence marks itself as an example on
      // all 66 rows (171 as of W5). Note the lexicon flattens hyphens, so the nameTag "green tea" is
      // matched by "green-tea extract"; without that this mention would have slipped the gate.
      exemplars: ["c30"],
      // 2026-08-02 (W5): "oral" DROPPED from the action. It was already untrue of a shipped carrier
      // — c43 Trenbolone is injected, and its own page says so ("Injectable trenbolone is less
      // hepatotoxic than oral 17-alpha-alkylated steroids, but transaminases are still monitored for
      // injury") — and W5 adds two more non-oral routes, c157 Ketamine / Esketamine (IV and nasal)
      // and c63's ACE-031 (injected). The rule has never been about the route; it is about two
      // things the liver has to clear. The `why` above keeps "an oral steroid plus high-dose
      // green-tea extract" because it is explicitly marked "e.g." and c30 is an acknowledged
      // exemplar.
      action: "Don't combine compounds that stress the liver; get bloodwork if unavoidable." },
    { id: "estrogen_crash", tier: "danger", need: [["aromatase_inhibitor", 2]],
      title: "Estrogen crash",
      why: "Aromatase inhibitors shut down estrogen production. Doubled, estrogen can crash — joint pain, crushed libido, mood and bone problems.",
      action: "Use one AI, dosed to bloodwork; don't zero out estrogen." },
    { id: "dnp", tier: "danger", need: [["do_not_use", 1]],
      title: "DNP — do not use",
      why: "DNP uncouples cellular energy production; the effective and lethal doses nearly overlap, and it can cause fatal overheating.",
      action: "There is no safe way to use or combine DNP." },

    // W4.5 (2026-08-02): the why named three compounds and rendered on 3 rows, each containing
    // exactly one of them — so 2 of every 3 named compounds were absent from the row they were
    // named in. c70 Rapamycin is the sole mtor_inhibitor, so it IS in all three rows and stays
    // named; the activator side is now described by its position in the pair instead of guessed.
    { id: "mtor_conflict", tier: "blunt", need: [["mtor_inhibitor", 1], ["mtor_activator", 1]],
      title: "Opposing growth signals",
      why: "Rapamycin lowers growth signalling for longevity and autophagy; the other half of this pair raises it. Run together, each undoes the other's purpose.",
      action: "Separate by goal and timing; don't run them the same day.", pathway: "/pathway/2" },
    { id: "immune_conflict", tier: "blunt", need: [["immunostim", 1], ["immunosuppress", 1]],
      title: "Opposing immune direction",
      why: "One of these pushes immune activity up and the other pushes it down. Run together each is working against the other's purpose, and what you end up with is whichever is stronger on the day — not something you can dose for.",
      action: "Pick a direction for your goal." },
    { id: "antioxidant_training", tier: "blunt", need: [["antioxidant_hd", 2]],
      title: "May blunt training adaptation",
      why: "The brief oxidative stress of a hard workout is the signal that tells muscle and mitochondria to adapt. Mega-dosing antioxidants around training can mop up that signal.",
      action: "Get antioxidants from food; keep high doses away from your workout window.", pathway: "/pathway/11" },
    { id: "hpta_stack", tier: "blunt", need: [["hpta_suppressive", 2]],
      title: "Compounded testosterone shutdown",
      why: "Each of these suppresses your natural testosterone. Stacked, the shutdown is deeper and recovery is harder.",
      // exemplars (W4.5): "your natural testosterone" is the HORMONE, not the page c33 Testosterone
      // (TRT). The token matches only because a compound page is named after the molecule. True on
      // all 66 rows; rewriting the sentence to avoid the word would make it worse, not truer.
      exemplars: ["c33"],
      action: "Understand the suppression and have a recovery plan; this is not casual stacking.", pathway: "/pathway/9" },
    // Wired 2026-08-01: `5ar_inhibitor` and `glp1` were assigned and read by no rule, which is why
    // Finasteride / Dutasteride could never produce a flag at all. Both are duplicate-therapy
    // rules — the same receptor or enzyme hit twice — which is the same shape as the
    // double_statin rule above, one tier softer because neither is acutely dangerous.
    { id: "double_5ar", tier: "blunt", need: [["5ar_inhibitor", 2]],
      title: "Two 5-alpha-reductase inhibitors — the same job twice",
      why: "Finasteride and dutasteride both block the enzyme that turns testosterone into DHT. Running both is more of one mechanism, not two mechanisms, and the sexual and mood side-effects people quit over scale with the total blockade.",
      action: "Use one, at the dose it was prescribed at." },
    // W4.5 (2026-08-02): "These act on the same receptor" was false on 7 of the 10 rows this rule
    // renders. glp1 has 5 carriers and two of them are not single-receptor drugs by their own
    // authored mechanism: c20 Tirzepatide is a "Dual agonist of **GIPR (GIP receptor)** and
    // **GLP1R**" and c21 Retatrutide is a "First-in-class **triple agonist** — **GLP1R + GIPR +
    // glucagon receptor (GCGR)**". Every row containing either carried a sentence its own page
    // contradicts. What is true of all five, and therefore of all 10 rows, is the GLP-1 arm — so
    // that is what the row now claims, and the extra receptors are acknowledged rather than denied.
    { id: "double_glp1", tier: "blunt", need: [["glp1", 2]],
      title: "Two GLP-1 agonists — duplicate therapy",
      why: "Every one of these activates the GLP-1 receptor; the dual and triple agonists among them act on other metabolic-hormone receptors as well, but GLP-1 is the arm they all share. Two together doses that shared arm twice — a bigger dose of one mechanism rather than a second angle on the problem — and the nausea, vomiting and slowed stomach emptying scale with it.",
      action: "Run one GLP-1 at a time, titrated by whoever prescribed it." },

    { id: "hypotensive_stack", tier: "timing", need: [["hypotensive", 2]], notIf: ["pde5_vasodilator", "nitrate_pde5"],
      title: "Both of these lower blood pressure",
      why: "Each relaxes blood vessels a little, so the drop adds up. On its own that is usually harmless; the way it shows up is light-headedness when you stand up quickly, especially in the first week.",
      action: "Stand up slowly while you settle in. If you already take blood-pressure medication, ask a pharmacist before adding either." },
    // W4.5 (2026-08-02): the why named all three carriers (c103 Melatonin, c104 Apigenin, c170
    // Valerian) on all 3 rows it can render, so every row named a compound that was not in it. It
    // was also wrong about the one it named first: "all nudge the same wind-down machinery" is
    // refuted by melatonin's own mechanism, which "shifts the circadian clock **rather than
    // sedating**". The row now says what is true of any two of the three, including that they are
    // not interchangeable. Note what the replacement deliberately does NOT say: it makes no claim
    // that the two in front of the reader share a mechanism, because for one of the three pairs
    // (melatonin with either of the others) that would be false and for the third I cannot quote a
    // page that says it. Overlap of PURPOSE is what all three pairs support.
    { id: "mild_sedatives", tier: "timing", need: [["sedative_mild", 2]],
      title: "Two mild sedatives at once",
      why: "Each of these is a mild sleep aid, and they overlap in purpose rather than adding a second angle. Taken on the same night they layer and you cannot tell which one did anything — the usual result is a groggy morning rather than deeper sleep.",
      action: "Start with one and give it two weeks before adding anything. If you're also on a strong sedative or drinking alcohol, treat all of these as off-limits." },

    // W4.5 (2026-08-02): the why listed all five minerals on all 28 rows this rule could render.
    // Measured hydrated at 390x844, /stack?ids=c5,c150 rendered "⏰ Minerals compete — space them
    // out · Magnesium + Strontium · Silica (brief)" above a sentence naming calcium, iron and zinc
    // as well — three compounds that were not in the stack. The mechanism is the same for any pair
    // that carries the tag, so the row states the mechanism and stops enumerating the carriers.
    { id: "mineral", tier: "timing", need: [["divalent_mineral", 2]],
      title: "Minerals compete — space them out",
      why: "These compete for the same intestinal uptake, so whichever is in excess wins while the other barely absorbs. Taken in the same mouthful, one of them is largely wasted.",
      action: "Take competing minerals about 2 hours apart." },
    { id: "thyroid_mineral", tier: "timing", need: [["thyroid", 1], ["divalent_mineral", 1]],
      title: "Minerals block thyroid absorption",
      why: "Minerals bind thyroid hormone in the gut and stop it being absorbed; the thyroid page's own absorption note names coffee, calcium and iron. Space any mineral supplement away from the thyroid dose rather than trying to work out which ones.",
      // exemplars (W4.5): an ATTRIBUTED QUOTATION. The sentence says whose list it is — c130's own
      // tech.adme.absorb — and then tells the reader not to rely on the list ("rather than trying
      // to work out which ones"), which is the opposite of claiming those minerals are in the row.
      exemplars: ["c79", "c122", "c148", "c149"],
      action: "Take thyroid medication 4 hours away from minerals and coffee." },
    { id: "zinc_copper", tier: "timing", need: [["zinc", 1]],
      title: "Long-term zinc depletes copper",
      why: "High zinc switches on a gut protein that carries copper out in the stool — over weeks, plenty of zinc can quietly cause copper deficiency.",
      action: "If taking zinc long-term, add ~1 mg copper per 10–15 mg zinc." },
    { id: "cyp3a4_statin", tier: "timing", need: [["cyp3a4", 1], ["statin_like", 1]],
      title: "Bergamot may raise statin levels",
      why: "Bergamot (like grapefruit) can slow the gut enzyme that breaks down statins, nudging their levels up.",
      // exemplars (W4.5): same class noun as statin_niacin. On the one row where c159 is absent the
      // other half is c161 Red Yeast Rice, which its own page calls a natural statin — so "your
      // specific statin" is still about the compound in the row.
      exemplars: ["c159"],
      action: "Be cautious combining; ask a pharmacist about your specific statin." }
  ],

  // Synergies — pairs that work well together (match by name substring; both must be present).
  synergies: [
    { a: "statin", b: "coq10", aIds: ["c159"], aNot: ["c63"], bIds: ["c11"], title: "Statin + CoQ10", why: "Statins deplete CoQ10; replacing it can ease the muscle aches that make people quit statins." },
    { a: "caffeine", b: "theanine", aIds: ["c1", "c24"], bIds: ["c2"], title: "Caffeine + L-Theanine", why: "Theanine smooths caffeine's jitter for clean focus without the crash." },
    { a: "iron", b: "vitamin c", aIds: ["c122", "c148"], aNot: ["c134"], bIds: ["c120"], bNot: ["c109"], title: "Iron + Vitamin C", why: "Vitamin C converts iron to its absorbable form and multiplies uptake." },
    { a: "collagen", b: "vitamin c", aIds: ["c109"], bIds: ["c120"], bNot: ["c109"], title: "Collagen + Vitamin C", why: "Vitamin C is the cofactor your body needs to build collagen from the peptides." },
    { a: "vitamin d", b: "magnesium", aIds: ["c4"], bIds: ["c5"], title: "Vitamin D + Magnesium", why: "Magnesium is a cofactor for activating vitamin D — low magnesium blunts D's effect." },
    { a: "glycine", b: "n-acetylcysteine", aIds: ["c10"], aNot: ["c14", "c80"], bIds: ["c9"], title: "Glycine + NAC (GlyNAC)", why: "Together they restore glutathione more than either alone." },
    { a: "creatine", b: "beta-alanine", aIds: ["c0"], bIds: ["c12"], title: "Creatine + Beta-Alanine", why: "Complementary buffers — creatine fuels short bursts, beta-alanine buffers acid for longer sets." }
  ]
};
