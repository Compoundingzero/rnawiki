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
  // 2026-08-02 (W5.5): 94 → 101. The second time this number has gone UP, and for the same reason as
  // the first: not a tag invented to flatter it, but tags pages already supported that nobody had
  // written down. The under-tagging audit that produced W5's +4 covered ONE of the 26 tags a rule
  // reads; this wave covers all of them, and 20 compounds gain a tag. Seven were previously
  // unreachable altogether — c17 Whey / Casein, c80 GlyNAC, c90 Racetams, c97 Methylene Blue, c107
  // Saffron, c11 CoQ10 and c163's Quercetin. c97 is the starkest: it carried NO tag at all while its
  // own contra block calls serotonin syndrome with an SSRI "a genuine medical emergency" and "the
  // single most important caution". Measured hydrated at 390x844, /stack?ids=c97,c156 rendered
  // "❔ I hold no interaction pharmacology for Methylene Blue" — honest, and a miss.
  // Every figure here is recomputed by assertInteractionCoverage() and the build fails on drift;
  // unreachableRx was read off the gate rather than derived by hand, which is how this file has got
  // numbers wrong before.
  // 2026-08-08 (W6): 101 → 102. Three compounds move and it is not a net of +1 improvements — it
  // is +2 and −1, and the −1 is the one that matters most.
  // UP: c144 Minoxidil, which carried NO tag at all while its own biomarker block opens "Blood
  // pressure | Primary effect is lowering BP; monitored to avoid dangerous hypotension"; and c117
  // Melanotan II, whose biomarker block reads "melanocortin agonism raises blood pressure and heart
  // rate via sympathetic outflow" (c117 is unapproved, so unreachableRx goes 36 → 35).
  // DOWN: c147 Myo-Inositol loses `hypoglycemic`, its only tag. Its whole record contains zero
  // glucose-lowering assertions, and the rule it fed is DANGER tier. It now renders the honest
  // "❔ Not enough to check" instead of "☠️ Additive low-blood-sugar risk · Myo-Inositol +
  // Metformin". A lower true number beats a higher false one — the same principle as the
  // 100→99→97→96→95→90 sequence above.
  // Four more compounds gain a tag and do not move this number because each was already reachable
  // through another one: c82 SGLT2 (`hypotensive`, already reachable via `hypoglycemic`), c113
  // Nattokinase and c74 Resveratrol (`hypotensive`, via `blood_thinning`), c155 Z-drugs/Trazodone
  // (`serotonergic`, via `cns_depressant`) and c63 Follistatin (`blood_thinning`, via
  // `hepatotoxic`). Coverage is the wrong instrument for those five; the verdict is the right one,
  // and all five were rendering a green tick over a hazard their own page documents.
  coverage: { compounds: 171, reachable: 102, unreachable: 69, unreachableRx: 35 },

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
    { m: "ssri", t: ["serotonergic", "blood_thinning"], ids: ["c156"] },   // W5.5 blood_thinning — contra: "SSRIs impair platelet function and raise gastrointestinal bleeding risk"
    { m: "sertraline", t: ["serotonergic"], ids: ["c156"] }, { m: "escitalopram", t: ["serotonergic"], ids: ["c156"] },
    { m: "sam-e", t: ["serotonergic"], ids: ["c168"] },
    // 2026-08-02 (W5.5): THE SINGLE HIGHEST-VALUE LINE IN THIS COMMIT. c97 carried NO tag at all —
    // measured hydrated at 390x844, 0 pageerrors, /stack?ids=c97,c156 rendered "⚠️ 1 thing to review"
    // and "❔ I hold no interaction pharmacology for Methylene Blue", which is honest and is a miss:
    // its own contra block calls this "the single most important caution".
    { m: "methylene blue", t: ["serotonergic"], ids: ["c97"] },  // contra: "Methylene blue is a potent MAO inhibitor and can precipitate **serotonin syndrome** — a genuine medical emergency — even at low doses. Do not combine; this is the single most important caution."
    { m: "saffron", t: ["serotonergic", "blood_thinning"], ids: ["c107"] },   // W5.5 blood_thinning — contra: "Saffron has mild **antiplatelet** activity"
    // W5.5 `stimulant` ADDED, and it is the weakest of the 24 assignments in this commit — NEEDS
    // FELIX. Psilocybin's page asserts the property of itself, unhedged, in a contra block:
    // "Sympathomimetic effects and 5-HT2B receptor activity make repeated dosing hazardous for the
    // heart", and its biomarker adds "Psilocin is mildly sympathomimetic", its overdose line "sharp
    // rises in heart rate and blood pressure". The stim_stack row it now produces is danger-tier and
    // says "Each drives the same fight-or-flight system", which is what sympathomimetic means. If
    // Felix would rather the bar for a DANGER tier row were higher than for a timing one, this is
    // the line to move — and the bar then has to move for every other tag here too.
    { m: "psilocybin", t: ["serotonergic", "stimulant"], ids: ["c158"] },
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
    // W6 (2026-08-08) `hypotensive` ADDED to nattokinase — biomarker: "**Blood pressure** (home
    // cuff) | The most consistent measurable effect; a meta-analysis of RCTs shows a modest
    // SBP/DBP reduction (~3-5 mmHg) over 8 weeks." Human, in RCT meta-analysis, unhedged, asserted
    // of this compound. Exactly the bar that tags c11 CoQ10 ("can modestly lower blood pressure")
    // and c13 Citrulline ("modestly lowers resting BP (meta-analyses ~4/2.5 mmHg)").
    { m: "nattokinase", t: ["blood_thinning", "hypotensive"], ids: ["c113"] }, { m: "omega-3", t: ["blood_thinning"], ids: ["c3"] }, { m: "ginkgo", t: ["blood_thinning"], ids: ["c153"] },
    // `vitamin e` DELETED 2026-08-02: it matched 0 of 171 compound names. A rule that can never
    // match is dead data in a file whose whole job is to be true about what it covers.
    // W6 (2026-08-08) `hypotensive` ADDED — biomarker: "Blood pressure | Meta-analyses show
    // **small systolic reductions**, mostly at higher doses (≥150 mg/day)." Human meta-analyses,
    // unhedged, and the qualifying dose is INSIDE this page's own protocol range ("Pterostilbene
    // 100–250 mg"), so the c130/c124 "above the page's own dose" exclusion does not apply here.
    { m: "resveratrol", t: ["blood_thinning", "hypotensive"], ids: ["c74"] },
    // 2026-08-02 (W5.5): FIVE MORE BLEEDING CARRIERS (two more are on the saffron, ssri and reishi
    // lines elsewhere in this array). Same bar as the W5 hepatotoxic pass, stated once and applied
    // to every candidate the 27 signals surface: TAG when the compound's own SAFETY fields assert
    // the property OF THAT COMPOUND, in humans, unhedged; acknowledge otherwise, with the page's own
    // words. It cuts both ways in visible pairs — c107 Saffron "has mild antiplatelet activity" is
    // tagged, c94 Lion's Mane "may have mild antiplatelet activity" is acknowledged.
    // `bleeding` is a DANGER-tier rule and this is the largest single move in the commit, so every
    // line carries the sentence it rests on.
    // ONE nameTag, BOTH ids, ON PURPOSE: c9 and c80 are two pages of one molecule (GlyNAC IS glycine
    // plus NAC), and writing them as two entries would evade assertDuplicateSubstances' discovery
    // tripwire. Written this way, the build demands the duplicates group below — which is the first
    // time that defect has been caught BEFORE it shipped rather than after.
    { m: "nac", t: ["blood_thinning", "nitrate_potentiator"], ids: ["c9", "c80"], not: ["c94"] },
    // ^ c9 contra: "**Anticoagulants / bleeding risk** High-dose NAC has mild antiplatelet activity";
    //   c80 contra: "NAC has mild antiplatelet activity"; both: "NAC potentiates nitrate vasodilation
    //   and can cause marked hypotension and severe headache". `not: c94` — "Hericium eriNACeus" is
    //   the substring-collision this file exists to catch; Lion's Mane is a mushroom, and its own
    //   antiplatelet sentence says "may have", which is why it is acknowledged rather than tagged.
    { m: "piracetam", t: ["blood_thinning"], ids: ["c90"] },   // contra: "Blood thinners / upcoming surgery | Piracetam has **antiplatelet/haemorheological activity**"
    // c163 is a four-substance brief page. The bar applied to every bundle page in this commit: a
    // hazard firmly asserted of a NAMED component is a hazard of the page, because the page is the
    // unit a reader adds to a stack. `not: c76` is the other quercetin page — its own safety fields
    // assert none of these three properties (it returns zero hits for all three signals over all
    // 171); its warnings are about the dasatinib pulse, not about quercetin's antiplatelet activity.
    { m: "quercetin", t: ["blood_thinning", "hypotensive", "cyp3a4"], ids: ["c163"], not: ["c76"] },
    // ^ contra: "Antihypertensive or antiplatelet/anticoagulant medication | Quercetin can modestly
    //   lower blood pressure and has mild antiplatelet activity"; contra: "**Quercetin inhibits
    //   CYP3A4 and P-glycoprotein** and can raise levels of drugs such as ciclosporin, some statins".
    // strong CNS depressants → additive sedation / respiratory depression
    { m: "phenibut", t: ["cns_depressant"], ids: ["c101"] }, { m: "zolpidem", t: ["cns_depressant"], ids: ["c155"] }, { m: "z-drug", t: ["cns_depressant"], ids: ["c155"] },
    // W5.5 `hepatotoxic` ADDED, and it REVERSES this page's own shipped acknowledgement, which said
    // tagging a bundle page asserts the hazard of zolpidem and doxylamine too. Three positions
    // cannot all be right: c170 Valerian was TAGGED in W5 on "Rare **hepatotoxicity reports**", and
    // c131's orlistat sentence is stronger than either. The bar is now applied uniformly — a hazard
    // firmly asserted of a NAMED component of a bundle page is a hazard of the page, because the
    // page is the unit a reader adds to a stack. Measured hydrated at 390x844, 0 pageerrors, before
    // this line: /stack?ids=c155,c30 rendered `<span class="ixn-verdict ok">✅ Nothing flagged
    // between the 2 of 2 I have pharmacology for` with zero rows, over Z-drugs + Green Tea Extract.
    // If Felix prefers the opposite bar, it has to be applied to c131, c141, c153 and c163 as well,
    // and it reopens c170.
    // W6 (2026-08-08) `serotonergic` ADDED, and this was the worst live miss in the file. Measured
    // hydrated at 390x844, 0 pageerrors, /stack?ids=c155,c156 — Trazodone + SSRIs — rendered
    // `<span class="ixn-verdict ok">✅ Nothing flagged between the 2 of 2 I have pharmacology for`
    // with ZERO rows. A green tick, claiming pharmacology for both, over a textbook
    // serotonin-syndrome pair. c155's own contra says it: "Current or recent MAOI or **other**
    // strongly serotonergic drugs (trazodone) | Risk of serotonin syndrome; combination requires a
    // doctor-managed washout." The word "other" places trazodone inside that set, the parenthetical
    // says which member of this bundled page the flag is about, and nothing is hedged.
    // The scan cannot see that sentence — see hazardAudit.carriers["c155:serotonergic"] for why.
    { m: "trazodone", t: ["cns_depressant", "hepatotoxic", "serotonergic"], ids: ["c155"] },  // biomarker: "Liver enzymes (ALT/AST) | Trazodone has rare case reports of hepatotoxicity"
    { m: "orexin", t: ["cns_depressant"], ids: ["c154"] }, { m: "suvorexant", t: ["cns_depressant"], ids: ["c154"] },
    { m: "lemborexant", t: ["cns_depressant"], ids: ["c154"] }, { m: "doxylamine", t: ["cns_depressant"], ids: ["c155"] },
    // mild sedatives → gentle stacking note only
    { m: "melatonin", t: ["sedative_mild"], ids: ["c103"] }, { m: "valerian", t: ["sedative_mild"], ids: ["c170"] }, { m: "apigenin", t: ["sedative_mild"], ids: ["c104"] },
    // W5.5: two more. Note the rule's `why` was rewritten in the same commit — it used to say "Each
    // of these is a mild sleep aid", and Bacopa is not one: its own page is about memory
    // consolidation over 8–12 weeks and only mentions drowsiness as a reason to move the dose to the
    // evening. The tag is right and the sentence was not, so the sentence changed.
    { m: "bacopa", t: ["sedative_mild"], ids: ["c95"] },       // contra: "**Sedatives / CNS depressants** | Bacopa can be mildly sedating"
    // glucose-lowering → additive hypoglycemia
    { m: "metformin", t: ["hypoglycemic"], ids: ["c71"] },
    // W5.5 `cyp3a4` ADDED — avoid: "It inhibits CYP3A4, so it interacts with many prescriptions
    // (statins, immunosuppressants, some blood thinners)"; contra: "Berberine inhibits
    // CYP3A4/CYP2D6 and P-glycoprotein, raising blood levels of many drugs (some statins,
    // cyclosporine, and others)". Compare c104 Apigenin, acknowledged because its page says the
    // same thing "in vitro" and "theoretically".
    { m: "berberine", t: ["hypoglycemic", "cyp3a4"], ids: ["c29"] }, { m: "acarbose", t: ["hypoglycemic"], ids: ["c72"] },
    { m: "panax", t: ["hypoglycemic"], ids: ["c153"] },        // W5.5 — contra: "Diabetes, blood-pressure medication, or warfarin | **Panax ginseng** can lower blood glucose"
    { m: "semaglutide", t: ["hypoglycemic", "glp1"], ids: ["c19"] }, { m: "tirzepatide", t: ["hypoglycemic", "glp1"], ids: ["c20"] }, { m: "retatrutide", t: ["hypoglycemic", "glp1"], ids: ["c21"] },
    { m: "liraglutide", t: ["hypoglycemic", "glp1"], ids: ["c22"] }, { m: "orforglipron", t: ["hypoglycemic", "glp1"], ids: ["c23"] }, { m: "cagrilintide", t: ["hypoglycemic"], ids: ["c128"] },
    // W6 (2026-08-08) `hypotensive` ADDED to c82 — biomarker: "Serum electrolytes and volume/blood
    // pressure | Diuretic-like effect can cause dehydration, hypotension and electrolyte shifts,
    // especially with other diuretics." Asserted of the drug, in humans, unhedged, and NOT the
    // overdose line. Measured hydrated at 390x844: /stack?ids=c82,c11 was a green tick over zero
    // rows, against a page that says this and a counterpart (c11 CoQ10) already tagged hypotensive.
    { m: "sglt2", t: ["hypoglycemic", "hypotensive"], ids: ["c82"] }, { m: "insulin", t: ["hypoglycemic"], ids: ["c132", "c133"] }, { m: "alpha-lipoic", t: ["hypoglycemic", "antioxidant_hd"], ids: ["c162"] },
    // `myo-inositol` / c147 `hypoglycemic` DELETED 2026-08-08 (W6). THE ONLY EDIT IN THIS WAVE THAT
    // REDUCES WHAT THE CHECKER SAYS, and the reason the coverage number below goes down by one.
    // A recursive scan of c147's whole record returns ZERO glucose-lowering assertions. Its
    // mechanism is "the 40:1 myo:D-chiro ratio improves ovarian insulin signalling"; its biomarker
    // why is "The primary mechanism is restoring ovarian insulin sensitivity"; its pregnancy contra
    // says it is "Widely studied and generally regarded as safe (including for gestational-diabetes
    // risk)". Nowhere does the page say it lowers blood sugar — and the rule this tag fed is DANGER
    // tier. Measured hydrated at 390x844, /stack?ids=c147,c71 rendered "☠️ 1 dangerous combination
    // — read below" over "☠️ Additive low-blood-sugar risk · Myo-Inositol (+ D-Chiro) + Metformin".
    // c147 has no other tag, so it now goes dark — to the honest "❔ Not enough to check", never to
    // a green tick. NEEDS FELIX: one authored glucose sentence on that page brings the tag back.
    // blood-pressure lowering / nitrate / PDE-5
    { m: "beetroot", t: ["hypotensive", "nitrate"], ids: ["c114"] }, { m: "nitrate", t: ["hypotensive", "nitrate"], ids: ["c114"] },
    { m: "pde-5", t: ["hypotensive", "pde5"], ids: ["c116"] }, { m: "sildenafil", t: ["hypotensive", "pde5"], ids: ["c116"] }, { m: "tadalafil", t: ["hypotensive", "pde5"], ids: ["c116"] },
    { m: "citrulline", t: ["hypotensive"], ids: ["c13"] }, { m: "taurine", t: ["hypotensive"], ids: ["c8"] },
    { m: "coq10", t: ["hypotensive"], ids: ["c11"] },          // W5.5 — contra: "On blood-pressure medication | CoQ10 can modestly lower blood pressure". Compare c83 Astaxanthin, acknowledged because its page says "may".
    // W6 (2026-08-08): c144 Minoxidil carried NO TAG AT ALL while its own biomarker block opens
    // with the property. contra: "Uncontrolled or borderline low blood pressure | **Additive
    // hypotension** can cause fainting and falls"; biomarker: "Blood pressure | **Primary effect is
    // lowering BP**; monitored to avoid dangerous hypotension and to guide titration"; misuse: "it
    // is a potent vasodilator". Measured hydrated at 390x844, /stack?ids=c144,c11 rendered
    // "❔ Not enough to check — I have interaction pharmacology for 1 of these 2". The shipped
    // signal missed it because its pattern was `lowers? (blood pressure|BP)` and the page writes
    // "lowering BP"; the widened `lower(s|ing)?` alternation below is what surfaced it.
    // Its reflex tachycardia is deliberately NOT tagged `stimulant` — that is a compensatory
    // response to vasodilation, not the adrenergic drive stim_stack describes (same reading that
    // deleted PT-141 in W3.6).
    { m: "minoxidil", t: ["hypotensive"], ids: ["c144"] },
    // W6 (2026-08-08): c117 Melanotan II likewise carried no tag. biomarker: "Blood pressure |
    // melanocortin agonism raises blood pressure and heart rate **via sympathetic outflow**";
    // contra: "Cardiovascular disease or uncontrolled hypertension | Avoid; the drug can raise
    // blood pressure and heart rate." Neither sentence is overdose-qualified, and "via sympathetic
    // outflow" names the fight-or-flight system stim_stack's why describes. Note this is the exact
    // INVERSE of c115 PT-141, whose tag was deleted in W3.6 because its page says each dose "raises
    // systolic BP by roughly 6 mmHg and LOWERS heart rate" — same receptor family, opposite
    // authored statement, opposite decision.
    { m: "melanotan", t: ["stimulant"], ids: ["c117"] },
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
    // reachable and coverage does not move — it was 90/171 both before and after THAT change, on
    // 2026-07-31. That is a record of one edit, not the current figure: `coverage.reachable` at the
    // top of this file is the live number, and assertInteractionCoverage() in build/parse.js
    // recomputes it from the corpus and fails the build if it drifts. A lower honest number beats a
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
    // W5.5 `sedative_mild` ADDED — avoid: "Sedatives and benzodiazepines (additive drowsiness)";
    // contra: "Sedatives, benzodiazepines, or alcohol | Additive sedation is possible"; its own
    // mechanism modulates GABA receptors and its plain-English line says it "improves sleep, calm".
    { m: "ashwagandha", t: ["hepatotoxic", "sedative_mild"], ids: ["c105"] },   // contra: "Liver disease or other hepatotoxic drugs | Rare cases of ashwagandha-associated liver injury are documented"
    { m: "cardarine", t: ["hepatotoxic"], ids: ["c53"] },      // contra: "Avoid — liver injury is among the most reported human effects"; biomarker: "including a documented hepatotoxicity case"
    // W5.5 `hpta_suppressive` ADDED — biomarker: "Total testosterone / LH / FSH | YK-11 suppresses
    // the hypothalamic-pituitary-gonadal axis." Stated flatly, in humans, of a named component.
    // W6 (2026-08-08) `blood_thinning` ADDED — the page names the exact interaction the `bleeding`
    // rule renders, in humans, from its own supervised trial. contra: "**Bleeding disorders,
    // anticoagulant/antiplatelet use**, or history of telangiectasia/vascular malformation |
    // ActRIIB ligand traps promoted abnormal vessels and **mucosal bleeding** — bleeding risk is
    // amplified"; misuse: "ACE-031's own supervised trial was **stopped early for bleeding** and
    // vascular events"; overdose: "trial subjects developed nosebleeds, gum bleeding and
    // spider-vein telangiectasias". Measured hydrated at 390x844: /stack?ids=c63,c3 was a green
    // tick over zero rows. c63's route to bleeding is the vessel wall, not clotting — which is why
    // the `bleeding` rule's why is rewritten below to state what is true of every carrier.
    { m: "follistatin", t: ["hepatotoxic", "hpta_suppressive", "blood_thinning"], ids: ["c63"] },    // misuse: "carries documented hepatotoxicity"; contra: "YK-11's hepatotoxicity can precipitate serious liver injury"
    { m: "ketamine", t: ["hepatotoxic"], ids: ["c157"] },      // misuse: "biliary/liver injury"; biomarker: "Repeated ketamine use is linked to hepatotoxicity and biliary tract dilation/cholangiopathy"
    // c170's own contra names the exact interaction the `liver` rule renders, and the checker was
    // clearing it: measured hydrated at 390x844, /stack?ids=c170,c30 rendered `.ixn-verdict ok`
    // "✅ Nothing flagged between the 2 of 2 I have pharmacology for" with 0 rows.
    { m: "valeriana", t: ["hepatotoxic"], ids: ["c170"] },     // contra: "Liver disease or hepatotoxic medications | Rare **hepatotoxicity reports** (mostly multi-herb products)"
    // 2026-08-02 (W5.5): the shipped `hepatotoxic` signal could not see this one at all. hzLive(c131,
    // shipped signal) returned [] — neither "hepatocellular injury" nor "acute liver failure" was in
    // any pos alternation, so the gate was never given the chance to demand a decision. It is a POS
    // GAP, not a missing acknowledgement. Measured hydrated at 390x844, 0 pageerrors, before this
    // line: /stack?ids=c131,c30 rendered "✅ Nothing flagged between the 2 of 2 I have pharmacology
    // for" with zero rows.
    { m: "orlistat", t: ["hepatotoxic"], ids: ["c131"] },      // biomarker: "ALT / AST (liver enzymes) | Rare but serious hepatocellular injury and acute liver failure have been reported with orlistat (FDA review: 13 severe cases, 2 deaths, 3 transplants)"
    // statin-like
    { m: "statin", t: ["statin_like"], ids: ["c159"], not: ["c63"] }, { m: "atorvastatin", t: ["statin_like"], ids: ["c159"] }, { m: "rosuvastatin", t: ["statin_like"], ids: ["c159"] },
    // niacin (myopathy risk with statins)
    { m: "niacin", t: ["niacin"], ids: ["c124"], not: ["c145"] },
    // grapefruit-type metabolism
    // W5.5 `statin_like` ADDED — biomarker: "LDL-C | Primary and best-supported target — bergamot
    // reliably lowers **LDL-C** in trials, via HMG-CoA reductase inhibition (a statin-like moiety in
    // brutieridin/melitidin)". c112 now carries BOTH tags cyp3a4_statin needs, which is what makes
    // the solo-row gate in build/parse.js load-bearing rather than theoretical: without it this one
    // line renders 168 rows of Bergamot interacting with itself.
    { m: "bergamot", t: ["cyp3a4", "statin_like"], ids: ["c112"] },
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
    // W5.5: TWO CARRIERS THE SAFETY-FIELD SCAN COULD NOT HAVE FOUND. mTOR direction is a
    // pharmacodynamic identity, not a hazard, so it is written in `mechanism` and never restated in
    // a warning block — which is why those two signals declare `fields: "mechanism"`.
    { m: "whey", t: ["mtor_activator"], ids: ["c17"] },              // mech: "Complete proteins rich in **leucine**, which activates **mTORC1** to trigger muscle protein synthesis"
    { m: "insulin (anabolic", t: ["mtor_activator"], ids: ["c133"] },  // mech: "Binds the **insulin receptor (INSR)** → GLUT4 glucose/amino-acid uptake and mTOR activation — powerfully anabolic"
    // immune direction
    { m: "beta-glucan", t: ["immunostim"], ids: ["c140"] }, { m: "mushroom", t: ["immunostim"], ids: ["c141"] },
    { m: "reishi", t: ["immunostim", "blood_thinning"], ids: ["c141"] },   // W5.5 blood_thinning — contra: "On anticoagulants / antiplatelets or pre-surgery | **Reishi** can increase bleeding time and has mild antiplatelet activity"
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
      action: "Add up the elemental zinc from both. The long-term copper caution applies to that combined amount, not to either page on its own." },
    // 2026-08-02 (W5.5): NAC — THE FIFTH INSTANCE, AND THE FIRST CAUGHT BEFORE IT SHIPPED. The
    // under-tag audit gives c9 and c80 the same `blood_thinning` tag off the same sentence — c9
    // "High-dose NAC has mild antiplatelet activity", c80 "NAC has mild antiplatelet activity" — and
    // GlyNAC IS glycine plus NAC. Without this group the danger-tier `bleeding` rule fires on one
    // molecule against itself. It was caught because the tag is written as ONE nameTag carrying both
    // ids, which is exactly what trips assertDuplicateSubstances' discovery check; two separate
    // nameTags would have evaded it silently.
    { substance: "n-acetylcysteine", ids: ["c9", "c80"],
      title: "The same substance twice — NAC",
      why: "GlyNAC is glycine plus N-acetylcysteine, so both of these deliver the same NAC. The mild antiplatelet activity both pages describe is that one molecule's, arriving in two products — not two blood-thinning agents adding up.",
      action: "Count the NAC once and add the two amounts together. The pre-surgery and anticoagulant caution applies to that combined amount, not to either page on its own." }
  ],

  // ---- W5 (2026-08-02): THE UNDER-TAGGING AUDIT ----------------------------------------------
  // Read by assertHazardTagCoverage() in build/parse.js, which fails the build on any compound that
  // survives a signal and is neither tagged nor acknowledged here. `pos`/`neg` are regex SOURCES,
  // applied per sentence to the SAFETY FIELDS ONLY (watch, avoid, bio.overdose.line,
  // bio.misuse.line, bio.contra[].flag/advice, bio.biomarkers[].marker/why) — a hazard word in a
  // mechanism paragraph is chemistry; the same word in a contra block is a warning. `neg` is what
  // keeps the output a decision list instead of noise: a whole-record scan returns 36 candidates,
  // this one returns 17 and correctly excludes Boldenone ("skips that particular liver toxicity"),
  // Berberine ("berberine is not a known hepatotoxin"), Milk Thistle, 17-α-Estradiol ("are not
  // documented for 17a-estradiol in humans") and c134 ("less hepatotoxic … a general precaution").
  //
  // ACKNOWLEDGED IS A DECISION, NOT A DISMISSAL. Each entry is a human assertion with the page's own
  // words beside it, exactly like `not:` on a nameTag, and flipping any one of them into a tag is a
  // one-line change. The bar applied to all 171, stated once: TAG when the page states liver injury
  // as documented or reported IN HUMANS for that compound; ACKNOWLEDGE when it is animal-only, above
  // the page's own stated dose range, attributed to a different substance, or monitoring-only.
  hazardAudit: {
    // ---- W5.5 (2026-08-02): 1 SIGNAL BECOMES 27 — ONE PER RULE-CONSUMED TAG --------------------
    // Until now this object declared `hepatotoxic` alone, and assertHazardTagCoverage() iterates the
    // DECLARED signals — so 25 of the 26 tags a rule reads had no under-tag scan at all. The Ostarine
    // fix was real and the class was still wide open. build/parse.js now demands a signal for every
    // rule-consumed tag in both directions, so this block cannot fall behind the rules again.
    //
    // THE ONE RULE THAT MAKES THE OUTPUT A DECISION LIST INSTEAD OF NOISE: a `pos` must match a
    // phrase in which THIS COMPOUND is asserted to HAVE the property. It must not match the
    // COUNTERPARTY — "Anticoagulant / antiplatelet therapy", "On MAOIs", "thyroid medication",
    // "strong CYP3A4 inhibitors" are the other half of an interaction the page is warning about, and
    // a compound is not a blood thinner because its page mentions blood thinners. Measured over all
    // 171: a naive lexicon returns 180 untagged candidates, this one returns 63. The shipped
    // hepatotoxic signal gets away without the rule only because "hepatotoxic" is nearly
    // self-attributing — and even it leaks ("or other hepatotoxic meds"), which is what c41's
    // acknowledgement is for.
    //
    // `fields` defaults to the SAFETY fields. Two signals declare "mechanism" and say why on
    // themselves: a hazard word in a mechanism paragraph is chemistry, but mTOR direction is a
    // pharmacodynamic IDENTITY, and its carriers' safety fields never restate it.
    signals: {
      // `acute liver failure` and `hepatocellular injury` ADDED. Everything else here is the shipped
      // pattern, verbatim. c131's own biomarker block reads "Rare but serious hepatocellular injury
      // and acute liver failure have been reported with orlistat (FDA review: 13 severe cases, 2
      // deaths, 3 transplants)" and the shipped signal returned [] on it — the gate was never given
      // the chance to demand a decision. These two alternations add exactly two candidates
      // corpus-wide, c131 and c87, and no others.
      hepatotoxic: {
        // W6 (2026-08-08) `hepatic (enzyme elevation|load)` and `steatosis or cholestasis` ADDED.
        // Both come from a CARRIER's own words: c37 Tamoxifen ("Tamoxifen can cause hepatic enzyme
        // elevation and, rarely, steatosis or cholestasis") and c43 Trenbolone ("Trenbolone worsens
        // renal strain, adds hepatic load"). Both were tagged and neither was visible to this scan.
        pos: "hepatotox|liver injury|drug[- ]induced liver|cholestatic (hepatitis|jaundice)|liver damage|liver strain|peliosis|acute liver failure|hepatocellular injury|hepatic (enzyme elevation|load)|steatosis or cholestasis",
        neg: "not a known hepatotox|less hepatotox|hepatotoxicity is unproven|no human hepatotoxicity data|are not documented for|avoids? that (specific )?(oral[- ]steroid )?liver toxicity|skips that|precaution rather than|extrapolated from"
      },
      serotonergic: {
        // W6 (2026-08-08): four of the six carriers were invisible to this pattern. Every addition
        // is a carrier's own sentence. `\\*{0,2}` because the corpus bolds mid-phrase — c107's line
        // is "Saffron gently raises **serotonergic** tone", so `serotonergic tone` never matched.
        // c108: "additive serotonin can cause **serotonin syndrome**" / "adds to an already
        // elevated serotonin load". c156: "The gravest risk is serotonin syndrome". c158: "it risks
        // serotonin toxicity". Deliberately NOT added: a bare `other ... serotonergic`, which would
        // match the COUNTERPARTY flags on c28, c32, c151 and c152 — stimulants whose pages warn
        // about serotonergic drugs and are not serotonergic themselves.
        pos: "(it'?s|is) an? (potent )?MAOI?\\b|is an? (potent )?MAO inhibitor|can precipitate \\*\\*serotonin syndrome|serotonin reuptake inhibit|raises? serotonin|serotonergic\\*{0,2} (activity|effect|tone)|inhibits? (MAO|monoamine oxidase)|additive serotonin|already elevated serotonin|serotonin toxicity|risk is serotonin syndrome",
        neg: "not an MAOI?|no serotonergic|does not raise serotonin"
      },
      stimulant: {
        // W6 (2026-08-08): THE WORST-PERFORMING SIGNAL IN THE FILE — it saw 4 of its 15 carriers.
        // Caffeine, ephedrine, yohimbine, clenbuterol, amphetamine and methylphenidate were all
        // invisible to the pattern meant to detect stimulants. Every alternation below is lifted
        // from a carrier: c98 "Nicotine **is a sympathomimetic** that acutely raises both"; c89
        // "stacking it with **other stimulants**"; c24 "**Stacking stimulants** compounds
        // cardiovascular strain"; c25 "**stimulant load** can trigger severe anxiety" and "a
        // **cardiac stimulant**"; c27 "a **hyperadrenergic** crisis" and "**adrenergic
        // stimulation** worsens tremor"; c26 "raises **noradrenergic tone**"; c100 "additive
        // **dopaminergic load**"; c1 "caffeine acutely **raises heart rate**".
        pos: "adrenergic stimulant|sympathomimetic (effect|amine|stimulant|load)|(is|are) (a )?sympathomimetic|(is|are) (a )?stimulants?\\b|stimulant tox|caffeine[- ]like stimulant|these stimulants|other[a-z ,/-]{0,24}stimulants|stacking stimulants|stimulant load|hyperadrenergic|adrenergic (stimulation|tone)|noradrenergic tone|dopaminergic load|(raise|raises|raising|increase|increases)[^.;]{0,24}heart rate|cardiac stimulant",
        neg: "not a stimulant|non[- ]stimulant|lowers heart rate"
      },
      blood_thinning: {
        // W6 (2026-08-08): three carriers were invisible. c3 Omega-3 "High doses modestly **affect
        // bleeding time**"; c113 Nattokinase "**Additive with anticoagulants** — bleeding risk" and
        // "Plausible **additive bleeding risk**"; c153 "**Ginkgo** may **add to bleeding risk**"
        // and "it can also **alter warfarin's effect**"; c63 "ACE-031's own supervised trial was
        // **stopped early for bleeding**" and "promoted abnormal vessels and **mucosal bleeding**".
        pos: "(has|have|having) [^.;]{0,30}antiplatelet|antiplatelet (activity|effects?)|impairs? platelet|potentiates warfarin|(increase|affect)s? bleeding time|raised INR and bleeding risk|inhibits? platelet aggregation|additive with anticoagulants|additive bleeding risk|adds? to bleeding risk|alter warfarin's effect|stopped early for bleeding|mucosal bleeding",
        neg: "theoretical|may theoretically|no antiplatelet"
      },
      cns_depressant: {
        pos: "respiratory depression|breathing (can be )?suppress|suppress(es|ed|ing)? breathing|additive CNS (and respiratory )?depression|CNS depressant",
        neg: "no respiratory depression|does not suppress breathing"
      },
      sedative_mild: {
        pos: "(is|are|can be) (mildly )?sedating|sedative (effect|activity)|additive (drowsiness|sedation)|next[- ](day|morning) (grogginess|drowsiness|sedation)|(promotes?|induces?) (sleep|drowsiness)",
        neg: "not sedating|rather than sedating|non[- ]sedating|poisoning"
      },
      hypoglycemic: {
        pos: "hypoglyc|lower(s|ing)? blood (sugar|glucose)|drops? blood sugar|blood sugar too (low|far)|glucose[- ]lowering",
        // W6 (2026-08-08): the neg was vetoing a carrier's own hypoglycaemia warning. c72 Acarbose:
        // "when combined with insulin or a sulfonylurea it can provoke hypoglycaemia … because
        // acarbose blocks sucrose breakdown and the sugar **will not raise blood glucose** fast
        // enough." The exclusion is meant for pages that say a compound RAISES blood sugar; the
        // lookbehind keeps that and stops it firing on a negated clause. Node-only syntax, and
        // nothing at runtime compiles this — hazardAudit is read by build/parse.js alone.
        neg: "does not cause hypoglyc|no hypoglyc|hypoglycaemia is rare|(?<!not )raises? blood (sugar|glucose)"
      },
      hypotensive: {
        // W6 (2026-08-08): `lowers? (blood pressure|BP)` demanded the two words be adjacent, so it
        // could not see c144 Minoxidil's "Primary effect is **lowering BP**" or c13's "citrulline
        // modestly **lowers resting BP**", and the corpus states the same fact in half a dozen
        // shapes. Each alternation below is a page's own wording: c13 "**Additive vasodilation** can
        // drop blood pressure too far"; c144 "**Additive hypotension** can cause fainting and
        // falls"; c116 "they can **drop blood pressure** to a fatal level"; c82 "Diuretic-like
        // effect can **cause dehydration, hypotension** and electrolyte shifts"; c113 "a modest
        // **SBP/DBP reduction** (~3-5 mmHg)"; c74 "Meta-analyses show small **systolic
        // reductions**".
        pos: "(can|may) (mildly |modestly )?lower(s)? (blood pressure|BP)|lower(s|ing)? [^.;]{0,18}(blood pressure|\\bBP\\b)|blood[- ]pressure lowering|potentiates? nitrate vasodilation|cause(s)? (marked )?hypotension|cause[^.;]{0,32}hypotension|additive vasodilation|additive hypotension|drops? blood pressure|blood-pressure drops|hypotensive (effect|signal)|mmHg (systolic )?(drop|reduction)|reductions in systolic|(systolic|SBP/DBP)[^.;]{0,12}reductions?",
        neg: "overdose|excess |very large boluses|toxicity|raise(s)? blood pressure"
      },
      nitrate: {
        pos: "(dietary|inorganic) nitrate|nitrate source|nitric[- ]oxide donor",
        neg: "not a nitrate"
      },
      // The counterpart of `nitrate`, and the reason c9 is not tagged `hypotensive` — see the
      // nitrate_potentiator RULE below for the full argument. Both carriers say it in one phrase.
      nitrate_potentiator: {
        pos: "potentiates? nitrate vasodilation|potentiates? (the )?vasodilation of nitrates",
        neg: "does not potentiate"
      },
      pde5: {
        pos: "PDE-?5 (inhibitor|drug)|phosphodiesterase[- ]?5 inhibitor",
        neg: "not a PDE-?5"
      },
      statin_like: {
        // W6 (2026-08-08): the signal for "is a statin" could not see THE STATINS. c159's safety
        // fields never use the phrase "is a statin"; they say "Prior **statin-associated
        // rhabdomyolysis** or serious myopathy", "**Statins are** avoided until liver status is
        // clarified", "**Statins can** occasionally raise liver enzymes", "**Statins carry** a
        // modest increase in new-onset type 2 diabetes".
        pos: "is a (natural )?statin|monacolin|HMG-?CoA reductase inhibit|statin[- ]like|statin[- ]associated (rhabdomyolysis|myopathy)|\\bstatins? (can|are|carry)\\b",
        neg: "not a statin"
      },
      niacin: {
        pos: "(high[- ]dose |gram[- ]level )?(niacin|nicotinic acid) (>|can|is)|niacin flush|nicotinic acid",
        neg: "NOT niacin|niacinamide \\(nicotinamide\\), NOT|not nicotinic acid"
      },
      cyp3a4: {
        pos: "inhibits? (CYP3A4|CYP ?3A4)|CYP3A4 inhibitor \\(|grapefruit[- ]like|furanocoumarin",
        neg: "strong CYP3A4 inhibitor|CYP3A4 substrate|concurrent strong|Drugs like|grapefruit juice and strong|raise monacolin"
      },
      divalent_mineral: {
        // W6 (2026-08-08): the corpus states mineral competition as ABSORPTION INTERFERENCE and as
        // ELEMENTAL CONTENT, not as the word "compete". c5 "Magnesium **binds and reduces
        // absorption** of tetracycline/quinolone antibiotics, bisphosphonates and thyroid hormone";
        // c122 "Iron **binds levothyroxine** and certain antibiotics (reducing both)"; c79 "Ca-AKG
        // is ~20% **elemental calcium** by weight". Three of the seven carriers, now visible.
        pos: "compete(s)? (with [^.;]{0,40})?for (the same )?(intestinal )?(uptake|absorption)|competes? with (calcium|iron|zinc|magnesium)|binds and reduces absorption|binds levothyroxine|elemental (calcium|iron|zinc|magnesium)",
        neg: "does not compete|without needing a transporter|rather than by systemic"
      },
      zinc: {
        pos: "elemental zinc|zinc (competes|depletes|supplement)|delivers? [^.;]{0,20}zinc",
        neg: "not zinc"
      },
      thyroid: {
        pos: "(is|are) (a )?thyroid hormone|thyroid hormone replacement therapy|(levothyroxine|liothyronine) (is|dose|therapy)|over[- ]replacement",
        neg: "not a thyroid hormone|reduces absorption of|binds levothyroxine|blunt thyroid hormone action"
      },
      hpta_suppressive: {
        pos: "HPTA suppress|suppress(es|ion|ing)?[^.;]{0,25}(natural )?(testosterone|LH|FSH|gonadotropin)|testosterone (shutdown|suppression)|shuts? down (natural )?testosterone|testicular (shrinkage|atrophy)|HPG shutdown|central suppression",
        neg: "does not suppress|no suppression|without suppress"
      },
      aromatase_inhibitor: {
        pos: "aromatase inhibitor|inhibits? aromatase|crash(es|ing)? estrogen|estrogen (crash|too low)|suppress(es)? (estrogen|oestrogen)",
        neg: "not an aromatase inhibitor|does not inhibit aromatase"
      },
      "5ar_inhibitor": {
        pos: "5-?alpha-?reductase inhibitor|inhibits? 5-?alpha-?reductase|blocks? (the )?conversion (of testosterone )?to DHT",
        neg: "not a 5-?alpha"
      },
      // fields: "mechanism" — MEASURED, not assumed: the string "mTOR" appears in the SAFETY fields
      // of c16, c18 and c62 exactly zero times, and in their `mechanism` once each. Left on the
      // default this signal would match nothing at all, and a scan over an empty set always passes.
      mtor_activator: {
        pos: "(stimulates?|triggers?|activates?|fires?|firing) [^.;]{0,40}mTOR|mTOR activation|Akt/mTOR growth",
        neg: "inhibit[^.;]{0,20}mTOR|dials the",
        fields: "mechanism"
      },
      mtor_inhibitor: {
        pos: "inhibits? [^.;]{0,20}mTOR|mTOR inhibitor|rapalog|mTORC1 while sparing",
        neg: "activates? [^.;]{0,20}mTOR",
        fields: "mechanism"
      },
      immunostim: {
        // W6 (2026-08-08): FOUR OF FIVE CARRIERS INVISIBLE, and the neg was the main culprit. The
        // bare word `immunosuppress` vetoed c140, c141 and c142 because their contra FLAGS are
        // addressed to readers who take immunosuppressants — "Autoimmune condition or
        // **immunosuppressant** use | Beta-glucan **stimulates innate immunity** via dectin-1". The
        // veto is meant for a compound that IS an immunosuppressant, so it now says that.
        // pos additions: c69 "LL-37 is a potent **immune-signalling** molecule" / "an
        // **immune-active** peptide"; c140 "**stimulates innate immun**ity"; c141 "These mushrooms
        // **modulate immune activity**".
        pos: "immune[- ]stimulating|stimulates? (the )?immune|immune (stimulation|activation)|upregulat(es)? immune|(is|are) (an )?immunomodulat|activat(es|ing) (Toll-like|T-cell)|immune[- ](signalling|signaling|active|activating)|stimulates? innate immun|modulates? \\*{0,2}immune activity",
        neg: "reduces inflammation|does not stimulate|(is|are) an immunosuppress|immunosuppressive (drug|therapy)"
      },
      immunosuppress: {
        pos: "\\bimmunosuppression\\b|(is|are) (an )?immunosuppress|immunosuppressive (effect|drug)|suppress(es|ing)? (the )?immune (system|response)|blunt(ed|s)? immunity",
        neg: "take immunosuppress|immunosuppressive therapy|on immunosuppressant|with immunosuppressant|other immunosuppress|immune[- ]stimulating|immune[- ]modulating"
      },
      glp1: {
        // W6 (2026-08-08) `GLP-1-class agonist` ADDED — c21 Retatrutide's own overdose line reads
        // "As a **GLP-1-class agonist**, excess dose causes severe, protracted nausea", and it was
        // the one glp1 carrier this signal could not see.
        pos: "GLP-?1 (receptor )?agonist|activates? (the )?GLP-?1|GLP-?1R|GLP-?1[- ]class agonist",
        neg: "not a GLP-?1"
      },
      antioxidant_hd: {
        // W6 (2026-08-08) `protection` ADDED — c83 Astaxanthin's biomarker why is "A core
        // mechanistic claim is lipid-membrane **antioxidant protection**", and it was a carrier its
        // own signal could not see. c120 and c162 state the property only in `mechanism`; they are
        // recorded in hazardAudit.carriers rather than reached by widening this into every page
        // that mentions oxidation.
        pos: "(it is|is) an antioxidant|antioxidant (dose|load|capacity|protection)|blunt[^.;]{0,40}(adaptive|training|adaptation)|high[- ]dose antioxidant",
        neg: "pro-?oxidant|not an antioxidant"
      },
      do_not_use: {
        pos: "no safe margin|no safe dose and no medical use|lethal the next|fatal overdose has occurred at amounts",
        neg: "not fatal"
      }
    },
    // ACKNOWLEDGED IS A DECISION, NOT A DISMISSAL — and the bar is stated once and applied to all 65
    // candidate hits the 27 signals surface. TAG when the compound's own safety prose asserts the
    // property OF THAT COMPOUND, in humans, unhedged. ACKNOWLEDGE when it is hedged ("may", "in
    // theory", "could plausibly"), animal- rodent- or lab-only, attributed to another substance or
    // to a class the page then withdraws for this molecule, overdose-only, monitoring-only, or the
    // COUNTERPARTY — the other half of an interaction the page is warning about. The bar cuts both
    // ways in visible pairs: c11 CoQ10 "can modestly lower blood pressure" is TAGGED while c83
    // Astaxanthin "may modestly lower blood pressure" is here; c107 Saffron "has mild antiplatelet
    // activity" is TAGGED while c94 Lion's Mane "may have" is here.
    // 10 entries become 41: 9 of the shipped 10 are carried forward verbatim, "c155:hepatotoxic" is
    // DELETED because c155 is now tagged, and 32 are new — one per candidate the widened scan
    // surfaces that did not meet the bar. SEVEN carry "NEEDS FELIX", where the page is a step
    // stronger than the decision I made.
    acknowledged: {
      "c71:antioxidant_hd": "Metformin — TRUE EFFECT, WRONG MECHANISM. Its watch line does say 'blunts exercise adaptation', but the antioxidant_training rule's why is explicitly about mopping up the oxidative signal, and metformin is not an antioxidant. Tagging it would print a radical-scavenging mechanism this page never claims. NEEDS FELIX: the ACTION (keep it away from the training window) may still be right for metformin — that would be a new rule, not this tag.",
      "c81:antioxidant_hd": "Sulforaphane — ENDOGENOUS CAPACITY, NOT A HIGH DOSE. The only hit is a biomarker why: 'NRF2 activation supports hepatic detox/antioxidant capacity.' That is the body's own antioxidant system being upregulated, not a mega-dose of an exogenous antioxidant around training.",
      "c44:blood_thinning": "Oxandrolone — WARFARIN PHARMACOKINETICS, NOT ANTIPLATELET ACTIVITY. 'It also potentiates warfarin (dangerous bleeding).' The bleeding rule's why says each carrier 'independently slows clotting (dissolving fibrin or making platelets less sticky)'; oxandrolone does neither, it raises a warfarin level.",
      "c75:blood_thinning": "Fisetin — ATTRIBUTED TO THE CLASS, AND HEDGED: 'Flavonoids can have mild antiplatelet effects.' The sentence is about flavonoids generally, not about fisetin.",
      "c94:blood_thinning": "Lion's Mane — HEDGED: 'Lion's Mane **may** have mild antiplatelet activity — discuss with your doctor.' Compare c107 Saffron, which is tagged because its page says 'has'.",
      "c110:blood_thinning": "Glucosamine + Chondroitin — SAME SHAPE AS c44. '**Warfarin / anticoagulants** … multiple case reports and pharmacovigilance signals of **raised INR and bleeding risk**.' INR destabilisation on warfarin is a drug-specific interaction, not intrinsic antiplatelet activity. NEEDS FELIX: the human case-report evidence here is stronger than c44's.",
      "c126:blood_thinning": "Cordyceps — HEDGED: 'Cordyceps **may** have **antiplatelet effects**.' Same bar as c94.",
      "c95:cns_depressant": "Bacopa — THE FLAG IS THE COUNTERPARTY. The matched sentence is the contra flag '**Sedatives / CNS depressants**'; Bacopa's own assertion in the same entry is 'can be mildly sedating', which is why it is now TAGGED sedative_mild instead. The danger-tier sedation rule would overstate a mild herb.",
      "c104:cns_depressant": "Apigenin — THEORETICAL: 'It binds the benzodiazepine site of GABA-A receptors **in lab studies**, so a **theoretical additive effect with other CNS depressants** can't be ruled out.' It already carries sedative_mild, which is the honest tier.",
      "c138:cns_depressant": "DSIP — COUNTERPARTY FLAG PLUS A HEDGE: 'Use of sedatives, opioids or other CNS depressants … Reported drowsiness and blood-pressure lowering **could** compound with these.' NEEDS FELIX: DSIP is a sleep peptide whose overdose line reports excessive drowsiness; sedative_mild may be the right tag and the signal does not currently reach it.",
      "c170:cns_depressant": "Valerian — IT IS THE MILD HALF OF THAT WARNING. 'Alcohol, benzodiazepines, or other CNS depressants **Additive sedation** — do not stack' names the strong depressant as the counterparty. c170 already carries sedative_mild.",
      "c104:cyp3a4": "Apigenin — IN VITRO AND THEORETICAL: 'Apigenin can **inhibit CYP3A4 and CYP2C9** **in vitro**, which could **theoretically** alter drug metabolism.' Compare c29 Berberine, tagged because its page states it flatly.",
      "c87:hepatotoxic": "17-α-Estradiol — A CLASS STATEMENT ABOUT ESTROGENS, WHICH THE PAGE THEN WITHDRAWS FOR THIS MOLECULE: 'Estrogens can cause cholestatic or hepatocellular injury', while the same record says the estrogenic harms 'are not documented for 17a-estradiol in humans'.",
      "c41:hepatotoxic": "Fadogia Agrestis — RAT ONLY. Its own overdose line says 'No human liver injury has been formally documented, but the animal liver and kidney signal is a genuine concern.' Product constraint 7 caps animal-only evidence; a danger row asserting human liver strain would go past what the page supports. NEEDS FELIX: its contra block does say 'Existing liver or kidney disease, or use of other hepatotoxic medication/supplements — Avoid', which is the exact interaction the rule renders. If that sentence is authoritative, tag it.",
      "c102:hepatotoxic": "Dihexa — RODENT ONLY: 'Rodent work also reported hepatotoxicity at doses only modestly above the effective range.' No human statement anywhere on the page.",
      "c124:hepatotoxic": "Niacin / NADH — ABOVE THE PAGE'S OWN RANGE. Hepatotoxicity is asserted only for gram doses ('High-dose niacin (>1 g/day), especially sustained-release, can be **hepatotoxic**') while the same page's dosing cap reads 'Supplemental **UL for nicotinic acid is 35 mg/day**'. Tagging it would fire a danger row on a 35 mg B-vitamin.",
      "c72:hepatotoxic": "Acarbose — DOSE-CONDITIONAL AND RARE: 'Dose-related transaminase elevation and rare hepatotoxicity occur, more likely above 50 mg three times daily; monitoring catches it before jaundice.' A prescription drug titrated by a clinician; already rule-reachable via `hypoglycemic`.",
      "c31:hepatotoxic": "Naltrexone/Bupropion — POTENTIAL, NOT OCCURRENCE: 'Naltrexone carries dose-related hepatotoxicity potential; new abdominal pain, dark urine, or jaundice warrants stopping and testing.' The page states a monitoring trigger, not a documented harm.",
      "c42:hepatotoxic": "Nandrolone — THE PAGE POINTS BOTH WAYS. Its overdose line reports 'liver strain including reported peliosis hepatis (blood-filled hepatic cysts)', but its biomarker why says 'Chronic use can cause liver strain, though injectable nandrolone is less hepatotoxic than oral 17-alkylated steroids.' NEEDS FELIX: this is the only AAS on the site with a documented hepatic lesion and no tag.",
      "c66:hepatotoxic": "GHK-Cu — ABOUT COPPER POISONING, NOT THE PEPTIDE AT DOSE: 'Copper overload causes … in more severe toxicity, hemolytic anemia, liver injury (jaundice, rising transaminases) and, in acute copper poisoning, acute kidney injury and multi-organ failure.'",
      "c76:hepatotoxic": "Quercetin + Dasatinib — MONITORING ONLY. The single hit is a biomarker why: 'Monitors for hepatotoxicity and informs dosing.' No harm is asserted.",
      "c143:hepatotoxic": "Tretinoin / Retinoids — CAUTION ON ORAL THERAPY, under prescription: 'Significant liver disease or high triglycerides | Oral retinoids can worsen liver injury and lipid levels and are used with caution or avoided.' Its biomarker adds 'Oral retinoids can cause dose-related hepatocellular enzyme elevation' — a monitored lab change, not a documented injury. NEEDS FELIX: 'can worsen liver injury' is a step stronger than this acknowledgement, and the compound this rule would pair it with is exactly a second hepatic load.",
      "c31:hypoglycemic": "Naltrexone/Bupropion — CAUSED BY THE OTHER DRUG: 'Weight loss can lower glucose and cause hypoglycemia **if insulin or sulfonylureas are not adjusted downward**.' The falling glucose is the un-adjusted insulin's, not Contrave's.",
      "c32:hypoglycemic": "Phentermine / Qsymia — SAME SHAPE AS c31: 'Weight loss and reduced intake can cause hypoglycemia, **needing diabetes medication adjustment**.'",
      "c61:hypoglycemic": "Human Growth Hormone — OVERDOSE ONLY, AND THE STEADY STATE POINTS THE OTHER WAY: 'Acute excess can cause hypoglycemia first, then rebound hyperglycemia.' GH's ordinary metabolic effect on this page is insulin resistance.",
      "c85:hypoglycemic": "MOTS-c — SPECULATIVE, BY ITS OWN WORD: 'an exaggerated response **could plausibly** cause hypoglycaemia'. Nothing is reported to have happened.",
      "c94:hypoglycemic": "Lion's Mane — HEDGED: '**May** modestly lower blood glucose.'",
      "c126:hypoglycemic": "Cordyceps — ANIMAL ONLY: 'May **lower blood glucose** **in animal models**.' Product constraint 7.",
      "c142:hypoglycemic": "Elderberry · Andrographis · Lactoferrin · Colostrum — PRECLINICAL, BY ITS OWN WORD: '**Andrographis may add to these effects** (antiplatelet/hypotensive signals, **mostly preclinical**).' The same sentence is why c142 is acknowledged for hypotensive too.",
      "c9:hypotensive": "NAC — NOT AN INDEPENDENT BP-LOWERING AGENT, and this is the decision the whole nitrate_potentiator rule exists to record. Its own words are 'NAC **potentiates nitrate vasodilation**' — the hypotension is the nitrate's, amplified. Tagging `hypotensive` would fire hypotensive_stack against taurine and citrulline under a why ('Each relaxes blood vessels a little') this page does not support, and pde5_vasodilator against sildenafil, which it does not say either: three fabricated rows to buy one true one. The real, named, pairwise interaction is carried by `nitrate_potentiator` instead.",
      "c80:hypotensive": "GlyNAC — identical sentence to c9, identical decision: 'NAC can potentiate nitrate vasodilation and cause marked hypotension and headache.' Carries `nitrate_potentiator`.",
      "c83:hypotensive": "Astaxanthin — HEDGED: 'Astaxanthin **may** modestly lower blood pressure.' Compare c11 CoQ10, tagged because its page says 'can'.",
      "c138:hypotensive": "DSIP — HEDGED AND ROUTE-QUALIFIED: 'Reported drowsiness and blood-pressure lowering **could** compound with these', and its overdose line says 'transient drops in blood pressure (**best documented after intravenous use**)'.",
      "c142:hypotensive": "Elderberry · Andrographis · Lactoferrin · Colostrum — 'mostly preclinical', the same sentence as the hypoglycemic entry above.",
      "c105:immunostim": "Ashwagandha — IN THEORY, BY ITS OWN WORD: 'Autoimmune conditions **May stimulate immune activity in theory**.' NEEDS FELIX: its avoid line is firmer — 'immunosuppressants (it's immune-stimulating)' — and c105 against c70 Rapamycin is exactly the pair the immune_conflict rule exists for.",
      "c126:immunosuppress": "Cordyceps — MODELS, THEORETICAL, AND THE WRONG DIRECTION: 'It is **immunomodulatory** in models, which **could theoretically** interfere with immunosuppression.' Immunomodulatory is not immunosuppressive.",
      "c165:immunosuppress": "Zinc-Carnosine · Akkermansia · S. boulardii · DGL — THE READER'S IMMUNOSUPPRESSION, NOT THE PRODUCT'S. 'Pregnancy / immunosuppression with Akkermansia' is a contra flag describing who should not take it.",
      "c13:pde5": "L-Citrulline — COUNTERPARTY FLAG: 'On nitrates or PDE5 inhibitors (e.g. …)'. Citrulline is not a PDE-5 inhibitor; it already carries `hypotensive`, which is what the rule needs from it.",
      "c154:sedative_mild": "Orexin Antagonists — ALREADY CARRIES THE STRONGER TAG. The hit is an overdose description ('Toxicity is dominated by heavy, prolonged drowsiness and next-day sedation') and c154 carries `cns_depressant`. Adding sedative_mild would print a timing row beside a danger row about the same physiology, and would understate a prescription hypnotic.",
      "c155:sedative_mild": "Z-drugs · Trazodone · Doxylamine — same as c154: carries `cns_depressant`; the hit is a dosing warning ('dangerous next-morning drowsiness and impaired driving').",
      "c106:serotonergic": "Rhodiola Rosea — LAB STUDIES, BY ITS OWN WORD: 'Has documented MAO-inhibiting and serotonergic activity **in lab studies**.' Not a human assertion, and the serotonin rule is danger-tier.",
      // ---- W6 (2026-08-08): eleven more. Every one of them was surfaced by widening a signal, and
      // this is the complete decision list the widened signals produce over the whole corpus —
      // there is no twelfth sitting silently in the gap, because the gate has no third state.
      "c2:hypotensive": "L-Theanine — HEDGED, AND THE PAGE DECLINES THE CLAIM ITSELF: 'L-theanine may modestly blunt stress-related blood-pressure rises; **evidence for lowering resting blood pressure is limited**, but if you're on antihypertensives it's worth mentioning to your doctor.' Blunting a stress-induced rise is not lowering resting pressure. Compare c11 CoQ10, tagged because its page says 'can modestly lower blood pressure'.",
      "c65:hypotensive": "TB-500 — THE CONTAMINANT, NOT THE PEPTIDE: 'unregulated vials frequently carry **bacterial endotoxin**, which can cause fever, chills, rigors, hypotension and, in the worst case, sepsis within hours of an injection.' That is endotoxin's hypotension in a grey-market vial. Nothing on this page says thymosin beta-4 lowers blood pressure, and c65 already lost an immunostim tag in W3.5 for the same kind of inference.",
      "c134:hypotensive": "Letrozole · Raloxifene · Cabergoline · Pregnenolone · Proviron — EXCESS AND UNSUPERVISED USE OF ONE COMPONENT: 'excess cabergoline can cause orthostatic hypotension and fainting' and 'unsupervised cabergoline risks valve fibrosis and dangerous blood-pressure drops'. Both sit outside the supervised dosing this page is written about, and its steady-state sentence is bidirectional — 'Cabergoline can cause marked blood-pressure changes'. NEEDS FELIX: first-dose orthostatic hypotension is an ordinary-dose cabergoline effect, and on that reading this is a tag.",
      "c19:stimulant": "Semaglutide — A CLASS HEART-RATE NOTE, NOT ADRENERGIC DRIVE: 'Resting heart rate | GLP-1 agonists modestly increase resting heart rate.' stim_stack's why says 'Each drives the same fight-or-flight system'; nothing on this page claims sympathomimetic activity. Already rule-reachable through hypoglycemic and glp1.",
      "c22:stimulant": "Liraglutide — the same class sentence and the same decision: 'GLP-1 agonists cause a small mean increase in heart rate that is monitored clinically.'",
      "c23:stimulant": "Orforglipron — the same class sentence and the same decision: 'GLP-1 agonists modestly raise heart rate as a class effect.'",
      "c128:stimulant": "Cagrilintide — the same shape as the GLP-1 pages: 'Amylin and incretin therapies can raise heart rate.' A class monitoring note, not a claim of sympathomimetic activity.",
      "c57:stimulant": "CJC-1295 — EXPOSURE-QUALIFIED, AND THE PAGE NAMES THE OPPOSITE MECHANISM: '**Higher exposures** can cause flushing, **a systemic vasodilatory reaction**, raised heart rate and blood pressure.' A reflex rise on top of vasodilation is not the adrenergic drive stim_stack describes — the same reading that keeps c144 Minoxidil's reflex tachycardia untagged.",
      "c130:stimulant": "T3 / T4 Thyroid — ABOVE THE PAGE'S OWN DOSE: '**Over-replacement** raises heart rate and the risk of atrial fibrillation, especially in older adults.' Replacement to a normal TSH is what this page is about. Same bar that keeps c124's gram-dose niacin out of hepatotoxic.",
      "c106:stimulant": "Rhodiola Rosea — THE CLOSEST CALL IN THIS WAVE. NEEDS FELIX. Its page asserts the property of itself, unhedged, in its safety fields: 'it can be stimulating and disrupt sleep late in the day; **caution with other stimulants**', 'may stack with caffeine/other stimulants', 'The stimulation can feel like overstimulation or a racing feeling'. What the page never says, anywhere, is anything about heart rate or blood pressure — and stim_stack is DANGER tier and prints 'heart rate and blood pressure compound' on every one of the 16 rows it would add. Acknowledging leaves /stack?ids=c106,c1 at the honest '❔ Not enough to check', which is not a green tick. The question underneath is whether the bar for a danger row is 'the page names the interaction' or 'the page states the harm', and whichever is chosen has to apply to c158 Psilocybin too.",
      "c165:divalent_mineral": "Zinc-Carnosine · Akkermansia · S. boulardii · DGL — SURFACED BY THE NEW `elemental` PATTERN, AND THE PAGE SAYS THE OPPOSITE. The hit is a dosing note, 'A single 75 mg dose (~17 mg **elemental zinc**) is modest', while the same record says zinc-carnosine works 'largely by adhering to inflamed mucosa **rather than by systemic zinc absorption**'. It already carries `zinc`, which is the tag its own words support."
    },
    // ---- W6 (2026-08-08): THE CONVERSE LEDGER — CARRIERS NO SIGNAL CAN SEE --------------------
    // `acknowledged` records a compound the scan CAN see and a human decided not to tag. This
    // records the inverse: a compound that CARRIES a tag its own signal cannot see. Both exist for
    // the same reason — there must be no silent third state — and the gate in build/parse.js now
    // demands one or the other for every single assignment.
    // MEASURED before the widening above: 41 of 143 assignments were in this state, and 10 of the
    // 41 could be DELETED with a clean build. The widened signals close 33 of them by reading each
    // carrier's own words. These eight are what is left, and they should not be forced to zero:
    // seven of them are tags that name what a product IS or CONTAINS rather than something its
    // warnings discuss, and one is a tag whose own word the page never writes. A scan of contra
    // blocks and biomarker notes cannot see "this is ~20% elemental calcium by weight", and
    // widening the regex until it could would make it match half the corpus. So the quote is
    // written down by a human, exactly like `not:` and `acknowledged`, and the gate refuses to let
    // the entry outlive the tag.
    carriers: {
      "c155:serotonergic": "Z-drugs · Trazodone · Doxylamine — THE SENTENCE IS SHAPED LIKE A COUNTERPARTY FLAG, WHICH IS THE ONE SHAPE THE SIGNALS ARE FORBIDDEN TO MATCH. Its contra reads: 'Current or recent MAOI or **other** strongly serotonergic drugs (trazodone) | Risk of serotonin syndrome; combination requires a doctor-managed washout.' The word 'other' places trazodone inside the serotonergic set and the parenthetical says which member of this bundled page the flag is about — but a pattern loose enough to match it would also match c28, c32, c151 and c152, four stimulants whose pages warn about serotonergic drugs and are not serotonergic themselves. Recorded by hand instead of bought with four false candidates.",
      "c104:sedative_mild": "Apigenin — THE PAGE STATES THE PROPERTY IN ITS MECHANISM AND HEDGES IT IN ITS SAFETY FIELDS. Mechanism: 'Chamomile flavonoid, a benzodiazepine-site **GABA-A** ligand (mild) and adenosine modulator.' Safety: 'Combined with alcohol, benzodiazepines, or other sedative sleep aids | It binds the benzodiazepine site of GABA-A receptors **in lab studies**, so a **theoretical** additive effect with other CNS depressants can't be ruled out — don't stack sedatives without medical guidance.' The only phrases a signal could reach there are the counterparty list and the hedge. NEEDS FELIX: on the bar this file states — unhedged, in humans, of this compound — that is an acknowledgement, not a tag, and the honest move would be to delete `sedative_mild` from c104 rather than record it. It is kept because it renders a TIMING row, not a danger row, and deleting it is a content decision.",
      "c62:mtor_activator": "IGF-1 LR3 — THE PAGE NEVER WRITES THE WORD mTOR, and this signal reads `mechanism` precisely because its other two carriers state it there. What c62 states instead is the growth signalling the mtor_conflict row is actually about: 'Long-acting insulin-like growth factor-1 analog binding **IGF1R**, driving hyperplasia (new muscle cells) and protein synthesis', and 'Serum IGF-1 | Marks the systemic overdrive of the growth-factor axis'. The ROW's claim is quotable against this page; the TAG's name is not. NEEDS FELIX: one authored sentence naming mTOR deletes this entry.",
      "c120:antioxidant_hd": "Vitamin C — AN IDENTITY, STATED IN THE MECHANISM AND NOWHERE IN THE SAFETY FIELDS: 'a water-phase **antioxidant** regenerating vitamin E'. Its four contra entries are about oxalate stones, iron overload, G6PD haemolysis and lab-test interference. Widening this signal to reach a mechanism clause would make it match every page that mentions oxidation.",
      "c162:antioxidant_hd": "Alpha-Lipoic Acid — the same identity in the same place: 'Both fat- and water-soluble **antioxidant**; regenerates vitamins C/E and glutathione.' Its safety fields are about hypoglycaemia, Hirata disease and T4-to-T3 conversion. It is already rule-reachable through `hypoglycemic`.",
      "c148:divalent_mineral": "DIM / Calcium-D-Glucarate · Vitex · Iron (brief) — THE TAG RESTS ON THE IRON THIS BUNDLE NAMES AND ON NOTHING ELSE: '**Iron** (menstrual loss — test ferritin)', in the page body. Its calcium half was withdrawn in W5 because calcium-D-glucarate is an estrogen-clearance molecule, not a calcium source. The page's safety fields do not mention minerals at all — its only contra is 'Pregnancy or breastfeeding | Avoid all three'.",
      "c149:divalent_mineral": "Calcium (+ D3 + K2) — the mineral is the product. Mechanism: 'Hydroxyapatite mineral substrate; D3 drives absorption, K2 (via **matrix-Gla protein**) directs calcium to bone not arteries.' Its safety fields warn about hypercalcemia, kidney stones, thiazides and digoxin — the reader's calcium load, never competition with another mineral, which is what the `mineral` and `thyroid_mineral` rows are about.",
      "c150:divalent_mineral": "Strontium · Silica (brief) — the page prints the exact action the mineral rule renders, in its raw body rather than in a contra block, which is why the safety-field scan cannot reach it: '**Strontium** (incorporates into bone, raises density readings; **separate from calcium dosing** — ⭐⭐⭐)'. Its contra entries are about VTE risk, renal clearance and DEXA interpretation."
    },
    // Words assertRuleProse() may print that the authored corpus has never used. Four, each real.
    vocab: ["overstimulate", "raisers", "doac", "whoever"]
  },

  // Rules: fire when every `need` [tag, minDistinctCompounds] is satisfied by the stack.
  // tier: danger | blunt | timing.  Each has a plain-English why + action; optional pathway.

  // ---- PAIR VERDICTS (2026-08-13) --------------------------------------------------------------
  // What the `rules` above CANNOT say: "somebody examined this exact combination and there is
  // nothing to act on". Without that, 243 of 257 pairings across the 52 protocols rendered to
  // readers as "not checked yet" — magnesium with fish oil, collagen with vitamin C — which made a
  // genuinely unstudied pair look identical to an ordinary one.
  //
  // A CLEARANCE MUST REST ON A REPORTED FINDING, NOT ON SILENCE. Eighteen recurring pairs were
  // researched and adversarially verified; only these five survived, and the ones that did not are
  // worth recording because they are the standard:
  //   · Collagen + Omega-3 — the trial co-administered them, but has NO adverse-event section at
  //     all. "Nothing came up" was an inference from a paper that never looked. Dropped to nothing.
  //   · Glucosamine/Chondroitin + Vitamin C — the cited arm was "manganese ascorbate", which is not
  //     vitamin C to a reader (it also delivers manganese, which has an intake ceiling), and the
  //     quoted sentence said the arm formed no closed loops in the network — the OPPOSITE of a
  //     clearance. Dropped.
  //   · Caffeine + Creatine — one acute trial at 35 mg caffeine, about a third of a cup of coffee,
  //     which does not address the question a reader actually has (does caffeine blunt creatine
  //     loading). Dropped.
  //   · Ashwagandha + Magnesium, Berberine + Myo-Inositol — no co-administration study found.
  // Those five stay UNCHECKED on the page, which is the honest render and the whole point of having
  // the state. assertPairVerdicts() in build/parse.js refuses any clear without a cited source.
  pairVerdicts: [
    { ids: ["c109", "c120"], tier: "clear",
      title: "Taken together for four months, nothing reported",
      plain: "A four-month trial gave these two together every day and recorded no side effects in anyone.",
      action: "",
      src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11206740/",
      srcLabel: "Nutrients (2024) — randomised, double-blind, placebo-controlled trial of 5 g hydrolysed collagen with 80 mg vitamin C over 16 weeks",
      srcQuote: "Throughout the study, no adverse events or side effects were documented." },

    { ids: ["c5", "c3"], tier: "clear",
      title: "Handled well in one supplement",
      plain: "Over 800 children took both in one supplement for 12 weeks and most doctors said they handled it fine.",
      action: "",
      src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2955638/",
      // MANUFACTURER-SPONSORED AND OBSERVATIONAL, and the label says so rather than hiding it. The
      // product also carried zinc and an omega-6 fat, and its magnesium dose is 80 mg — about a
      // fifth of what somebody taking a magnesium tablet uses. The verdict is that the pairing was
      // examined and tolerated, which is all it claims.
      srcLabel: "Lipids in Health and Disease (2010) — manufacturer-sponsored observational cohort of 810 children on a combined product, 12 weeks",
      srcQuote: "The observing physicians assessed the tolerability of PUFA in combination with magnesium and zinc to be very good or good in 711 children (87.8%), moderate in 45 children (5.6%), and poor in 11 children (1.4%)." },

    { ids: ["c3", "c120"], tier: "clear",
      title: "Tested together in a four-way trial",
      plain: "People took both together for two months with nothing that needed changing.",
      action: "",
      src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3705155/",
      srcLabel: "Journal of Clinical Biochemistry and Nutrition (2013) — randomised trial with a group taking omega-3 and vitamin C together",
      srcQuote: "Group 1 were on 2 omega-3 soft gels and 2 vitamin C pills daily regimen, group 2 were on 2 omega-3 soft gels and 2 vitamin C placebo pills daily regimen, group 3 were on 2 vitamin C pills and 2 omega-3 placebo soft gels and group 4 were on 2 omega-3 placebo soft gels and 2 vitamin C placebo pills daily regimen." },

    { ids: ["c2", "c5"], tier: "clear",
      title: "Taken together for 28 days",
      plain: "People took both in one daily tablet for 28 days and had no more side effects than the dummy pill.",
      action: "",
      src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9102162/",
      // The tablet also held B6, B9, B12 and rhodiola, and its theanine dose is 50 mg — below what a
      // reader taking theanine alone would use. Named in the label so the verdict is not read wider
      // than the trial it rests on.
      srcLabel: "Nutrients (2022) — randomised placebo-controlled trial of a multi-ingredient tablet containing magnesium and 50 mg L-theanine, 100 chronically stressed adults",
      srcQuote: "The effect of a combination of magnesium, vitamins B6, B9, B12, rhodiola and green tea/L-theanine (Mg-Teadiola) on stress was evaluated in chronically stressed, otherwise healthy individuals." },

    { ids: ["c12", "c1"], tier: "clear",
      // THE PLAIN LINE NAMES THE THING THAT DID HAPPEN. The first draft said "nothing came up",
      // which contradicted the very paper it cited — three participants reported skin tingling. A
      // clearance that omits the one reported effect is not a clearance, it is a summary with the
      // inconvenient half removed.
      title: "Taken together in one drink",
      plain: "In a controlled test people drank both together; the only thing reported was harmless skin tingling from beta-alanine.",
      action: "",
      src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11163698/",
      srcLabel: "BMC Sports Science, Medicine and Rehabilitation (2024) — randomised, crossover, single-blind trial of a pre-workout drink containing 3,000 mg beta-alanine and 290 mg caffeine alongside three other ingredients",
      srcQuote: "Three participants from SUP group reported paresthesia in the lower extremities, i.e. skin tingling (an effect of beta alanine). The participants did not report any other side effects after consuming the dietary supplement." },
  
    // ---- 2026-08-14: 32 more exact pairs, each sourced and adversarially re-checked --------
    // 53 pairs across the 52 protocols still rendered as "not checked". A verifier that had not
    // written them re-fetched every source and asked one question: does this paper examine the
    // two TOGETHER? Three were struck on that bar — including one whose source label described a
    // whey-versus-BCAA trial that does not exist; the cited paper had no whey arm at all. 18 more
    // are honestly unstudied and are deliberately NOT recorded here: absence of evidence is not a
    // clearance, and a pair with no verdict correctly renders as unchecked.
    { ids: ["c106", "c5"], tier: "clear",
      title: "Taken together for a month",
      plain: "These two were taken together every day for a month in a trial, with nothing to watch for.",
      action: "",
      src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9102162/",
      srcLabel: "Nutrients 2022 — randomised, placebo-controlled trial of a magnesium plus rhodiola combination in chronically stressed adults (PMC9102162)",
      srcQuote: "No treatment-related AEs with Mg-Teadiola or placebo were identified during this study." },
    { ids: ["c1", "c99"], tier: "clear",
      title: "Given together, nothing reported",
      plain: "Caffeine and tyrosine were given together in one drink to athletes, and no side effects were reported.",
      action: "",
      src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6880365/",
      srcLabel: "Journal of the International Society of Sports Nutrition 2019 — crossover trial of a single drink containing caffeine, theanine and tyrosine in athletes (PMC6880365)",
      srcQuote: "After familiarization, each participant completed two identical testing sessions with provision of a proprietary dietary supplement (SUP) containing caffeine theanine and tyrosine or a placebo (PL)." },
    { ids: ["c1", "c2"], tier: "clear",
      title: "One of the best-tested pairs",
      plain: "People have taken caffeine and theanine together in trials, and nothing came up that needs any change.",
      action: "",
      src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12491391/",
      srcLabel: "British Journal of Nutrition 2025 — double-blind crossover trial giving 200 mg L-theanine with 160 mg caffeine in one dose (PMC12491391)",
      srcQuote: "Thirty-seven overnight sleep-deprived healthy adults (aged 22–30 years, twenty-one men) completed a computerised traffic-scene-related visual stimulus discrimination task before and 50 min after ingesting 200 mg L-theanine–160 mg caffeine combination or a placebo." },
    { ids: ["c5", "c7"], tier: "clear",
      title: "Fine taken together",
      plain: "These two have been studied together, and boron helps the body hold on to magnesium. Nothing to change.",
      action: "",
      src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4712861/",
      srcLabel: "Nothing Boring About Boron — Integrative Medicine review (PMC4712861)",
      srcQuote: "Boron significantly improves magnesium absorption and deposition in bone, yet another beneficial effect of boron's inhibition of 17β-estradiol degradation." },
    { ids: ["c146", "c5"], tier: "clear",
      title: "No conflict found",
      plain: "Reviewed together: hormone therapy helps the body keep more magnesium, so you can take magnesium as usual.",
      action: "",
      src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4586582/",
      srcLabel: "Magnesium in Prevention and Therapy — review (PMC4586582)",
      srcQuote: "Oestrogen is known to stimulate TRPM6 expression. Thus, oestrogen substitution therapy can normalize hypermagnesuria, which occurs frequently in postmenopausal women." },
    { ids: ["c144", "c39"], tier: "clear",
      title: "Meant to be used together",
      plain: "These are deliberately combined in hair loss trials. Results were better than either alone, and side effects were similar.",
      action: "",
      src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12537375/",
      srcLabel: "Minoxidil–finasteride combination vs minoxidil alone — meta-analysis of randomized trials (PMC12537375)",
      srcQuote: "Topical minoxidil-finasteride combination therapy demonstrates superior efficacy for male androgenetic alopecia compared to monotherapy." },
    { ids: ["c144", "c6"], tier: "clear",
      title: "Taken together in a trial",
      plain: "In a trial, about half the people using minoxidil also took a zinc supplement, and it was well tolerated.",
      action: "",
      src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12376952/",
      srcLabel: "Zinc-containing supplement taken alongside hair loss drugs — randomized trial in 225 people (PMC12376952)",
      srcQuote: "Topical minoxidil (5%–2% lotions) was the most used pharmacological treatment (49% in Group A and 52% in Group B). The dietary supplement was well tolerated among all participants, with minimal reported side effects that did not warrant discontinuation of treatment." },
    { ids: ["c123", "c6"], tier: "clear",
      title: "Taken together in a trial",
      plain: "Zinc and selenium were taken together for eight weeks in a trial, and no problems were reported.",
      action: "",
      src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10386647/",
      srcLabel: "Randomized, double-blind, placebo-controlled trial of zinc and selenium co-supplementation, Nutrients (PMC10386647)",
      srcQuote: "Participants in the supplementation group received 25 mg/day of Zn gluconate and 200 mcg/day of Se L-selenomethionine. No side effects of the supplementation were reported during the 8-week intervention while all participants showed a compliance of >90%." },
    { ids: ["c1", "c93"], tier: "clear",
      title: "Both in the same tested drink",
      plain: "Both were in one tested pre-workout drink, and heart rate and blood pressure matched the dummy version.",
      action: "",
      src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9179939/",
      srcLabel: "Trial of a pre-workout supplement containing 300 mg caffeine and 300 mg alpha-GPC, Frontiers in Nutrition (PMC9179939)",
      srcQuote: "The MIPS studied in the current investigation consisted of several potentially ergogenic ingredients including CAF, L-citrulline, betaine, beta-alanine, creatine, and alpha-GPC. HR and BP were measured after testing at 45-minute post-consumption, and the results showed no differences between the treatment and the placebo." },
    { ids: ["c2", "c99"], tier: "clear",
      title: "Both in one tested supplement",
      plain: "A trial gave healthy adults one drink containing both, and nothing came up that needs watching.",
      action: "",
      src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9133906/",
      srcLabel: "Randomized, triple-blinded, placebo-controlled crossover trial of a multi-ingredient nootropic containing L-tyrosine and L-theanine (PMC9133906)",
      srcQuote: "The main ingredients were: L-tyrosine, acetyl L-carnitine, HCL, citicoline sodium, alpha-glycerylphosphorylcholine (GPC), taurine, caffeine, L-theanine, extract from mango leaves, and extract from huperzia leaves." },
    { ids: ["c93", "c99"], tier: "clear",
      title: "Given together, nothing found",
      plain: "Healthy adults took both in the same drink in a trial, with no effect on the heart.",
      action: "",
      src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9133906/",
      srcLabel: "Randomized, triple-blinded, placebo-controlled crossover trial of a multi-ingredient nootropic containing L-tyrosine and alpha-GPC (PMC9133906)",
      srcQuote: "The main ingredients were: L-tyrosine, acetyl L-carnitine, HCL, citicoline sodium, alpha-glycerylphosphorylcholine (GPC), taurine, caffeine, L-theanine, extract from mango leaves, and extract from huperzia leaves." },
    { ids: ["c2", "c93"], tier: "clear",
      title: "Tested in the same formula",
      plain: "Both sat in one supplement tested against a dummy one, and the trial reported nothing to act on.",
      action: "",
      src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9133906/",
      srcLabel: "Randomized, triple-blinded, placebo-controlled crossover trial of a multi-ingredient nootropic containing L-theanine and alpha-GPC (PMC9133906)",
      srcQuote: "An acute ingestion of dietary multi-ingredient nootropic enhances cognitive performance in comparison with placebo without negatively influencing HR or HRV in young healthy adults." },
    { ids: ["c92", "c95"], tier: "clear",
      title: "Two months together, no problems",
      plain: "One small study gave 50 people both for two months; no side effects and nobody stopped.",
      action: "",
      src: "https://lupinepublishers.com/otolaryngology-journal/fulltext/effectiveness-of-bacopa-monnieri-in-the-therapy-of-vertigo-in-association-with-citicoline-ginger-vitamin-b6-and-passionflower.ID.000303.php",
      srcLabel: "60-day study of 50 patients on a combined citicoline plus Bacopa monnieri formulation, Scholarly Journal of Otolaryngology (2022)",
      srcQuote: "citicoline, ginger, vitamin B6, bacopa and passionflower, in oral formulation, at a dose of two tablets per day for sixty days. We have not experienced any side effects; moreover, no patient stopped the treatment." },
    { ids: ["c106", "c2"], tier: "clear",
      title: "Tested in the same capsule, nothing to change",
      plain: "Both were in one daily capsule in a 28-day trial, and nothing came up that needed watching.",
      action: "",
      src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9102162/",
      srcLabel: "Nutrients 2022 — randomized, placebo-controlled trial of a magnesium, B-vitamin, rhodiola and green tea (L-theanine) combination in chronically stressed adults (PMC9102162)",
      srcQuote: "150 mg of Mg, 0.7 mg of vitamin B6, 0.1 mg of vitamin B9, and 1.25 µg of vitamin B12, and Teadiola® (222 mg of rhodiola extract and 125 mg of green tea extract including 50 mg of L-theanine) ... No treatment-related AEs with Mg-Teadiola or placebo were identified during this study." },
    { ids: ["c103", "c5"], tier: "clear",
      title: "Taken together nightly for eight weeks",
      plain: "One group in a trial took both every night for eight weeks and reported no side effects.",
      action: "",
      src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8183043/",
      srcLabel: "Randomized, double-blind, placebo-controlled trial of melatonin and/or magnesium supplementation, with a combined melatonin-plus-magnesium arm (PMC8183043)",
      srcQuote: "Subjects in four groups were receiving: two melatonin tablets (each, 3 mg) plus a 250 mg magnesium oxide tablet (group one) ... During the intervention, no adverse events or symptoms were reported by the patients." },
    { ids: ["c10", "c2"], tier: "clear",
      title: "Both were in the same tested blend",
      plain: "A sleep trial gave people one blend holding both, and nothing came up that you would need to act on.",
      action: "",
      src: "https://researchonline.ljmu.ac.uk/id/eprint/18756/",
      srcLabel: "Langan-Evans et al., Medicine & Science in Sports & Exercise 2023 — randomised, repeated-measures, double-blind crossover trial of a blend containing 3000 mg glycine and 200 mg L-theanine (LJMU open repository record)",
      srcQuote: "a novel nutritional blend comprised of tryptophan, glycine, magnesium, tart cherry powder and L-theanine" },
    { ids: ["c1", "c103"], tier: "blunt",
      title: "Evening caffeine pushes your body clock later",
      plain: "Coffee in the evening shifts your sleep timing later, working against what melatonin is there to do.",
      action: "On nights you take melatonin, keep caffeine to the morning and early afternoon — nothing within about eight hours of bed.",
      src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9541543/",
      srcLabel: "Review of adenosine, caffeine and sleep-wake regulation, covering caffeine's effect on the melatonin rhythm in humans (PMC9541543)",
      srcQuote: "In humans, ~200 mg caffeine ingested in the early evening delayed the endogenous melatonin rhythm by roughly 40 min" },
    { ids: ["c10", "c5"], tier: "clear",
      title: "Studied together, nothing to change",
      plain: "A four-week trial gave people 250 mg magnesium with 1,523 mg glycine daily; side effects were rare.",
      action: "",
      src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12412596/",
      srcLabel: "Randomized placebo-controlled trial of magnesium bisglycinate in 153 adults, Nature and Science of Sleep (2025), PMC12412596",
      srcQuote: "Generalized linear mixed model (GLMM) analysis confirmed a small but statistically significant reduction in ISI scores following supplementation with 250 mg elemental magnesium and 1523 mg glycine daily, with most improvements occurring within the first 14 days and sustained thereafter." },
    { ids: ["c5", "c71"], tier: "clear",
      title: "Fine together, and often the point",
      plain: "Metformin can lower your magnesium over time, and magnesium is the usual fix, so taking both is normal.",
      action: "If you have taken metformin for years, ask for a magnesium blood test instead of guessing your level.",
      src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12221734/",
      srcLabel: "Hypomagnesemia With Metformin Use in Diabetes Mellitus: A Case and Narrative Review, Kidney Medicine (2025), PMC12221734",
      srcQuote: "Hypomagnesemia has also been reported with use of metformin and may be because of gastrointestinal wasting and intracellular accumulation." },
    { ids: ["c1", "c29"], tier: "clear",
      title: "Tested together in people",
      plain: "People took berberine for two weeks, then a coffee's worth of caffeine; how they handled the caffeine barely moved.",
      action: "",
      src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4898966/",
      srcLabel: "Guo et al., Repeated administration of berberine inhibits cytochromes P450 in humans, European Journal of Clinical Pharmacology (2012), PMC4898966",
      srcQuote: "Although AUC0–∞ and Cmax of caffeine did not fall into the bioequivalence criteria of 80–125%, which implies a difference between berberine and controls, the changes in caffeine pharmacokinetics were not statistically significant." },
    { ids: ["c77", "c78"], tier: "clear",
      title: "Looked at together, nothing to do",
      plain: "Researchers who reviewed these two side by side found no reason to change how you take either one.",
      action: "",
      src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC13468152/",
      srcLabel: "Nutrients 2025 review of spermidine, fisetin, berberine and urolithin A (PMC13468152)",
      srcQuote: "At the mechanistic level, a 2025 review comparing spermidine and urolithin A as autophagy/mitophagy inducers concluded that the two compounds operate through distinct but convergent pathways: spermidine through broad EP300-dependent autophagy induction and urolithin A through PINK1/Parkin-specific mitophagy, and proposed that their combination could provide more comprehensive mitochondrial and proteostatic quality control than either compound alone." },
    { ids: ["c71", "c74"], tier: "clear",
      title: "Studied on top of metformin",
      plain: "People already on metformin took resveratrol for six months in a trial and reported no problems from it.",
      action: "",
      src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10138491/",
      srcLabel: "Six-month resveratrol trial in older adults with type 2 diabetes on metformin (PMC10138491)",
      srcQuote: "None of the participants reported adverse events attributable to RV administration." },
    { ids: ["c74", "c77"], tier: "clear",
      title: "Tested together, nothing to watch for",
      plain: "These two have been given together in studies and there was nothing to watch for.",
      action: "",
      src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3044119/",
      srcLabel: "Journal of Cell Biology study of spermidine and resveratrol given together (PMC3044119)",
      srcQuote: "However, the combination of low doses of both agents was highly efficient in triggering autophagy in vivo." },
    { ids: ["c118", "c164"], tier: "clear",
      title: "Made to be taken together",
      plain: "These were taken together in a trial and handled well; the fibre is food for the bacteria.",
      action: "",
      src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5147956/",
      srcLabel: "Trial of a nine-strain probiotic with 10 g of prebiotic fibre in healthy adults (PMC5147956)",
      srcQuote: "Overall, intake of synbiotic Ecologic® 825/FOS P6 was well tolerated by human subjects in our study." },
    { ids: ["c118", "c119"], tier: "clear",
      title: "Taken together in a trial",
      plain: "These two were given in the same capsule for months in a trial, with no problems reported.",
      action: "",
      src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10745841/",
      srcLabel: "Trial of a probiotic supplement combined with L-glutamine in ulcerative colitis (PMC10745841)",
      srcQuote: "Supplementation with probiotics associated with L-glutamine and biotin can improve body composition parameters, which in turn implies an increase in the overall quality of life of patients with UC." },
    { ids: ["c119", "c164"], tier: "clear",
      title: "Given together for six months",
      plain: "Fibre, inulin and glutamine were given together in one daily drink for six months, with no problems reported.",
      action: "",
      src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7354871/",
      srcLabel: "Six-month trial of zinc, glutamine, fibre and prebiotics in young children (PMC7354871)",
      srcQuote: "Supplementation with zinc, glutamine, fiber, and prebiotics during 6 months reduced FC only in those who had low levels at baseline but not in those with impaired integrity." },
    { ids: ["c140", "c6"], tier: "clear",
      title: "Tested together in one product",
      plain: "These two have been given together in a trial and nothing came up that you need to watch for.",
      action: "",
      src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8708701/",
      srcLabel: "Nutrients 2021 — randomised, double-blind, placebo-controlled trial of a beta-glucan plus zinc yeast supplement (PMC8708701)",
      srcQuote: "A single-center, randomized, double-blind, placebo-controlled study was conducted in 72 volunteers who received a synergistic combination of yeast-based ingredients with a unique β-1,3/1,6-glucan complex and a consortium of heat-treated probiotic Saccharomyces cerevisiae rich in selenium and zinc (ABB C1®) or placebo on the next day after getting vaccinated against influenza (Chiromas®) (n = 34) or the COVID-19 (Comirnaty®) (n = 38)." },
    { ids: ["c12", "c18"], tier: "clear",
      title: "Taken together for eight weeks",
      plain: "Athletes took these together for eight weeks in a study and nothing came up that needs handling.",
      action: "",
      src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6769605/",
      srcLabel: "Nutrients 2019 — 8-week randomised double-blind crossover trial of beta-alanine with branched-chain amino acids in elite athletes (PMC6769605)",
      srcQuote: "The results of our study indicate that customarily used BCAA and Cr supplementation, combined with BA, seems to be more effective than BCAA and Cr supplementation combined with ALK as regards to improvements in fat-free mass and exercise adaptation." },
    { ids: ["c12", "c15"], tier: "clear",
      title: "Ten studies have combined them",
      plain: "Ten studies combined these two and found nothing to watch for; together they helped performance.",
      action: "",
      src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11167468/",
      srcLabel: "Systematic review and meta-analysis of combined beta-alanine and sodium bicarbonate supplementation, 10 studies, 243 people (PMC11167468)",
      srcQuote: "The results of this meta-analysis showed that supplementing with beta-alanine and sodium bicarbonate together leads to benefits in exercise performance compared to a placebo, although there was no apparent benefit in taking each of these supplements individually." },
    { ids: ["c1", "c15"], tier: "blunt",
      title: "Bicarbonate cancelled caffeine's lift",
      plain: "In a lifting study, caffeine's boost disappeared when sodium bicarbonate was taken with it.",
      action: "If you take caffeine before training, keep sodium bicarbonate for a different session — the pair also caused more stomach discomfort.",
      src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11677328/",
      srcLabel: "Nutrients 2024 — double-blind crossover trial, 27 trained adults, caffeine and sodium bicarbonate alone and together (PMC11677328)",
      srcQuote: "Thus, acute caffeine and NaHCO3 co-ingestion does not cause a synergic effect on muscular endurance; in fact, it mitigates the ergogenic effect caused by caffeine." },
    { ids: ["c1", "c114"], tier: "clear",
      title: "Fine together before training",
      plain: "Trained cyclists took beetroot juice and caffeine together in a study; neither weakened the other and nothing needed watching.",
      action: "",
      src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4045310/",
      srcLabel: "Handzlik & Gleeson, randomised double-blind crossover trial of beetroot juice (8 mmol nitrate) plus caffeine (5 mg/kg) in 14 trained cyclists, PMC4045310",
      srcQuote: "This finding demonstrates that caffeine alone or in combination with beetroot juice does not affect muscle substrate utilisation and oxygen consumption during exercise." },
    { ids: ["c12", "c99"], tier: "clear",
      title: "Tested together in one drink",
      plain: "Both were given together in one pre-workout drink in a trial; the only thing reported was beta-alanine's usual skin tingling.",
      action: "",
      src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11163698/",
      srcLabel: "Randomised crossover trial of a pre-workout drink containing 3 g beta-alanine and 125 mg L-tyrosine in 12 men, PMC11163698",
      srcQuote: "The aim of the study was to determine the acute effects of a multi-ingredient pre-workout supplement containing: beta-alanine, taurine, caffeine, L-tyrosine, and cayenne pepper (capsaicin) on anaerobic performance." },
  ],

  rules: [
    { id: "serotonin", src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6734608/", srcLabel: "Scotton et al., Int J Tryptophan Res 2019, PMID 31523132 (PMC6734608)", srcKind: "review", srcQuote: "The main drug classes classically implicated in SS can be divided into serotonin precursors, inhibitors of serotonin reuptake from the synaptic cleft, inhibitors of serotonin metabolism, direct serotonin receptor agonists, and drugs that sensitise serotonin receptors ... Severe SS is only usually precipitated by the simultaneous initiation of 2 or more serotonergic drugs", conf: "high", plain: "Several things that each raise serotonin can push it too high, which can make you seriously ill.", tier: "danger", need: [["serotonergic", 2]],
      title: "Serotonin syndrome risk",
      why: "Each of these raises serotonin signalling — by supplying the raw material, by slowing its reuptake, or by acting on the receptor directly. Stacked, serotonin can build up faster than the body clears it and overstimulate receptors.",
      // exemplars (W4.5): CONDITIONAL ADVICE, not a description of the row. The sentence is
      // addressed to a reader who is already on a prescribed antidepressant and tells them what to
      // keep away from it; that is useful on all 10 rows, including the 6 where 5-HTP and SAM-e are
      // not the two compounds shown. Named on purpose, so assertRuleTextRowTruth is told so.
      exemplars: ["c108", "c168"],
      action: "Don't combine serotonin-raisers. If you take a prescribed antidepressant, treat 5-HTP / SAM-e / St John's Wort as off-limits without a doctor.", pathway: "/pathway/7" },
    { id: "bleeding", src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9586694/", srcLabel: "Hatfield et al., Proc (Bayl Univ Med Cent) 2022, PMID 36304597 (PMC9586694)", srcKind: "review", srcQuote: "These supplements alter bleeding through (1) direct antiplatelet or anticoagulant effects, and/or (2) interaction with anticoagulant drugs, often through cytochrome P450 enzymes.", conf: "medium", plain: "Each of these makes blood clot less easily, so together they can make bleeding harder to stop.", tier: "danger", need: [["blood_thinning", 2]],
      title: "Additive bleeding risk",
      // W6 (2026-08-08): "independently slows clotting" stopped being true of every carrier the
      // moment c63 joined this rule. ACE-031 does not slow clotting — its own page says the
      // bleeding comes from BMP9/BMP10 blockade that "promoted abnormal vessels and mucosal
      // bleeding". Same repair W4.5 made to pde5_vasodilator, mineral and sedation: the row states
      // what is true of every carrier instead of one carrier's mechanism.
      why: "Each of these independently raises bleeding risk — by dissolving fibrin, by making platelets less sticky, or by weakening the vessel wall itself. Stacked, the effects add up.",
      action: "Avoid stacking blood-thinners; if you're on a prescribed anticoagulant (warfarin, a DOAC, aspirin), don't add these without medical advice." },
    { id: "nitrate_pde5", src: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2018/021134s010lbl.pdf", srcLabel: "FDA prescribing information, NITROSTAT (nitroglycerin), NDA 021134, sections 4.1 and 7.1", srcKind: "regulator", srcQuote: "NITROSTAT is contraindicated in patients who are using a selective inhibitor of cyclic guanosine monophosphate (cGMP)-specific phosphodiesterase type 5 (PDE-5).", conf: "high", plain: "Both open blood vessels the same way, so together blood pressure can fall dangerously low.", tier: "danger", need: [["nitrate", 1], ["pde5", 1]],
      title: "Nitrate + PDE-5 = blood-pressure crash",
      why: "Nitrates (like beetroot) and PDE-5 drugs (sildenafil / tadalafil) both widen blood vessels through the same NO→cGMP route. Together, blood pressure can drop dangerously.",
      action: "Never combine a nitrate source with a PDE-5 inhibitor.", pathway: "/pathway/4" },
    // W5.5 (2026-08-02): THE PAIR THIS WAVE WAS OPENED ON. Measured hydrated at 390x844, 0
    // pageerrors, before this rule existed: /stack?ids=c9,c114 rendered `<span class="ixn-verdict
    // ok">✅ Nothing flagged between the 2 of 2 I have pharmacology for` with ZERO rows — a
    // clearance claiming pharmacology for BOTH — over NAC + Beetroot, while NAC's own contra reads
    // "**Nitroglycerin / nitrate medications** NAC potentiates nitrate vasodilation and can cause
    // marked hypotension and severe headache".
    // WHY THIS IS NOT A `hypotensive` TAG ON NAC, which would have been the one-line fix: NAC does
    // not lower blood pressure. Its page says it POTENTIATES the nitrate's. A `hypotensive` tag
    // would fire hypotensive_stack against Taurine and L-Citrulline under a why that says "Each
    // relaxes blood vessels a little" — which NAC's page does not support — and pde5_vasodilator
    // against Sildenafil, which it does not say either: three fabricated rows to buy one true one.
    // This rule wires up the sentence the page actually wrote. It renders exactly 2 rows against
    // this corpus (c114 × c9, c114 × c80) and both are quotable. The decision is reversible in one
    // line: acknowledge c9/c80 for `nitrate_potentiator` instead and delete this rule.
    { id: "nitrate_potentiator", src: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2018/021134s010lbl.pdf", srcLabel: "FDA prescribing information, NITROSTAT (nitroglycerin) sublingual tablets, NDA 021134, sections 4.1, 7.1 and 12.1", srcKind: "regulator", srcQuote: "NITROSTAT is contraindicated in patients who are using a selective inhibitor of cyclic guanosine monophosphate (cGMP)-specific phosphodiesterase type 5 (PDE-5). PDE-5-Inhibitors such as avanafil, sildenafil, vardenafil, and tadalafil have been shown to potentiate the hypotensive effects of organic nitrates.", conf: "high", plain: "Both open blood vessels the same way, so blood pressure can drop far enough to cause fainting.", tier: "danger", need: [["nitrate", 1], ["nitrate_potentiator", 1]],
      title: "This makes a nitrate hit harder",
      why: "One of these is a nitrate source and the other potentiates nitrate vasodilation — it does not lower blood pressure on its own, it makes the nitrate do more. Together the drop in blood pressure can be marked, with severe headache alongside it.",
      action: "Keep these apart. If you take a nitrate medication such as nitroglycerin, this combination needs a doctor, not a supplement plan.", pathway: "/pathway/4" },
    // Wired 2026-08-01. `hypotensive` was assigned to 8 compounds and read by no rule, so the
    // checker cleared L-Citrulline + PDE-5 Inhibitors with a green tick while this site's own
    // compendium entry for citrulline says the opposite: "Stacking strong blood-flow agents —
    // citrulline + beetroot + ED drugs (PDE-5) + nitrates together can drop blood pressure
    // dangerously" (content/COMPENDIUM.md:233). This rule wires up what was already written down.
    // `notIf` keeps it from double-counting the nitrate case, which has its own rule above.
    { id: "pde5_vasodilator", src: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2017/020895s049lbl.pdf", srcLabel: "FDA prescribing information, VIAGRA (sildenafil citrate) tablets, NDA 020895, sections 5.5, 7.2 and 7.3", srcKind: "regulator", srcQuote: "Use caution when co-administering alpha-blockers with VIAGRA because of potential additive blood pressure-lowering effects.", conf: "high", plain: "Two different ways of lowering blood pressure add up, so it can fall too far.", tier: "danger", need: [["pde5", 1], ["hypotensive", 2]], notIf: ["nitrate_pde5"],
      // W6 (2026-08-08): "blood-flow agent" and "pushes that same route from the other end" were
      // both true of the five carriers this rule had (citrulline, beetroot, taurine, CoQ10, NAC's
      // nitrate case) and are false of the four it has now. A diuretic-like fluid loss (c82), a
      // potassium-channel opener taken for hair (c144) and two supplements whose pages report only
      // a measured mmHg drop (c113, c74) are not blood-flow agents pushing the NO→cGMP route. Same
      // repair as the `why` above it made in W3 and the one hypotensive_stack takes below: the row
      // says what is true of every compound that can appear in it.
      title: "PDE-5 inhibitor plus another blood-pressure-lowering agent",
      // The `why` must be about the compounds in the ROW. Until 2026-08-01 this sentence named
      // "Citrulline, beetroot and agmatine" — three of the five hypotensive carriers — no matter
      // which pair actually fired it. Measured hydrated at 390x844: /stack?ids=c116,c8 rendered the
      // header "PDE-5 Inhibitors (Sildenafil / Tadalafil) + Taurine" directly above an explanation
      // about three compounds, none of them in the stack. The row now describes the mechanism both
      // halves share instead of guessing which compound filled the second slot. The warning is
      // unchanged in strength — only the false specificity is gone.
      why: "A PDE-5 drug already widens blood vessels through the NO→cGMP route, and the other compound in this stack lowers blood pressure by a route of its own. Two blood-pressure-lowering agents at once can drop it far enough to make you faint.",
      action: "Don't stack blood-pressure-lowering agents on top of a PDE-5 inhibitor — pick one. If you take any blood-pressure medication, this needs a doctor, not a supplement plan.", pathway: "/pathway/4" },
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
    { id: "sedation", src: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2023/018276s059lbl.pdf", srcLabel: "FDA prescribing information, XANAX (alprazolam) tablets, NDA 018276, boxed warning and section 7.1", srcKind: "regulator", srcQuote: "The concomitant use of benzodiazepines and opioids increases the risk of respiratory depression because of actions at different receptor sites in the CNS that control respiration.", conf: "high", plain: "Two things that both slow the brain can together slow breathing enough to be dangerous.", tier: "danger", need: [["cns_depressant", 2]],
      title: "Additive sedation / breathing risk",
      why: "Each of these slows the brain's arousal system by a different route, and each one's own page carries the same warning about the combination: stacked with another sedative, the sedation deepens and breathing can be suppressed.",
      action: "Don't layer strong sedatives. Alcohol counts as one of them — it goes with none of these." },
    { id: "double_statin", src: "https://www.ncbi.nlm.nih.gov/books/NBK584311/", srcLabel: "NCBI Bookshelf NBK584311, \"Red Yeast Rice\", in Prevention and Treatment of Atherosclerosis: The Use of Nutraceuticals and Functional Foods (Springer, 2022)", srcKind: "reference-text", srcQuote: "the co-administration of statins and RYR should be avoided for pharmacodynamic reasons (both have the same mechanism of action) and comparable side effects", conf: "high", plain: "Two things that lower cholesterol the same way add up, which can make muscle damage more likely.", tier: "danger", need: [["statin_like", 2]],
      // W5.5 (2026-08-02): the why and the action both named Red Yeast Rice, and the under-tag audit
      // adds a second statin-like supplement this corpus already documents — c112 Citrus Bergamot,
      // whose own biomarker block says it "reliably lowers **LDL-C** in trials, via HMG-CoA
      // reductase inhibition (a statin-like moiety in brutieridin/melitidin)". Rows go 1 -> 3 and
      // red yeast rice is absent from one of them. The row now states the mechanism all three pairs
      // share.
      title: "Two statin mechanisms at once — muscle-damage risk",
      why: "Each of these blocks HMG-CoA reductase, the same enzyme a prescription statin blocks — one as a supplement, one as a drug, or both as supplements. Doubling that blockade raises the risk of muscle breakdown (rhabdomyolysis).",
      // exemplars (W5.5): "a prescription statin" is the DRUG CLASS, and it happens to be the name of
      // a page (c159). Identical to the argument already made on statin_niacin and cyp3a4_statin: on
      // the rows where c159 is absent the other halves are Red Yeast Rice and Bergamot, both of which
      // their own pages describe as statin-like — so the class noun is still true of what is in the row.
      exemplars: ["c159"],
      action: "Pick one, and never add a statin-like supplement to a prescribed statin without medical review." },
    { id: "statin_niacin", src: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=92b3ec1d-0dc7-4bde-9817-57b1bdf7f0b9", srcLabel: "FDA-approved label, niacin extended-release tablets, section 5.2 Skeletal Muscle (DailyMed, US National Library of Medicine)", srcKind: "regulator", srcQuote: "Cases of rhabdomyolysis have been associated with concomitant administration of lipid-altering doses (≥1 g/day) of niacin and statins.", conf: "high", plain: "Taking high-dose niacin together with a statin has caused serious muscle damage in some people.", tier: "danger", need: [["statin_like", 1], ["niacin", 1]],
      title: "Statin + high-dose niacin — myopathy risk",
      why: "High-dose niacin adds to a statin's small risk of muscle injury.",
      // exemplars (W4.5): "a statin" here is the DRUG CLASS, and it happens to be the name of a
      // page. The rule's other statin_like carrier is c161 Red Yeast Rice, whose own page opens by
      // saying it IS a natural statin — so on the one row where c159 is absent, the class noun is
      // still true of the compound in the row.
      exemplars: ["c159"],
      action: "Only combine under medical supervision; watch for muscle aches." },
    { id: "stim_stack", src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12348313/", srcLabel: "Dobrek L, \"The Review on Adverse Effects of Energy Drinks and Their Potential Drug Interactions\", Nutrients 2025, PMID 40806020 / PMC12348313", srcKind: "review", srcQuote: "A synergistic reaction, expressed as an increase in psychostimulant and cardiovascular stimulant effects, is observed with the combined use of caffeine and sympathomimetics (adrenergic drugs), amphetamine-derived agents, and cocaine.", conf: "high", plain: "Two stimulants at once push the heart harder than one, raising heart rate and blood pressure.", tier: "danger", need: [["stimulant", 2]],
      title: "Stacked stimulants — cardiovascular strain",
      why: "Each drives the same fight-or-flight system. Stacked, heart rate and blood pressure compound — the classic ephedrine + caffeine combo is the cautionary example.",
      // exemplars (W4.5): an EXPLICITLY LABELLED illustration. "the classic ephedrine + caffeine
      // combo is the cautionary example" tells the reader it is an example, not what is in front of
      // them, on all 91 rows. Deleting it to satisfy a name check would remove the one line that
      // makes the mechanism concrete.
      exemplars: ["c1", "c24", "c25"],
      action: "Use one stimulant at a time; don't layer them." },
    { id: "hypoglycemia", src: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2024/021995Orig1s053lbl.pdf", srcLabel: "FDA approved label, JANUVIA (sitagliptin), NDA 021995, Jan 2024 revision", srcKind: "regulator", srcQuote: "Low blood sugar (hypoglycemia). If you take JANUVIA with another medicine that can cause low blood sugar, such as a sulfonylurea or insulin, your risk of getting low blood sugar is higher.", conf: "high", plain: "Two things that each lower blood sugar can push it too low, leaving you shaky, confused or faint.", tier: "danger", need: [["hypoglycemic", 2]],
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
    { id: "liver", src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9936988/", srcLabel: "AASLD practice guidance on drug, herbal, and dietary supplement-induced liver injury, Hepatology 2023, PMID 35899384 (PMC9936988)", srcKind: "guideline", srcQuote: "Concomitant administration of multiple hepatotoxic drugs has also been associated with an increased risk of DILI in several studies.", conf: "high", plain: "Taking two things that can each harm the liver at the same time raises the chance of liver damage.", tier: "danger", need: [["hepatotoxic", 2]],
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
    { id: "estrogen_crash", src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8353230/", srcLabel: "Hyder T et al., Front Endocrinol 2021, PMID 34385978 (PMC8353230)", srcKind: "review", srcQuote: "Similar to AI-induced bone loss, estrogen deprivation has been proposed as a cause for the development of arthralgias.", conf: "medium", plain: "Pushing estrogen very low can make joints ache and can slowly weaken bones.", tier: "danger", need: [["aromatase_inhibitor", 2]],
      title: "Estrogen crash",
      why: "Aromatase inhibitors shut down estrogen production. Doubled, estrogen can crash — joint pain, crushed libido, mood and bone problems.",
      action: "Use one AI, dosed to bloodwork; don't zero out estrogen." },
    { id: "dnp", src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3550200/", srcLabel: "Grundlingh et al., \"2,4-dinitrophenol (DNP): a weight loss agent with significant acute toxicity and risk of death\", J Med Toxicol 2011, PMID 21739343, PMC3550200, doi:10.1007/s13181-011-0162-6", srcKind: "review", srcQuote: "It causes uncoupling of oxidative phosphorylation; the classic symptom complex associated with toxicity of phenol-based products such as DNP is a combination of hyperthermia, tachycardia, diaphoresis and tachypnoea, eventually leading to death. [...] To date, there have been 62 published deaths in the medical literature attributed to DNP. [...] There is a small margin between the beneficial effects and the toxic effects of DNP.", conf: "high", plain: "DNP makes the body burn energy as heat, there is no safe amount, and people have died.", tier: "danger", need: [["do_not_use", 1]],
      title: "DNP — do not use",
      why: "DNP uncouples cellular energy production; the effective and lethal doses nearly overlap, and it can cause fatal overheating.",
      action: "There is no safe way to use or combine DNP." },

    // W4.5 (2026-08-02): the why named three compounds and rendered on 3 rows, each containing
    // exactly one of them — so 2 of every 3 named compounds were absent from the row they were
    // named in. c70 Rapamycin is the sole mtor_inhibitor, so it IS in all three rows and stays
    // named; the activator side is now described by its position in the pair instead of guessed.
    { id: "mtor_conflict", src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2678224/", srcLabel: "Drummond et al., \"Rapamycin administration in humans blocks the contraction-induced increase in skeletal muscle protein synthesis\", J Physiol 2009, PMID 19188252, PMC2678224, doi:10.1113/jphysiol.2008.163816", srcKind: "review", srcQuote: "rapamycin treatment blocks the early (1-2 h) acute contraction-induced increase (~40%) in human muscle protein synthesis [...] the mTORC1 signalling pathway is mechanistically important in regulating the contraction-induced increase in muscle protein synthesis", conf: "high", plain: "One thing tells muscle to grow while the other blocks that same signal, so growth stalls.", tier: "blunt", need: [["mtor_inhibitor", 1], ["mtor_activator", 1]],
      title: "Opposing growth signals",
      why: "Rapamycin lowers growth signalling for longevity and autophagy; the other half of this pair raises it. Run together, each undoes the other's purpose.",
      action: "Separate by goal and timing; don't run them the same day.", pathway: "/pathway/2" },
    { id: "immune_conflict", src: "", srcLabel: "", srcKind: "none", srcQuote: "", conf: "none", plain: "One of these switches your immune system up and the other switches it down.", tier: "blunt", need: [["immunostim", 1], ["immunosuppress", 1]],
      title: "Opposing immune direction",
      why: "One of these pushes immune activity up and the other pushes it down. Run together each is working against the other's purpose, and what you end up with is whichever is stronger on the day — not something you can dose for.",
      action: "Pick a direction for your goal." },
    { id: "antioxidant_training", src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC13113188/", srcLabel: "Mănescu et al., Antioxidants (Basel) 2026;15(4):456, PMID 42072098, PMC13113188", srcKind: "review", srcQuote: "Exercise-derived reactive oxygen species (ROS) are required for mitochondrial and hypertrophic adaptations... Across trials, chronic high-dose vitamins C/E taken close to key sessions are most consistently associated with attenuation of redox-sensitive signaling... When the goal is adaptation, preserve the signal: avoid high-dose, peri-exercise scavengers that flatten redox transients.", conf: "high", plain: "Large vitamin C or E doses taken near training can mute the stress signal your body uses to adapt.", tier: "blunt", need: [["antioxidant_hd", 2]],
      title: "May blunt training adaptation",
      why: "The brief oxidative stress of a hard workout is the signal that tells muscle and mitochondria to adapt. Mega-dosing antioxidants around training can mop up that signal.",
      action: "Get antioxidants from food; keep high doses away from your workout window.", pathway: "/pathway/11" },
    { id: "hpta_stack", src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10620455/", srcLabel: "Grant et al., Endocrine Connections 2023;12(12):e230358, PMID 37855241, PMC10620455", srcKind: "review", srcQuote: "Most symptoms of ASIH can be understood through prolonged feedback inhibition (if not long-term suppression) of gonadotropin-releasing hormone (GnRH) and therefore luteinising hormone (LH) and follicle-stimulating hormone (FSH)... The suppression of gonadotropins is dose dependent and is also dependent on the type of androgen used... The severity of ASIH depends on the type, combination, timeframe and dosages of AAS being abused... Up to 90% may combine various forms of AAS, otherwise known as 'stacking'.", conf: "high", plain: "Each one tells the body to stop making its own testosterone, so together the shutdown goes deeper.", tier: "blunt", need: [["hpta_suppressive", 2]],
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
    { id: "double_5ar", src: "", srcLabel: "", srcKind: "none", srcQuote: "", conf: "none", plain: "Both hair-loss drugs work the same way, so taking two mainly doubles the sexual side effects.", tier: "blunt", need: [["5ar_inhibitor", 2]],
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
    { id: "double_glp1", src: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2026/215256s033lbl.pdf", srcLabel: "FDA Prescribing Information, WEGOVY (semaglutide), NDA 215256, Limitations of Use / Section 12.1", srcKind: "regulator", srcQuote: "Concomitant use of WEGOVY (semaglutide) tablets or WEGOVY (semaglutide) injection with other semaglutide-containing products or with any other GLP-1 receptor agonist is not recommended.", conf: "high", plain: "Both medicines act the same way in the body, so the official label says do not use them together.", tier: "blunt", need: [["glp1", 2]],
      title: "Two GLP-1 agonists — duplicate therapy",
      why: "Every one of these activates the GLP-1 receptor; the dual and triple agonists among them act on other metabolic-hormone receptors as well, but GLP-1 is the arm they all share. Two together doses that shared arm twice — a bigger dose of one mechanism rather than a second angle on the problem — and the nausea, vomiting and slowed stomach emptying scale with it.",
      action: "Run one GLP-1 at a time, titrated by whoever prescribed it." },

    { id: "hypotensive_stack", src: "https://www.ncbi.nlm.nih.gov/books/NBK448192/", srcLabel: "Ringer M, Hashmi MF, Lappin SL. Orthostatic Hypotension. StatPearls, NCBI Bookshelf, NBK448192", srcKind: "reference-text", srcQuote: "The total number of antihypertensive medications prescribed may be a better predictor of orthostatic hypotension than any single drug class.", conf: "high", plain: "The more things you take that lower blood pressure, the more likely you feel dizzy standing up.", tier: "timing", need: [["hypotensive", 2]], notIf: ["pde5_vasodilator", "nitrate_pde5"],
      title: "Both of these lower blood pressure",
      // W6 (2026-08-08): "Each relaxes blood vessels a little" became false the moment c82 SGLT2,
      // c113 Nattokinase and c74 Resveratrol joined this rule. SGLT2 inhibitors do not relax
      // vessels — their own page calls the drop a "Diuretic-like effect [that] can cause
      // dehydration, hypotension and electrolyte shifts" — and neither the nattokinase nor the
      // resveratrol page states a route at all; both report a measured mmHg reduction and stop.
      // The sentence now asserts only what every carrier's page supports, which is the effect and
      // the observable, and no mechanism. The light-headedness line is right for all of them and
      // is unchanged.
      why: "Each of these lowers blood pressure, so the drop adds up. On its own that is usually harmless; the way it shows up is light-headedness when you stand up quickly, especially in the first week.",
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
    { id: "mild_sedatives", src: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=2884d2dc-2d4a-4ca6-ab73-688a80b428eb", srcLabel: "FDA OTC Drug Facts label, BENADRYL (diphenhydramine HCl), DailyMed SPL 2884d2dc-2d4a-4ca6-ab73-688a80b428eb", srcKind: "regulator", srcQuote: "alcohol, sedatives, and tranquilizers may increase drowsiness", conf: "high", plain: "Things that make you sleepy add up, so taking two together can leave you unexpectedly drowsy.", tier: "timing", need: [["sedative_mild", 2]],
      title: "Two mild sedatives at once",
      // W5.5 (2026-08-02): "Each of these is a mild sleep aid" was true of the three carriers this
      // rule had and is FALSE of one of the two the under-tag audit adds. Bacopa's own page is about
      // memory consolidation over 8–12 weeks; the only thing it says about drowsiness is "If it
      // makes you drowsy or foggy, shift the dose to evening". Tagging it is right — "Bacopa can be
      // mildly sedating" is its own contra — and the sentence had to stop claiming a shared purpose
      // it does not have. What IS true of all five carriers, and therefore of all 10 rows, is that
      // each page names drowsiness of its own and warns about it adding to another sedative's:
      // c103 "morning hangover and impaired alertness", c104 "theoretical additive effect with other
      // CNS depressants", c105 "Sedatives and benzodiazepines (additive drowsiness)", c170
      // "**Additive sedation** — do not stack", c95 "can be mildly sedating".
      why: "Each of these can leave you drowsy, and each one's own page names additive drowsiness with another sedative as the thing to avoid. Taken on the same night they layer and you cannot tell which one did anything — the usual result is a groggy morning rather than deeper sleep.",
      action: "Start with one and give it two weeks before adding anything. If you're also on a strong sedative or drinking alcohol, treat all of these as off-limits." },

    // W4.5 (2026-08-02): the why listed all five minerals on all 28 rows this rule could render.
    // Measured hydrated at 390x844, /stack?ids=c5,c150 rendered "⏰ Minerals compete — space them
    // out · Magnesium + Strontium · Silica (brief)" above a sentence naming calcium, iron and zinc
    // as well — three compounds that were not in the stack. The mechanism is the same for any pair
    // that carries the tag, so the row states the mechanism and stops enumerating the carriers.
    { id: "mineral", src: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6722515/", srcLabel: "Kondaiah P et al., Nutrients 2019;11(8):1885, PMID 31412634 (PMC6722515)", srcKind: "review", srcQuote: "Together, these studies suggest competitive interaction between iron and zinc during intestinal absorption.", conf: "medium", plain: "Large iron and zinc doses taken together on an empty stomach compete, so you take in less zinc.", tier: "timing", need: [["divalent_mineral", 2]],
      title: "Minerals compete — space them out",
      why: "These compete for the same intestinal uptake, so whichever is in excess wins while the other barely absorbs. Taken in the same mouthful, one of them is largely wasted.",
      action: "Take competing minerals about 2 hours apart." },
    { id: "thyroid_mineral", src: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=1e11ad30-1041-4520-10b0-8f9d30d30fcc", srcLabel: "FDA Prescribing Information, SYNTHROID (levothyroxine sodium), NDA 021402, Section 7.1 Table 5, via DailyMed (NLM)", srcKind: "regulator", srcQuote: "Table 5. Drugs That May Decrease T4 Absorption (Hypothyroidism). Potential impact: Concurrent use may reduce the efficacy of SYNTHROID by binding and delaying or preventing absorption, potentially resulting in hypothyroidism. [...] Phosphate Binders (e.g., calcium carbonate, ferrous sulfate, sevelamer, lanthanum) [...] Phosphate binders may bind to levothyroxine. Administer SYNTHROID at least 4 hours apart from these agents.", conf: "high", plain: "Calcium and iron stick to thyroid medicine in the gut, so less of the medicine gets into you.", tier: "timing", need: [["thyroid", 1], ["divalent_mineral", 1]],
      title: "Minerals block thyroid absorption",
      why: "Minerals bind thyroid hormone in the gut and stop it being absorbed; the thyroid page's own absorption note names coffee, calcium and iron. Space any mineral supplement away from the thyroid dose rather than trying to work out which ones.",
      // exemplars (W4.5): an ATTRIBUTED QUOTATION. The sentence says whose list it is — c130's own
      // tech.adme.absorb — and then tells the reader not to rely on the list ("rather than trying
      // to work out which ones"), which is the opposite of claiming those minerals are in the row.
      exemplars: ["c79", "c122", "c148", "c149"],
      action: "Take thyroid medication 4 hours away from minerals and coffee." },
    { id: "zinc_copper", src: "https://www.ncbi.nlm.nih.gov/books/NBK554548/", srcLabel: "Agnew UM, Slesinger TL. Zinc Toxicity. StatPearls, NCBI Bookshelf NBK554548", srcKind: "reference-text", srcQuote: "Oral zinc is primarily absorbed in the jejunum. A metallothionein protein complex in the villi of the enterocytes primarily facilitates absorption... The body's response to excess zinc is to produce more metallothionein to decrease free zinc concentrations. However, as copper is the metal with the highest affinity to metallothionein, this inadvertently leads to decreased copper levels instead. By this mechanism, a high level of zinc always lowers the level of copper... Zinc toxicity also impairs copper metabolism, causing anemia.", conf: "high", plain: "Taking a lot of zinc for months pushes your copper down, which can leave you anaemic.", tier: "timing", need: [["zinc", 1]],
      title: "Long-term zinc depletes copper",
      why: "High zinc switches on a gut protein that carries copper out in the stool — over weeks, plenty of zinc can quietly cause copper deficiency.",
      action: "If taking zinc long-term, add ~1 mg copper per 10–15 mg zinc." },
    { id: "cyp3a4_statin", src: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=8f55d5de-5a4f-4a39-8c84-c53976dd6af9", srcLabel: "FDA prescribing information, ZOCOR (simvastatin), NDA 019766, Drug Interactions 7.1 (DailyMed/NLM, SPL set id 8f55d5de-5a4f-4a39-8c84-c53976dd6af9, rev. 2025-03-28)", srcKind: "regulator", srcQuote: "Simvastatin is a substrate of CYP3A4. Concomitant use of strong CYP3A4 inhibitors with ZOCOR increases simvastatin exposure and increases the risk of myopathy and rhabdomyolysis, particularly with higher ZOCOR dosages.", conf: "high", plain: "Some substances slow how the body clears statins, so the cholesterol drug builds up and can damage muscle.", tier: "timing", need: [["cyp3a4", 1], ["statin_like", 1]],
      // W5.5 (2026-08-02): the title and the why both named Bergamot, and the under-tag audit adds
      // two more CYP3A4 inhibitors this corpus already documents — c29 Berberine ("It inhibits
      // CYP3A4, so it interacts with many prescriptions (statins, immunosuppressants, some blood
      // thinners)") and c163's Quercetin ("**Quercetin inhibits CYP3A4 and P-glycoprotein** and can
      // raise levels of drugs such as ciclosporin, some statins"). Rows go 2 -> 8 and Bergamot is
      // absent from most of them. The row now describes the mechanism both halves share instead of
      // naming whichever compound happened to fill the first slot. The warning is unchanged in
      // strength; only the false specificity is gone. Same repair W4.5 made to pde5_vasodilator,
      // mineral and sedation — and the title is now checked too, which it was not then.
      title: "Slows the enzyme that clears statins",
      why: "The supplement in this pair inhibits CYP3A4, the gut and liver enzyme that breaks statins down. With that enzyme slowed, a normal statin dose behaves like a larger one, and the muscle side-effects scale with the level in your blood.",
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
