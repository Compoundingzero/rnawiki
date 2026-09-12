### [2026-09-07T20:10:00Z] Phase 4 — measure v6: the same ruler over the fixed render

Commands, in order:
`npx tsx scripts/revamp/page_text_v5.ts --out data/revamp/render-v6-run-ff` and the same script
`--with-furniture --out data/revamp/render-v6-run-wf`;
`.venv-corpus/bin/python scripts/revamp/derive_threshold.py --fields-dir data/revamp/fields-v2
--text-dir data/revamp/render-v6/text --with-furniture-text-dir data/revamp/render-v6/text-with-furniture
--out data/revamp/thresholds-v6.json` and the same script with `--text-dir
data/revamp/render-v6/text-with-furniture --out data/revamp/thresholds-v6-with-furniture.json`;
`.venv-corpus/bin/python scripts/revamp/common_line_share.py data/revamp/render-v6/text
data/revamp/render-v6/text-with-furniture data/revamp/render-v5/text data/corpus-20k/render/text
--out data/revamp/common-line-share-v6.json`;
`npx tsx scripts/with-disposable-database.ts` created `rnawiki_test_1788803439533_2572f4cee2`,
`pg_restore --data-only -L <drugs, inventory_resolutions>` from
`rnawiki-backups/corpus-20k-2026-09-05/rnawiki-pre-corpus-20k.pgcustom` put 9,859 legacy `drugs` and
9,859 `inventory_resolutions` rows in it, `materialise.ts --tier {1,3,2} --revamp --thresholds
data/revamp/thresholds-v6.json --no-checkpoint` loaded it and `npx next start -p 3191` served it;
`rendered_dup_check.py --base-url http://127.0.0.1:3191 --sample 1000 --seed 20260905` twice, the
second with `--indexable-keys data/revamp/indexable-keys-after.txt`;
`redirect_check.py --base-url http://127.0.0.1:3191 --plan …/redirect-plan-v3.csv --canonical
…/canonical-v3.ndjson`; `slop_draw.py --base-url http://127.0.0.1:3191 --seed 20260907 --per-tier 20
--text-dir data/revamp/render-v6/text --out-dir data/revamp/slop-draws/draw-2`. Server stopped,
database dropped and its absence confirmed in `pg_database`.

Output: `data/revamp/render-v6/{text,provenance,text-with-furniture,provenance-with-furniture}`,
`thresholds-v6.json`/`.md`, `thresholds-v6-with-furniture.json`/`.md`,
`presence-applicable-v6.ndjson`, `field-census-applicable-v6.csv`, `common-line-share-v6.json`,
`indexable-keys-after.txt`, `rendered-dups-v6.csv`/`-summary.json`,
`rendered-dups-v6-prior-set.csv`/`-summary.json`, `redirect-check-v6-local.json`,
`slop-draws/draw-2/{report.json,pages.md}`.

**Render.** 28,832 pages, 1,319,671 sentences, every one carrying provenance; 12,473,782 words
furniture-free (mean 432.6) and 16,183,745 with furniture (mean 561.3); 350,910 furniture lines. Both
runs reproduced the render already on disk byte for byte (sha256 `84101a89…ab10` furniture-free,
`a96a983e…b3b8` with furniture, and all 4 × 29 batch files identical), so the render is
deterministic and the measurement below is of the code as it stands.

**The ruler (§11's furniture-free gate figure).** Tier 1 **20** present-and-applicable fields,
**303 indexable**, positional 0.197626 all pairs, lexical 0.349686 size-matched. Tier 2 **20**, 1
page. Tier 3 **none**, 0 pages — no count at or above the stub floor of 3 produces a set that holds
both lines. Against the two earlier rulers: `thresholds-after` (pre-Phase-4 text) selected Tier 1 at
12 with 1,061 indexable (0.160173 / 0.328660); `thresholds-v5` (Phase-4 text, furniture in it)
selected 23 with 48 (0.198739 / 0.345081). Tier 2 has stood at 20-with-one-page and Tier 3 at none
on all three.

**The with-furniture run, reported beside it and never selecting.** Tier 1 **23**, **48** indexable,
positional 0.193042, lexical 0.340507; Tier 2 20, 1 page; Tier 3 none. It reproduces v5's threshold
and count exactly, which is the measurement §11 predicted: the collapse from 1,061 to 48 was the
absence statements, not the reading text. The 303-page set scored on the with-furniture text
measures 0.216549 positional and 0.360215 lexical — over both lines, which is why the furniture-free
text is the gate figure and this one is recorded.

**Repetition.** Lines carried by more than half of all pages are **5.38 %** of the corpus's words
furniture-free (8 such lines, 670,673 words of 12,473,782) and **26.55 %** with furniture (21 lines,
4,296,373 of 16,183,745). Before Phase 4 the same measure was 5.05 % (4 lines). Median page
**215 words** furniture-free and **352** with, against 80 before Phase 4.

**Rendered duplicates.** The build loaded 28,766 pages — 300 Tier 1 and 1 Tier 2 indexable. On the
v6 indexable set (301 pages plus a seeded 1,000-page noindex sample, 995 rendered) 25,778 pairs are
at or above 0.5 Jaccard and **2 distinct pairs are indexable-to-indexable**, not zero:
`pertuzumab-trastuzumab-and-hyaluronidase-zzxf` ↔ `trastuzumab-and-hyaluronidase-oysk` at 0.5888
(reason class biosimilar) and `nebivolol` ↔ `nebivolol-2` at 0.5167 (identical trial set). No pair
was flagged under unclassified-overlap or stub-template. On the 1,062-page pre-Phase-4 comparison
set (1,053 keys still carry a slug, 1,046 rendered) there are **26 distinct indexable pairs**
against 32 at v5 and 19 before Phase 4: 16 biosimilar (15 trastuzumab suffix pairs and the
pertuzumab pair), 8 identical-trial-set (halofuginone, carnitine, esmolol, cisapride, nebivolol,
heparin calcium/sodium, chromium/chromium acetate, isoprenaline/isoproterenol) and 2
unclassified-overlap (acetohexamide/tolazamide, alpha-arbutin/glutathione).

**Redirects, local build: PASS.** Plan — universe 9,857, 8,972 served directly, 935 by one hop, 0
orphans, 0 chains, 0 conflicts. Live — 9,857 slugs checked, 8,984 answered 200 and 873 answered 308,
**0 failures**. The v5 run's 886 404s were the missing legacy `drugs` rows; with the two legacy
tables restored the loader skipped only 5 redirect rows for want of a legacy target.

**Slop draw 2** (seed 20260907, 60 pages, 20 per tier, 1,452 sentences and 2,775 revealed rows):
**(a) 0** failures, against 128 in draw 1 — every sentence resolves to at least one recorded trace.
**(b) 242** failures in scope, against 1,219: 229 in question blocks and 13 in computed sections; the
largest question template ("no regulator classification is recorded for …") sits on 6,585 of 28,832
pages and the largest computed one ("Closest approved compound: …") on 1,288. 771 sentences were out
of scope and each is counted by the exclusion that removed it. **(c) 0**. `pages.md` is 47,889 words.
Separately measured and not one of the three checks: 31 recorded sentences the page does not paint
and 597 painted lines the render does not carry.

Draw 2 is not clean, so the gate's two-consecutive-clean-draws bar is not met and the generator work
that remains is the question-block and computed-section templates, the two indexable duplicate pairs
and the 31 + 597 render/DOM divergence.
