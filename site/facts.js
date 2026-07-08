/* RNAwiki — Daily Fact series.  window.RNAWIKI_FACTS
 *
 * SOURCE OF TRUTH for the homepage "Did you know?" widget. One fact surfaces per day,
 * chosen deterministically by date (same for everyone that day), cycling through the array.
 * Target of the series: 365 × 3 = 1095 facts (three years, no repeat). This is the seed batch;
 * facts are added in expert-reviewed batches — every fact must be TRUE and link to a page that
 * teaches it. No invented numbers, no false precision (the opposite of the viral posts this
 * feature answers). Each: { t: fact text, href: internal route, label: link text }.
 *
 * All hrefs verified against the live route table (/c/:slug compound, /pathway/:i,
 * /protocol/:pid/:rcid). Keep that true when adding: if a fact isn't yet supported on its
 * target page, enrich the page first, then add the fact.
 */
window.RNAWIKI_FACTS = [
  { t: "The most-studied longevity drug on Earth was scraped from the soil of Easter Island — locals call the island Rapa Nui, which is how <b>rapamycin</b> got its name.", href: "/c/rapamycin-sirolimus", label: "How rapamycin slows ageing →" },
  { t: "<b>Metformin</b>, the cheap diabetes drug now trialled to extend healthy lifespan, was originally derived from the French lilac flower — used for fevers since medieval times.", href: "/c/metformin", label: "Why metformin is a longevity candidate →" },
  { t: "<b>Nattokinase</b>, an enzyme from fermented soybeans, literally dissolves blood clots. That real power is exactly why it's dangerous to stack with a blood thinner.", href: "/c/nattokinase", label: "The honest take on nattokinase →" },
  { t: "<b>Melatonin</b> isn't a sedative — it's a <i>darkness signal</i>. Take it at the wrong hour and you shift your body clock the wrong way instead of sleeping better.", href: "/c/melatonin", label: "How to actually use melatonin →" },
  { t: "<b>Magnesium</b> is a cofactor in over 300 enzyme reactions in your body — and a large share of people run low without ever knowing it.", href: "/c/magnesium", label: "What magnesium really does →" },
  { t: "<b>Caffeine</b> doesn't add energy. It blocks adenosine — the molecule that tells your brain you're tired — so the tiredness is just hidden, then arrives all at once.", href: "/c/caffeine", label: "The real mechanism of caffeine →" },
  { t: "Take too much <b>zinc</b> for months and you can quietly become copper-deficient — the two minerals fight for the same doorway into your body.", href: "/c/zinc", label: "Zinc, copper & the balance →" },
  { t: "Three-day-old broccoli sprouts contain 10–100× more <b>sulforaphane</b> — the compound behind broccoli's health halo — than the fully grown vegetable.", href: "/c/sulforaphane", label: "The science of sulforaphane →" },
  { t: "<b>Beetroot</b> makes athletes measurably faster: its nitrate becomes nitric oxide, which lets your muscles pull oxygen from blood more efficiently.", href: "/c/beetroot-dietary-nitrate", label: "Nitrate & the 'pump' →" },
  { t: "<b>Ashwagandha</b> means \"smell of horse\" in Sanskrit — named for the strength it was traditionally said to give whoever took it.", href: "/c/ashwagandha-withania-somnifera", label: "What ashwagandha does to stress →" },
  { t: "<b>Glycine</b> — the simplest amino acid — lowers your core body temperature at night, and that drop is one reason it helps you fall asleep faster.", href: "/c/glycine", label: "Glycine for sleep →" },
  { t: "A 2023 study in <i>Science</i> found <b>taurine</b> — yes, the energy-drink ingredient — extended lifespan in mice, and that our own taurine levels fall as we age.", href: "/c/taurine", label: "The taurine longevity finding →" },
  { t: "<b>L-theanine</b>, the calming compound in green tea, smooths out caffeine's jitter — which is why a matcha feels so different from a coffee.", href: "/c/l-theanine", label: "Why theanine + caffeine works →" },
  { t: "<b>Spermidine</b> — first isolated from semen, hence the name — switches on autophagy, your cells' self-recycling program, and is now studied for longevity.", href: "/c/spermidine", label: "Spermidine & autophagy →" },
  { t: "<b>Fisetin</b>, a compound found in strawberries, can clear 'zombie' senescent cells in animal studies — an entire anti-ageing strategy hiding in a fruit.", href: "/c/fisetin", label: "Senolytics, explained →" },
  { t: "Your <b>NAD⁺</b> — the molecule every cell uses to turn food into energy — roughly halves between the ages of 40 and 60.", href: "/c/nmn-nr-nad-precursors", label: "The NAD⁺ decline →" },
  { t: "<b>Omega-3s</b> don't just 'reduce inflammation' — your body converts them into molecules called resolvins that actively switch inflammation off.", href: "/c/omega-3-epa-dha", label: "How omega-3 resolves inflammation →" },
  { t: "<b>Vitamin D</b> is not really a vitamin — it's a hormone your skin manufactures from sunlight, which is why deficiency is so common indoors.", href: "/c/vitamin-d3-k2", label: "Vitamin D (and why K2) →" },
  { t: "<b>Berberine</b> flips the same metabolic switch (AMPK) as the diabetes drug metformin — which is why it's nicknamed \"nature's metformin.\"", href: "/c/berberine", label: "Berberine & blood sugar →" },
  { t: "<b>Minoxidil</b> for hair growth was discovered by accident — it was a blood-pressure pill, and patients kept growing hair as a side effect.", href: "/c/minoxidil", label: "How minoxidil regrows hair →" },
  { t: "<b>Finasteride</b> slows hair loss by blocking the enzyme that turns testosterone into DHT — the hormone that shrinks your follicles.", href: "/c/finasteride-dutasteride", label: "DHT & pattern hair loss →" },
  { t: "<b>Semaglutide</b> (Ozempic) copies a gut hormone, GLP-1, that your body already releases after eating to tell your brain you're full.", href: "/c/semaglutide-ozempic-wegovy-rybelsus", label: "How GLP-1 drugs work →" },
  { t: "Statins can lower <b>CoQ10</b> — the molecule your muscles need to make energy — which is why some people ache on them, and why pairing can help.", href: "/c/coq10-ubiquinol", label: "Statins, CoQ10 & muscle aches →" },
  { t: "<b>Apigenin</b>, the compound in chamomile tea, gently binds the same brain receptors as anti-anxiety drugs — a mild version of the same idea.", href: "/c/apigenin", label: "Chamomile's active compound →" },
  { t: "<b>Lion's mane</b> mushroom stimulates nerve growth factor — proteins that help brain and nerve cells grow and repair.", href: "/c/lion-s-mane-hericium-erinaceus", label: "Lion's mane & the brain →" },
  { t: "<b>Boron</b> — a trace mineral almost nobody supplements — can raise free testosterone and lower inflammation markers in small human studies.", href: "/c/boron", label: "The overlooked mineral →" },
  { t: "<b>Ketamine</b>, an old anaesthetic, can lift severe depression in <i>hours</i> — not weeks — through a completely different mechanism than antidepressants.", href: "/c/ketamine-esketamine-spravato", label: "Ketamine for depression →" },
  { t: "<b>Collagen</b> supplements don't travel straight to your skin — they break into peptides that signal your body to build its own collagen, with vitamin C as the cofactor.", href: "/c/collagen-peptides-vitamin-c", label: "How collagen actually works →" },
  { t: "The harmless skin-tingle from <b>beta-alanine</b> isn't the benefit — it's a nerve quirk. The real effect is buffering acid so your muscles last a few more reps.", href: "/c/beta-alanine", label: "Beta-alanine & the tingle →" },
  { t: "About 20% of the <b>creatine</b> you make each day is used by your brain — which is why it's now studied for memory and mental fatigue, not just muscle.", href: "/c/creatine-monohydrate", label: "Creatine beyond the gym →" },
  { t: "<b>Baking soda</b> is a genuine performance aid — it buffers acid in working muscle so you can grind out extra reps. (The 'removes 98% of pesticides' claim is the overblown part.)", href: "/c/sodium-bicarbonate", label: "Sodium bicarbonate, honestly →" },
  { t: "<b>Urolithin A</b> — made by gut bacteria from pomegranates and walnuts — triggers mitophagy, your cells recycling their worn-out power plants.", href: "/c/urolithin-a", label: "Urolithin A & mitochondria →" },
  { t: "<b>Tongkat ali</b>, nicknamed \"Malaysian ginseng,\" is one of the few traditional herbs with real human trials for raising testosterone.", href: "/c/tongkat-ali-eurycoma-longifolia", label: "Tongkat ali & testosterone →" },
  { t: "The one claim in that viral 'hospitals would be empty' list that actually holds up: <b>turmeric + black pepper</b>. Piperine raises curcumin absorption around 20-fold.", href: "/protocol/inflammation/low-grade-inflammation", label: "The real anti-inflammatory protocol →" },
  { t: "You start losing muscle from around age 30 unless you fight it — and it's <b>protein per meal</b>, not per day, that flips the rebuild switch.", href: "/protocol/sarcopenia/anabolic-resistance", label: "The muscle-loss protocol →" },
  { t: "Your <b>VO₂ max</b> — how well you use oxygen — predicts how long you'll live better than blood pressure or smoking status does.", href: "/protocol/longevity/cellular-senescence", label: "Fitness as the longevity drug →" },
  { t: "Your bones are living tissue, rebuilt constantly — and the <i>only</i> signal that tells them to get stronger is mechanical load. No load, no bone.", href: "/protocol/bone-density/low-bmd", label: "The bone-density protocol →" },
  { t: "<b>Sunscreen</b> is the single most proven anti-ageing product there is — most of what looks like 'ageing' skin is accumulated UV damage, not time.", href: "/protocol/skin-aging/uv-oxidative", label: "The skin-ageing protocol →" },
  { t: "Your gut houses a 'second brain' of ~500 million neurons and makes roughly 90% of your body's serotonin — which is why gut health shifts mood.", href: "/protocol/gut-health/dysbiosis", label: "The gut-health protocol →" },
  { t: "A clock ticks in every cell of your body, but the master clock in your brain resets each day to one signal above all others: <b>morning light</b>.", href: "/protocol/insomnia/circadian-misalign", label: "The sleep protocol →" },
  { t: "<b>Vitamin K2</b> decides where the calcium you eat goes — into your bones (good) or your artery walls (bad) — which is why it belongs with vitamin D.", href: "/c/vitamin-d3-k2", label: "Why D3 needs K2 →" },
  { t: "The reason grapefruit carries drug warnings: it blocks a gut enzyme (CYP3A4) that breaks down many medicines — including statins — spiking their levels.", href: "/c/statins-atorvastatin-rosuvastatin", label: "Statins & the grapefruit effect →" },
  { t: "The 'good stress' of exercise — a brief burst of reactive oxygen — is the very signal that makes you fitter. Mega-dosing antioxidants around training can blunt it.", href: "/pathway/11", label: "The mitochondria pathway →" },
  { t: "Your body runs on two fuels, sugar and fat, and a single enzyme system — <b>AMPK</b> — flips between them. Both exercise and metformin pull that same lever.", href: "/pathway/3", label: "The AMPK energy switch →" },
  { t: "The 'pump' you feel lifting is nitric oxide widening your blood vessels — the very same molecule that Viagra works through.", href: "/pathway/4", label: "The nitric-oxide pathway →" },
  { t: "<b>mTOR</b> is your body's growth switch: on, you build muscle; off, cells clean house through autophagy. You can't max both at once — you cycle them.", href: "/pathway/2", label: "The mTOR growth pathway →" },
  { t: "Ginger and turmeric aren't roots — they're underground stems (rhizomes) — and both calm inflammation through the same master switch, NF-κB.", href: "/pathway/13", label: "The inflammation pathway →" },
  { t: "<b>5-HTP</b> is a direct serotonin precursor — which is exactly why combining it with an antidepressant can be dangerous, not helpful.", href: "/c/5-htp-l-tryptophan", label: "5-HTP, safely →" },
  { t: "Iron from meat is absorbed 2–3× better than iron from plants — but a squeeze of vitamin C can multiply how much plant iron you actually take in.", href: "/protocol/chronic-fatigue/iron-anemia", label: "The fatigue & iron protocol →" },
  { t: "Muscle is an organ: when it contracts it releases 'myokines' — hormone-like messengers that fight inflammation and even talk to your brain.", href: "/protocol/longevity/cellular-senescence", label: "Why muscle keeps you young →" }
];
