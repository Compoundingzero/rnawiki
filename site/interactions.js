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
  coverage: { compounds: 171, reachable: 95, unreachable: 76, unreachableRx: 38 },

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
    { m: "5-htp", t: ["serotonergic"] }, { m: "tryptophan", t: ["serotonergic"] },
    { m: "ssri", t: ["serotonergic"] }, { m: "sertraline", t: ["serotonergic"] }, { m: "escitalopram", t: ["serotonergic"] },
    { m: "sam-e", t: ["serotonergic"] }, { m: "saffron", t: ["serotonergic"] }, { m: "psilocybin", t: ["serotonergic"] },
    { m: "ketamine", t: ["serotonergic", "cns_depressant"] },
    // stimulants → additive cardiovascular strain
    { m: "caffeine", t: ["stimulant"] }, { m: "ephedrine", t: ["stimulant"] }, { m: "yohimbine", t: ["stimulant"] },
    { m: "clenbuterol", t: ["stimulant"] }, { m: "synephrine", t: ["stimulant"] }, { m: "higenamine", t: ["stimulant"] },
    { m: "theacrine", t: ["stimulant"] }, { m: "phentermine", t: ["stimulant"] }, { m: "amphetamine", t: ["stimulant"] },
    { m: "lisdexamfetamine", t: ["stimulant"] }, { m: "methylphenidate", t: ["stimulant"] }, { m: "modafinil", t: ["stimulant"] },
    { m: "bromantane", t: ["stimulant"] }, { m: "nicotine", t: ["stimulant"] }, { m: "pt-141", t: ["stimulant"] },
    { m: "bupropion", t: ["stimulant"] },
    // blood-thinning → additive bleeding
    { m: "nattokinase", t: ["blood_thinning"] }, { m: "omega-3", t: ["blood_thinning"] }, { m: "ginkgo", t: ["blood_thinning"] },
    { m: "vitamin e", t: ["blood_thinning"] }, { m: "resveratrol", t: ["blood_thinning"] },
    // strong CNS depressants → additive sedation / respiratory depression
    { m: "phenibut", t: ["cns_depressant"] }, { m: "zolpidem", t: ["cns_depressant"] }, { m: "z-drug", t: ["cns_depressant"] },
    { m: "trazodone", t: ["cns_depressant"] }, { m: "orexin", t: ["cns_depressant"] }, { m: "suvorexant", t: ["cns_depressant"] },
    { m: "lemborexant", t: ["cns_depressant"] }, { m: "doxylamine", t: ["cns_depressant"] },
    // mild sedatives → gentle stacking note only
    { m: "melatonin", t: ["sedative_mild"] }, { m: "valerian", t: ["sedative_mild"] }, { m: "apigenin", t: ["sedative_mild"] },
    // glucose-lowering → additive hypoglycemia
    { m: "metformin", t: ["hypoglycemic"] }, { m: "berberine", t: ["hypoglycemic"] }, { m: "acarbose", t: ["hypoglycemic"] },
    { m: "semaglutide", t: ["hypoglycemic", "glp1"] }, { m: "tirzepatide", t: ["hypoglycemic", "glp1"] }, { m: "retatrutide", t: ["hypoglycemic", "glp1"] },
    { m: "liraglutide", t: ["hypoglycemic", "glp1"] }, { m: "orforglipron", t: ["hypoglycemic", "glp1"] }, { m: "cagrilintide", t: ["hypoglycemic"] },
    { m: "sglt2", t: ["hypoglycemic"] }, { m: "insulin", t: ["hypoglycemic"] }, { m: "alpha-lipoic", t: ["hypoglycemic", "antioxidant_hd"] },
    { m: "myo-inositol", t: ["hypoglycemic"] },
    // blood-pressure lowering / nitrate / PDE-5
    { m: "beetroot", t: ["hypotensive", "nitrate"] }, { m: "nitrate", t: ["hypotensive", "nitrate"] },
    { m: "pde-5", t: ["hypotensive", "pde5"] }, { m: "sildenafil", t: ["hypotensive", "pde5"] }, { m: "tadalafil", t: ["hypotensive", "pde5"] },
    { m: "citrulline", t: ["hypotensive"] }, { m: "agmatine", t: ["hypotensive"] }, { m: "taurine", t: ["hypotensive"] },
    // hepatotoxic (liver strain) — oral AAS + a few others
    { m: "green tea", t: ["hepatotoxic"] }, { m: "red yeast rice", t: ["statin_like", "hepatotoxic"] },
    { m: "dnp", t: ["do_not_use", "hepatotoxic"] }, { m: "dinitrophenol", t: ["do_not_use", "hepatotoxic"] },
    { m: "tamoxifen", t: ["hepatotoxic"] }, { m: "oxandrolone", t: ["hepatotoxic"] }, { m: "stanozolol", t: ["hepatotoxic"] },
    { m: "winstrol", t: ["hepatotoxic"] }, { m: "dianabol", t: ["hepatotoxic"] }, { m: "methandrostenolone", t: ["hepatotoxic"] },
    { m: "anadrol", t: ["hepatotoxic"] }, { m: "oxymetholone", t: ["hepatotoxic"] }, { m: "trenbolone", t: ["hepatotoxic"] },
    { m: "rad-140", t: ["hepatotoxic"] }, { m: "lgd-4033", t: ["hepatotoxic"] }, { m: "s-23", t: ["hepatotoxic"] },
    // statin-like
    { m: "statin", t: ["statin_like"] }, { m: "atorvastatin", t: ["statin_like"] }, { m: "rosuvastatin", t: ["statin_like"] },
    // niacin (myopathy risk with statins)
    { m: "niacin", t: ["niacin"] },
    // grapefruit-type metabolism
    { m: "bergamot", t: ["cyp3a4"] },
    // minerals that compete for absorption
    // `iron` deleted 2026-08-01: no rule consumed it, and everything it was there for is already
    // carried — competition with other minerals by `divalent_mineral`, the vitamin-C absorption
    // pairing by the name-matched synergy below. A tag no rule reads is dead data that reads as
    // coverage, so it goes rather than gets a rule invented for it.
    { m: "calcium", t: ["divalent_mineral"] }, { m: "iron", t: ["divalent_mineral"] }, { m: "zinc", t: ["divalent_mineral", "zinc"] },
    { m: "magnesium", t: ["divalent_mineral"] }, { m: "strontium", t: ["divalent_mineral"] }, { m: "boron", t: ["divalent_mineral"] },
    // high-dose antioxidants (can blunt training adaptation)
    // `vitc` deleted 2026-08-01, same reason as `iron`: no rule read it, and vitamin C's two real
    // interactions here are already covered — antioxidant load by `antioxidant_hd`, the iron
    // pairing by the name-matched synergy below.
    { m: "n-acetylcysteine", t: ["antioxidant_hd"] }, { m: "vitamin c", t: ["antioxidant_hd"] },
    { m: "astaxanthin", t: ["antioxidant_hd"] },
    // mTOR
    { m: "rapamycin", t: ["mtor_inhibitor", "immunosuppress"] }, { m: "eaas", t: ["mtor_activator"] }, { m: "bcaa", t: ["mtor_activator"] },
    { m: "hmb", t: ["mtor_activator"] }, { m: "igf-1", t: ["mtor_activator", "hypoglycemic"] },
    // immune direction
    { m: "beta-glucan", t: ["immunostim"] }, { m: "mushroom", t: ["immunostim"] }, { m: "reishi", t: ["immunostim"] },
    // "thymosin" narrowed to "thymosin alpha" 2026-08-01. A nameTag match is an UNANCHORED
    // SUBSTRING, and the bare string hit two different molecules that do opposite things.
    // Thymosin α-1 is an immunomodulator by its own mechanism ("activating Toll-like receptors
    // (TLR9/2) and T-cell maturation"). Thymosin β-4 is not: TB-500's own mechanism is "regulates
    // actin polymerisation to enable cell migration to wounds, promotes angiogenesis, and REDUCES
    // INFLAMMATION". Measured hydrated at 390x844: /stack?ids=c65,c70 rendered "🔻 Opposing immune
    // direction · TB-500 (Thymosin Beta-4 fragment) + Rapamycin (Sirolimus)", explained with
    // "Mushrooms / beta-glucans push the immune system up" — a sentence about neither compound in
    // the row. "thymosin alpha" hits exactly one compound in the 171-name corpus.
    { m: "andrographis", t: ["immunostim"] }, { m: "ll-37", t: ["immunostim"] }, { m: "thymosin alpha", t: ["immunostim"] },
    // aromatase inhibitors (estrogen crash)
    { m: "anastrozole", t: ["aromatase_inhibitor"] }, { m: "exemestane", t: ["aromatase_inhibitor"] },
    { m: "letrozole", t: ["aromatase_inhibitor"] }, { m: "aromatase", t: ["aromatase_inhibitor"] },
    // 5-alpha-reductase inhibitors (redundant if doubled)
    { m: "finasteride", t: ["5ar_inhibitor"] }, { m: "dutasteride", t: ["5ar_inhibitor"] },
    // thyroid hormone (mineral-blocked absorption)
    { m: "t3 / t4", t: ["thyroid"] }, { m: "levothyroxine", t: ["thyroid"] }, { m: "liothyronine", t: ["thyroid"] },
    // Exogenous androgens → HPTA suppression. ASSERTED PER COMPOUND, never by category (see the
    // catTags note above). Each match string was tested against all 171 lowercased compound names
    // and hits exactly one. The comment on each line is that compound's OWN authored support,
    // quoted from site/data.js — if you cannot quote the page, do not add the line.
    { m: "testosterone", t: ["hpta_suppressive"] },        // watch: "Testicular shrinkage/infertility (suppresses LH/FSH)"
    { m: "nandrolone", t: ["hpta_suppressive"] },          // watch: "prolonged HPTA suppression"
    { m: "oxandrolone", t: ["hpta_suppressive"] },         // watch: "Lipid deterioration, HPTA suppression"
    { m: "oxymetholone", t: ["hpta_suppressive"] },        // watch: "all suppress natural testosterone"
    { m: "ostarine", t: ["hpta_suppressive"] },            // watch: "HPTA suppression, liver injury cases"
    { m: "ligandrol", t: ["hpta_suppressive"] },           // watch: "Marked suppression, hepatotoxicity"
    { m: "andarine", t: ["hpta_suppressive"] },            // watch: "Minimal human data, strong suppression"
    // The four below are exogenous androgen-receptor agonists by their own authored MECHANISM;
    // their pages do not use the word "suppression". The tag rests on the mechanism the page
    // states, not on an inference about the molecule's class — which is the line this file now
    // holds everywhere. If Felix would rather these carried the tag only when the page says so,
    // the honest fix is one authored sentence on each page, not a quieter tag.
    { m: "trenbolone", t: ["hpta_suppressive"] },          // mech: "19-nor with extreme AR binding affinity (higher than testosterone)"
    { m: "stanozolol", t: ["hpta_suppressive"] },          // mech: "DHT-derived, 17α-alkylated, non-aromatising"
    { m: "boldenone", t: ["hpta_suppressive"] },           // mech: "Testosterone with a 1,2 double bond"
    { m: "methandrostenolone", t: ["hpta_suppressive"] },  // mech: "Oral 17α-alkylated, aromatises readily"
    { m: "testolone", t: ["hpta_suppressive"] }            // mech: "Potent AR agonist designed to mimic testosterone's anabolism"
  ],

  // Rules: fire when every `need` [tag, minDistinctCompounds] is satisfied by the stack.
  // tier: danger | blunt | timing.  Each has a plain-English why + action; optional pathway.
  rules: [
    { id: "serotonin", tier: "danger", need: [["serotonergic", 2]],
      title: "Serotonin syndrome risk",
      why: "Both raise serotonin — one blocks its reuptake, the other supplies the raw material. Together it can build up faster than the body clears it and overstimulate receptors.",
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
    { id: "sedation", tier: "danger", need: [["cns_depressant", 2]],
      title: "Additive sedation / breathing risk",
      why: "Each of these slows the brain's arousal system. Stacked, sedation deepens toward slowed breathing — phenibut with a Z-drug or alcohol is a documented cause of overdoses.",
      action: "Don't layer strong sedatives, and never combine phenibut with alcohol." },
    { id: "double_statin", tier: "danger", need: [["statin_like", 2]],
      title: "Double statin — muscle-damage risk",
      why: "Red yeast rice *is* a natural statin. Taking it alongside a prescription statin is effectively a double dose, which raises the risk of muscle breakdown (rhabdomyolysis).",
      action: "Pick one. Never combine red yeast rice with a prescribed statin." },
    { id: "statin_niacin", tier: "danger", need: [["statin_like", 1], ["niacin", 1]],
      title: "Statin + high-dose niacin — myopathy risk",
      why: "High-dose niacin adds to a statin's small risk of muscle injury.",
      action: "Only combine under medical supervision; watch for muscle aches." },
    { id: "stim_stack", tier: "danger", need: [["stimulant", 2]],
      title: "Stacked stimulants — cardiovascular strain",
      why: "Each drives the same fight-or-flight system. Stacked, heart rate and blood pressure compound — the classic ephedrine + caffeine combo is the cautionary example.",
      action: "Use one stimulant at a time; don't layer them." },
    { id: "hypoglycemia", tier: "danger", need: [["hypoglycemic", 2]],
      title: "Additive low-blood-sugar risk",
      why: "Two or more glucose-lowering agents together can drop blood sugar too far — shakiness, confusion, and in severe cases worse. Insulin plus anything else is especially risky.",
      action: "Combine glucose-loweres only under medical supervision; never self-stack with insulin." },
    { id: "liver", tier: "danger", need: [["hepatotoxic", 2]],
      title: "Stacked liver strain",
      why: "The liver clears these and takes strain doing it. Two together (e.g. an oral steroid plus high-dose green-tea extract) stack the load.",
      action: "Don't combine oral hepatotoxic compounds; get bloodwork if unavoidable." },
    { id: "estrogen_crash", tier: "danger", need: [["aromatase_inhibitor", 2]],
      title: "Estrogen crash",
      why: "Aromatase inhibitors shut down estrogen production. Doubled, estrogen can crash — joint pain, crushed libido, mood and bone problems.",
      action: "Use one AI, dosed to bloodwork; don't zero out estrogen." },
    { id: "dnp", tier: "danger", need: [["do_not_use", 1]],
      title: "DNP — do not use",
      why: "DNP uncouples cellular energy production; the effective and lethal doses nearly overlap, and it can cause fatal overheating.",
      action: "There is no safe way to use or combine DNP." },

    { id: "mtor_conflict", tier: "blunt", need: [["mtor_inhibitor", 1], ["mtor_activator", 1]],
      title: "Opposing growth signals",
      why: "Rapamycin lowers growth signalling for longevity/autophagy; IGF-1 and high leucine (EAAs/HMB) raise it. Run together, each undoes the other's purpose.",
      action: "Separate by goal and timing; don't run them the same day.", pathway: "/pathway/2" },
    { id: "immune_conflict", tier: "blunt", need: [["immunostim", 1], ["immunosuppress", 1]],
      title: "Opposing immune direction",
      why: "Mushrooms / beta-glucans push the immune system up; rapamycin pushes it down. Together they pull in opposite directions.",
      action: "Pick a direction for your goal." },
    { id: "antioxidant_training", tier: "blunt", need: [["antioxidant_hd", 2]],
      title: "May blunt training adaptation",
      why: "The brief oxidative stress of a hard workout is the signal that tells muscle and mitochondria to adapt. Mega-dosing antioxidants around training can mop up that signal.",
      action: "Get antioxidants from food; keep high doses away from your workout window.", pathway: "/pathway/11" },
    { id: "hpta_stack", tier: "blunt", need: [["hpta_suppressive", 2]],
      title: "Compounded testosterone shutdown",
      why: "Each of these suppresses your natural testosterone. Stacked, the shutdown is deeper and recovery is harder.",
      action: "Understand the suppression and have a recovery plan; this is not casual stacking.", pathway: "/pathway/9" },
    // Wired 2026-08-01: `5ar_inhibitor` and `glp1` were assigned and read by no rule, which is why
    // Finasteride / Dutasteride could never produce a flag at all. Both are duplicate-therapy
    // rules — the same receptor or enzyme hit twice — which is the same shape as the
    // double_statin rule above, one tier softer because neither is acutely dangerous.
    { id: "double_5ar", tier: "blunt", need: [["5ar_inhibitor", 2]],
      title: "Two 5-alpha-reductase inhibitors — the same job twice",
      why: "Finasteride and dutasteride both block the enzyme that turns testosterone into DHT. Running both is more of one mechanism, not two mechanisms, and the sexual and mood side-effects people quit over scale with the total blockade.",
      action: "Use one, at the dose it was prescribed at." },
    { id: "double_glp1", tier: "blunt", need: [["glp1", 2]],
      title: "Two GLP-1 agonists — duplicate therapy",
      why: "These act on the same receptor. Two together is a bigger dose of one drug class rather than a second angle on the problem, and the nausea, vomiting and slowed stomach emptying scale with it.",
      action: "Run one GLP-1 at a time, titrated by whoever prescribed it." },

    { id: "hypotensive_stack", tier: "timing", need: [["hypotensive", 2]], notIf: ["pde5_vasodilator", "nitrate_pde5"],
      title: "Both of these lower blood pressure",
      why: "Each relaxes blood vessels a little, so the drop adds up. On its own that is usually harmless; the way it shows up is light-headedness when you stand up quickly, especially in the first week.",
      action: "Stand up slowly while you settle in. If you already take blood-pressure medication, ask a pharmacist before adding either." },
    { id: "mild_sedatives", tier: "timing", need: [["sedative_mild", 2]],
      title: "Two mild sedatives at once",
      why: "Melatonin, valerian and apigenin all nudge the same wind-down machinery. Stacked, the sedation adds up, and the usual result is a groggy morning rather than deeper sleep.",
      action: "Start with one and give it two weeks before adding anything. If you're also on a strong sedative or drinking alcohol, treat all of these as off-limits." },

    { id: "mineral", tier: "timing", need: [["divalent_mineral", 2]],
      title: "Minerals compete — space them out",
      why: "Calcium, iron, zinc and magnesium ride the same intestinal transporter and compete; whichever is in excess wins, and the other barely absorbs.",
      action: "Take competing minerals about 2 hours apart." },
    { id: "thyroid_mineral", tier: "timing", need: [["thyroid", 1], ["divalent_mineral", 1]],
      title: "Minerals block thyroid absorption",
      why: "Calcium, iron and magnesium bind thyroid hormone in the gut and stop it being absorbed.",
      action: "Take thyroid medication 4 hours away from minerals and coffee." },
    { id: "zinc_copper", tier: "timing", need: [["zinc", 1]],
      title: "Long-term zinc depletes copper",
      why: "High zinc switches on a gut protein that carries copper out in the stool — over weeks, plenty of zinc can quietly cause copper deficiency.",
      action: "If taking zinc long-term, add ~1 mg copper per 10–15 mg zinc." },
    { id: "cyp3a4_statin", tier: "timing", need: [["cyp3a4", 1], ["statin_like", 1]],
      title: "Bergamot may raise statin levels",
      why: "Bergamot (like grapefruit) can slow the gut enzyme that breaks down statins, nudging their levels up.",
      action: "Be cautious combining; ask a pharmacist about your specific statin." }
  ],

  // Synergies — pairs that work well together (match by name substring; both must be present).
  synergies: [
    { a: "statin", b: "coq10", title: "Statin + CoQ10", why: "Statins deplete CoQ10; replacing it can ease the muscle aches that make people quit statins." },
    { a: "caffeine", b: "theanine", title: "Caffeine + L-Theanine", why: "Theanine smooths caffeine's jitter for clean focus without the crash." },
    { a: "iron", b: "vitamin c", title: "Iron + Vitamin C", why: "Vitamin C converts iron to its absorbable form and multiplies uptake." },
    { a: "collagen", b: "vitamin c", title: "Collagen + Vitamin C", why: "Vitamin C is the cofactor your body needs to build collagen from the peptides." },
    { a: "vitamin d", b: "magnesium", title: "Vitamin D + Magnesium", why: "Magnesium is a cofactor for activating vitamin D — low magnesium blunts D's effect." },
    { a: "glycine", b: "n-acetylcysteine", title: "Glycine + NAC (GlyNAC)", why: "Together they restore glutathione more than either alone." },
    { a: "creatine", b: "beta-alanine", title: "Creatine + Beta-Alanine", why: "Complementary buffers — creatine fuels short bursts, beta-alanine buffers acid for longer sets." }
  ]
};
